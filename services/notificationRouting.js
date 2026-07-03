import { router } from "expo-router";
import { PUSH_NOTIFICATION_URL_SCHEME } from "./pushNotificationConfig";
import {
    buildProjectPanelNotificationContent,
    getNotificationEventKeyFromData,
    getProjectPanelNotificationEvent,
    interpolateNotificationTemplate,
} from "./projectPanelNotificationCatalog";

const SCREEN_ROUTES = {
    home: "/(tabs)/home",
    notifications: "/(screens)/notifications",
    "add-project": "/(tabs)/add-project",
    addProject: "/(tabs)/add-project",
};

const SHEET_ROUTE_PREFIXES = [
    { prefix: "/auth/verify-otp", route: "/otp-verification" },
    { prefix: "/kyc", route: "/(screens)/notifications" },
    { prefix: "/projects/", includes: "/form/step/", route: "/(tabs)/add-project" },
    { prefix: "/projects/", includes: "/correction", route: "/(tabs)/add-project" },
    { prefix: "/projects", route: "/(tabs)/home" },
];

const getKnownAppRoute = (route) => {
    const match = SHEET_ROUTE_PREFIXES.find((item) => {
        if (!route.startsWith(item.prefix)) return false;
        return item.includes ? route.includes(item.includes) : true;
    });

    return match?.route || null;
};

const normalizeRoute = (value) => {
    if (typeof value !== "string" || !value.trim()) return null;

    const route = value.trim();
    if (route.startsWith("/")) return getKnownAppRoute(route) || route;

    const schemePrefix = `${PUSH_NOTIFICATION_URL_SCHEME}://`;
    if (route.startsWith(schemePrefix)) {
        const path = route.slice(schemePrefix.length);
        return path.startsWith("/") ? path : `/${path}`;
    }

    return SCREEN_ROUTES[route] || null;
};

export const getRouteFromNotificationData = (data = {}) => {
    const directRoute = normalizeRoute(data.url || data.route || data.href || data.screen);
    if (directRoute) return directRoute;

    const eventKey = getNotificationEventKeyFromData(data);
    const definition = getProjectPanelNotificationEvent(eventKey);
    if (definition?.appRoute) return definition.appRoute;
    if (definition?.sheetRoute) {
        return normalizeRoute(interpolateNotificationTemplate(definition.sheetRoute, data));
    }

    if (data.notificationId || data.notification_id) {
        return "/(screens)/notifications";
    }

    return null;
};

export const routeNotificationResponse = (response) => {
    const data = response?.notification?.request?.content?.data || {};
    const route = getRouteFromNotificationData(data);

    if (route) {
        router.push(route);
    }
};

export const buildRouteForProjectPanelEvent = (eventKey, data = {}) => {
    const content = buildProjectPanelNotificationContent(eventKey, data);
    return content?.appRoute || normalizeRoute(content?.route);
};
