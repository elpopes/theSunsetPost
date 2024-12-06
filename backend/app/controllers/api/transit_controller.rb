# app/controllers/api/transit_controller.rb
module Api
    class TransitController < ApplicationController
      require 'net/http'
      require 'uri'
  
      def get_transit_info
        stop_id = params[:stop_id].strip
        route_id = params[:route_id]
  
        if stop_id.blank?
          render json: { error: "stop_id parameter is required" }, status: :bad_request and return
        end
  
        url = URI.parse("https://bustime.mta.info/api/siri/stop-monitoring.json")
        params_hash = {
          key: ENV['MTA_API_KEY'],
          MonitoringRef: stop_id
        }
        params_hash[:LineRef] = route_id if route_id.present?
        url.query = URI.encode_www_form(params_hash)
  
        Rails.logger.debug("Constructed MTA API URL: #{url}")
  
        begin
          response = Net::HTTP.start(url.host, url.port, use_ssl: true) do |http|
            http.get(url.request_uri)
          end
  
          data = JSON.parse(response.body)
          stop_monitoring_delivery = data.dig('Siri', 'ServiceDelivery', 'StopMonitoringDelivery') || []
  
          # Extract and filter arrivals
          arrivals = stop_monitoring_delivery.flat_map do |delivery|
            delivery['MonitoredStopVisit'] || []
          end.map do |visit|
            arrival_time = visit.dig('MonitoredVehicleJourney', 'MonitoredCall', 'ExpectedArrivalTime')
            next unless arrival_time
  
            {
              time: arrival_time,
              status: visit.dig('MonitoredVehicleJourney', 'ProgressStatus'),
              route: visit.dig('MonitoredVehicleJourney', 'PublishedLineName'),
            }
          end.compact
  
          # Filter arrivals to include only upcoming within the next hour
          now = Time.now
          arrivals = arrivals.select do |arrival|
            Time.parse(arrival[:time]) > now && Time.parse(arrival[:time]) < now + 1.hour
          end
  
          # Limit the number of results (e.g., first 5 arrivals)
          arrivals = arrivals.first(2)
  
          render json: { arrivals: arrivals }, status: :ok
        rescue => e
          Rails.logger.error("Error fetching transit data: #{e.message}")
          render json: { error: "Error fetching transit data" }, status: :bad_gateway
        end
      end
    end
end
  