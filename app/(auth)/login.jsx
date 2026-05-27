import { Text, View, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Link, router } from "expo-router";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { setMobile, setPassword, toggleRememberMe, setLoggedIn, setUser, setToken, setLoading, setError, clearError } from "../../store/slices/authSlice";
import { authService } from "../../services/authService";

const logo = require("../../assets/icons/app-icon.png");

export default function Login() {
    const dispatch = useDispatch();
    const { mobile, password, rememberMe, loading, error } = useSelector((state) => state.auth);
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async () => {
        // Clear previous errors
        dispatch(clearError());

        console.log('🔵 [LOGIN PAGE] Login button pressed');
        console.log('🔵 [LOGIN PAGE] Mobile:', mobile);
        console.log('🔵 [LOGIN PAGE] Password length:', password?.length);

        // Validation
        if (!mobile || !password) {
            console.log(' [LOGIN PAGE] Validation failed: Missing fields');
            Alert.alert('Missing Information', 'Please enter both phone number and password');
            return;
        }

        if (mobile.length < 10) {
            console.log(' [LOGIN PAGE] Validation failed: Invalid phone length');
            Alert.alert('Invalid Phone Number', 'Please enter a valid 10-digit phone number');
            return;
        }

        try {
            console.log('🔵 [LOGIN PAGE] Starting login process...');
            dispatch(setLoading(true));
            
            const response = await authService.login(mobile, password);
            
            console.log(' [LOGIN PAGE] Login response received:', response);
            
            if (response.success) {
                console.log(' [LOGIN PAGE] Login successful, updating Redux state');
                // Update Redux state
                dispatch(setToken(response.token));
                dispatch(setUser(response.user));
                dispatch(setLoggedIn(true));
                
                console.log(' [LOGIN PAGE] Navigating to home');
                // Navigate to home
                router.replace("/(tabs)/home");
            } else {
                console.log(' [LOGIN PAGE] Login response success=false');
                Alert.alert('Login Failed', 'Invalid response from server. Please try again.');
            }
        } catch (err) {
            console.log(' [LOGIN PAGE] Login error caught:', err);
            
            // Get error details safely
            const errorStatus = err?.status;
            const errorMessage = err?.message || 'Login failed. Please try again.';
            const errorDetails = err?.details;
            
            console.log('Error details:', { errorStatus, errorMessage, errorDetails });
            
            // Handle specific error cases
            if (errorStatus === 401 || errorMessage.toLowerCase().includes('invalid credentials')) {
                // Invalid credentials
                Alert.alert(
                    'Login Failed',
                    'Invalid phone number or password. Please check your credentials and try again.',
                    [{ text: 'OK' }]
                );
            } else if (errorStatus === 400 || errorMessage.toLowerCase().includes('required')) {
                // Missing fields
                Alert.alert(
                    'Missing Information',
                    'Please enter both phone number and password.',
                    [{ text: 'OK' }]
                );
            } else if (errorMessage.toLowerCase().includes('network') || errorMessage.toLowerCase().includes('timeout')) {
                // Network error
                Alert.alert(
                    'Connection Error',
                    'Unable to connect to server. Please check your internet connection and try again.',
                    [{ text: 'OK' }]
                );
            } else if (errorMessage.toLowerCase().includes('not found')) {
                // Account not found
                Alert.alert(
                    'Account Not Found',
                    'No account found with this phone number. Would you like to register?',
                    [
                        {
                            text: 'Register',
                            onPress: () => router.replace('/register'),
                        },
                        {
                            text: 'Cancel',
                            style: 'cancel',
                        },
                    ]
                );
            } else {
                // Generic error
                Alert.alert(
                    'Login Failed',
                    errorMessage || 'An unexpected error occurred. Please try again.',
                    [{ text: 'OK' }]
                );
            }
            
            dispatch(setError(errorMessage));
        } finally {
            dispatch(setLoading(false));
            console.log('🔵 [LOGIN PAGE] Login process completed');
        }
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
                            disabled={loading}
                            className={`bg-[#4A43EC] rounded-2xl py-4 items-center mb-8 shadow-lg shadow-blue-500/30 ${loading ? 'opacity-70' : ''}`}
                        >
                            {loading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text className="text-white text-[16px] font-lato-bold">Log In</Text>
                            )}
                        </TouchableOpacity>

                        <View className="flex-row items-center mb-8">
                            <View className="flex-1 h-[1px] bg-gray-200" />
                            <Text className="mx-4 text-gray-400 text-[12px] font-lato">OR</Text>
                            <View className="flex-1 h-[1px] bg-gray-200" />
                        </View>

                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
