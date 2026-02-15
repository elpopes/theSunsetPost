import { logEvent } from "../analytics";

export const logInfoClick = ({ slot, info_id, lng, path, dest }) => {
  logEvent("info_click", { slot, info_id, lng, path, dest });
};
