import { Image, Text, View } from "react-native";
import { Link } from "expo-router";

const logo = require("../assets/icons/app-icon.png");

export default function AuthHeader({ title, subtitle, actionLabel, actionHref }) {
    return (
        <View className="bg-[#4A43EC] pt-12 pb-10 px-6">
            <View style={{ width: 60, height: 60, overflow: 'hidden' }} className="mb-6">
                <Image source={logo} style={{ width: 110, height: 110, margin: -20 }} resizeMode="contain" />
            </View>
            <Text className="text-white text-[36px] font-lato-bold mb-1">{title}</Text>
            <View className="flex-row items-center">
                <Text className="text-white/80 text-[14px]">{subtitle}</Text>
                <Link href={actionHref}>
                    <Text className="text-white text-[14px] font-lato-bold underline">{actionLabel}</Text>
                </Link>
            </View>
        </View>
    );
}