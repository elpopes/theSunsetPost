import { buildQuery } from "./utils/adminAnalyticsApi";

test("buildQuery omits empty analytics filters", () => {
  expect(
    buildQuery({
      start_date: "2026-07-01",
      end_date: "2026-07-31",
      language: "",
      source_type: null,
    }),
  ).toBe("?start_date=2026-07-01&end_date=2026-07-31");
});
