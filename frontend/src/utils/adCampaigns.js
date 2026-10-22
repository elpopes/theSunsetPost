import { useEffect, useState } from "react";

// The November 2026 BWI campaign shares one English creative across EN/ES/ZH.
// Dates are explicit Brooklyn-local midnights, with an exclusive Dec 1 cutoff.
export const BWI_NOV_2026 = {
  id: "bwi_deckhand_202611",
  href: "https://qrco.de/bebvvd",
  startsAt: "2026-11-01T00:00:00-04:00",
  endsAt: "2026-12-01T00:00:00-05:00",
};

export const useCampaignActive = ({ startsAt, endsAt }) => {
  const [now, setNow] = useState(() => Date.now());

  // Updates an already-open page at a campaign boundary without a redeploy.
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return now >= Date.parse(startsAt) && now < Date.parse(endsAt);
};
