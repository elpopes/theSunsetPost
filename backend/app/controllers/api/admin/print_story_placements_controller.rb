class Api::Admin::PrintStoryPlacementsController < ApplicationController
  before_action :require_admin!

  def create
    issue = PrintIssue.find(params[:print_issue_id])
    placement = issue.print_story_placements.new(placement_params)

    if placement.save
      render json: PrintIssueAnalytics.new(issue.reload).as_json, status: :created
    else
      render json: { errors: placement.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    placement = PrintStoryPlacement.find(params[:id])
    placement.destroy!
    head :no_content
  end

  private

  def placement_params
    params.require(:print_story_placement).permit(
      :story_id,
      :page_number,
      :position_label,
      :print_language,
      :target_language,
      :utm_content
    )
  end
end
