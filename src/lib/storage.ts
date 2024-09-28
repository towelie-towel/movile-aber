import AsyncStorage from '@react-native-async-storage/async-storage';

import { Profile } from '~/types/User';

export const storePublicProfile = async (profile: Profile) => {
  try {
    const key = `profile-${profile.id}`;
    await AsyncStorage.setItem(key, JSON.stringify(profile));
  } catch (e) {
    console.error("storePublicProfile error", e)
    throw e
  }
};
export const getStoredPublicProfile = async (id: string) => {
  try {
    const key = `profile-${id}`;
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    console.error("getStoredPublicProfile error", e)
    throw e
  }
}

export const storeData = async (key: string, value: any) => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (e) {
    console.error("storeData error", e)
    throw e
  }
};
export const getData = async (key: string) => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    console.error("getData error", e)
    throw e
  }
};

const storage = {
  get: async (key: string) => {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) {
      console.error("storage.get error", e)
      throw e
    }
  }
  ,
  getBoolean: async (key: string) => {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      const res = jsonValue != null ? JSON.parse(jsonValue) as boolean : null;
      return res
    } catch (e) {
      console.error("storage.getBoolean error", e)
      throw e
    }
  },
  set: async (key: string) => {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) {
      console.error("storage.set error", e)
      throw e
    }
  },
  delete: async (key: string) => {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) {
      console.error("storage.delete error", e)
      throw e
    }
  },
  getString: async (key: string) => {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) {
      console.error("storage.getString error", e)
      throw e
    }
  }
}

export default storage
