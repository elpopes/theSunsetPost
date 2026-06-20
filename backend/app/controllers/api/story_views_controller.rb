require "openssl"

class Api::StoryViewsController < ApplicationController
  MAX_VISITOR_TOKEN_LENGTH = 255
  MAX_PATH_LENGTH = 2_048
  MAX_USER_AGENT_LENGTH = 1_024

  def create
    story = Story.find_by_identifier(params[:story_id])
    return render json: { error: "Story not found" }, status: :not_found unless story

    visitor_token = truncate(params[:visitor_token], MAX_VISITOR_TOKEN_LENGTH)
    language = truncate(params[:language], 10)
    path = truncate(params[:path], MAX_PATH_LENGTH)

    if visitor_token.blank? || language.blank? || path.blank?
      return render json: {
        errors: ["Visitor token, language, and path are required"]
      }, status: :unprocessable_entity
    end

    recent_view = story.story_views
                       .where(visitor_token: visitor_token, language: language)
                       .where("viewed_at >= ?", StoryView::DEDUPLICATION_WINDOW.ago)
                       .order(viewed_at: :desc)
                       .first

    if recent_view
      return render json: { view_id: recent_view.id, counted: false }, status: :ok
    end

    attribution = StoryViewAttribution.new(
      query_string: params[:query_string],
      referrer: params[:referrer]
    )

    story_view = story.story_views.new(
      visitor_token: visitor_token,
      language: language,
      path: path,
      user_agent: truncate(request.user_agent, MAX_USER_AGENT_LENGTH),
      ip_hash: hashed_ip,
      viewed_at: Time.current,
      **attribution.attributes
    )

    if story_view.save
      render json: { view_id: story_view.id, counted: true }, status: :created
    else
      render json: { errors: story_view.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def hashed_ip
    ip_address = request.remote_ip.to_s
    return if ip_address.blank?

    daily_value = "#{Date.current.iso8601}:#{ip_address}"
    OpenSSL::HMAC.hexdigest(
      "SHA256",
      Rails.application.secret_key_base.to_s,
      daily_value
    )
  end

  def truncate(value, length)
    value.to_s.strip.first(length)
  end
end
