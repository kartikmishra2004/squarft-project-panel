import { Text, View, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setMobile, setOtpFlow, clearError, clearAuthInputs, sendOtpThunk } from "../../store/slices/authSlice";

const logo = require("../../assets/icons/app-icon.png");

const COUNTRY_CODE = "+91";

export default function ForgotPassword() {
    const dispatch = useDispatch();
    const { mobile, loading, error } = useSelector((state) => state.auth);

    useEffect(() => {
        dispatch(clearError());
        dispatch(clearAuthInputs());
    }, [dispatch]);

    const handleSendOtp = async () => {
        dispatch(clearError());
        if (mobile.length !== 10) return;

        const phone = `${COUNTRY_CODE}${mobile}`;
        const result = await dispatch(sendOtpThunk({ phone, purpose: 'reset_password' }));
        if (sendOtpThunk.fulfilled.match(result)) {
            dispatch(setOtpFlow('reset_password'));
            router.push("/otp-verification");
        }
    };

    return (
        <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : "height"}>
            <View className="flex-1">
                <StatusBar style="light" />

                <View className="bg-[#4A43EC] pt-16 pb-10 px-6">
                    <View style={{ width: 60, height: 60, overflow: 'hidden' }} className="mb-6">
                        <Image source={logo} style={{ width: 110, height: 110, margin: -20 }} resizeMode="contain" />
                    </View>
                    <Text className="text-white text-[32px] font-bold mb-1">Forgot Password</Text>
                    <Text className="text-white/80 text-[14px]">Enter your registered mobile number</Text>
                </View>

                <View className="flex-1 bg-white px-6 pt-8">
                    <Text className="text-gray-500 text-[13px] mb-1.5">Mobile Number</Text>
                    <View className="border border-gray-200 rounded-xl px-4 py-3 mb-8 flex-row items-center">
                        <Text className="text-[15px] text-black font-lato-bold mr-2">{COUNTRY_CODE}</Text>
                        <View className="w-[1px] h-5 bg-gray-200 mr-3" />
                        <TextInput
                            value={mobile}
                            onChangeText={(val) => dispatch(setMobile(val.replace(/[^0-9]/g, '').slice(0, 10)))}
                            placeholder="Phone Number"
                            placeholderTextColor="#aaa"
                            keyboardType="phone-pad"
                            maxLength={10}
                            className="flex-1 text-[15px] text-black"
                        />
                    </View>

                    {error && (
                        <Text className="text-red-500 text-[13px] mb-4 text-center">{error}</Text>
                    )}

                    <TouchableOpacity
                        onPress={handleSendOtp}
                        disabled={loading || mobile.length !== 10}
                        className="bg-[#4A43EC] rounded-2xl py-4 items-center"
                        style={{ opacity: mobile.length !== 10 ? 0.5 : 1 }}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text className="text-white text-[16px] font-semibold">Send OTP</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}
