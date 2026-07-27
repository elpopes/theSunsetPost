class Api::AdEventsController < ApplicationController
  MAX_KEY_LENGTH = 100
  MAX_SLOT_LENGTH = 100
  MAX_PATH_LENGTH = 2_048
  MAX_URL_LENGTH = 2_048
  MAX_VISITOR_TOKEN_LENGTH = 255
  MAX_USER_AGENT_LENGTH = 1_024
  TRANSPARENT_GIF = [
    71, 73, 70, 56, 57, 97, 1, 0, 1, 0, 128, 0, 0, 0, 0, 0,
    255, 255, 255, 33, 249, 4, 1, 0, 0, 0, 0, 44, 0, 0, 0, 0,
    1, 0, 1, 0, 0, 2, 2, 68, 1, 0, 59
  ].pack("C*").freeze

  def create
    event = build_event

    unless event
      return render json: { error: "Unknown or inactive campaign" },
                    status: :unprocessable_entity
    end

    if event.save
      render json: { recorded: true }, status: :created
    else
      render json: { errors: event.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # GET /api/ad_events/pixel.gif
  # A cross-origin image request does not require CORS preflight and survives
  # link navigation more reliably than an asynchronous fetch.
  def pixel
    event = build_event
    event&.save

    response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
    response.headers["Pragma"] = "no-cache"
    send_data TRANSPARENT_GIF,
              type: "image/gif",
              disposition: "inline"
  end

  private

  def build_event
    campaign = AdCampaign.resolve_default(truncate(params[:campaign_key], MAX_KEY_LENGTH))
    return unless campaign&.running_on?

    campaign.ad_events.new(
      event_type: truncate(params[:event_type], 20),
      slot: truncate(params[:slot], MAX_SLOT_LENGTH),
      language: truncate(params[:language], 10),
      device_type: device_type,
      path: truncate(params[:path], MAX_PATH_LENGTH),
      destination_url: truncate(params[:destination_url], MAX_URL_LENGTH).presence,
      visitor_token: truncate(params[:visitor_token], MAX_VISITOR_TOKEN_LENGTH).presence,
      user_agent: truncate(request.user_agent, MAX_USER_AGENT_LENGTH).presence,
      event_at: Time.current
    )
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
