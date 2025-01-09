import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

const WeatherTime = () => {
  const { i18n } = useTranslation();
  const [weather, setWeather] = useState(null);
  const [time, setTime] = useState(new Date());
  const weatherIntervalRef = useRef(null); // Use a ref for weatherInterval

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const lang = i18n.language;
        const lat = 40.6452;
        const lon = -74.0122;

        const response = await fetch(
          `http://localhost:3000/api/weather?lat=${lat}&lon=${lon}&lang=${lang}`
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
        weatherIntervalRef.current = setInterval(fetchWeather, 600000); // Update every 10 minutes
      } else {
        if (weatherIntervalRef.current) {
          clearInterval(weatherIntervalRef.current);
          weatherIntervalRef.current = null;
        }
      }
    };

    // Initial fetch and attach visibility listener
    if (document.visibilityState === "visible") {
      fetchWeather();
      weatherIntervalRef.current = setInterval(fetchWeather, 600000);
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Cleanup
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

    // Cleanup
    return () => clearInterval(timeInterval);
  }, []);

  return (
    <div className="weather-time">
      {weather ? (
        <>
          <img
            src={weather.icon}
            alt={weather.description}
            className="weather-time__icon"
          />
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
