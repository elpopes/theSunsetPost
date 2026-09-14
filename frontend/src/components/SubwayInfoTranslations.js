const COPY = {
  en: {
    southboundAt: "{{station}} · Southbound",
    interactionHint:
      "Tap once for the next station. Double-tap to switch direction.",
    northboundCycleLabel:
      "Manhattan-bound subway arrivals at {{station}}. Activate once to show the next Sunset Park station; activate twice to switch direction.",
    southboundCycleLabel:
      "Southbound subway arrivals at {{station}}. Activate once to show the next Sunset Park station; activate twice to switch to Manhattan-bound.",
  },
  es: {
    southboundAt: "{{station}} · hacia el sur",
    interactionHint:
      "Toca una vez para mostrar la próxima estación. Toca dos veces para cambiar de dirección.",
    northboundCycleLabel:
      "Llegadas del metro hacia Manhattan en {{station}}. Activa una vez para mostrar la próxima estación de Sunset Park; activa dos veces para cambiar de dirección.",
    southboundCycleLabel:
      "Llegadas del metro hacia el sur en {{station}}. Activa una vez para mostrar la próxima estación de Sunset Park; activa dos veces para cambiar a la dirección hacia Manhattan.",
  },
  zh: {
    southboundAt: "{{station}} · 南行",
    interactionHint: "轻触一次查看下一站；连续轻触两次切换方向。",
    northboundCycleLabel:
      "{{station}}开往曼哈顿方向的地铁到站信息。操作一次查看日落公园下一站；操作两次切换方向。",
    southboundCycleLabel:
      "{{station}}南行地铁到站信息。操作一次查看日落公园下一站；操作两次切换至曼哈顿方向。",
  },
};

const normalizeLanguage = (language = "en") => {
  const value = String(language).toLowerCase();
  if (value.startsWith("es")) return "es";
  if (value.startsWith("zh")) return "zh";
  return "en";
};

const interpolateStation = (template, station) =>
  template.replace("{{station}}", station);

export const getSubwayInteractionCopy = (language, station) => {
  const copy = COPY[normalizeLanguage(language)];

  return {
    ...copy,
    southboundAt: interpolateStation(copy.southboundAt, station),
    northboundCycleLabel: interpolateStation(copy.northboundCycleLabel, station),
    southboundCycleLabel: interpolateStation(copy.southboundCycleLabel, station),
  };
};
