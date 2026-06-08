import test from "node:test";
import assert from "node:assert/strict";
import { calculateTotalPrice, isValidDateRange } from "../src/services/booking.service.js";

test("calculateTotalPrice should compute total correctly for half hour increments", () => {
  const price = calculateTotalPrice(1000, "2026-06-07T10:00:00", "2026-06-07T12:30:00");
  assert.equal(price, 2500); // 2.5 цаг × 1000
});

test("isValidDateRange should return true for valid start/end", () => {
  assert.equal(isValidDateRange("2026-06-07T10:00:00", "2026-06-07T12:00:00"), true);
});

test("isValidDateRange should return false when end is before start", () => {
  assert.equal(isValidDateRange("2026-06-07T12:00:00", "2026-06-07T10:00:00"), false);
});

test("calculateTotalPrice should reject zero or negative durations", () => {
  assert.throws(
    () => calculateTotalPrice(1200, "2026-06-07T12:00:00", "2026-06-07T12:00:00"),
    {
      name: "ApiError",
    }
  );
});
