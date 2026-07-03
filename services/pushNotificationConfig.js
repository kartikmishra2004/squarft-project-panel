export const PUSH_NOTIFICATION_APP_KEY = "project_panel_app";
export const PUSH_NOTIFICATION_ANDROID_CHANNEL_ID = "project-panel-alerts";
export const PUSH_NOTIFICATION_ANDROID_PACKAGE = "com.kartik2611mishra.squarftprojectpanel";
export const PUSH_NOTIFICATION_URL_SCHEME = "squarftprojectpanel";

export const PUSH_TOKEN_ENDPOINT =
    process.env.EXPO_PUBLIC_PUSH_TOKEN_ENDPOINT || "/api/v1/push-notifications/register";

export const PUSH_TOKEN_UNREGISTER_ENDPOINT =
    process.env.EXPO_PUBLIC_PUSH_TOKEN_UNREGISTER_ENDPOINT || "/api/v1/push-notifications/unregister";

export const PUSH_TOKEN_SYNC_ENABLED =
    process.env.EXPO_PUBLIC_PUSH_TOKEN_SYNC_ENABLED === "true";

export const getConfiguredProjectId = (constants) =>
    process.env.EXPO_PUBLIC_EAS_PROJECT_ID ||
    constants?.expoConfig?.extra?.eas?.projectId ||
    constants?.easConfig?.projectId;
