import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import "./TransitInfo.css";

// Define stops with MTA stop IDs
const stops = [{ id: "MTA_305361", name: "North-Bound B63 @ 44th:" }];

const TransitInfo = () => {
  const { t, i18n } = useTranslation(); // Access translation functions
  const [transitData, setTransitData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let interval;

    const fetchTransitData = async () => {
      setLoading(true);
      setError(null);

      try {
        const lang = i18n.language; // Get current language from i18next

        const results = await Promise.all(
          stops.map(async (stop) => {
            console.log(`Fetching data for stop: ${stop.id}`);

            const response = await fetch(
              `http://localhost:3000/api/transit?stop_id=${stop.id}&route_id=MTA NYCT_B63&lang=${lang}`
            );

            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log(`Data received for stop ${stop.id}:`, data);

            return {
              stop: stop.name,
              data: data.arrivals,
            };
          })
        );

        console.log("All transit data:", results);
        setTransitData(results);
      } catch (error) {
        console.error("Error fetching transit data:", error);
        setError("Error fetching transit data.");
      } finally {
        setLoading(false);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchTransitData();
        interval = setInterval(fetchTransitData, 60000); // Start interval when tab is active
      } else {
        clearInterval(interval); // Clear interval when tab is inactive
      }
    };

    // Attach event listener for visibility change
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Initial fetch when component mounts
    if (document.visibilityState === "visible") {
      fetchTransitData();
      interval = setInterval(fetchTransitData, 60000);
    }

    // Cleanup
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearInterval(interval);
    };
  }, [i18n.language]); // Refetch data when the language changes

  return (
    <div className="transit-info">
      {loading ? (
        <p>{t("Loading transit information...")}</p>
      ) : error ? (
        <p>{t("Error fetching transit data.")}</p>
      ) : transitData.length > 0 ? (
        transitData.map((stop) => (
          <div key={stop.id} className="transit-info__stop">
            <h4>{t(stop.stop)}</h4> {/* Translate stop name dynamically */}
            {stop.data && stop.data.length > 0 ? (
              <ul>
                {stop.data.map((arrival, index) => (
                  <li key={`${stop.id}-${arrival.time}-${index}`}>
                    {new Date(arrival.time).toLocaleTimeString()}
                  </li>
                ))}
              </ul>
            ) : (
              <p>{t("No arrivals available.")}</p>
            )}
          </div>
        ))
      ) : (
        <p>{t("No transit data available.")}</p>
      )}
    </div>
  );
};

export default TransitInfo;
