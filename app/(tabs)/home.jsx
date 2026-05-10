import { Text, View, ScrollView, Image, TouchableOpacity, TextInput, Platform } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, FontAwesome, MaterialIcons, Feather } from "@expo/vector-icons";
import { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { mockData } from "../../constants/mockData";

const projectImg = require("../../assets/images/project_main.png");
const profileImg = require("../../assets/images/user_profile.png");

export default function Home() {
    const [activeTab, setActiveTab] = useState("Overview");
    const [inventoryFilter, setInventoryFilter] = useState("All");
    const [selectedUnits, setSelectedUnits] = useState(new Set());
    const tabs = ["Overview", "Inventory", "Visits", "Deals"];
    const inventoryFilters = ["All", "Available", "Tokened", "Booked", "Sold"];
    const insets = useSafeAreaInsets();

    const isSelectable = (status) => status === "Available" || status === "Booked";

    const toggleUnit = (unitId, status) => {
        if (!isSelectable(status)) return;
        setSelectedUnits((prev) => {
            const next = new Set(prev);
            next.has(unitId) ? next.delete(unitId) : next.add(unitId);
            return next;
        });
    };

    const getStatusColor = (status, unitId) => {
        const selected = selectedUnits.has(unitId);
        if (selected) return "#1D4ED8";
        switch (status) {
            case "Available": return "#2563EB";
            case "Booked": return "#10B981";
            case "Tokened": return "#C7C7CD";
            case "Sold": return "#92370B";
            default: return "#F3F4F6";
        }
    };

    return (
        <View className="flex-1 bg-white">
            <StatusBar style={activeTab === "Overview" ? "light" : "dark"} translucent backgroundColor="transparent" />

            {/* Header Switcher */}
            {activeTab === "Overview" ? (
                <View style={{ position: "relative" }}>
                    <LinearGradient
                        colors={["#5D57F3", "#4A43EC"]}
                        className="rounded-b-[35px]"
                        style={{
                            paddingTop: Math.max(insets.top, 20) + 7,
                            paddingHorizontal: 20,
                            paddingBottom: 50
                        }}
                    >
                        {/* Profile & Notification */}
                        <View className="flex-row justify-between items-center mb-5">
                            <View className="flex-row items-center">
                                <View className="w-11 h-11 rounded-2xl overflow-hidden bg-gray-200 border-2 border-white/20">
                                    <Image source={profileImg} className="w-full h-full" />
                                </View>
                                <View className="ml-3">
                                    <View className="flex-row items-center">
                                        <Text className="text-white text-[17px] font-lato-bold">{mockData.user.name}</Text>
                                        {mockData.user.verified && (
                                            <MaterialIcons name="verified" size={15} color="#4ADE80" style={{ marginLeft: 4 }} />
                                        )}
                                    </View>
                                    <Text className="text-white/70 text-[10px] font-lato">{mockData.user.date}</Text>
                                </View>
                            </View>
                            <TouchableOpacity className="w-9 h-9 rounded-full bg-white/10 items-center justify-center">
                                <Ionicons name="notifications-outline" size={20} color="white" />
                            </TouchableOpacity>
                        </View>

                        {/* Search & Add Project */}
                        <View className="flex-row items-center gap-3 mb-5">
                            <View className="flex-1 h-10 bg-white rounded-xl flex-row items-center px-3">
                                <Ionicons name="search" size={18} color="#4A43EC" />
                                <TextInput
                                    placeholder="Select Project"
                                    placeholderTextColor="#9CA3AF"
                                    className="flex-1 ml-2 text-[#1A1A1A] font-lato text-[13px]"
                                />
                            </View>
                            <TouchableOpacity className="h-10 px-3 rounded-xl flex-row items-center border border-white/50">
                                <View className="w-5 h-5 rounded-full bg-white items-center justify-center">
                                    <Ionicons name="add" size={16} color="#4A43EC" />
                                </View>
                                <Text className="text-white ml-2 font-lato-bold text-[12px]">Add Projects</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Stats Cards */}
                        <View className="flex-row justify-between">
                            <View className="flex-1 bg-white rounded-xl overflow-hidden shadow-sm mr-2 border border-white/50">
                                <View className="bg-[#4A43EC] py-2 items-center">
                                    <Text className="text-white text-[8px] font-lato-bold uppercase tracking-tighter">Total Received</Text>
                                </View>
                                <View className="py-3 items-center bg-white">
                                    <Text className="text-[#1A1A1A] text-xs font-lato-bold">{mockData.stats.totalReceived}</Text>
                                </View>
                            </View>

                            <View className="flex-1 bg-white rounded-xl overflow-hidden shadow-sm mr-2 border border-white/50">
                                <View className="bg-[#4A43EC] py-2 items-center">
                                    <Text className="text-white text-[8px] font-lato-bold uppercase tracking-tighter">Upcoming  Amount</Text>
                                </View>
                                <View className="py-3 items-center bg-white">
                                    <Text className="text-[#10B981] text-xs font-lato-bold">{mockData.stats.upcomingAmount}</Text>
                                </View>
                            </View>

                            <View className="flex-1 bg-white rounded-xl overflow-hidden shadow-sm border border-white/50">
                                <View className="bg-[#4A43EC] py-2 items-center">
                                    <Text className="text-white text-[8px] font-lato-bold uppercase tracking-tighter">To Be Released</Text>
                                </View>
                                <View className="py-3 items-center bg-white">
                                    <Text className="text-[#EF4444] text-xs font-lato-bold">{mockData.stats.toBeReleased}</Text>
                                </View>
                            </View>
                        </View>
                    </LinearGradient>

                    {/* 20-stop smooth fade overlay */}
                    <LinearGradient
                        colors={[
                            "transparent",
                            "rgba(255,255,255,0.01)",
                            "rgba(255,255,255,0.03)",
                            "rgba(255,255,255,0.06)",
                            "rgba(255,255,255,0.10)",
                            "rgba(255,255,255,0.15)",
                            "rgba(255,255,255,0.21)",
                            "rgba(255,255,255,0.28)",
                            "rgba(255,255,255,0.36)",
                            "rgba(255,255,255,0.44)",
                            "rgba(255,255,255,0.52)",
                            "rgba(255,255,255,0.60)",
                            "rgba(255,255,255,0.68)",
                            "rgba(255,255,255,0.75)",
                            "rgba(255,255,255,0.82)",
                            "rgba(255,255,255,0.88)",
                            "rgba(255,255,255,0.93)",
                            "rgba(255,255,255,0.97)",
                            "rgba(255,255,255,0.99)",
                            "white"
                        ]}
                        style={{
                            position: "absolute",
                            bottom: 0,
                            left: 0,
                            right: 0,
                            height: 100,
                        }}
                        pointerEvents="none"
                    />
                </View>
            ) : (
                <View
                    style={{ paddingTop: Math.max(insets.top, 20) + 10 }}
                    className="bg-white px-5 pb-4"
                >
                    <View className="flex-row items-center justify-between">
                        <TouchableOpacity
                            onPress={() => setActiveTab("Overview")}
                            className="w-10 h-10 rounded-full border border-gray-100 items-center justify-center"
                        >
                            <Ionicons name="chevron-back" size={20} color="#1A1A1A" />
                        </TouchableOpacity>
                        <TouchableOpacity className="flex-row items-center">
                            <Text className="text-[#1A1A1A] text-lg font-lato-bold mr-1">Serenity Reserve</Text>
                            <Ionicons name="chevron-down" size={16} color="#1A1A1A" />
                        </TouchableOpacity>
                        <View className="w-10" />
                    </View>
                </View>
            )}

            {/* Tabs Bar */}
            <View className="flex-row justify-around border-b border-gray-100 bg-white" style={{ paddingHorizontal: 10 }}>
                {tabs.map((tab) => (
                    <TouchableOpacity
                        key={tab}
                        onPress={() => setActiveTab(tab)}
                        className={`pb-2.5 px-2 ${activeTab === tab ? "border-b-2 border-[#4A43EC]" : ""}`}
                    >
                        <Text className={`${activeTab === tab ? "text-[#4A43EC] font-lato-bold" : "text-gray-400 font-lato"} text-[12px]`}>
                            {tab}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 120 }}
            >
                {activeTab === "Overview" ? (
                    <View className="pt-2">
                        {mockData.projects.map((project) => (
                            <View key={project.id} className="mx-5 my-4 bg-white rounded-[20px] border border-gray-100 shadow-sm overflow-hidden">
                                <View className="flex-row h-40">
                                    <View className="flex-[2] relative">
                                        <Image source={projectImg} className="w-full h-full" />
                                        <View className="absolute top-2.5 left-2.5 bg-black/40 px-2 py-0.5 rounded-md">
                                            <Text className="text-white text-[9px] font-lato">{project.developer}</Text>
                                        </View>
                                    </View>
                                    <View className="flex-1 ml-0.5 bg-gray-200 relative">
                                        <Image source={projectImg} className="w-full h-full opacity-60" resizeMode="cover" />
                                        <View className="absolute bottom-2.5 right-2.5 bg-black/50 px-1.5 py-0.5 rounded-md">
                                            <Text className="text-white text-[9px] font-lato-bold">{project.imagesCount}</Text>
                                        </View>
                                    </View>
                                </View>

                                <View className="p-3.5">
                                    <View className="flex-row items-center mb-1.5">
                                        <Text className="text-gray-400 text-[10px] font-lato">Possession: {project.possession}</Text>
                                        <View className="w-1 h-1 rounded-full bg-gray-300 mx-1.5" />
                                        <Text className="text-gray-400 text-[10px] font-lato">Avg Price per sq ft: {project.avgPrice}</Text>
                                    </View>

                                    <View className="flex-row items-center justify-between mb-0.5">
                                        <Text className="text-[#1A1A1A] text-xl font-lato-bold">{project.title}</Text>
                                        {project.rera && (
                                            <View className="bg-green-50 px-1.5 py-0.5 rounded flex-row items-center border border-green-100">
                                                <Text className="text-[#10B981] text-[9px] font-lato-bold mr-1">RERA</Text>
                                                <Ionicons name="checkmark-circle" size={10} color="#10B981" />
                                            </View>
                                        )}
                                    </View>
                                    <Text className="text-gray-400 text-[12px] font-lato mb-3">{project.location}</Text>

                                    <View className="border-t border-dashed border-gray-200 pt-3 mb-3">
                                        <View className="flex-row">
                                            {project.apartments.map((apt, idx) => (
                                                <View key={idx} className={`flex-1 ${idx === 0 ? "border-r border-gray-100 pr-3" : "pl-3"}`}>
                                                    <Text className="text-gray-400 text-[9px] font-lato-bold uppercase mb-0.5">{apt.type}</Text>
                                                    <Text className="text-[#1A1A1A] text-base font-lato-bold">{apt.price}</Text>
                                                </View>
                                            ))}
                                        </View>
                                    </View>

                                    <View className="flex-row justify-between mb-5">
                                        <View className="flex-1 bg-white border border-gray-100 rounded-lg py-1.5 items-center mr-2">
                                            <Text className="text-gray-400 text-[9px] font-lato-bold uppercase">Unit</Text>
                                            <Text className="text-[#1A1A1A] text-xs font-lato-bold">{project.units.total}</Text>
                                        </View>
                                        <View className="flex-1 bg-white border border-gray-100 rounded-lg py-1.5 items-center mr-2">
                                            <Text className="text-gray-400 text-[9px] font-lato-bold uppercase">Avail.</Text>
                                            <Text className="text-[#1A1A1A] text-xs font-lato-bold">{project.units.avail}</Text>
                                        </View>
                                        <View className="flex-1 bg-white border border-gray-100 rounded-lg py-1.5 items-center">
                                            <Text className="text-gray-400 text-[9px] font-lato-bold uppercase">Sold</Text>
                                            <Text className="text-[#1A1A1A] text-xs font-lato-bold">{project.units.sold}</Text>
                                        </View>
                                    </View>

                                    <View className="flex-row gap-2.5">
                                        <TouchableOpacity
                                            onPress={() => setActiveTab("Inventory")}
                                            className="flex-1 border border-[#4A43EC] rounded-lg py-2.5 items-center"
                                        >
                                            <Text className="text-[#4A43EC] font-lato-bold text-[13px]">Edit Inventory</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity className="flex-1 border border-[#4A43EC] rounded-lg py-2.5 items-center">
                                            <Text className="text-[#4A43EC] font-lato-bold text-[13px]">Track Follow-Up</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>
                ) : activeTab === "Inventory" ? (
                    <View className="p-5">
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-8">
                            {inventoryFilters.map((filter) => (
                                <TouchableOpacity
                                    key={filter}
                                    onPress={() => setInventoryFilter(filter)}
                                    className={`px-6 py-2 rounded-full mr-3 ${inventoryFilter === filter ? "bg-[#3D30F2]" : "bg-white border border-gray-100"}`}
                                >
                                    <Text className={`font-lato-bold text-[13px] ${inventoryFilter === filter ? "text-white" : "text-gray-400"}`}>
                                        {filter}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        {mockData.projects[0].inventory.map((section, idx) => {
                            const filteredUnits = inventoryFilter === "All"
                                ? section.units
                                : section.units.filter(u => u.status === inventoryFilter);

                            if (filteredUnits.length === 0) return null;

                            return (
                                <View key={idx} className="mb-8">
                                    <View className="flex-row items-center mb-4">
                                        <Text className="text-gray-400 text-[11px] font-lato-bold uppercase tracking-wider">{section.floor}</Text>
                                        <View className="flex-1 h-[1px] bg-gray-50 ml-4" />
                                    </View>

                                    <View className="flex-row flex-wrap gap-4">
                                        {filteredUnits.map((unit) => {
                                            const isSelected = selectedUnits.has(unit.id);
                                            const selectable = isSelectable(unit.status);
                                            return (
                                                <TouchableOpacity
                                                    key={unit.id}
                                                    onPress={() => toggleUnit(unit.id, unit.status)}
                                                    activeOpacity={selectable ? 0.75 : 1}
                                                    style={{
                                                        width: 70,
                                                        height: 70,
                                                        backgroundColor: getStatusColor(unit.status, unit.id),
                                                        borderRadius: 12,
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        borderWidth: isSelected ? 2.5 : 0,
                                                        borderColor: isSelected ? "white" : "transparent",
                                                        shadowColor: isSelected ? "#1D4ED8" : "#000",
                                                        shadowOffset: { width: 0, height: 4 },
                                                        shadowOpacity: isSelected ? 0.4 : 0.05,
                                                        shadowRadius: 8,
                                                        elevation: isSelected ? 8 : 1,
                                                    }}
                                                >
                                                    <Text
                                                        className="text-white text-[11px] font-lato-bold text-center"
                                                        style={{ includeFontPadding: false }}
                                                    >
                                                        {unit.id}
                                                    </Text>
                                                    {unit.type && (
                                                        <Text
                                                            className="text-white text-[8px] font-lato text-center"
                                                            style={{ includeFontPadding: false, marginTop: 1 }}
                                                        >
                                                            ({unit.type})
                                                        </Text>
                                                    )}
                                                    {isSelected && (
                                                        <View style={{ marginTop: 2 }}>
                                                            <Ionicons name="checkmark-circle" size={10} color="white" />
                                                        </View>
                                                    )}
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                ) : (
                    <View className="p-10 items-center">
                        <Text className="text-gray-400 font-lato">Coming Soon...</Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}