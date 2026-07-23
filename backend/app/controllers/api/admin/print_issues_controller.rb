class Api::Admin::PrintIssuesController < ApplicationController
  before_action :require_admin!
  before_action :set_print_issue, only: [:show, :update]

  def index
    issues = PrintIssue.includes(:print_story_placements)
                       .order(publication_date: :desc, code: :desc)

    render json: {
      issues: issues.map { |issue| issue_summary(issue) }
    }
  end

  def show
    render json: PrintIssueAnalytics.new(@print_issue).as_json
  end

  def create
    issue = PrintIssue.new(print_issue_params)

    if issue.save
      render json: issue_summary(issue), status: :created
    else
      render json: { errors: issue.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    if @print_issue.update(print_issue_params)
      render json: issue_summary(@print_issue)
    else
      render json: { errors: @print_issue.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def set_print_issue
    @print_issue = PrintIssue.find(params[:id])
  end

  def print_issue_params
    params.require(:print_issue).permit(
      :code,
      :name,
      :publication_date,
      :copies_printed
    )
  end

  def issue_summary(issue)
    {
      id: issue.id,
      code: issue.code,
      name: issue.name,
      publication_date: issue.publication_date,
      copies_printed: issue.copies_printed,
      placement_count: issue.print_story_placements.size
    }
  end
end
