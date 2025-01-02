import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import protobuf from "protobufjs";
import "./SubwayInfo.css";

const SubwayInfo = () => {
  const { t } = useTranslation();
  const [arrivals, setArrivals] = useState([]); // Holds arrival data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSubwayArrivals = async () => {
      setLoading(true);
      setError(null);

      const feeds = [
        {
          feedUrl:
            "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-nqrw",
          stationId: "R36N", // Northbound N/R trains
        },
        {
          feedUrl:
            "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-bdfm",
          stationId: "R36N", // Northbound D trains
        },
      ];

      try {
        const root = await protobuf.load("/proto/gtfs-realtime.proto");
        const FeedMessage = root.lookupType("transit_realtime.FeedMessage");

        let allArrivals = [];

        for (const { feedUrl, stationId } of feeds) {
          const response = await fetch(feedUrl);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const arrayBuffer = await response.arrayBuffer();
          const feed = FeedMessage.decode(new Uint8Array(arrayBuffer));

          const stationArrivals = feed.entity
            .flatMap((entity) =>
              entity.tripUpdate
                ? entity.tripUpdate.stopTimeUpdate
                    .filter((stopTime) => stopTime.stopId === stationId)
                    .map((stopTime) => ({
                      route: entity.tripUpdate.trip.routeId,
                      arrival_time: stopTime.arrival?.time
                        ? new Date(stopTime.arrival.time * 1000)
                        : null,
                    }))
                : []
            )
            .flat();

          allArrivals = [...allArrivals, ...stationArrivals];
        }

        const sortedArrivals = allArrivals
          .filter((a) => a.arrival_time)
          .sort((a, b) => a.arrival_time - b.arrival_time);

        const limitedArrivals = sortedArrivals.slice(0, 3);
        setArrivals(limitedArrivals);
      } catch (err) {
        console.error("Error fetching subway data:", err);
        setError(t("Error fetching subway data."));
      } finally {
        setLoading(false);
      }
    };

    fetchSubwayArrivals();
    const interval = setInterval(fetchSubwayArrivals, 60000);
    return () => clearInterval(interval);
  }, [t]);

  const calculateMinutes = (arrivalTime) => {
    const now = new Date();
    const diffMs = arrivalTime - now;
    const diffMinutes = Math.floor(diffMs / 60000);
    return diffMinutes <= 0 ? t("Now arriving") : t(`${diffMinutes} min`);
  };

  return (
    <div className="subway-info">
      <h3 className="subway-info__header">
        {t("Northbound Trains at 36th St.")}
      </h3>
      {loading ? (
        <p>{t("Loading subway information...")}</p>
      ) : error ? (
        <p>{error}</p>
      ) : arrivals.length > 0 ? (
        <ul>
          {arrivals.map((arrival, index) => (
            <li key={`${arrival.route}-${index}`}>
              <h4>{`${arrival.route} ${t("Train")}`}</h4>
              <span
                className={
                  calculateMinutes(arrival.arrival_time) === t("Now arriving")
                    ? "now-arriving"
                    : ""
                }
              >
                {calculateMinutes(arrival.arrival_time)}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p>{t("No arrivals available for this station.")}</p>
      )}
    </div>
  );
};

export default SubwayInfo;
