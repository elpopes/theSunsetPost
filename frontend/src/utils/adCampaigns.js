import { useEffect, useState } from "react";

// BWI October 22–November 30, 2026 campaign shares one English creative across EN/ES/ZH.
// Dates are explicit Brooklyn-local midnights, with an exclusive Dec 1 cutoff.
export const BWI_NOV_2026 = {
  id: "bwi_deckhand_202611",
  href: "https://qrco.de/bebvvd",
  startsAt: "2026-10-22T00:00:00-04:00",
  endsAt: "2026-12-01T00:00:00-05:00",
};

// Brooklyn Org's event-specific creative must not advertise registration after Nov 5.
// The paid one-month term continues through Nov 26; replace the creative with
// the promised general Sunset Park Fund advertisement for the remaining days.
export const BKO_SUNSET_PARK_FUND_202610 = {
  id: "bko_sunset_park_fund_202610",
  href: "https://www.eventbrite.com/e/sunset-park-community-conversation-tickets-2003520131647",
  startsAt: "2026-10-27T00:00:00-04:00",
  endsAt: "2026-11-06T00:00:00-05:00",
};


// Brooklyn Org advisory council recruitment, Nov 22–Dec 21, 2026.
// Nov 22–26 honors the unfinished original placement; the separately billed
// one-month renewal is Nov 27–Dec 26. Current art names a Dec 21 deadline,
// so stop this creative on Dec 22; request neutral replacement art for Dec 22–26.
export const BKO_SUNSET_PARK_FUND_ADVISORY_202611 = {
  id: "bko_sunset_park_fund_advisory_202611",
  hrefByLang: {
    en: "https://bcf.tfaforms.net/4946866",
    es: "https://bcf.tfaforms.net/4946876",
    zh: "https://bcf.tfaforms.net/4946877",
  },
  startsAt: "2026-11-22T00:00:00-05:00",
  endsAt: "2026-12-22T00:00:00-05:00",
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
