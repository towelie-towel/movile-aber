export const getAddress = async (latitude: number, longitude: number) => {
  const resp = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AIzaSyAtcwUbA0jjJ6ARXl5_FqIqYcGbTI_XZEE`)
  const respJson = await resp.json();

  const streetAddresses = respJson.results.filter((result: any) => result.types.includes('street_address') || result.types.includes('route'))
  const streets = streetAddresses.map((address: any) => address.address_components.find((component: any) => component.types.includes('route'))?.long_name)
  console.log(JSON.stringify(respJson.results, null, 2))
  return streets
}

export const getDirections = async (startLoc: string, destinationLoc: string) => {
  try {
    const resp = await fetch(
      `http://172.20.10.12:4200/route?from=${startLoc}&to=${destinationLoc}`
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

export function calculateMiddlePointAndDelta(coord1: { latitude: number, longitude: number }, coord2: { latitude: number, longitude: number }, buffer = 0.01) {
  const middlePoint = {
    latitude: (coord1.latitude + coord2.latitude) / 2,
    longitude: (coord1.longitude + coord2.longitude) / 2,
  };

  const latitudeDelta = Math.abs(coord1.latitude - coord2.latitude) + buffer;
  const longitudeDelta = Math.abs(coord1.longitude - coord2.longitude) + buffer;

  return {
    ...middlePoint,
    latitudeDelta,
    longitudeDelta,
  };
}