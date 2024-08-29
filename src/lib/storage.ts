import AsyncStorage from '@react-native-async-storage/async-storage';

export const storeData = async (key: string, value: any) => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (e) {
    console.error("storeData error", e)
  }
};

export const getData = async (key: string) => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    console.error("getData error", e)
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
