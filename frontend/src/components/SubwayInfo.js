import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import protobuf from "protobufjs";
import "./SubwayInfo.css";

const FEEDS = {
  nqrw:
    "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-nqrw",
  bdfm:
    "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-bdfm",
};

const STATIONS = [
  {
    key: "36-st",
    stationId: "R36N",
    feedKeys: ["nqrw", "bdfm"],
  },
  {
    key: "9-av",
    stationId: "B12N",
    feedKeys: ["bdfm"],
  },
  {
    key: "8-av",
    stationId: "N02N",
    feedKeys: ["nqrw"],
  },
  {
    key: "59-st",
    stationId: "R41N",
    feedKeys: ["nqrw"],
  },
];

const SubwayInfo = () => {
  const { t } = useTranslation();

  const [arrivalsByStation, setArrivalsByStation] = useState({});
  const [stationIndex, setStationIndex] = useState(() =>
    Math.floor(Math.random() * STATIONS.length)
  );
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const feedMessageRef = useRef(null);
  const selectedStation = STATIONS[stationIndex];
  const arrivals = arrivalsByStation[selectedStation.key] || [];

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
        const decodedFeeds = {};

        for (const [feedKey, feedUrl] of Object.entries(FEEDS)) {
          const response = await fetch(feedUrl, { cache: "no-store" });
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const arrayBuffer = await response.arrayBuffer();
          decodedFeeds[feedKey] = FeedMessage.decode(
            new Uint8Array(arrayBuffer)
          );
        }

        const nextArrivalsByStation = {};

        STATIONS.forEach(({ key, stationId, feedKeys }) => {
          let stationArrivals = [];

          feedKeys.forEach((feedKey) => {
            const feed = decodedFeeds[feedKey];
            if (!feed) return;

            const feedArrivals = feed.entity.flatMap((entity) => {
              if (!entity.tripUpdate) return [];

              return entity.tripUpdate.stopTimeUpdate
                .filter((stopTime) => stopTime.stopId === stationId)
                .map((stopTime) => {
                  const timestamp =
                    stopTime.arrival?.time || stopTime.departure?.time;

                  return {
                    route: entity.tripUpdate.trip.routeId,
                    arrival_time: timestamp
                      ? new Date(timestamp * 1000)
                      : null,
                  };
                });
            });

            stationArrivals = stationArrivals.concat(feedArrivals);
          });

          nextArrivalsByStation[key] = stationArrivals
            .filter((arrival) => arrival.arrival_time)
            .sort((a, b) => a.arrival_time - b.arrival_time)
            .slice(0, 3);
        });

        if (!cancelled) setArrivalsByStation(nextArrivalsByStation);
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

  const cycleStation = () => {
    setStationIndex((currentIndex) => (currentIndex + 1) % STATIONS.length);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      cycleStation();
    }
  };

  const stationName = t(`subway.stations.${selectedStation.key}`);
  const heading = t("subway.manhattanBoundAt", { station: stationName });

  return (
    <div
      className="subway-info"
      aria-busy={initialLoading || refreshing}
      aria-label={t("subway.cycleLabel", { station: stationName })}
      role="button"
      tabIndex={0}
      title={t("subway.nextStation")}
      onClick={cycleStation}
      onKeyDown={handleKeyDown}
    >
      <h3 className="subway-info__header">
        <span>{heading}</span>
        <span className="subway-info__next" aria-hidden="true">
          ›
        </span>
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
