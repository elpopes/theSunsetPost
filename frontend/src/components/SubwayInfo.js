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

const DIRECTIONS = {
  northbound: "N",
  southbound: "S",
};

const DOUBLE_TAP_DELAY = 300;

const DIRECTION_COPY = {
  en: {
    southboundAt: "{{station}} · Southbound",
    northboundLabel:
      "Manhattan-bound subway arrivals at {{station}}. Single tap or press Enter to show the next Sunset Park station. Double tap, or use the left/right arrow keys, to switch direction.",
    southboundLabel:
      "Southbound subway arrivals at {{station}}. Single tap or press Enter to show the next Sunset Park station. Double tap, or use the left/right arrow keys, to switch direction.",
    interactionHint: "Single tap: next station. Double tap: switch direction.",
  },
  es: {
    southboundAt: "{{station}} · hacia el sur",
    northboundLabel:
      "Llegadas del metro hacia Manhattan en {{station}}. Toca una vez o presiona Enter para mostrar la próxima estación de Sunset Park. Toca dos veces, o usa las flechas izquierda/derecha, para cambiar de dirección.",
    southboundLabel:
      "Llegadas del metro hacia el sur en {{station}}. Toca una vez o presiona Enter para mostrar la próxima estación de Sunset Park. Toca dos veces, o usa las flechas izquierda/derecha, para cambiar de dirección.",
    interactionHint:
      "Un toque: próxima estación. Dos toques: cambiar de dirección.",
  },
  zh: {
    southboundAt: "{{station}} · 南行",
    northboundLabel:
      "{{station}}开往曼哈顿方向的地铁到站信息。单击或按回车键查看日落公园下一站。双击，或使用左右方向键，切换行驶方向。",
    southboundLabel:
      "{{station}}南行地铁到站信息。单击或按回车键查看日落公园下一站。双击，或使用左右方向键，切换行驶方向。",
    interactionHint: "单击：下一站。双击：切换方向。",
  },
};

const STATIONS = [
  {
    key: "36-st",
    stopId: "R36",
    feedKeys: ["nqrw", "bdfm"],
  },
  {
    key: "9-av",
    stopId: "B12",
    feedKeys: ["bdfm"],
  },
  {
    key: "8-av",
    stopId: "N02",
    feedKeys: ["nqrw"],
  },
  {
    key: "59-st",
    stopId: "R41",
    feedKeys: ["nqrw"],
  },
];

const SubwayInfo = () => {
  const { t, i18n } = useTranslation();

  const [arrivalsByStation, setArrivalsByStation] = useState({});
  const [stationIndex, setStationIndex] = useState(() =>
    Math.floor(Math.random() * STATIONS.length)
  );
  const [direction, setDirection] = useState("northbound");
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const feedMessageRef = useRef(null);
  const tapTimerRef = useRef(null);
  const selectedStation = STATIONS[stationIndex];
  const arrivals = arrivalsByStation[selectedStation.key]?.[direction] || [];

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

        STATIONS.forEach(({ key, stopId, feedKeys }) => {
          nextArrivalsByStation[key] = {};

          Object.entries(DIRECTIONS).forEach(([directionKey, suffix]) => {
            const stationId = `${stopId}${suffix}`;
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

            nextArrivalsByStation[key][directionKey] = stationArrivals
              .filter((arrival) => arrival.arrival_time)
              .sort((a, b) => a.arrival_time - b.arrival_time)
              .slice(0, 3);
          });
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

  useEffect(
    () => () => {
      if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
    },
    []
  );

  const calculateMinutes = (arrivalTime) => {
    const now = new Date();
    const diffMs = arrivalTime - now;
    const diffMinutes = Math.floor(diffMs / 60000);
    return diffMinutes <= 0 ? t("Now arriving") : `${diffMinutes} ${t("min")}`;
  };

  const cycleStation = () => {
    setStationIndex((currentIndex) => (currentIndex + 1) % STATIONS.length);
  };

  const switchDirection = () => {
    setDirection((currentDirection) =>
      currentDirection === "northbound" ? "southbound" : "northbound"
    );
  };

  const handleClick = () => {
    if (tapTimerRef.current) {
      clearTimeout(tapTimerRef.current);
      tapTimerRef.current = null;
      switchDirection();
      return;
    }

    tapTimerRef.current = setTimeout(() => {
      cycleStation();
      tapTimerRef.current = null;
    }, DOUBLE_TAP_DELAY);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      cycleStation();
      return;
    }

    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      switchDirection();
    }
  };

  const language = String(i18n.resolvedLanguage || i18n.language || "en")
    .toLowerCase()
    .startsWith("es")
    ? "es"
    : String(i18n.resolvedLanguage || i18n.language || "en")
        .toLowerCase()
        .startsWith("zh")
      ? "zh"
      : "en";
  const copy = DIRECTION_COPY[language];
  const stationName = t(`subway.stations.${selectedStation.key}`);
  const isNorthbound = direction === "northbound";
  const heading = isNorthbound
    ? t("subway.manhattanBoundAt", { station: stationName })
    : copy.southboundAt.replace("{{station}}", stationName);
  const cycleLabel = (isNorthbound
    ? copy.northboundLabel
    : copy.southboundLabel
  ).replace("{{station}}", stationName);

  return (
    <div
      className="subway-info"
      aria-busy={initialLoading || refreshing}
      aria-label={cycleLabel}
      role="button"
      tabIndex={0}
      title={copy.interactionHint}
      onClick={handleClick}
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
