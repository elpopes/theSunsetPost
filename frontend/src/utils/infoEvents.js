import { logEvent } from "../analytics";
import { recordInfoEvent } from "./infoMetrics";

export const logInfoClick = ({ slot, info_id, lng, path, dest }) => {
  logEvent("info_click", { slot, info_id, lng, path, dest });
  recordInfoEvent({
    kind: "click",
    content_id: info_id,
    slot,
    lang: lng,
    path,
    dest,
  });
};
