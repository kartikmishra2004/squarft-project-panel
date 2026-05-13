import { Tabs } from "expo-router";
import { Image, Platform } from "react-native";
import { Image as ExpoImage } from "expo-image";

const icons = {
    home: {
        inactive: require("../../assets/icons/tabs/home.png"),
        active: require("../../assets/icons/tabs/home-active.png"),
    },
    favourite: {
        inactive: require("../../assets/icons/tabs/fav.png"),
        active: require("../../assets/icons/tabs/fav-active.png"),
    },
    "add-project": {
        inactive: require("../../assets/icons/tabs/book.png"),
        active: require("../../assets/icons/tabs/book-active.png"),
    },
    discount: {
        inactive: require("../../assets/icons/tabs/discount.png"),
        active: require("../../assets/icons/tabs/discount-active.png"),
    },
    settings: {
        inactive: require("../../assets/icons/tabs/settings.png"),
        active: require("../../assets/icons/tabs/settings-active.png"),
    },
};

function TabIcon({ name, focused, size }) {
    const icon = icons[name];
    const activeSize = size?.active ?? { width: 44, height: 44 };
    const inactiveSize = size?.inactive ?? { width: 24, height: 24 };
    return (
        <ExpoImage
            source={focused ? icon.active : icon.inactive}
            style={[focused ? activeSize : inactiveSize]}
            contentFit="contain"
            transition={0}
        />
    );
}

export default function TabsLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarShowLabel: false,
                tabBarStyle: {
                    position: "absolute",
                    left: 0,
                    right: 0,
                    bottom: Platform.OS === "android" ? -1 : 0,
                    borderTopRightRadius: 45,
                    borderTopLeftRadius: 45,
                    borderTopColor: "transparent",
                    backgroundColor: "#fff",
                    paddingTop: 15,
                    paddingHorizontal: 15,
                    height: 80,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.25,
                    shadowRadius: 4,
                    elevation: 10,
                },
            }}
        >
            <Tabs.Screen
                name="home"
                options={{
                    headerTitle: "Home",
                    tabBarIcon: ({ focused }) => <TabIcon name="home" focused={focused} />,
                }}
            />
            <Tabs.Screen
                name="favourite"
                options={{
                    headerTitle: "Favourite",
                    tabBarIcon: ({ focused }) => <TabIcon name="favourite" focused={focused} />,
                }}
            />
            <Tabs.Screen
                name="add-project"
                options={{
                    headerTitle: "Add project",
                    tabBarIcon: ({ focused }) => (
                        <TabIcon
                            name="add-project"
                            focused={focused}
                            size={{
                                active: { width: 50, height: 50, position: "absolute", bottom: 5 },
                                inactive: { width: 50, height: 50, position: "absolute", bottom: 5 },
                            }}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="discount"
                options={{
                    headerTitle: "Discount",
                    tabBarIcon: ({ focused }) => <TabIcon name="discount" focused={focused} />,
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    headerTitle: "Settings",
                    tabBarIcon: ({ focused }) => <TabIcon name="settings" focused={focused} />,
                }}
            />
        </Tabs>
    );
}