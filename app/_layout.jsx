import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { Provider } from 'react-redux';
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../global.css";
import { store } from '../store/store';
import {
    useFonts,
    Lato_400Regular,
    Lato_700Bold,
    Lato_300Light,
    Lato_900Black,
} from "@expo-google-fonts/lato";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const [fontsLoaded] = useFonts({
        Lato_400Regular,
        Lato_700Bold,
        Lato_300Light,
        Lato_900Black,
    });

    useEffect(() => {
        if (fontsLoaded) SplashScreen.hideAsync();
    }, [fontsLoaded]);

    if (!fontsLoaded) return null;

    return (
        <Provider store={store}>
            <SafeAreaProvider>
                <Stack>
                    <Stack.Screen name="index" options={{ headerShown: false }} />
                    <Stack.Screen name="(auth)" options={{ headerShown: false, animation: "none" }} />
                    <Stack.Screen name="(tabs)" options={{ headerShown: false, animation: "none" }} />
                </Stack>
            </SafeAreaProvider>
        </Provider>
    );
}