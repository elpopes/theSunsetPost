class Api::WeatherController < ApplicationController
    def fetch_weather
      lat = params[:lat]
      lon = params[:lon]
      lang = params[:lang] || 'en'
  
      cache_key = "weather_#{lat}_#{lon}_#{lang}"
      weather_data = Rails.cache.fetch(cache_key, expires_in: 10.minutes) do
        api_key = ENV['WEATHER_API_KEY']
        url = URI("http://api.weatherapi.com/v1/current.json?key=#{api_key}&q=#{lat},#{lon}&lang=#{lang}")
        response = Net::HTTP.get(url)
        JSON.parse(response)
      end
  
      render json: weather_data
    rescue JSON::ParserError
      render json: { error: 'Invalid JSON response from WeatherAPI' }, status: :unprocessable_entity
    rescue StandardError => e
      render json: { error: e.message }, status: :internal_server_error
    end
end
  
  