import { Redirect, Stack } from "expo-router";
import { useSelector } from "react-redux";

export default function TabsLayout() {
    const { isLoggedIn, isKycCompleted } = useSelector((state) => state.auth);

    if (isLoggedIn && !isKycCompleted) {
        return <Redirect href="/(screens)/kyc" />;
    }

    return (
        <Stack screenOptions={{ headerShown: false, animation: "none" }}>
            <Stack.Screen name="home" />
            <Stack.Screen name="add-project" />
            <Stack.Screen name="settings" />
        </Stack>
    );
}
