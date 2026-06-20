require "openssl"

class Api::StoryViewsController < ApplicationController
  MAX_VISITOR_TOKEN_LENGTH = 255
  MAX_PATH_LENGTH = 2_048
  MAX_USER_AGENT_LENGTH = 1_024
  MAX_ENGAGED_SECONDS = 4.hours.to_i

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


  def engagement
    visitor_token = truncate(params[:visitor_token], MAX_VISITOR_TOKEN_LENGTH)
    story_view = StoryView.find_by(
      id: params[:id],
      story_id: params[:story_id],
      visitor_token: visitor_token
    )

    return render json: { error: "Story view not found" }, status: :not_found unless story_view

    engaged_seconds = bounded_integer(params[:engaged_seconds], 0, MAX_ENGAGED_SECONDS)
    max_scroll_percent = bounded_integer(params[:max_scroll_percent], 0, 100)

    if engaged_seconds.nil? || max_scroll_percent.nil?
      return render json: {
        errors: ["Engaged seconds and max scroll percent must be integers"]
      }, status: :unprocessable_entity
    end

    if story_view.update(
      engaged_seconds: [story_view.engaged_seconds, engaged_seconds].max,
      max_scroll_percent: [story_view.max_scroll_percent, max_scroll_percent].max
    )
      render json: {
        engaged_seconds: story_view.engaged_seconds,
        max_scroll_percent: story_view.max_scroll_percent
      }, status: :ok
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

  def bounded_integer(value, minimum, maximum)
    Integer(value.to_s, 10).clamp(minimum, maximum)
  rescue ArgumentError
    nil
  end

  def truncate(value, length)
    value.to_s.strip.first(length)
  end
end
