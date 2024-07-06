import type { IMarker } from "~/types/Marker";

export const defaultMarkers = [{ name: "Trabajo", icon: "folder-marker" }, { name: "Casa", icon: "home-map-marker" }]

export const initialMarkers: IMarker[] = [
  {
    coordinate: {
      latitude: 23.1218644,
      longitude: -82.32806211,
    },
    title: 'Best Place',
    description: 'This is the best place in Portland',
    imageURL: '',
  },
  {
    coordinate: {
      latitude: 23.1118644,
      longitude: -82.31806211,
    },
    title: 'Second Best Place',
    description: 'This is the second best place in Portland',
    imageURL: '',
  },
  {
    coordinate: {
      latitude: 23.1318644,
      longitude: -82.33806211,
    },
    title: 'Third Best Place',
    description: 'This is the third best place in Portland',
    imageURL: '',
  },
  {
    coordinate: {
      latitude: 23.1148644,
      longitude: -82.34806211,
    },
    title: 'Fourth Best Place',
    description: 'This is the fourth best place in Portland',
    imageURL: '',
  },
];
