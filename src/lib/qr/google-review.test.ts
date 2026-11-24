import { describe, expect, it } from "vitest";
import { fidFromUrl, isDirectReviewUrl, placeIdFromFid, placeIdFromInput, reviewUrlFromPlaceId } from "@/lib/qr/google-review";

describe("google review links", () => {
  it("turns a Maps feature id into the write-review place id", () => {
    expect(placeIdFromFid("0x4870bdb5f4979a6f:0x5cc54664d2153657")).toBe("ChIJb5qX9LW9cEgRVzYV0mRGxVw");
  });

  it("reads the feature id out of a Maps place URL", () => {
    const url = "https://www.google.com/maps/place/Shop/@1,2,17z/data=!3m1!4b1!4m6!3m5!1s0x399c470720d572c5:0x56417441619742e0";
    expect(fidFromUrl(url)).toBe("0x399c470720d572c5:0x56417441619742e0");
    expect(isDirectReviewUrl(reviewUrlFromPlaceId("ChIJb5qX9LW9cEgRVzYV0mRGxVw"))).toBe(true);
  });

  it("accepts a bare Place ID and rejects a Maps link", () => {
    expect(placeIdFromInput("  ChIJb5qX9LW9cEgRVzYV0mRGxVw  ")).toBe("ChIJb5qX9LW9cEgRVzYV0mRGxVw");
    expect(placeIdFromInput("https://maps.app.goo.gl/abc")).toBeNull();
    expect(isDirectReviewUrl(reviewUrlFromPlaceId("ChIJb5qX9LW9cEgRVzYV0mRGxVw"))).toBe(true);
  });
});
