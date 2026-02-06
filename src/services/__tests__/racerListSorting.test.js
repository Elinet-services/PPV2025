import { resolveRacerOrder, sortRacersByPaymentAndOrder, toSortableIsoDate } from "../racerListSorting";

describe("racerListSorting", () => {
  test("keeps original order when nobody is paid", () => {
    const racers = [
      { name: "A", surname: "One" },
      { name: "B", surname: "Two" },
      { name: "C", surname: "Three" },
    ];

    const sorted = sortRacersByPaymentAndOrder(racers);
    expect(sorted.map((r) => r.name)).toEqual(["A", "B", "C"]);
  });

  test("sorts by numeric order value instead of text", () => {
    const racers = [
      { name: "Ten", surname: "Pilot", order: "10" },
      { name: "Two", surname: "Pilot", order: "2" },
      { name: "One", surname: "Pilot", order: "1" },
    ];

    const sorted = sortRacersByPaymentAndOrder(racers);
    expect(sorted.map((r) => r.name)).toEqual(["One", "Two", "Ten"]);
  });

  test("puts paid racers first and sorts paid by date, then by order in same day", () => {
    const racers = [
      { name: "Unpaid", surname: "Pilot", order: "1", paymentDate: "" },
      { name: "PaidLater", surname: "Pilot", order: "2", paymentDate: "2026-02-05" },
      { name: "PaidEarlier", surname: "Pilot", order: "10", paymentDate: "2026-02-01" },
      { name: "PaidSameDayLowerOrder", surname: "Pilot", order: "3", paymentDate: "2026-02-05" },
    ];

    const sorted = sortRacersByPaymentAndOrder(racers);
    expect(sorted.map((r) => r.name)).toEqual([
      "PaidEarlier",
      "PaidLater",
      "PaidSameDayLowerOrder",
      "Unpaid",
    ]);
  });

  test("sorts same payment day by order value", () => {
    const racers = [
      { name: "Order10", surname: "Pilot", order: "10", paymentDate: "12.02.2026" },
      { name: "Order2", surname: "Pilot", order: "2", paymentDate: "12.02.2026" },
    ];

    const sorted = sortRacersByPaymentAndOrder(racers);
    expect(sorted.map((r) => r.name)).toEqual(["Order2", "Order10"]);
  });

  test("reads order from parameters payload", () => {
    const order = resolveRacerOrder({ parameters: "{\"order\":\"7\"}" }, 99);
    expect(order).toBe(7);
  });

  test("normalizes czech and iso date formats", () => {
    expect(toSortableIsoDate("5.2.2026")).toBe("2026-02-05");
    expect(toSortableIsoDate("2026-02-05T12:44:00.000Z")).toBe("2026-02-05");
  });
});

