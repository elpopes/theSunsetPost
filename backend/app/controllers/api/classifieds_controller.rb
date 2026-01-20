module Api
  class ClassifiedsController < ApplicationController
    before_action :require_admin!, only: [:create, :update, :destroy]

    # GET /api/classifieds?lang=en&category=housing&subcategory=rooms&limit=50
    def index
      lang = normalized_lang(params[:lang])

      scope = Classified.published_now.includes(
        :classified_category,
        :classified_subcategory,
        :classified_translations,
        photo_attachment: :blob
      )

      if params[:category].present?
        scope = scope.joins(:classified_category).where(
          classified_categories: { slug: params[:category] }
        )
      end

      if params[:subcategory].present?
        scope = scope.joins(:classified_subcategory).where(
          classified_subcategories: { slug: params[:subcategory] }
        )
      end

      classifieds = scope.limit(limit_param)

      render json: classifieds.map { |c| serialize_summary(c, lang) }
    end

    # GET /api/classifieds/:id  (supports slug OR numeric id)
    def show
      lang = normalized_lang(params[:lang])

      classified =
        Classified.published_now.includes(
          :classified_category,
          :classified_subcategory,
          :classified_translations,
          photo_attachment: :blob
        ).find_by(slug: params[:id]) || Classified.published_now.find(params[:id])

      render json: serialize_detail(classified, lang)
    end

    # POST /api/classifieds  (FormData-only)
    # Expects scalar fields at top level + translations JSON string + optional photo
    #   classified_category_id, classified_subcategory_id, submitter_email, expires_at, status, admin_notes
    #   translations: JSON string: [{language, title, body}]
    #   photo: file
    def create
      classified = Classified.new
      classified.assign_attributes(classified_params)

      normalize_blank_foreign_keys!(classified)
      apply_translations_json!(classified)
      attach_photo!(classified)

      if classified.published? && classified.posted_at.blank?
        classified.posted_at = Time.current
      end

      if classified.save
        render json: { classified: serialize_detail(classified, normalized_lang(params[:lang])) }, status: :created
      else
        render json: { errors: classified.errors.full_messages }, status: :unprocessable_entity
      end
    end

    # PATCH/PUT /api/classifieds/:id  (FormData-only)
    def update
      classified = Classified.find(params[:id])
      was_published = classified.published?

      classified.assign_attributes(classified_params)

      normalize_blank_foreign_keys!(classified)
      apply_translations_json!(classified)
      attach_photo!(classified)

      if classified.save
        if !was_published && classified.published? && classified.posted_at.blank?
          classified.update(posted_at: Time.current)
        end

        render json: { classified: serialize_detail(classified, normalized_lang(params[:lang])) }, status: :ok
      else
        render json: { errors: classified.errors.full_messages }, status: :unprocessable_entity
      end
    end

    # DELETE /api/classifieds/:id
    def destroy
      classified = Classified.find(params[:id])
      classified.destroy
      render json: { message: "Deleted" }, status: :ok
    end

    private

    # FormData-only scalar params (top-level)
    def classified_params
      params.permit(
        :status,
        :posted_at,
        :expires_at,
        :submitter_email,
        :admin_notes,
        :classified_category_id,
        :classified_subcategory_id
      )
    end

    # Converts "" -> nil for optional belongs_to to avoid casting/validation weirdness
    def normalize_blank_foreign_keys!(classified)
      if classified.classified_subcategory_id.is_a?(String) && classified.classified_subcategory_id.blank?
        classified.classified_subcategory_id = nil
      end
    end

    # Reads params[:translations] JSON string, upserts translations by normalized language
    def apply_translations_json!(classified)
      raw = params[:translations].presence || "[]"
      arr = JSON.parse(raw) rescue []

      arr.each do |t|
        lang = normalized_lang(t["language"])
        tr = classified.classified_translations.find_or_initialize_by(language: lang)
        tr.title = t["title"]
        tr.body  = t["body"] || t["content"] || ""
      end
    end

    def attach_photo!(classified)
      return unless params[:photo].present?
      classified.photo.attach(params[:photo])
    end

    def serialize_summary(c, lang)
      tr = c.translation_for(lang)
      {
        id: c.id,
        slug: c.slug,
        posted_at: c.posted_at || c.created_at,
        expires_at: c.expires_at,
        category: {
          id: c.classified_category.id,
          slug: c.classified_category.slug,
          name: c.classified_category.name_for(lang)
        },
        subcategory: c.classified_subcategory ? {
          id: c.classified_subcategory.id,
          slug: c.classified_subcategory.slug,
          name: c.classified_subcategory.name_for(lang)
        } : nil,
        title: tr&.title,
        body_snippet: snippet_for(tr&.body),
        photo_url: c.photo.attached? ? url_for(c.photo) : nil
      }
    end

    def serialize_detail(c, lang)
      tr = c.translation_for(lang)
      {
        id: c.id,
        slug: c.slug,
        posted_at: c.posted_at || c.created_at,
        expires_at: c.expires_at,
        category: {
          id: c.classified_category.id,
          slug: c.classified_category.slug,
          name: c.classified_category.name_for(lang)
        },
        subcategory: c.classified_subcategory ? {
          id: c.classified_subcategory.id,
          slug: c.classified_subcategory.slug,
          name: c.classified_subcategory.name_for(lang)
        } : nil,
        title: tr&.title,
        body: tr&.body,
        photo_url: c.photo.attached? ? url_for(c.photo) : nil
      }
    end

    def snippet_for(body)
      return "" if body.blank?
      max = 120
      s = body.to_s.strip
      s.length > max ? "#{s[0...max]}..." : s
    end

    def limit_param
      n = params[:limit].to_i
      return 50 if n <= 0
      [n, 100].min
    end

    def normalized_lang(lng)
      return "en" if lng.blank?
      s = lng.to_s
      return "es" if s.start_with?("es")
      return "zh" if s.start_with?("zh")
      "en"
    end
  end
end
