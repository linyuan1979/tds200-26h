import * as Location from "expo-location";
import { PostLocation } from "@/utils/postData";

export class LocationPermissionDeniedError extends Error {
  constructor() {
    super("Location permission denied. Enable it in your device settings.");
    this.name = "LocationPermissionDeniedError";
  }
}

function formatCoordinates(latitude: number, longitude: number): string {
  return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
}

// Reverse geocoding: turn GPS coordinates into a human-readable address.
// Two ways to do it are shown below. Method 1 is active; Method 2 is
// commented out — swap them to try the device's own geocoder.

// Method 1 (active): Google Geocoding HTTP API.
// Requires EXPO_PUBLIC_GOOGLE_MAPS_API_KEY in .env and "Geocoding API"
// enabled in Google Cloud Console. Works the same on iOS, Android, and web.
//
// Falls back to raw coordinates if the key is missing or the request fails.
async function reverseGeocode(latitude: number, longitude: number): Promise<string> {
  const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return formatCoordinates(latitude, longitude);
  }
  try {
    const url =
      `https://maps.googleapis.com/maps/api/geocode/json` +
      `?latlng=${latitude},${longitude}&key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.status === "OK" && data.results.length > 0) {
      return data.results[0].formatted_address as string;
    }
  } catch {
    // network error — fall through to the coordinate fallback
  }
  return formatCoordinates(latitude, longitude);
}

/* Method 2 (commented out): expo-location's own geocoder — no API key needed.
It asks the device's built-in geocoder (Apple on iOS, android.location.Geocoder
on Android). Limitations:
- Web: not supported — it always throws.
- Android: needs a geocoding backend on the device, which is often missing on
  emulators or devices without Google Play Services.
To try it: comment out Method 1 above and uncomment this function.

async function reverseGeocode(latitude: number, longitude: number): Promise<string> {
  try {
    const results = await Location.reverseGeocodeAsync({ latitude, longitude });
    const place = results[0];
    if (place) {
      const parts = [place.street ?? place.name, place.city, place.country].filter(Boolean);
      if (parts.length > 0) {
        return parts.join(", ");
      }
    }
  } catch {
    // geocoder not available — fall through to the coordinate fallback
  }
  return formatCoordinates(latitude, longitude);
}
*/

// Requests permission, reads the current GPS position, and turns it into a
// human-readable address.
export async function getCurrentLocation(): Promise<PostLocation> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") {
    throw new LocationPermissionDeniedError();
  }

  const position = await Location.getCurrentPositionAsync({});
  const { latitude, longitude } = position.coords;
  const address = await reverseGeocode(latitude, longitude);

  return { latitude, longitude, address };
}

export class InvalidCoordinatesError extends Error {
  constructor() {
    super("Enter a valid latitude (-90 to 90) and longitude (-180 to 180).");
    this.name = "InvalidCoordinatesError";
  }
}

// Builds a location from coordinates typed in by hand instead of the device's
// GPS. No permission, GPS, or network fix needed — useful for testing on a
// simulator/emulator, or to post from a specific place.
export async function getMockLocation(
  latitude: number,
  longitude: number
): Promise<PostLocation> {
  if (
    Number.isNaN(latitude) ||
    Number.isNaN(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    throw new InvalidCoordinatesError();
  }

  const address = await reverseGeocode(latitude, longitude);
  return { latitude, longitude, address };
}
