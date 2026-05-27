import { Text, View, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from "react-native";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import {
    setFirstName,
    setLastName,
    setMobile,
    setPassword,
    setConfirmPassword,
    setCompanyName,
    setCompanyType,
    setReraNumber,
    setLocation,
    setLoading,
    setError,
    clearError,
    setLoggedIn,
    setUser,
    setToken
} from "../../store/slices/authSlice";
import { authService } from "../../services/authService";
import AuthHeader from "../../components/AuthHeader";

export default function Register() {
    const dispatch = useDispatch();
    const {
        firstName,
        lastName,
        mobile,
        password,
        confirmPassword,
        companyName,
        reraNumber,
        location,
        loading
    } = useSelector((state) => state.auth);
    const companyType = useSelector((state) => state.auth.companyType);
    const [showPassword, setShowPassword] = useState(false);
    const [showCompanyTypeDropdown, setShowCompanyTypeDropdown] = useState(false);
    const companyTypes = ["Builder", "Marketing"];

    const handleRegister = async () => {
        // Clear previous errors
        dispatch(clearError());

        console.log('🔵 [REGISTER PAGE] Register button pressed');
        console.log('🔵 [REGISTER PAGE] Form data:', {
            firstName,
            lastName,
            companyName,
            companyType,
            reraNumber,
            mobile,
            location,
            passwordLength: password?.length,
        });

        // Validation
        if (!firstName || !lastName) {
            console.log(' [REGISTER PAGE] Validation failed: Missing name');
            Alert.alert('Missing Information', 'Please enter your first and last name');
            return;
        }

        if (!companyName) {
            console.log(' [REGISTER PAGE] Validation failed: Missing company name');
            Alert.alert('Missing Information', 'Please enter your company name');
            return;
        }

        if (!reraNumber) {
            console.log(' [REGISTER PAGE] Validation failed: Missing RERA number');
            Alert.alert('Missing Information', 'Please enter your RERA number');
            return;
        }

        if (!mobile) {
            console.log(' [REGISTER PAGE] Validation failed: Missing phone');
            Alert.alert('Missing Information', 'Please enter your phone number');
            return;
        }

        if (mobile.length < 10) {
            console.log(' [REGISTER PAGE] Validation failed: Invalid phone length');
            Alert.alert('Invalid Phone Number', 'Please enter a valid 10-digit phone number');
            return;
        }

        if (!location) {
            console.log(' [REGISTER PAGE] Validation failed: Missing location');
            Alert.alert('Missing Information', 'Please enter your location');
            return;
        }

        if (!password) {
            console.log(' [REGISTER PAGE] Validation failed: Missing password');
            Alert.alert('Missing Information', 'Please enter a password');
            return;
        }

        if (password.length < 8) {
            console.log(' [REGISTER PAGE] Validation failed: Password too short');
            Alert.alert('Weak Password', 'Password must be at least 8 characters long');
            return;
        }

        if (password !== confirmPassword) {
            console.log(' [REGISTER PAGE] Validation failed: Passwords do not match');
            Alert.alert('Password Mismatch', 'Passwords do not match. Please check and try again.');
            return;
        }

        try {
            console.log('🔵 [REGISTER PAGE] Starting registration process...');
            dispatch(setLoading(true));

            // Register the user
            const registerResponse = await authService.register({
                first_name: firstName,
                last_name: lastName,
                company_name: companyName,
                company_type: companyType,
                rera_number: reraNumber,
                phone: mobile,
                location: location,
                password: password,
            });

            console.log(' [REGISTER PAGE] Registration response:', registerResponse);

            if (registerResponse.success) {
                console.log(' [REGISTER PAGE] Registration successful, attempting auto-login');
                Alert.alert(
                    'Success',
                    'Account created successfully! Logging you in...',
                    [
                        {
                            text: 'OK',
                            onPress: async () => {
                                try {
                                    console.log('🔵 [REGISTER PAGE] Starting auto-login...');
                                    const loginResponse = await authService.login(mobile, password);
                                    
                                    console.log(' [REGISTER PAGE] Auto-login response:', loginResponse);
                                    
                                    if (loginResponse.success) {
                                        dispatch(setToken(loginResponse.token));
                                        dispatch(setUser(loginResponse.user));
                                        dispatch(setLoggedIn(true));
                                        console.log(' [REGISTER PAGE] Navigating to home');
                                        router.replace("/(tabs)/home");
                                    } else {
                                        throw new Error('Login response was not successful');
                                    }
                                } catch (loginErr) {
                                    console.log(' [REGISTER PAGE] Auto-login error:', loginErr);
                                    Alert.alert(
                                        'Login Required',
                                        'Account created successfully but auto-login failed. Please login manually.',
                                        [
                                            {
                                                text: 'Go to Login',
                                                onPress: () => router.replace("/login")
                                            }
                                        ]
                                    );
                                }
                            }
                        }
                    ]
                );
            } else {
                console.log(' [REGISTER PAGE] Registration response success=false');
                Alert.alert('Registration Failed', 'Invalid response from server. Please try again.');
            }
        } catch (err) {
            console.log(' [REGISTER PAGE] Registration error caught:', err);
            
            const errorStatus = err?.status || err?.response?.status;
            const errorMessage = err?.message || err?.response?.data?.message || 'Registration failed. Please try again.';
            const errorDetails = err?.details;
            
            console.log('Error details:', { errorStatus, errorMessage, errorDetails });
            
            if (errorStatus === 409 || errorStatus === 400 || errorMessage.toLowerCase().includes('already exists')) {
                Alert.alert(
                    'Account Already Exists',
                    'This phone number is already registered. Would you like to login instead?',
                    [
                        {
                            text: 'Go to Login',
                            onPress: () => router.replace('/login'),
                        },
                        {
                            text: 'Try Different Number',
                            style: 'cancel',
                        },
                    ]
                );
            } else if (errorStatus === 422 || errorMessage.toLowerCase().includes('password')) {
                Alert.alert(
                    'Invalid Password',
                    errorMessage,
                    [{ text: 'OK' }]
                );
            } else if (errorMessage.toLowerCase().includes('network') || errorMessage.toLowerCase().includes('timeout')) {
                Alert.alert(
                    'Connection Error',
                    'Unable to connect to server. Please check your internet connection and try again.',
                    [{ text: 'OK' }]
                );
                // Only trigger global red snackbar fallback for structural connectivity loss
                dispatch(setError(errorMessage));
            } else {
                Alert.alert(
                    'Registration Failed',
                    errorMessage || 'An unexpected error occurred. Please try again.',
                    [{ text: 'OK' }]
                );
                dispatch(setError(errorMessage));
            }
        } finally {
            dispatch(setLoading(false));
            console.log('🔵 [REGISTER PAGE] Registration process completed');
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
                    className="flex-1"
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <AuthHeader
                        title="Register"
                        subtitle="Already have an account? "
                        actionLabel="Log in"
                        actionHref="/login"
                    />

                    <View className="px-6 pt-6">
                        {/* First Name */}
                        <Text className="text-gray-500 text-[13px] mb-1.5 font-lato-bold">First Name</Text>
                        <View className="border border-gray-200 rounded-xl px-4 py-3 mb-4">
                            <TextInput
                                value={firstName}
                                onChangeText={(val) => dispatch(setFirstName(val))}
                                placeholder="First Name"
                                placeholderTextColor="#aaa"
                                className="text-[15px] text-black font-lato"
                            />
                        </View>

                        {/* Last Name */}
                        <Text className="text-gray-500 text-[13px] mb-1.5 font-lato-bold">Last Name</Text>
                        <View className="border border-gray-200 rounded-xl px-4 py-3 mb-4">
                            <TextInput
                                value={lastName}
                                onChangeText={(val) => dispatch(setLastName(val))}
                                placeholder="Last Name"
                                placeholderTextColor="#aaa"
                                className="text-[15px] text-black font-lato"
                            />
                        </View>

                        {/* Company Name */}
                        <Text className="text-gray-500 text-[13px] mb-1.5 font-lato-bold">Company Name</Text>
                        <View className="border border-gray-200 rounded-xl px-4 py-3 mb-4">
                            <TextInput
                                value={companyName}
                                onChangeText={(val) => dispatch(setCompanyName(val))}
                                placeholder="Company Name"
                                placeholderTextColor="#aaa"
                                className="text-[15px] text-black font-lato"
                            />
                        </View>

                        {/* Company Type */}
                        <View className="z-[100]">
                            <Text className="text-gray-500 text-[13px] mb-1.5 font-lato-bold">Company Type</Text>
                            <TouchableOpacity
                                onPress={() => setShowCompanyTypeDropdown(!showCompanyTypeDropdown)}
                                className="bg-white border border-gray-200 rounded-xl px-4 h-12 flex-row items-center justify-between mb-4"
                            >
                                <Text className="text-[15px] text-black font-lato">{companyType ? companyType : 'Select Company Type'}</Text>
                                <Ionicons name={showCompanyTypeDropdown ? "chevron-up" : "chevron-down"} size={20} color="#666" />
                            </TouchableOpacity>

                            {showCompanyTypeDropdown && (
                                <View className="absolute top-[56px] left-0 right-0 bg-white border border-gray-100 rounded-xl shadow-lg z-[101] overflow-hidden">
                                    {companyTypes.map((item) => (
                                        <TouchableOpacity
                                            key={item}
                                            onPress={() => {
                                                dispatch(setCompanyType(item));
                                                setShowCompanyTypeDropdown(false);
                                            }}
                                            className={`px-4 py-3 border-b border-gray-50`}
                                        >
                                            <Text className={`text-[13px] font-lato ${companyType === item ? 'text-[#4A43EC]' : 'text-gray-800'}`}>
                                                {item}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                        </View>

                        {/* RERA Number */}
                        <Text className="text-gray-500 text-[13px] mb-1.5 font-lato-bold">RERA Number</Text>
                        <View className="border border-gray-200 rounded-xl px-4 py-3 mb-4">
                            <TextInput
                                value={reraNumber}
                                onChangeText={(val) => dispatch(setReraNumber(val))}
                                placeholder="RERA Number"
                                placeholderTextColor="#aaa"
                                className="text-[15px] text-black font-lato"
                            />
                        </View>

                        {/* Mobile */}
                        <Text className="text-gray-500 text-[13px] mb-1.5 font-lato-bold">Phone Number</Text>
                        <View className="border border-gray-200 rounded-xl px-4 py-3 mb-4">
                            <TextInput
                                value={mobile}
                                onChangeText={(val) => dispatch(setMobile(val))}
                                placeholder="Phone Number"
                                placeholderTextColor="#aaa"
                                keyboardType="phone-pad"
                                className="text-[15px] text-black font-lato"
                            />
                        </View>

                        {/* Location */}
                        <Text className="text-gray-500 text-[13px] mb-1.5 font-lato-bold">Location</Text>
                        <View className="border border-gray-200 rounded-xl px-4 py-3 mb-4">
                            <TextInput
                                value={location}
                                onChangeText={(val) => dispatch(setLocation(val))}
                                placeholder="Location"
                                placeholderTextColor="#aaa"
                                className="text-[15px] text-black font-lato"
                            />
                        </View>

                        {/* Password */}
                        <Text className="text-gray-500 text-[13px] mb-1.5 font-lato-bold">Password</Text>
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

                        {/* Confirm Password */}
                        <Text className="text-gray-500 text-[13px] mb-1.5 font-lato-bold">Confirm Password</Text>
                        <View className="border border-gray-200 rounded-xl px-4 py-3 flex-row items-center mb-8">
                            <TextInput
                                value={confirmPassword}
                                onChangeText={(val) => dispatch(setConfirmPassword(val))}
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

                        <TouchableOpacity
                            onPress={handleRegister}
                            disabled={loading}
                            className={`bg-[#4A43EC] rounded-2xl py-4 items-center mb-10 shadow-lg shadow-blue-500/30 ${loading ? 'opacity-70' : ''}`}
                        >
                            {loading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text className="text-white text-[16px] font-lato-bold">Register</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}