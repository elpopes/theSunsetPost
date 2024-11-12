# app/controllers/api/transit_controller.rb
module Api
	class TransitController < ApplicationController
		require 'net/http'
		require 'uri'

		def get_transit_info
			stop_id = params[:stop_id].strip # Remove any trailing newline or whitespace
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
			Rails.logger.debug("Using MTA API Key: #{ENV['MTA_API_KEY']}")

			begin
				response = Net::HTTP.start(url.host, url.port, use_ssl: true) do |http|
					http.get(url.request_uri)
				end

				Rails.logger.debug("API Response Code: #{response.code}")
				Rails.logger.debug("API Response Content-Type: #{response.content_type}")

				if response.content_type == "application/json"
					data = JSON.parse(response.body)
				else
					Rails.logger.error("Non-JSON response received: #{response.body}")
					render json: { error: "Unexpected response format from MTA API" }, status: :bad_gateway and return
				end

				# Check if StopMonitoringDelivery exists in the response
				stop_monitoring_delivery = data.dig('Siri', 'ServiceDelivery', 'StopMonitoringDelivery')
				if stop_monitoring_delivery.nil?
					Rails.logger.error("StopMonitoringDelivery missing in response: #{data}")
					render json: { error: "No transit data available for this stop." }, status: :bad_gateway and return
				end

				# Parse the arrivals data if available
				arrivals = stop_monitoring_delivery.flat_map do |delivery|
					delivery['MonitoredStopVisit'].map do |visit|
						{
							time: visit['MonitoredVehicleJourney']['MonitoredCall']['ExpectedArrivalTime'],
							status: visit['MonitoredVehicleJourney']['ProgressStatus'],
							route: visit['MonitoredVehicleJourney']['PublishedLineName']
						}
					end
				end

				Rails.logger.debug("Parsed Transit Data: #{arrivals}")
				render json: { arrivals: arrivals }, status: :ok
			rescue JSON::ParserError => e
				Rails.logger.error("JSON Parsing Error: #{e.message}")
				render json: { error: "Invalid response format from MTA API" }, status: :bad_gateway
			rescue => e
				Rails.logger.error("Error fetching transit data: #{e.message}")
				render json: { error: "Error fetching transit data" }, status: :bad_gateway
			end
		end
	end
end
