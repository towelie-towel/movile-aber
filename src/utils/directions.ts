export const getAddress = async (latitude: number, longitude: number) => {
  const resp = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AIzaSyAtcwUbA0jjJ6ARXl5_FqIqYcGbTI_XZEE`
  );
  const respJson = await resp.json();

  const streetAddresses = respJson.results.filter(
    (result: any) => result.types.includes('street_address') || result.types.includes('route')
  );
  const streets = streetAddresses.map(
    (address: any) =>
      address.address_components.find((component: any) => component.types.includes('route'))
        ?.long_name
  );
  console.log(JSON.stringify(respJson.results, null, 2));
  return streets;
};

export const getDirections = async (startLoc: string, destinationLoc: string) => {
  try {
    const resp = await fetch(
      `http://172.20.10.4:6942/route?from=${startLoc}&to=${destinationLoc}`
    );
    const respJson = await resp.json();
    const decodedCoords = polylineDecode(respJson[0].overview_polyline.points).map((point, _) => ({
      latitude: point[0]!,
      longitude: point[1]!,
    }));
    return decodedCoords;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const duplicateCoords = (
  coords: {
    latitude: number;
    longitude: number;
  }[]
) => {
  const newCoords: {
    latitude: number;
    longitude: number;
  }[] = [];
  for (let i = 0; i < coords.length - 1; i++) {
    newCoords.push({
      latitude: Number(coords[i]?.latitude),
      longitude: Number(coords[i]?.longitude),
    });
    newCoords.push({
      latitude: (Number(coords[i]?.latitude) + Number(coords[i + 1]?.latitude)) / 2,
      longitude: (Number(coords[i]?.longitude) + Number(coords[i + 1]?.longitude)) / 2,
    });
  }
  if (coords.length > 0) {
    newCoords.push({
      latitude: Number(coords[coords.length - 1]?.latitude),
      longitude: Number(coords[coords.length - 1]?.longitude),
    });
  }
  return newCoords;
};

export function polylineDecode(str: string, precision?: number) {
  let index = 0,
    lat = 0,
    lng = 0,
    coordinates = [],
    shift = 0,
    result = 0,
    byte = null,
    latitude_change,
    longitude_change,
    factor = Math.pow(10, precision !== undefined ? precision : 5);

  // Coordinates have variable length when encoded, so just keep
  // track of whether we've hit the end of the string. In each
  // loop iteration, a single coordinate is decoded.
  while (index < str.length) {
    // Reset shift, result, and byte
    byte = null;
    shift = 1;
    result = 0;

    do {
      byte = str.charCodeAt(index++) - 63;
      result += (byte & 0x1f) * shift;
      shift *= 32;
    } while (byte >= 0x20);

    latitude_change = result & 1 ? (-result - 1) / 2 : result / 2;

    shift = 1;
    result = 0;

    do {
      byte = str.charCodeAt(index++) - 63;
      result += (byte & 0x1f) * shift;
      shift *= 32;
    } while (byte >= 0x20);

    longitude_change = result & 1 ? (-result - 1) / 2 : result / 2;

    lat += latitude_change;
    lng += longitude_change;

    coordinates.push([lat / factor, lng / factor]);
  }

  return coordinates;
}

/* export function calculateMiddlePointAndDelta(coord1: { latitude: number, longitude: number }, coord2: { latitude: number, longitude: number }, bottomSheetHeightPercentage = 0.3, deltaIncreaseFactor = 1.2) {
  // Calculate middle point
  const middlePoint = {
    latitude: (coord1.latitude + coord2.latitude) / 2,
    longitude: (coord1.longitude + coord2.longitude) / 2,
  };

  // Calculate deltas
  const latitudeDelta = Math.abs(coord1.latitude - coord2.latitude);
  const longitudeDelta = Math.abs(coord1.longitude - coord2.longitude);

  // Calculate buffer based on vertical distance
  const buffer = latitudeDelta * 0.1;

  // Adjust latitude for bottom sheet
  const adjustedLatitude = middlePoint.latitude - (latitudeDelta + buffer) * bottomSheetHeightPercentage / 2;

  // Increase deltas
  const increasedLatitudeDelta = (latitudeDelta + buffer) * deltaIncreaseFactor;
  const increasedLongitudeDelta = (longitudeDelta + buffer) * deltaIncreaseFactor;

  return {
    latitude: adjustedLatitude,
    longitude: middlePoint.longitude,
    latitudeDelta: increasedLatitudeDelta,
    longitudeDelta: increasedLongitudeDelta,
  };
} */

export function calculateMiddlePointAndDelta(
  coord1: { latitude: number; longitude: number },
  coord2: { latitude: number; longitude: number },
  buffer = 0.01,
  bottomSheetHeightPercentage = 0.4
) {
  // Calculate middle point
  const middlePoint = {
    latitude: (coord1.latitude + coord2.latitude) / 2,
    longitude: (coord1.longitude + coord2.longitude) / 2,
  };

  // Calculate deltas with buffer
  const latitudeDelta = Math.abs(coord1.latitude - coord2.latitude) + buffer;
  const longitudeDelta = Math.abs(coord1.longitude - coord2.longitude) + buffer;

  // Adjust latitude for bottom sheet
  const adjustedLatitude = middlePoint.latitude - (latitudeDelta * bottomSheetHeightPercentage) / 2;

  return {
    latitude: adjustedLatitude,
    longitude: middlePoint.longitude,
    latitudeDelta,
    longitudeDelta,
  };
}

export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
    ;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance;
}

export function calculateBearing(startLat: number, startLng: number, destLat: number, destLng: number) {
  const startRadLat = toRadians(startLat);
  const startRadLng = toRadians(startLng);
  const destRadLat = toRadians(destLat);
  const destRadLng = toRadians(destLng);

  const deltaLng = destRadLng - startRadLng;

  const y = Math.sin(deltaLng) * Math.cos(destRadLat);
  const x = Math.cos(startRadLat) * Math.sin(destRadLat) - Math.sin(startRadLat) * Math.cos(destRadLat) * Math.cos(deltaLng);
  let bearing = toDegrees(Math.atan2(y, x));
  bearing = (bearing + 360) % 360; // Normalize to 0-360

  return bearing;
}

export function toRadians(degree: number) {
  return degree * (Math.PI / 180);
}

export function toDegrees(radian: number) {
  return radian * (180 / Math.PI);
}

export function formatDistance(distanceInKm: number) {
  let formattedDistance: string;

  if (distanceInKm < 1) {
    const distanceInMeters = Math.round(distanceInKm * 1000);
    formattedDistance = `${distanceInMeters} m`;
  } else {
    formattedDistance = `${distanceInKm.toFixed(2)} km`;
  }

  return formattedDistance;
}

export enum CardinalDirections {
  NORTH = 1,
  NORTH_EAST = 2,
  EAST = 3,
  SOUTH_EAST = 4,
  SOUTH = 5,
  SOUTH_WEST = 6,
  WEST = 7,
  NORTH_WEST = 8
}

export function cardinalToDegrees(direction: CardinalDirections) {
  switch (direction) {
    case CardinalDirections.NORTH:
      return 0;
    case CardinalDirections.NORTH_EAST:
      return 45;
    case CardinalDirections.EAST:
      return 90;
    case CardinalDirections.SOUTH_EAST:
      return 135;
    case CardinalDirections.SOUTH:
      return 180;
    case CardinalDirections.SOUTH_WEST:
      return 225;
    case CardinalDirections.WEST:
      return 270;
    case CardinalDirections.NORTH_WEST:
      return 315;
    default:
      throw new Error(`Invalid direction: ${direction}`);
  }
}