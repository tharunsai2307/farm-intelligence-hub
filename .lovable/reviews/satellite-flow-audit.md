# Satellite image flow audit

Rule: farm satellite views use the saved GPS location, show available images or a readable failure, and distinguish configured basemaps from imported scientific scenes.

## Read and repaired
- AgriSense satellite card: imported image URLs were not rendered; now displayed with capture date, metrics preserved, and readable image errors.
- AgriSense source status and satellite panel: configured basemaps no longer claim a verified connection or live scene feed; pending and record-read errors are explicit.
- Shared status function and authenticated satellite records endpoint: only implemented Google basemap credentials count toward basemap availability; stored scenes still load independently. Failed record reads no longer become successful empty responses.
- Satellite image endpoint: uses the linked Google gateway, not an unrelated Earth Engine key; authenticates before upstream requests, validates inputs, and reports provider errors.
- Satellite coordinate lookup, image endpoint, and coordinate editor service: consistently choose the earliest saved location without changing existing rows.
- Farm Location screen and shared Leaflet map: blank fields are not interpreted as zero; the map remains available to select the first location; obsolete Stamen overlay removed, tile errors visible, browser-only Leaflet loaded after hydration.

## Read; no image-delivery repair needed
- Farm onboarding: blank coordinates remain absent and farm creation only inserts a location when both coordinates exist. Server validation bounds coordinates.
- Dashboard summary: counts saved farm locations; does not render satellite images or advertise satellite provider health.
- Digital Twin readiness, location panel, and timeline: use saved coordinates and real activity; no satellite image request or configured-provider assertion.
- FarmTimeline: satellite is a display category only; it does not request or generate imagery.
- Settings Data Sources: weather-only status, no satellite assertion.
- Landing page: satellite capability text, no actual satellite request or provider health assertion.
- Satellite table migrations and farm-location policies/updated-at trigger: persistence, indexing, access control and timestamp maintenance only; no image fetching. Left unchanged.
- No satellite importer, scheduled satellite fetch, or database image-fetch function was found in application sources or migrations. Configured Google basemaps do not imply these exist.

## Verification
- Five shared-rule tests passed.
- Latest automatic build: OK.
- Browser: home renders, AgriSense/Farm Location/Digital Twin redirect signed-out users to login; both satellite endpoints return 401 without a session; no page runtime errors.
- Live Google Maps rendering is unavailable in the sandbox. Validate on the authorized published HTTPS origin.
- Signed-in verification is blocked: account session creation returned backend-inaccessible. No signed-in image success is claimed.
- Existing records, permissions, settings, and example data were not modified.