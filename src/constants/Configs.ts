import type { KeyboardTypeOptions } from 'react-native';
import { LatLng } from 'react-native-maps';

export const drawerItems: {
  icon: string;
  label: string;
}[] = [
    {
      icon: 'map',
      label: 'Home',
    },
    {
      icon: 'wallet-giftcard',
      label: 'Wallet',
    },
    {
      icon: 'history',
      label: 'History',
    },
    {
      icon: 'notifications',
      label: 'Notifications',
    },
    {
      icon: 'settings',
      label: 'Settings',
    },
  ];

export enum ClientSteps {
  SEARCH = 1,
  TAXI = 2,
  RIDE = 3,
}

export enum TaxiSteps {
  WAITING = 1,
  CONFIRM = 2,
  PICKUP = 3,
  RIDE = 4,
}

export enum UserRoles {
  CLIENT = 'client',
  TAXI = 'taxi',
  ADMIN = 'admin',
}

export interface RideInfo {
  client: {
    name: string;
    phone: string;
  };
  origin: {
    address: string;
    latitude: number;
    longitude: number;
  };
  destination: {
    latitude: number;
    longitude: number;
    address: string;
  };
  price: number;
  distance: {
    text: string;
    value: number;
  };
  duration: {
    text: string;
    value: number;
  };
  overview_polyline: {
    points: string;
  };
}
export type NavigationInfo = {
  coords: LatLng[];
} & google.maps.DirectionsLeg

export interface configs {
  General?: GeneralConfig;
  Themes?: undefined;
  Network?: undefined;
  Admin?: undefined;
  Device?: undefined;
  Service?: undefined;
  Payment?: undefined;
  Config?: undefined;
  Drawer?: undefined;
  SignIn?: SignInConfig;
  SignUp?: undefined;
}

interface GeneralConfig {
  title: string;
  description: string;
  logo: string;
  background: string;
  color: string;
  image: string;
  customConfig: boolean;
}

export interface SignInConfig {
  title: string;
  reduce_title: boolean;
  screen_title: string;
  description: string;
  logo: string;
  light_theme: {
    background: string;
    textColor: string;
  };
  dark_theme: {
    background: string;
    text_color: string;
  };
  blur_hash: string;
  image: string;
  vanish_logo: boolean;
  errors: {
    phone_error: {
      length: {
        active: boolean;
        message: string;
        value: number;
      };
      starts_with: {
        active: boolean;
        message: string;
        value: string;
      };
      invalid_chars: {
        active: boolean;
        message: string;
        with_invalid: boolean;
      };
    };
    password_error: {
      max_length: {
        active: boolean;
        message: string;
        value: number;
      };
      min_length: {
        active: boolean;
        message: string;
        value: number;
      };
    };
  };
  fields: {
    phone: TextInputConfig;
    password: TextInputConfig;
  };
  button_texts: {
    init_session: string;
    dontHave_account: string;
    create_account: string;
  };
}

interface ColorByTheme {
  light: string;
  dark: string;
}
interface TextInputConfig {
  placeholder: string;
  placeholder_text_color: ColorByTheme;
  keyboard_type: KeyboardTypeOptions;
  auto_capitalize: 'none' | 'sentences' | 'words' | 'characters' | undefined;
  max_length: number;
  auto_correct: boolean;
  secure_text_entry: boolean;
}
