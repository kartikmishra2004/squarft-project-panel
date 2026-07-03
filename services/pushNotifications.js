import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import {
    PUSH_NOTIFICATION_ANDROID_CHANNEL_ID,
    PUSH_TOKEN_SYNC_ENABLED,
    getConfiguredProjectId,
} from "./pushNotificationConfig";
import { notificationApi } from "./notificationApi";

const INSTALLATION_ID_KEY = "pushNotificationInstallationId";
const LAST_REGISTERED_TOKEN_KEY = "lastRegisteredExpoPushToken";
const LAST_REGISTERED_EXPO_PUSH_TOKEN_KEY = "lastRegisteredExpoPushTokenValue";
const CACHED_EXPO_PUSH_TOKEN_KEY = "cachedExpoPushToken";

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export const ensureAndroidNotificationChannelAsync = async () => {
    if (Platform.OS !== "android") return;

    await Notifications.setNotificationChannelAsync(PUSH_NOTIFICATION_ANDROID_CHANNEL_ID, {
        name: "Project panel alerts",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#4A43EC",
        sound: "default",
    });
};

const getInstallationIdAsync = async () => {
    const existingId = await AsyncStorage.getItem(INSTALLATION_ID_KEY);
    if (existingId) return existingId;

    const newId = `${Platform.OS}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    await AsyncStorage.setItem(INSTALLATION_ID_KEY, newId);
    return newId;
};

const getPermissionStatusAsync = async () => {
    const existingPermission = await Notifications.getPermissionsAsync();
    if (existingPermission.status === "granted") return "granted";

    const requestedPermission = await Notifications.requestPermissionsAsync();
    return requestedPermission.status;
};

export const getExpoPushTokenAsync = async () => {
    await ensureAndroidNotificationChannelAsync();

    const permissionStatus = await getPermissionStatusAsync();
    if (permissionStatus !== "granted") {
        return null;
    }

    const projectId = getConfiguredProjectId(Constants);
    if (!projectId) {
        throw new Error("EAS project ID is required for Expo push token registration.");
    }

    const tokenResponse = await Notifications.getExpoPushTokenAsync({ projectId });
    await AsyncStorage.setItem(CACHED_EXPO_PUSH_TOKEN_KEY, tokenResponse.data);
    return tokenResponse.data;
};

export const primePushNotificationsAsync = async () => {
    const cachedToken = await AsyncStorage.getItem(CACHED_EXPO_PUSH_TOKEN_KEY);
    if (cachedToken) return cachedToken;

    return getExpoPushTokenAsync();
};

export const getStoredExpoPushTokenAsync = async () =>
    AsyncStorage.getItem(CACHED_EXPO_PUSH_TOKEN_KEY);

const getDevicePushTokenAsync = async () => {
    try {
        const tokenResponse = await Notifications.getDevicePushTokenAsync();
        return tokenResponse?.data || null;
    } catch (error) {
        console.warn("[PUSH] Native device token unavailable:", error.message);
        return null;
    }
};

export const registerPushNotificationsAsync = async ({ userId } = {}) => {
    const expoPushToken = await getExpoPushTokenAsync();
    if (!expoPushToken) return null;

    const installationId = await getInstallationIdAsync();
    const registrationKey = `${userId || "anonymous"}:${installationId}:${expoPushToken}`;
    const lastRegisteredToken = await AsyncStorage.getItem(LAST_REGISTERED_TOKEN_KEY);

    if (lastRegisteredToken === registrationKey) {
        return expoPushToken;
    }

    if (!PUSH_TOKEN_SYNC_ENABLED) {
        await AsyncStorage.setItem(LAST_REGISTERED_TOKEN_KEY, registrationKey);
        await AsyncStorage.setItem(LAST_REGISTERED_EXPO_PUSH_TOKEN_KEY, expoPushToken);
        console.info("[PUSH] Expo push token ready. Backend token sync is disabled:", expoPushToken);
        return expoPushToken;
    }

    const devicePushToken = await getDevicePushTokenAsync();
    await notificationApi.registerDevice({ expoPushToken, devicePushToken, userId });
    await AsyncStorage.setItem(LAST_REGISTERED_TOKEN_KEY, registrationKey);
    await AsyncStorage.setItem(LAST_REGISTERED_EXPO_PUSH_TOKEN_KEY, expoPushToken);
    console.info("[PUSH] Registered Expo push token:", expoPushToken);

    return expoPushToken;
};

export const unregisterPushNotificationsAsync = async ({ userId } = {}) => {
    const expoPushToken = await AsyncStorage.getItem(LAST_REGISTERED_EXPO_PUSH_TOKEN_KEY);
    if (!expoPushToken) return;

    if (PUSH_TOKEN_SYNC_ENABLED) {
        await notificationApi.unregisterDevice({ expoPushToken, userId });
    }

    await AsyncStorage.removeItem(LAST_REGISTERED_TOKEN_KEY);
    await AsyncStorage.removeItem(LAST_REGISTERED_EXPO_PUSH_TOKEN_KEY);
};

export const getInitialNotificationResponseAsync = async () => {
    if (Notifications.getLastNotificationResponseAsync) {
        return Notifications.getLastNotificationResponseAsync();
    }

    return Notifications.getLastNotificationResponse();
};
