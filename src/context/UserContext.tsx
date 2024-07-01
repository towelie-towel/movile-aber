import NetInfo from '@react-native-community/netinfo';
import { User, type Session } from '@supabase/supabase-js';
import React, { createContext, useCallback, useContext, useEffect, useReducer } from 'react';
import { atomWithStorage, createJSONStorage, } from 'jotai/utils';
import AsyncStorage from '@react-native-async-storage/async-storage'

import { supabase } from '~/lib/supabase';
import { UserMarkerIconType } from '~/components/markers/AddUserMarker';
import { getData } from '~/lib/storage'; UserRoles
import { RideInfo } from '~/constants/RideFlow';
import { UserRoles } from '~/constants/User';
import { PlaceInfo } from '~/constants/Places';
import { Profile } from '~/constants/User';

const storedUserMarkers = createJSONStorage<UserMarkerIconType[]>(() => AsyncStorage)
export const userMarkersAtom = atomWithStorage<UserMarkerIconType[]>('user_markers', [], storedUserMarkers)
const storedRidesHistoryMarkers = createJSONStorage<RideInfo[]>(() => AsyncStorage)
export const ridesHistoryAtom = atomWithStorage<RideInfo[]>('ride_history', [], storedRidesHistoryMarkers)

const AUTH_LOGS = false;

type State = {
  session: Session | null;
  profile: Profile | null;
  error: Error | null;
  isError: boolean;
  isSignedIn: boolean;
  isInitializing: boolean;
}

type Action =
  | { type: 'GET_SESSION_ERROR', payload: Error }
  | { type: 'GET_PROFILE_ERROR', payload: Error }
  | { type: 'GET_SESSION_SUCCESS', payload: Session }
  | { type: 'GET_PROFILE_SUCCESS', payload: Profile }
  | { type: 'GET_USER_SUCCESS', payload: User }
  | { type: 'UPDATE_PROFILE_SUCCESS', payload: Profile }
  | { type: 'SIGN_OUT_SUCCESS' }
  | { type: 'SET_ERROR', payload: Error | null }
  | { type: 'SET_PROFILE', payload: Profile | null }
  | { type: 'SET_SESSION', payload: Session | null }
  | { type: 'SET_USER_MARKERS', payload: UserMarkerIconType[] }
  | { type: 'SET_SIGNED_IN', payload: boolean }
  | { type: 'SET_IS_ERROR', payload: boolean }
  | { type: 'SET_IS_INITIALIZED' };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'GET_PROFILE_ERROR':
      return { ...state, error: action.payload, isError: true, session: null };
    case 'GET_SESSION_ERROR':
      return { ...state, error: action.payload, isError: true, session: null };
    case 'GET_SESSION_SUCCESS':
      return {
        ...state,
        session: action.payload,
        isSignedIn: true,
        isError: false,
        error: null
      };
    case 'GET_PROFILE_SUCCESS':
      return {
        ...state,
        profile: {
          ...state.profile,
          id: action.payload.id,
          phone: action.payload.phone,
          username: action.payload.username,
          slug: action.payload.slug,
          role: action.payload.role,
        },
        isError: false,
        error: null
      };
    case 'UPDATE_PROFILE_SUCCESS':
      return { ...state, profile: action.payload, isError: false, error: null };
    case 'SIGN_OUT_SUCCESS':
      return { session: null, profile: null, isSignedIn: false, error: null, isError: false, isInitializing: false };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isError: action.payload !== null };
    case 'SET_PROFILE':
      return { ...state, profile: action.payload };
    case 'SET_SESSION':
      return { ...state, session: action.payload, isSignedIn: action.payload !== null };
    case 'SET_SIGNED_IN':
      return { ...state, isSignedIn: action.payload };
    case 'SET_IS_INITIALIZED':
      return { ...state, isInitializing: false };
    default:
      return state;
  }
}

type UserContext = {
  getSession: () => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (params: {
    username?: string;
    slug?: string;
    avatar_url?: string;
    email?: string;
    role?: string;
  }) => Promise<void>;
  toggleUserRole: () => Promise<void>;
} & State

const initialValue: UserContext = {
  session: null,
  profile: null,
  error: null,
  isError: false,
  isSignedIn: false,
  isInitializing: true,
  getSession: async () => {
    throw new Error('Function not initizaliced yet');
  },
  signOut: async () => {
    throw new Error('Function not initizaliced yet');
  },
  updateUser: async () => {
    throw new Error('Function not initizaliced yet');
  },
  toggleUserRole: async () => {
    throw new Error('Function not initizaliced yet');
  },
};

const UserContext = createContext(initialValue);

export const useUser = () => {
  return useContext(UserContext);
};

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, {
    session: null,
    error: null,
    profile: null,
    isSignedIn: false,
    isError: false,
    isInitializing: true,
  });
  const { isConnected } = NetInfo.useNetInfo();

  const getSession = useCallback(async () => {
    try {
      const {
        data: { session: currentSession },
        error,
      } = await supabase.auth.getSession();
      if (error) {
        dispatch({ type: 'GET_SESSION_ERROR', payload: error });
      } else if (currentSession === null) {
        dispatch({ type: 'GET_SESSION_ERROR', payload: new Error('Session is null') });
      } else {
        if (AUTH_LOGS) console.log("getSession success", JSON.stringify(currentSession, null, 2))
        dispatch({ type: 'GET_SESSION_SUCCESS', payload: currentSession });
      }
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        dispatch({ type: 'GET_SESSION_ERROR', payload: error });
      }
    } finally {
      dispatch({ type: 'SET_IS_INITIALIZED' });
    }
  }, [dispatch]);

  const getProfile = useCallback(async (id?: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select<any, Profile>()
        .eq("id", id ?? state.session?.user.id);
      if (error) {
        dispatch({ type: 'GET_PROFILE_ERROR', payload: { ...error, name: "Get Profile Error" } });
      } else if (data === null || data.length === 0) {
        dispatch({ type: 'GET_PROFILE_ERROR', payload: new Error('Profile not found') });
      } else {
        if (AUTH_LOGS) console.log("getProfile success", JSON.stringify(data[0], null, 2))
        dispatch({ type: 'GET_PROFILE_SUCCESS', payload: data[0] });
      }
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        dispatch({ type: 'GET_PROFILE_ERROR', payload: error });
      }
    } finally {
      dispatch({ type: 'SET_IS_INITIALIZED' });
    }
  }, [state.session, dispatch]);

  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error(error);
        // Case intern error
        dispatch({ type: 'SET_ERROR', payload: error });
      } else {
        // Case Succes
        if (AUTH_LOGS) console.log('signed out succesful');
        dispatch({ type: 'SIGN_OUT_SUCCESS' });
      }
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        dispatch({ type: 'SET_ERROR', payload: error });
      }
    }
  }, [dispatch]);

  const updateUser = useCallback(async ({
    username,
    slug,
    avatar_url,
    email,
  }: {
    username?: string;
    slug?: string;
    avatar_url?: string;
    email?: string;
  }) => {
    try {
      const { error, data } = await supabase
        .from('profiles')
        .update({
          username,
          slug,
          avatar_url,
          email,
          updated_at: new Date().toISOString()
        })
        .eq('id', state.profile?.id);
      if (error) {
        console.error(error);
        dispatch({ type: 'SET_ERROR', payload: { ...error, name: 'PostgresError' } });
      } else {
        if (AUTH_LOGS) console.log('update user succesful', JSON.stringify(data, null, 2));
        dispatch({
          type: 'UPDATE_PROFILE_SUCCESS', payload: {
            ...state.profile,
            username: username ?? state.profile?.username,
            slug: slug ?? state.profile?.slug,
            avatar_url: avatar_url ?? state.profile?.avatar_url,
            email: email ?? state.profile?.email,
          }
        });
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error(error)
        dispatch({ type: 'SET_ERROR', payload: error });
      }
    }
  }, [state.profile, dispatch]);

  const toggleUserRole = useCallback(async () => {
    try {
      const { error, data } = await supabase
        .from('profiles')
        .update({
          role: state.profile?.role === "client" ? UserRoles.TAXI : UserRoles.CLIENT,
          updated_at: new Date().toISOString()
        })
        .eq('id', state.profile?.id);
      if (error) {
        console.error(error);
        dispatch({ type: 'SET_ERROR', payload: { ...error, name: 'PostgresError' } });
      } else {
        if (AUTH_LOGS) console.log('update user role succesful', JSON.stringify(data, null, 2));
        dispatch({
          type: 'UPDATE_PROFILE_SUCCESS', payload: {
            ...state.profile,
            role: state.profile?.role === "client" ? UserRoles.TAXI : UserRoles.CLIENT,
          }
        });
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error(error)
        dispatch({ type: 'SET_ERROR', payload: error });
      }
    }
  }, [state.profile, dispatch]);

  useEffect(() => {
    if (AUTH_LOGS)
      console.log('UserContext.tsx -> useEffect [isConnected]', isConnected);
    const expired = !!state.session?.expires_at && new Date(state.session.expires_at) < new Date();

    if (!isConnected) {
      if (AUTH_LOGS) console.log('Internet is not reachable');
      return;
    }

    if (!state.session || expired) {
      void getSession();
    }
  }, [isConnected]);

  useEffect(() => {
    if (AUTH_LOGS)
      console.log('UserContext.tsx -> useEffect []');
    getData('user_markers').then((data) => {
      dispatch({ type: 'SET_USER_MARKERS', payload: data ?? [] });
    });

    const authSub = supabase.auth.onAuthStateChange((_event, currentSession) => {
      if (AUTH_LOGS) console.log('AuthState Changed: ' + _event);

      if (currentSession?.user) {
        getProfile(currentSession.user.id);
        dispatch({ type: 'GET_SESSION_SUCCESS', payload: currentSession });
      } else {
        dispatch({ type: 'SET_SESSION', payload: null });
      }
    });

    return () => {
      authSub.data.subscription.unsubscribe()
    }
  }, [])

  return (
    <UserContext.Provider
      value={{
        ...state,
        updateUser,
        getSession,
        signOut,
        toggleUserRole,
      }}>
      {children}
    </UserContext.Provider>
  );
};
