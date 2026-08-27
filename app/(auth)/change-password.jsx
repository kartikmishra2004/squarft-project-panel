import { Text, View, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from "react-native";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import { setNewPassword, setConfirmPassword, clearError, resetPasswordThunk } from "../../store/slices/authSlice";

const logo = require("../../assets/icons/app-icon.png");

export default function ChangePassword() {
    const dispatch = useDispatch();
    const { newPassword, confirmPassword, verifiedToken, loading, error } = useSelector((state) => state.auth);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    useEffect(() => {
        dispatch(clearError());
    }, [dispatch]);

    const handleSubmit = async () => {
        dispatch(clearError());

        if (!newPassword || newPassword.length < 8) {
            Alert.alert('Weak Password', 'Password must be at least 8 characters long');
            return;
        }
        if (newPassword !== confirmPassword) {
            Alert.alert('Password Mismatch', 'Passwords do not match. Please check and try again.');
            return;
        }

        const result = await dispatch(resetPasswordThunk({
            verified_token: verifiedToken,
            new_password: newPassword,
        }));

        if (resetPasswordThunk.fulfilled.match(result)) {
            Alert.alert('Success', 'Password updated successfully. Please login again.', [
                { text: 'OK', onPress: () => router.replace("/login") },
            ]);
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
                    <Text className="text-white text-[36px] font-bold mb-1">Change Password</Text>
                    <Text className="text-white/80 text-[14px]">Set your new password</Text>
                </View>

                <View className="flex-1 bg-white px-6 pt-8">
                    <Text className="text-gray-500 text-[13px] mb-1.5">New Password</Text>
                    <View className="border border-gray-200 rounded-xl px-4 py-3.5 flex-row items-center mb-5">
                        <TextInput
                            value={newPassword}
                            onChangeText={(val) => dispatch(setNewPassword(val))}
                            placeholder="••••••••"
                            placeholderTextColor="#aaa"
                            secureTextEntry={!showNew}
                            className="flex-1 text-[15px] text-black"
                        />
                        <TouchableOpacity onPress={() => setShowNew(!showNew)}>
                            <Ionicons name={showNew ? "eye-outline" : "eye-off-outline"} size={20} color="#aaa" />
                        </TouchableOpacity>
                    </View>

                    <Text className="text-gray-500 text-[13px] mb-1.5">Confirm Password</Text>
                    <View className="border border-gray-200 rounded-xl px-4 py-3.5 flex-row items-center mb-8">
                        <TextInput
                            value={confirmPassword}
                            onChangeText={(val) => dispatch(setConfirmPassword(val))}
                            placeholder="••••••••"
                            placeholderTextColor="#aaa"
                            secureTextEntry={!showConfirm}
                            className="flex-1 text-[15px] text-black"
                        />
                        <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
                            <Ionicons name={showConfirm ? "eye-outline" : "eye-off-outline"} size={20} color="#aaa" />
                        </TouchableOpacity>
                    </View>

                    {error && (
                        <Text className="text-red-500 text-[13px] mb-4 text-center">{error}</Text>
                    )}

                    <TouchableOpacity
                        onPress={handleSubmit}
                        disabled={loading}
                        className="bg-[#4A43EC] rounded-2xl py-4 items-center"
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text className="text-white text-[16px] font-semibold">Reset Password</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}
