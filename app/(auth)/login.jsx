import { Text, View, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Link, router } from "expo-router";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Ionicons, AntDesign } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { setMobile, setPassword, toggleRememberMe, setLoggedIn } from "../../store/slices/authSlice";

const logo = require("../../assets/icons/app-icon.png");

export default function Login() {
    const dispatch = useDispatch();
    const { mobile, password, rememberMe } = useSelector((state) => state.auth);
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = () => {
        dispatch(setLoggedIn(true));
        router.replace("/(tabs)/home");
    };

    return (
        <SafeAreaView className="flex-1 bg-white" edges={['bottom']}>
            <StatusBar style="dark" />
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 40}
            >
                <ScrollView
                    className="flex-1 bg-white"
                    contentContainerStyle={{ flexGrow: 1 }}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <View className="bg-[#4A43EC] pt-12 pb-10 px-6">
                        <View style={{ width: 60, height: 60, overflow: 'hidden' }} className="mb-6">
                            <Image source={logo} style={{ width: 110, height: 110, margin: -20 }} resizeMode="contain" />
                        </View>
                        <Text className="text-white text-[36px] font-lato-bold mb-1">Login</Text>
                        <View className="flex-row items-center">
                            <Text className="text-white/80 text-[14px]">Don't have an account? </Text>
                            <Link href="/register">
                                <Text className="text-white text-[14px] font-lato-bold underline">Sign Up</Text>
                            </Link>
                        </View>
                    </View>

                    <View className="flex-1 px-6 pt-8">
                        <Text className="text-gray-500 text-[13px] mb-1.5 font-lato">Mobile Number</Text>
                        <View className="border border-gray-200 rounded-xl px-4 py-3 mb-5">
                            <TextInput
                                value={mobile}
                                onChangeText={(val) => dispatch(setMobile(val))}
                                placeholder="Number"
                                placeholderTextColor="#aaa"
                                keyboardType="phone-pad"
                                className="text-[15px] text-black font-lato"
                            />
                        </View>

                        <Text className="text-gray-500 text-[13px] mb-1.5 font-lato">Password</Text>
                        <View className="border border-gray-200 rounded-xl px-4 py-3 flex-row items-center mb-4">
                            <TextInput
                                value={password}
                                onChangeText={(val) => dispatch(setPassword(val))}
                                placeholder="••••••••"
                                placeholderTextColor="#aaa"
                                secureTextEntry={!showPassword}
                                className="flex-1 text-[15px] text-black font-lato"
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                <Ionicons
                                    name={showPassword ? "eye-outline" : "eye-off-outline"}
                                    size={20}
                                    color="#aaa"
                                />
                            </TouchableOpacity>
                        </View>

                        <View className="flex-row items-center justify-between mb-7">
                            <TouchableOpacity
                                className="flex-row items-center gap-2"
                                onPress={() => dispatch(toggleRememberMe())}
                            >
                                <View className={`w-4 h-4 border rounded-sm items-center justify-center ${rememberMe ? "bg-[#4A43EC] border-[#4A43EC]" : "border-gray-400"}`}>
                                    {rememberMe && <Ionicons name="checkmark" size={11} color="white" />}
                                </View>
                                <Text className="text-gray-500 text-[13px] font-lato">Remember me</Text>
                            </TouchableOpacity>
                            <Link href="/forgot-password">
                                <Text className="text-[#4A43EC] text-[13px] font-lato">Forgot Password ?</Text>
                            </Link>
                        </View>

                        <TouchableOpacity
                            onPress={handleLogin}
                            className="bg-[#4A43EC] rounded-2xl py-4 items-center mb-8 shadow-lg shadow-blue-500/30"
                        >
                            <Text className="text-white text-[16px] font-lato-bold">Log In</Text>
                        </TouchableOpacity>

                        <View className="flex-row items-center mb-8">
                            <View className="flex-1 h-[1px] bg-gray-200" />
                            <Text className="mx-4 text-gray-400 text-[12px] font-lato">OR</Text>
                            <View className="flex-1 h-[1px] bg-gray-200" />
                        </View>

                        <TouchableOpacity className="flex-row items-center justify-center border border-gray-200 rounded-2xl py-4 mb-4 relative">
                            <Image
                                source={require('../../assets/icons/google.png')}
                                style={{ width: 20, height: 20, position: 'absolute', left: 20 }}
                                resizeMode="contain"
                            />
                            <Text className="text-black text-[15px] font-lato-bold">Continue With Google</Text>
                        </TouchableOpacity>

                        <TouchableOpacity className="flex-row items-center justify-center border border-gray-200 rounded-2xl py-4 mb-10 relative">
                            <Image
                                source={require('../../assets/icons/apple-logo.png')}
                                style={{ width: 20, height: 20, position: 'absolute', left: 20 }}
                                resizeMode="contain"
                            />
                            <Text className="text-black text-[15px] font-lato-bold">Continue With Apple</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
