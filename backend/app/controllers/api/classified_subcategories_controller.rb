module Api
  class ClassifiedSubcategoriesController < ApplicationController
    before_action :require_admin!

    # POST /api/classified_subcategories
    def create
      subcategory = ClassifiedSubcategory.new(subcategory_params)
      if subcategory.save
        render json: { subcategory: serialize_subcategory(subcategory, normalized_lang(params[:lang])) }, status: :created
      else
        render json: { errors: subcategory.errors.full_messages }, status: :unprocessable_entity
      end
    end

    # PATCH/PUT /api/classified_subcategories/:id
    def update
      subcategory = ClassifiedSubcategory.find(params[:id])
      if subcategory.update(subcategory_params)
        render json: { subcategory: serialize_subcategory(subcategory, normalized_lang(params[:lang])) }, status: :ok
      else
        render json: { errors: subcategory.errors.full_messages }, status: :unprocessable_entity
      end
    end

    # DELETE /api/classified_subcategories/:id
    def destroy
      subcategory = ClassifiedSubcategory.find(params[:id])
      subcategory.destroy
      render json: { message: "Deleted" }, status: :ok
    end

    private

    def subcategory_params
      params.require(:classified_subcategory).permit(
        :classified_category_id, :slug, :position, :active,
        classified_subcategory_translations_attributes: [:id, :language, :name, :_destroy]
      )
    end

    def serialize_subcategory(sc, lang)
      {
        id: sc.id,
        classified_category_id: sc.classified_category_id,
        slug: sc.slug,
        name: sc.name_for(lang),
        position: sc.position,
        active: sc.active
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
