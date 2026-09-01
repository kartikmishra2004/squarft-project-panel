import { configureStore } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import appReducer from './slices/appSlice';
import authReducer from './slices/authSlice';
import projectReducer from './slices/projectSlice';
import projectsReducer from './slices/projectsSlice';
import notificationReducer, { hydrateNotifications } from './slices/notificationSlice';
import inventoryReducer from './slices/inventorySlice';

export const store = configureStore({
    reducer: {
        app: appReducer,
        auth: authReducer,
        project: projectReducer,
        projects: projectsReducer,
        notifications: notificationReducer,
        inventory: inventoryReducer,
    },
});

// The rest of this store is deliberately plain in-memory state, but
// notifications need to survive an app restart/fresh login — otherwise
// "watched" resets every time and everything looks unread again. This is a
// small, targeted persistence layer for just that one slice.
const NOTIFICATIONS_STORAGE_KEY = '@squarft/notifications';

export const hydrateNotificationsFromStorage = async () => {
    try {
        const raw = await AsyncStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
        store.dispatch(hydrateNotifications(raw ? JSON.parse(raw) : null));
    } catch (error) {
        console.warn('[NOTIFICATIONS] Failed to load persisted notifications:', error.message);
        store.dispatch(hydrateNotifications(null));
    }
};

let lastPersistedList = null;
store.subscribe(() => {
    const state = store.getState().notifications;
    if (!state.hydrated || state.list === lastPersistedList) return;
    lastPersistedList = state.list;
    AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(state.list)).catch((error) => {
        console.warn('[NOTIFICATIONS] Failed to persist notifications:', error.message);
    });
});
