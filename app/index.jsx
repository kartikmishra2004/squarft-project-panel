import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { StatusBar } from "expo-status-bar";
import { Redirect, useRouter } from "expo-router";

const SPLASH_DURATION_MS = 1800;

export default function Index() {
    const router = useRouter();
    const isLoggedIn = false;

    useEffect(() => {
        if (isLoggedIn) return undefined;

        const splashTimer = setTimeout(() => {
            router.replace("/(auth)/onboarding1");
        }, SPLASH_DURATION_MS);

        return () => clearTimeout(splashTimer);
    }, [isLoggedIn, router]);

    if (isLoggedIn) {
        return <Redirect href="/(tabs)/home" />;
    }

    return (
        <View className="flex-1 bg-black">
            <StatusBar hidden />
            <Image
                source={require("../assets/images/splash-mobile.gif")}
                style={StyleSheet.absoluteFill}
                contentFit="cover"
            />
        </View>
    );
}
