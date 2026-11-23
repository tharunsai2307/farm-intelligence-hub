import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { isSafeMapOrigin, staticSatelliteUrl } from "./satellite-image";

describe("satellite image origin safety", () => {
  test("never sends a credential-bearing preview origin to Google", () => {
    assert.equal(isSafeMapOrigin("https://project-devserver-accesskey.lovableproject.com"), false);
    assert.equal(staticSatelliteUrl("https://project-devserver-accesskey.lovableproject.com", "public-test-key", 12, 77), null);
  });
  test("uses HTTPS published site for browser Static Maps", () => {
    const source = staticSatelliteUrl("https://agri-twin-os.lovable.app", "public-test-key", 12, 77, "tracking");
    assert.notEqual(source, null);
    if (!source) throw new Error("Expected image URL");
    assert.equal(new URL(source).searchParams.get("center"), "12,77");
    assert.equal(new URL(source).searchParams.get("maptype"), "satellite");
  });
  test("rejects invalid coordinates and insecure origins", () => {
    assert.equal(staticSatelliteUrl("https://agri-twin-os.lovable.app", "public-test-key", 91, 77), null);
    assert.equal(isSafeMapOrigin("http://localhost:8080"), false);
  });
});