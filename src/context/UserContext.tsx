import NetInfo from '@react-native-community/netinfo';
import React, { createContext, useCallback, useContext, useEffect, useReducer } from 'react';
import { atomWithStorage, createJSONStorage, } from 'jotai/utils';
import AsyncStorage from '@react-native-async-storage/async-storage'

import { getData } from '~/lib/storage';
import { UserMarkerIconType } from '~/components/markers/AddUserMarker';
import { fetchProfile, updateProfile } from '~/utils/auth';
import type { Profile, UserRole } from '~/types/User';

const storedUserMarkers = createJSONStorage<UserMarkerIconType[]>(() => AsyncStorage)
export const userMarkersAtom = atomWithStorage<UserMarkerIconType[]>('user_markers', [], storedUserMarkers)

const AUTH_LOGS = true;

type State = {
  profile: Profile | null;
  error: Error | null;
  isError: boolean;
  isSignedIn: boolean;
  isInitializing: boolean;
}

type Action =
  | { type: 'GET_PROFILE_SUCCESS', payload: Profile }
  | { type: 'GET_PROFILE_ERROR', payload: Error }
  | { type: 'GET_PROFILE_NOT_FOUND', payload: Profile }
  | { type: 'UPDATE_PROFILE_SUCCESS', payload: Profile }
  // | { type: 'UPDATE_PROFILE_ERROR', payload: Error }
  | { type: 'SIGN_OUT_SUCCESS' }
  | { type: 'SET_USER_MARKERS', payload: UserMarkerIconType[] }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'GET_PROFILE_SUCCESS':
      return {
        isSignedIn: true,
        isInitializing: false,
        profile: {
          ...state.profile,
          ...action.payload
        },
        isError: false,
        error: null
      };
    case 'GET_PROFILE_ERROR':
      return { ...state, error: action.payload, isError: true, isSignedIn: false, isInitializing: false };
    case 'GET_PROFILE_NOT_FOUND':
      return { ...state, error: new Error("Profile not found"), isError: true, isSignedIn: false, isInitializing: false };
    case 'UPDATE_PROFILE_SUCCESS':
      return { ...state, profile: action.payload, isError: false, error: null };
    case 'SIGN_OUT_SUCCESS':
      return { profile: null, isSignedIn: false, error: null, isError: false, isInitializing: false };
    default:
      return state;
  }
}

type UserContext = {
  signOut: () => Promise<void>;
  updateUserHandler: (params: Omit<Partial<Profile>, "id">) => Promise<void>;
} & State

const initialValue: UserContext = {
  profile: null,
  error: null,
  isError: false,
  isSignedIn: false,
  isInitializing: true,
  signOut: async () => {
    throw new Error('Function not initizaliced yet');
  },
  updateUserHandler: async () => {
    throw new Error('Function not initizaliced yet');
  },
};

const UserContext = createContext(initialValue);

export const useUser = () => {
  return useContext(UserContext);
};

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, {
    error: null,
    profile: null,
    isSignedIn: false,
    isError: false,
    isInitializing: true,
  });
  const { isConnected } = NetInfo.useNetInfo();

  const getProfile = useCallback(async (id: string) => {
    try {
      const respProfile = await fetchProfile(id);

      if (AUTH_LOGS) console.log(JSON.stringify(respProfile, null, 2))

      if (!respProfile) {
        dispatch({ type: 'GET_PROFILE_ERROR', payload: new Error('Profile not found') });
      } else {
        if (AUTH_LOGS) console.log("getProfile success", JSON.stringify(respProfile, null, 2))
        dispatch({ type: 'GET_PROFILE_SUCCESS', payload: respProfile });
      }
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        dispatch({ type: 'GET_PROFILE_ERROR', payload: error });
      }
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      // sign out

    } catch (error) {
      console.error(error);
    }
  }, []);

  const updateUserHandler = useCallback(async (profile: Omit<Partial<Profile>, "id">) => {
    try {
      // update user
      if (!state.profile) {
        throw new Error('Profile not found');
      }

      await updateProfile({ ...profile, id: state.profile.id });

      dispatch({
        type: 'UPDATE_PROFILE_SUCCESS', payload: {
          ...state.profile,
          username: profile.username ?? state.profile.username,
          full_name: profile.full_name ?? state.profile.full_name,
          role: profile.role ?? state.profile.role,
          avatar_url: profile.avatar_url ?? state.profile.avatar_url,
          email: profile.email ?? state.profile.email,
        }
      });
    } catch (error) {
      console.error(error)
      if (error instanceof Error) {
        // dispatch({ type: 'UPDATE_PROFILE_ERROR', payload: error });
      }
    }
  }, [state.profile]);

  useEffect(() => {
    if (AUTH_LOGS) console.log('UserContext.tsx -> useEffect [isConnected]', isConnected);

    if (!isConnected) {
      if (AUTH_LOGS) console.log('Internet is not reachable');
      return;
    }

    getProfile("e117adcb-f429-42f7-95d9-07f1c92a1c8b")
  }, [isConnected]);

  useEffect(() => {
    if (AUTH_LOGS) console.log('UserContext.tsx -> useEffect []');
    getData('user_markers').then((data) => {
      dispatch({ type: 'SET_USER_MARKERS', payload: data ?? [] });
    });
  }, [])

  return (
    <UserContext.Provider
      value={{
        ...state,
        updateUserHandler,
        signOut,
      }}>
      {children}
    </UserContext.Provider>
  );
};
