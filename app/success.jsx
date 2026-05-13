import React from 'react';
import { View, Text, TouchableOpacity, StatusBar, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

export default function Success() {
    const router = useRouter();

    return (
        <View className="flex-1 bg-white items-center justify-center px-8">
            <StatusBar barStyle="dark-content" />

            <Stack.Screen options={{
                headerShown: false,
                gestureEnabled: false,
                fullScreenGestureEnabled: false,
            }} />

            <View className="w-24 h-24 bg-green-50 rounded-full items-center justify-center mb-8">
                <Ionicons name="checkmark-circle" size={60} color="#10B981" />
            </View>

            <Text className="text-2xl font-lato-bold text-black text-center mb-3">Project Added Successfully!</Text>
            <Text className="text-sm font-lato text-gray-500 text-center mb-10 leading-relaxed">
                Your project has been successfully listed in the inventory. You can now manage units and track sales from your dashboard.
            </Text>

            <TouchableOpacity
                onPress={() => router.replace('/(tabs)/home')}
                className="bg-[#4A43EC] w-full py-4 rounded-xl items-center shadow-lg shadow-[#4A43EC]/30"
                activeOpacity={0.8}
            >
                <Text className="text-white font-lato-bold text-base">Back to Home</Text>
            </TouchableOpacity>
        </View>
    );
}
