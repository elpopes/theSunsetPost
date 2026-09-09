import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { baseURL } from "../config";
import "./WeatherTime.css";

const WeatherTime = () => {
  const { i18n } = useTranslation();
  const [weather, setWeather] = useState(null);
  const [time, setTime] = useState(new Date());
  const weatherIntervalRef = useRef(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const lang = i18n.language;
        const lat = 40.6452;
        const lon = -74.0122;

        const response = await fetch(
          `${baseURL}/api/weather?lat=${lat}&lon=${lon}&lang=${lang}`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        setWeather({
          temp: data.current.temp_f,
          description: data.current.condition.text,
          icon: data.current.condition.icon,
        });
      } catch (error) {
        console.error("Error fetching weather:", error);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchWeather();
        weatherIntervalRef.current = setInterval(fetchWeather, 600000);
      } else if (weatherIntervalRef.current) {
        clearInterval(weatherIntervalRef.current);
        weatherIntervalRef.current = null;
      }
    };

    if (document.visibilityState === "visible") {
      fetchWeather();
      weatherIntervalRef.current = setInterval(fetchWeather, 600000);
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (weatherIntervalRef.current) {
        clearInterval(weatherIntervalRef.current);
        weatherIntervalRef.current = null;
      }
    };
  }, [i18n.language]);

  useEffect(() => {
    const timeInterval = setInterval(() => setTime(new Date()), 10000);
    return () => clearInterval(timeInterval);
  }, []);

  return (
    <div className="weather-time" aria-live="polite">
      <div className="weather-time__conditions">
        {weather ? (
          <>
            <img
              src={weather.icon}
              alt={weather.description}
              className="weather-time__icon"
              width="64"
              height="64"
            />
            <p className="weather-time__temp">{weather.temp}°F</p>
            <p className="weather-time__description">{weather.description}</p>
          </>
        ) : (
          <div className="weather-time__placeholder" aria-hidden="true">
            <span className="weather-time__placeholder-icon" />
            <span className="weather-time__placeholder-line weather-time__placeholder-line--temp" />
            <span className="weather-time__placeholder-line" />
          </div>
        )}
      </div>
      <p className="weather-time__time">
        {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
      </p>
    </div>
  );
};

export default WeatherTime;
