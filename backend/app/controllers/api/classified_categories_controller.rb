module Api
  class ClassifiedCategoriesController < ApplicationController
    before_action :require_admin!, only: [:create, :update, :destroy]

    # GET /api/classified_categories?lang=en
    def index
      lang = normalized_lang(params[:lang])

      categories = ClassifiedCategory
        .active
        .includes(:classified_category_translations, classified_subcategories: :classified_subcategory_translations)

      render json: categories.map { |cat| serialize_category(cat, lang) }
    end

    # POST /api/classified_categories
    def create
      category = ClassifiedCategory.new(category_params)
      if category.save
        render json: { category: serialize_category(category, normalized_lang(params[:lang])) }, status: :created
      else
        render json: { errors: category.errors.full_messages }, status: :unprocessable_entity
      end
    end

    # PATCH/PUT /api/classified_categories/:id
    def update
      category = ClassifiedCategory.find(params[:id])
      if category.update(category_params)
        render json: { category: serialize_category(category, normalized_lang(params[:lang])) }, status: :ok
      else
        render json: { errors: category.errors.full_messages }, status: :unprocessable_entity
      end
    end

    # DELETE /api/classified_categories/:id
    def destroy
      category = ClassifiedCategory.find(params[:id])
      category.destroy
      render json: { message: "Deleted" }, status: :ok
    end

    private

    def category_params
      params.require(:classified_category).permit(
        :slug, :position, :active,
        classified_category_translations_attributes: [:id, :language, :name, :_destroy]
      )
    end

    def serialize_category(cat, lang)
      {
        id: cat.id,
        slug: cat.slug,
        name: cat.name_for(lang),
        position: cat.position,
        active: cat.active,
        subcategories: cat.classified_subcategories
          .select(&:active)
          .sort_by { |sc| [sc.position || 0, sc.created_at] }
          .map { |sc|
            {
              id: sc.id,
              slug: sc.slug,
              name: sc.name_for(lang),
              position: sc.position,
              active: sc.active
            }
          }
      }
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
