import { Text, View, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, Platform } from "react-native";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { setOtpDigit, clearOtp, setLoggedIn } from "../../store/slices/authSlice";

const logo = require("../../assets/icons/app-icon.png");

export default function OtpVerification() {
    const dispatch = useDispatch();
    const { otp, otpFlow } = useSelector((state) => state.auth);
    const inputs = useRef([]);

    const handleChange = (text, index) => {
        const digit = text.replace(/[^0-9]/g, '').slice(-1);
        dispatch(setOtpDigit({ index, value: digit }));
        if (digit && index < 3) {
            inputs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (e, index) => {
        if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
            inputs.current[index - 1]?.focus();
        }
    };

    const handleVerify = () => {
        dispatch(clearOtp());
        if (otpFlow === 'forgot-password') {
            router.push("/change-password");
        } else {
            dispatch(setLoggedIn(true));
            router.replace("/(tabs)/home");
        }
    };

    const handleResend = () => {
        dispatch(clearOtp());
        inputs.current[0]?.focus();
    };

    return (
        <SafeAreaView className="flex-1 bg-white" edges={['bottom']}>
            <StatusBar style="dark" />
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 40}
            >
                <View className="bg-[#4A43EC] pt-12 pb-10 px-6">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="mb-4"
                    >
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>

                    <View style={{ width: 60, height: 60, overflow: 'hidden' }} className="mb-4">
                        <Image source={logo} style={{ width: 110, height: 110, margin: -20 }} resizeMode="contain" />
                    </View>
                    <Text className="text-white text-[32px] font-lato-bold mb-1">Verification</Text>
                    <Text className="text-white/80 text-[14px] font-lato">We've sent a 4-digit code to your mobile number</Text>
                </View>

                <View className="flex-1 bg-white px-6 pt-12">
                    <View className="flex-row justify-between mb-10">
                        {otp.map((digit, index) => (
                            <TextInput
                                key={index}
                                ref={(ref) => (inputs.current[index] = ref)}
                                value={digit}
                                onChangeText={(text) => handleChange(text, index)}
                                onKeyPress={(e) => handleKeyPress(e, index)}
                                keyboardType="number-pad"
                                maxLength={1}
                                style={{
                                    width: 70,
                                    height: 70,
                                    borderWidth: 1,
                                    borderColor: digit ? '#4A43EC' : '#E5E7EB',
                                    borderRadius: 16,
                                    textAlign: 'center',
                                    fontSize: 24,
                                    fontFamily: 'Lato_700Bold',
                                    color: '#000',
                                }}
                            />
                        ))}
                    </View>

                    <TouchableOpacity
                        onPress={handleVerify}
                        className="bg-[#4A43EC] rounded-2xl py-4 items-center mb-6 shadow-lg shadow-blue-500/30"
                    >
                        <Text className="text-white text-[16px] font-lato-bold uppercase tracking-wider">Continue</Text>
                    </TouchableOpacity>

                    <View className="flex-row justify-center items-center">
                        <Text className="text-gray-500 text-[14px] font-lato">Didn't receive code? </Text>
                        <TouchableOpacity onPress={handleResend}>
                            <Text className="text-[#4A43EC] text-[14px] font-lato-bold">Resend OTP</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
