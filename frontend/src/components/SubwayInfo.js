import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import protobuf from "protobufjs";
import "./SubwayInfo.css";

const feeds = [
  {
    feedUrl:
      "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-nqrw",
    stationId: "R36N",
  },
  {
    feedUrl:
      "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-bdfm",
    stationId: "R36N",
  },
];

const SubwayInfo = () => {
  const { t } = useTranslation();

  const [arrivals, setArrivals] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const feedMessageRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    const ensureProto = async () => {
      if (feedMessageRef.current) return feedMessageRef.current;
      const root = await protobuf.load("/proto/gtfs-realtime.proto");
      const FeedMessage = root.lookupType("transit_realtime.FeedMessage");
      feedMessageRef.current = FeedMessage;
      return FeedMessage;
    };

    const fetchSubwayArrivals = async ({ isPoll = false } = {}) => {
      if (isPoll) setRefreshing(true);
      setError(null);

      try {
        const FeedMessage = await ensureProto();

        let allArrivals = [];

        for (const { feedUrl, stationId } of feeds) {
          const response = await fetch(feedUrl, { cache: "no-store" });
          if (!response.ok)
            throw new Error(`HTTP error! status: ${response.status}`);

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

          allArrivals = allArrivals.concat(stationArrivals);
        }

        const limitedArrivals = allArrivals
          .filter((a) => a.arrival_time)
          .sort((a, b) => a.arrival_time - b.arrival_time)
          .slice(0, 3);

        if (!cancelled) setArrivals(limitedArrivals);
      } catch (err) {
        if (!cancelled) setError(t("Error fetching subway data."));
      } finally {
        if (!cancelled) {
          setInitialLoading(false);
          setRefreshing(false);
        }
      }
    };

    fetchSubwayArrivals({ isPoll: false });

    const interval = setInterval(() => {
      fetchSubwayArrivals({ isPoll: true });
    }, 60000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [t]);

  const calculateMinutes = (arrivalTime) => {
    const now = new Date();
    const diffMs = arrivalTime - now;
    const diffMinutes = Math.floor(diffMs / 60000);
    return diffMinutes <= 0 ? t("Now arriving") : `${diffMinutes} ${t("min")}`;
  };

  return (
    <div className="subway-info" aria-busy={initialLoading || refreshing}>
      <h3 className="subway-info__header">
        {t("Northbound Trains at 36th St.")}
      </h3>

      {refreshing && (
        <div className="subway-info__updating">{t("Updating…")}</div>
      )}

      {initialLoading ? (
        <div className="subway-info__skeleton">
          <div className="row" />
          <div className="row" />
          <div className="row" />
        </div>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <ul className="subway-info__list">
          {(arrivals.length
            ? arrivals
            : [{ route: "-", arrival_time: null }]
          ).map((arrival, index) => {
            const eta = arrival.arrival_time
              ? calculateMinutes(arrival.arrival_time)
              : t("No arrivals");
            const isNow = eta === t("Now arriving");

            return (
              <li
                className="subway-info__item"
                key={`${arrival.route}-${index}`}
              >
                <h4 className="subway-info__route">
                  {arrival.route === "-"
                    ? ""
                    : `${arrival.route} ${t("Train")}`}
                </h4>
                <span
                  className={`subway-info__eta ${isNow ? "now-arriving" : ""}`}
                >
                  {eta}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default SubwayInfo;
