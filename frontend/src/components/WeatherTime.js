// src/components/WeatherTime.js
import React, { useState, useEffect } from "react";

const WeatherTime = () => {
  const [weather, setWeather] = useState(null);
  const [time, setTime] = useState(new Date());

  // Fetch weather data from the NWS API
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        // Step 1: Get the office and grid information for Sunset Park
        const pointResponse = await fetch(
          `https://api.weather.gov/points/40.6452,-74.0122`
        );
        const pointData = await pointResponse.json();
        const forecastUrl = pointData.properties.forecast;

        // Step 2: Fetch the forecast data
        const forecastResponse = await fetch(forecastUrl);
        const forecastData = await forecastResponse.json();

        // Get the current period (usually the first item in the forecast)
        const currentWeather = forecastData.properties.periods[0];
        setWeather({
          temp: currentWeather.temperature,
          description: currentWeather.shortForecast,
        });
      } catch (error) {
        console.error("Error fetching weather:", error);
      }
    };

    fetchWeather();

    // Update weather every 10 minutes
    const interval = setInterval(fetchWeather, 600000);

    return () => clearInterval(interval);
  }, []);

  // Update time every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="weather-time">
      {weather ? (
        <>
          <p className="weather-time__temp">{weather.temp}°F</p>
          <p className="weather-time__description">{weather.description}</p>
        </>
      ) : (
        <p>Loading weather...</p>
      )}
      <p className="weather-time__time">
        {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
      </p>
    </div>
  );
};

export default WeatherTime;
