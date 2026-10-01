export interface GeoPoint {
  latitude: number;
  longitude: number;
}

export function haversineDistanceMeters(a: GeoPoint, b: GeoPoint): number {
  const earthRadiusMeters = 6_371_000;
  const latitudeDelta = ((b.latitude - a.latitude) * Math.PI) / 180;
  const longitudeDelta = ((b.longitude - a.longitude) * Math.PI) / 180;
  const latitudeA = (a.latitude * Math.PI) / 180;
  const latitudeB = (b.latitude * Math.PI) / 180;
  const value =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(latitudeA) * Math.cos(latitudeB) * Math.sin(longitudeDelta / 2) ** 2;
  return 2 * earthRadiusMeters * Math.asin(Math.sqrt(value));
}

export function isWithinRadius(point: GeoPoint, center: GeoPoint, radiusMeters: number): boolean {
  return haversineDistanceMeters(point, center) <= radiusMeters;
}