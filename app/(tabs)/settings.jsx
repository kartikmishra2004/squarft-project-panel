import { Text, View, TouchableOpacity, ScrollView, Alert, StatusBar } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { logout as logoutAction } from "../../store/slices/authSlice";
import { authService } from "../../services/authService";
import { useRouter } from "expo-router";
import { Ionicons, Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

export default function Settings() {
    const router = useRouter();
    const dispatch = useDispatch();
    const insets = useSafeAreaInsets();
    
    // Get logged-in user data from Redux store
    const user = useSelector((state) => state.auth.user);

    const handleLogout = () => {
        Alert.alert(
            "Logout",
            "Are you sure you want to log out of SquarFT Project Panel?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Logout",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await authService.logout();
                            dispatch(logoutAction());
                            router.replace("/(auth)/login");
                        } catch (error) {
                            console.error("Logout error:", error);
                            Alert.alert("Error", "Failed to log out. Please try again.");
                        }
                    }
                }
            ]
        );
    };

    if (!user) {
        return (
            <View className="flex-1 bg-[#F8F9FE] items-center justify-center p-5">
                <Text className="text-gray-500 font-lato mb-4">No active user session found.</Text>
                <TouchableOpacity
                    onPress={() => router.replace("/(auth)/login")}
                    className="border border-gray-200 bg-white px-6 py-3 rounded-2xl"
                >
                    <Text className="text-gray-700 font-lato-bold">Go to Login</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const displayName = user.full_name || user.name;
    const displayPhone = user.phone || user.mobile;
    const companyName = user.company_name;
    const companyType = user.company_type;
    const reraNumber = user.rera_number;
    const location = user.location;

    return (
        <View className="flex-1 bg-[#F8F9FE]">
            <StatusBar barStyle="light-content" />
            
            <LinearGradient
                colors={["#4A43EC", "#3D30F2"]}
                style={{ 
                    paddingTop: Math.max(insets.top, 20) + 16, 
                    paddingBottom: 24,
                    paddingHorizontal: 20,
                    borderBottomLeftRadius: 32,
                    borderBottomRightRadius: 32,
                    borderBottomWidth: 1,
                    borderBottomColor: "#3D30F2"
                }}
            >
                <View className="flex-row items-center gap-3 mb-6">
                    <TouchableOpacity onPress={() => router.back()} className="p-1">
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <Text className="text-white text-xl font-lato-bold">Profile</Text>
                </View>

                {/* Profile Card Info */}
                <View className="flex-row items-center gap-4">
                    <View className="w-16 h-16 rounded-2xl bg-white/20 border border-white/30 items-center justify-center">
                        <Text className="text-white text-2xl font-lato-bold">
                            {displayName ? displayName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "PD"}
                        </Text>
                    </View>
                    <View className="flex-1">
                        {displayName && <Text className="text-white text-lg font-lato-bold">{displayName}</Text>}
                        {companyName && <Text className="text-white/80 text-xs font-lato-medium mt-0.5">{companyName}</Text>}
                        {companyType && (
                            <View className="flex-row items-center mt-1.5">
                                <View className="bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 rounded-md flex-row items-center gap-1">
                                    <View className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    <Text className="text-emerald-300 text-[10px] font-lato-bold uppercase tracking-wider">
                                        {companyType}
                                    </Text>
                                </View>
                            </View>
                        )}
                    </View>
                </View>
            </LinearGradient>

            <ScrollView 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: 40 }}
                className="flex-1"
            >
                {/* Account Details Card - thin border instead of shadow */}
                <View className="bg-white rounded-3xl border border-gray-200 p-5 mb-6">
                    <Text className="text-gray-900 text-[15px] font-lato-bold mb-4">Account Details</Text>
                    
                    {/* Phone Row */}
                    {displayPhone && (
                        <View className="flex-row items-center gap-4 py-3 border-b border-gray-100">
                            <View className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 items-center justify-center">
                                <Feather name="phone" size={16} color="#4A43EC" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-gray-400 text-[11px] font-lato-bold uppercase tracking-wider">Phone Number</Text>
                                <Text className="text-gray-800 text-[14px] font-lato-medium mt-0.5">{displayPhone}</Text>
                            </View>
                        </View>
                    )}

                    {/* Location Row */}
                    {location && (
                        <View className="flex-row items-center gap-4 py-3 border-b border-gray-100">
                            <View className="w-9 h-9 rounded-xl bg-orange-50 border border-orange-100 items-center justify-center">
                                <Feather name="map-pin" size={16} color="#F97316" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-gray-400 text-[11px] font-lato-bold uppercase tracking-wider">Location</Text>
                                <Text className="text-gray-800 text-[14px] font-lato-medium mt-0.5">{location}</Text>
                            </View>
                        </View>
                    )}

                    {/* RERA Row */}
                    {reraNumber && (
                        <View className="flex-row items-center gap-4 py-3">
                            <View className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 items-center justify-center">
                                <Feather name="award" size={16} color="#10B981" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-gray-400 text-[11px] font-lato-bold uppercase tracking-wider">RERA Registration</Text>
                                <Text className="text-gray-800 text-[14px] font-lato-medium mt-0.5">{reraNumber}</Text>
                            </View>
                        </View>
                    )}
                </View>

                {/* Logout Button - thin border instead of shadow */}
                <TouchableOpacity
                    onPress={handleLogout}
                    activeOpacity={0.8}
                    className="bg-white border border-rose-200 rounded-3xl py-4 flex-row items-center justify-center gap-2"
                >
                    <Ionicons name="log-out-outline" size={18} color="#EF4444" />
                    <Text className="text-rose-500 text-[15px] font-lato-bold">Log Out</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}