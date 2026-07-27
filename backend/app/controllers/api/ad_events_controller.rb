class Api::AdEventsController < ApplicationController
  MAX_KEY_LENGTH = 100
  MAX_SLOT_LENGTH = 100
  MAX_PATH_LENGTH = 2_048
  MAX_URL_LENGTH = 2_048
  MAX_VISITOR_TOKEN_LENGTH = 255
  MAX_USER_AGENT_LENGTH = 1_024

  def create
    save_event(
      key: params[:campaign_key],
      kind: params[:event_type],
      slot: params[:slot],
      language: params[:language],
      path: params[:path],
      destination_url: params[:destination_url],
      visitor_token: params[:visitor_token],
      response_mode: :json
    )
  end

  # Neutral browser-facing collection endpoint. Public request names intentionally
  # match the existing info-content vocabulary used by the frontend.
  def info
    save_event(
      key: params[:content_id],
      kind: params[:kind],
      slot: params[:slot],
      language: params[:lang],
      path: params[:path],
      destination_url: params[:dest],
      visitor_token: params[:visitor],
      response_mode: :empty
    )
  end

  private

  def save_event(key:, kind:, slot:, language:, path:, destination_url:, visitor_token:, response_mode:)
    normalized_key = truncate(key, MAX_KEY_LENGTH)
    campaign = AdCampaign.resolve_default(normalized_key)

    unless campaign&.running_on?
      Rails.logger.warn(
        "[InfoMetrics] rejected reason=unknown_or_inactive content_id=#{normalized_key.inspect}"
      )
      return failure_response(response_mode, ["Unknown or inactive content"])
    end

    event = campaign.ad_events.new(
      event_type: truncate(kind, 20),
      slot: truncate(slot, MAX_SLOT_LENGTH),
      language: truncate(language, 10),
      device_type: device_type,
      path: truncate(path, MAX_PATH_LENGTH),
      destination_url: truncate(destination_url, MAX_URL_LENGTH).presence,
      visitor_token: truncate(visitor_token, MAX_VISITOR_TOKEN_LENGTH).presence,
      user_agent: truncate(request.user_agent, MAX_USER_AGENT_LENGTH).presence,
      event_at: Time.current
    )

    if event.save
      return head :no_content if response_mode == :empty

      render json: { recorded: true }, status: :created
    else
      Rails.logger.warn(
        "[InfoMetrics] rejected reason=validation content_id=#{normalized_key.inspect} " \
        "kind=#{kind.inspect} errors=#{event.errors.full_messages.join('; ')}"
      )
      failure_response(response_mode, event.errors.full_messages)
    end
  end

  def failure_response(response_mode, errors)
    return head :unprocessable_entity if response_mode == :empty

    render json: { errors: errors }, status: :unprocessable_entity
  end

  def truncate(value, length)
    value.to_s.strip.first(length)
  end

  def device_type
    user_agent = request.user_agent.to_s
    return "unknown" if user_agent.blank?

    user_agent.match?(/Android|iPad|iPhone|Mobile/i) ? "mobile" : "desktop"
  end
end
