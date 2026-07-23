import { logEvent } from "../analytics";
import { recordAdEvent } from "./firstPartyAnalytics";

export const logInfoClick = ({ slot, info_id, lng, path, dest }) => {
  logEvent("info_click", { slot, info_id, lng, path, dest });
  recordAdEvent({
    event_type: "click",
    campaign_key: info_id,
    slot,
    language: lng,
    path,
    destination_url: dest,
  });
};
