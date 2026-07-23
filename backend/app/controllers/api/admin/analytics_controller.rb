class Api::Admin::AnalyticsController < ApplicationController
  before_action :require_admin!

  def overview
    render json: analytics_query.overview
  end

  def stories
    render json: analytics_query.stories
  end

  def story
    render json: analytics_query.story(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Story not found" }, status: :not_found
  end

  def story_options
    render json: { stories: analytics_query.story_options }
  end

  def ads
    render json: analytics_query.ads
  end

  private

  def analytics_query
    @analytics_query ||= AdminAnalyticsQuery.new(params)
  end
end
