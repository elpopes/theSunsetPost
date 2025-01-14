import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { baseURL } from "../config";
import "./TransitInfo.css";

const stops = [{ id: "MTA_305361", name: "North-Bound B63 @ 44th:" }];

const TransitInfo = () => {
  const { t } = useTranslation();
  const [transitData, setTransitData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const calculateWaitTime = useCallback(
    (arrivalTime) => {
      const now = new Date();
      const diffMs = arrivalTime - now;
      const diffMinutes = Math.floor(diffMs / 60000);
      return diffMinutes <= 0 ? t("Now arriving") : t(`${diffMinutes} min`);
    },
    [t]
  );

  useEffect(() => {
    let interval;

    const fetchTransitData = async () => {
      setLoading(true);
      setError(null);

      try {
        const results = await Promise.all(
          stops.map(async (stop) => {
            const response = await fetch(
              `${baseURL}/api/transit?stop_id=${stop.id}&route_id=MTA NYCT_B63`
            );

            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            const arrivals = data.arrivals.map((arrival) => ({
              route: "B63",
              waitTime: calculateWaitTime(new Date(arrival.time)),
            }));

            return {
              stop: stop.name,
              arrivals,
            };
          })
        );

        setTransitData(results);
      } catch (err) {
        console.error("Error fetching transit data:", err);
        setError(t("Error fetching transit data."));
      } finally {
        setLoading(false);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchTransitData();
        interval = setInterval(fetchTransitData, 60000); // Start polling
      } else {
        clearInterval(interval); // Stop polling when tab is inactive
      }
    };

    // Attach event listener for visibility change
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Initial fetch when component mounts
    if (document.visibilityState === "visible") {
      fetchTransitData();
      interval = setInterval(fetchTransitData, 60000);
    }

    // Cleanup on unmount or visibility change
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearInterval(interval);
    };
  }, [calculateWaitTime, t]);

  return (
    <div className="transit-info">
      <h4 className="transit-info__header">
        {t("Northbound Buses at 44th St.")}
      </h4>
      {loading ? (
        <p>{t("Loading transit information...")}</p>
      ) : error ? (
        <p>{error}</p>
      ) : transitData.length > 0 ? (
        transitData.map((stop, stopIndex) => (
          <div key={stopIndex} className="transit-info__stop">
            <ul>
              {stop.arrivals && stop.arrivals.length > 0 ? (
                stop.arrivals.map((arrival, index) => (
                  <li key={`${stopIndex}-${index}`}>
                    <h4>{`${arrival.route} ${t("Bus")}`}</h4>
                    <span
                      className={
                        arrival.waitTime === t("Now arriving")
                          ? "now-arriving"
                          : ""
                      }
                    >
                      {arrival.waitTime}
                    </span>
                  </li>
                ))
              ) : (
                <p>{t("No arrivals available.")}</p>
              )}
            </ul>
          </div>
        ))
      ) : (
        <p>{t("No transit data available.")}</p>
      )}
    </div>
  );
};

export default TransitInfo;
