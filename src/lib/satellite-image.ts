/** Only credential-free HTTPS origins may send Google the page's origin. */
export function isSafeMapOrigin(origin: string): boolean {
  try {
    const url = new URL(origin);
    return url.protocol === "https:" && !url.username && !url.password &&
      !/-devserver-/i.test(url.hostname);
  } catch {
    return false;
  }
}

export function staticSatelliteUrl(origin: string, key: string, latitude: number, longitude: number, channel = ""): string | null {
  if (!key || !isSafeMapOrigin(origin) || !Number.isFinite(latitude) || !Number.isFinite(longitude) ||
    Math.abs(latitude) > 90 || Math.abs(longitude) > 180) return null;
  const params = new URLSearchParams({ key, center: `${latitude},${longitude}`, zoom: "16", size: "640x400", scale: "2", maptype: "satellite" });
  if (channel) params.set("channel", channel);
  return `https://maps.googleapis.com/maps/api/staticmap?${params}`;
}