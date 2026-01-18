module Api
  class ClassifiedsController < ApplicationController
    before_action :require_admin!, only: [:create, :update, :destroy]

    # GET /api/classifieds?lang=en&category=housing&subcategory=rooms&limit=50
    def index
      lang = normalized_lang(params[:lang])

      scope = Classified.published_now.includes(
        :classified_category,
        :classified_subcategory,
        :classified_translations
      )

      if params[:category].present?
        scope = scope.joins(:classified_category).where(classified_categories: { slug: params[:category] })
      end

      if params[:subcategory].present?
        scope = scope.joins(:classified_subcategory).where(classified_subcategories: { slug: params[:subcategory] })
      end

      classifieds = scope.limit(limit_param)

      render json: classifieds.map { |c| serialize_summary(c, lang) }
    end

    # GET /api/classifieds/:id  (we’ll support slug OR numeric id)
    def show
      lang = normalized_lang(params[:lang])

      classified = Classified.published_now.includes(
        :classified_category,
        :classified_subcategory,
        :classified_translations
      ).find_by(slug: params[:id]) || Classified.published_now.find(params[:id])

      render json: serialize_detail(classified, lang)
    end

    # POST /api/classifieds
    def create
      classified = Classified.new(classified_params)

      if classified.status == "published" && classified.posted_at.blank?
        classified.posted_at = Time.current
      end

      if classified.save
        render json: { classified: serialize_detail(classified, normalized_lang(params[:lang])) }, status: :created
      else
        render json: { errors: classified.errors.full_messages }, status: :unprocessable_entity
      end
    end

    # PATCH/PUT /api/classifieds/:id
    def update
      classified = Classified.find(params[:id])

      going_live = classified.status != "published" && params.dig(:classified, :status) == "published"

      if classified.update(classified_params)
        classified.update(posted_at: Time.current) if going_live && classified.posted_at.blank?
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

    def classified_params
      params.require(:classified).permit(
        :slug,
        :status,
        :posted_at,
        :expires_at,
        :submitter_email,
        :admin_notes,
        :classified_category_id,
        :classified_subcategory_id,
        classified_translations_attributes: [:id, :language, :title, :body, :_destroy]
      )
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
        body_snippet: snippet_for(tr&.body)
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
        body: tr&.body
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
