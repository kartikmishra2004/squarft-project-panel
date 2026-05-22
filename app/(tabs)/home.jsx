import { Text, View, ScrollView, Image, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialIcons, Feather } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { mockData } from "../../constants/mockData";
import ProjectDetailModal from "../../components/ProjectDetailModal";

const projectImg = require("../../assets/images/project_main.png");
const profileImg = require("../../assets/images/user_profile.png");

export default function Home() {
    const [activeTab, setActiveTab] = useState("Overview");

    const [selectedProjectId, setSelectedProjectId] = useState(mockData.projects[0]?.id ?? "");
    const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
    const [isProjectDetailVisible, setIsProjectDetailVisible] = useState(false);
    const [selectedDeal, setSelectedDeal] = useState(null);
    const [inventoryType, setInventoryType] = useState("apartment");
    const [selectedTower, setSelectedTower] = useState("tower-a");
    const [selectedPlotStack, setSelectedPlotStack] = useState("stack-a");
    const [selectedPlotUnit, setSelectedPlotUnit] = useState("A-1202");
    const [selectedUnits, setSelectedUnits] = useState(new Set());
    const tabs = ["Overview", "Inventory", "Visits", "Deals"];
    const inventoryTabs = [
        { key: "apartment", label: "Apartment" },
        { key: "villa", label: "Villa" },
        { key: "rowhouse", label: "Rowhouse" },
        { key: "plot", label: "Plot" },
        { key: "shop", label: "Shop" }
    ];
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

    const getBadgeStyle = (status) => {
        switch (status) {
            case "Available":
                return "bg-emerald-100 text-emerald-600";
            case "Booked":
                return "bg-amber-100 text-amber-600";
            case "Tokened":
                return "bg-slate-100 text-slate-500";
            case "Sold":
                return "bg-rose-100 text-rose-500";
            default:
                return "bg-gray-100 text-gray-500";
        }
    };

    const getActionButtonStyle = (variant) => {
        switch (variant) {
            case "primary":
                return "bg-[#4A43EC] border-[#4A43EC]";
            case "secondary":
                return "bg-white border-gray-200";
            case "disabled":
                return "bg-gray-100 border-gray-100";
            default:
                return "bg-white border-gray-200";
        }
    };

    const getPlotStatusStyle = (status) => {
        switch (status) {
            case "Reserved":
                return "bg-violet-100 text-violet-700";
            case "In Process":
                return "bg-emerald-100 text-emerald-700";
            case "Sold":
                return "bg-slate-100 text-slate-500";
            default:
                return "bg-gray-100 text-gray-500";
        }
    };

    const getVisitChipStyle = (tone) => {
        switch (tone) {
            case "indigo":
                return "bg-[#E9E8FF] text-[#4A43EC]";
            case "orange":
                return "bg-[#FFF1E3] text-[#F97316]";
            default:
                return "bg-gray-100 text-gray-500";
        }
    };

    const getDealStatusStyle = (tone) => {
        switch (tone) {
            case "success":
                return "bg-[#DDF6E7] text-[#23A55B]";
            case "info":
                return "bg-[#DCEAFF] text-[#4B82F1]";
            case "warning":
                return "bg-[#FDECC8] text-[#D98A1B]";
            case "muted":
                return "bg-[#ECEEF4] text-[#636A78]";
            default:
                return "bg-gray-100 text-gray-500";
        }
    };

    const projectOptions = mockData.projects;
    const selectedProject = projectOptions.find((project) => project.id === selectedProjectId) || projectOptions[0] || { inventory: {} };
    const visitsData = selectedProject.visits || { metrics: [], pipeline: { stages: [] }, followUps: [] };
    const dealsData = selectedProject.deals || [];
    const selectedInventory = selectedProject.inventory?.[inventoryType] || { sections: [] };
    const selectedTowerData = selectedInventory.towers?.find((tower) => tower.key === selectedTower) || selectedInventory.towers?.[0] || null;
    const selectedPlotData = selectedInventory.stacks?.find((stack) => stack.key === selectedPlotStack) || selectedInventory.stacks?.[0] || null;
    const activePlotUnit = selectedPlotData?.levels.flatMap((level) => level.cards || []).find((card) => card.unit === selectedPlotUnit)
        || selectedPlotData?.levels.flatMap((level) => level.cards || []).find((card) => card.active)
        || selectedPlotData?.levels.flatMap((level) => level.cards || []).find((card) => card.unit)
        || null;

    useEffect(() => {
        if (inventoryType === "apartment") {
            const firstTowerKey = selectedInventory.towers?.[0]?.key;
            if (firstTowerKey) setSelectedTower(firstTowerKey);
        }
        if (inventoryType === "plot") {
            const firstStackKey = selectedInventory.stacks?.[0]?.key;
            if (firstStackKey) setSelectedPlotStack(firstStackKey);
        }
    }, [inventoryType, selectedInventory.towers, selectedInventory.stacks]);

    useEffect(() => {
        if (inventoryType !== "plot") return;
        if (!activePlotUnit?.unit) return;
        setSelectedPlotUnit(activePlotUnit.unit);
    }, [inventoryType, selectedPlotData, activePlotUnit]);

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
                            paddingBottom: 50,
                            overflow: "visible"
                        }}
                    >
                        {/* Profile & Notification */}
                        <View className="flex-row justify-between items-center mb-4">
                            <View className="flex-row items-center">
                                <View className="w-10 h-10 rounded-2xl overflow-hidden bg-gray-200 border-2 border-white/20">
                                    <Image source={profileImg} className="w-full h-full" />
                                </View>
                                <View className="ml-3">
                                    <View className="flex-row items-center">
                                        <Text className="text-white text-[15px] font-lato-bold">{mockData.user.name}</Text>
                                        {mockData.user.verified && (
                                            <MaterialIcons name="verified" size={14} color="#4ADE80" style={{ marginLeft: 4 }} />
                                        )}
                                    </View>
                                    <Text className="text-white/70 text-[9px] font-lato">{mockData.user.date}</Text>
                                </View>
                            </View>
                            <TouchableOpacity className="w-8 h-8 rounded-full bg-white/10 items-center justify-center">
                                <Ionicons name="notifications-outline" size={18} color="white" />
                            </TouchableOpacity>
                        </View>

                        {/* Search & Add Project */}
                        <View className="flex-row items-center gap-2.5 mb-4" style={{ zIndex: 1000, elevation: 1000, position: "relative" }}>
                            <View className="flex-1 relative z-50" style={{ zIndex: 9999, elevation: 9999 }}>
                                <TouchableOpacity
                                    activeOpacity={0.85}
                                    onPress={() => setIsProjectDropdownOpen((current) => !current)}
                                    className="h-9 bg-white rounded-xl flex-row items-center px-3"
                                >
                                    <Ionicons name="chevron-down" size={16} color="#4A43EC" />
                                    <Text className="flex-1 ml-2 text-[#1A1A1A] font-lato text-[12px]" numberOfLines={1}>
                                        {selectedProject?.title || "Select Project"}
                                    </Text>
                                </TouchableOpacity>

                                {isProjectDropdownOpen ? (
                                    <View
                                        className="absolute left-0 right-0 top-10 bg-white rounded-xl border border-gray-100 overflow-hidden"
                                        style={{ zIndex: 10000, elevation: 50 }}
                                    >
                                        {projectOptions.map((project) => {
                                            const isSelected = project.id === selectedProjectId;

                                            return (
                                                <TouchableOpacity
                                                    key={project.id}
                                                    activeOpacity={0.85}
                                                    onPress={() => {
                                                        setSelectedProjectId(project.id);
                                                        setIsProjectDropdownOpen(false);
                                                    }}
                                                    className={`px-3 py-3 ${isSelected ? "bg-[#F4F3FF]" : "bg-white"}`}
                                                >
                                                    <Text className={`font-lato-bold text-[12px] ${isSelected ? "text-[#4A43EC]" : "text-[#1A1A1A]"}`} numberOfLines={1}>
                                                        {project.title}
                                                    </Text>
                                                    <Text className="mt-0.5 text-[10px] font-lato text-[#8E9AAF]" numberOfLines={1}>
                                                        {project.location}
                                                    </Text>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>
                                ) : null}
                            </View>
                            <TouchableOpacity className="h-9 px-3 rounded-xl flex-row items-center border border-white/50">
                                <View className="w-[18px] h-[18px] rounded-full bg-white items-center justify-center">
                                    <Ionicons name="add" size={14} color="#4A43EC" />
                                </View>
                                <Text className="text-white ml-2 font-lato-bold text-[11px]">Add Projects</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Stats Cards */}
                        <View className="flex-row justify-between" style={{ zIndex: 1, elevation: 1, position: "relative" }}>
                            <View className="flex-1 bg-white rounded-2xl overflow-hidden shadow-sm mr-2 border border-white/50 min-h-[72px]">
                                <View className="bg-[#4A43EC] py-2.5 items-center">
                                    <Text className="text-white text-[9px] font-lato-bold uppercase tracking-tighter">Total Received</Text>
                                </View>
                                <View className="py-3 items-center bg-white">
                                    <Text className="text-[#1A1A1A] text-[13px] font-lato-bold">{mockData.stats.totalReceived}</Text>
                                </View>
                            </View>

                            <View className="flex-1 bg-white rounded-2xl overflow-hidden shadow-sm mr-2 border border-white/50 min-h-[72px]">
                                <View className="bg-[#4A43EC] py-2.5 items-center">
                                    <Text className="text-white text-[9px] font-lato-bold uppercase tracking-tighter">Upcoming  Amount</Text>
                                </View>
                                <View className="py-3 items-center bg-white">
                                    <Text className="text-[#10B981] text-[13px] font-lato-bold">{mockData.stats.upcomingAmount}</Text>
                                </View>
                            </View>

                            <View className="flex-1 bg-white rounded-2xl overflow-hidden shadow-sm border border-white/50 min-h-[72px]">
                                <View className="bg-[#4A43EC] py-2.5 items-center">
                                    <Text className="text-white text-[9px] font-lato-bold uppercase tracking-tighter">To Be Released</Text>
                                </View>
                                <View className="py-3 items-center bg-white">
                                    <Text className="text-[#EF4444] text-[13px] font-lato-bold">{mockData.stats.toBeReleased}</Text>
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
                                className={`pb-2 px-1.5 ${activeTab === tab ? "border-b-2 border-[#4A43EC]" : ""}`}
                    >
                        <Text className={`${activeTab === tab ? "text-[#4A43EC] font-lato-bold" : "text-gray-400 font-lato"} text-[11px]`}>
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
                        <View key={selectedProject.id} className="mx-5 my-4 bg-white rounded-[20px] border border-gray-100 shadow-sm overflow-hidden">
                            <View className="flex-row h-36">
                                <View className="flex-[2] relative">
                                    <Image source={projectImg} className="w-full h-full" />
                                    <View className="absolute top-2 left-2 bg-black/40 px-2 py-0.5 rounded-md">
                                        <Text className="text-white text-[8px] font-lato">{selectedProject.developer}</Text>
                                    </View>
                                </View>
                                <View className="flex-1 ml-0.5 bg-gray-200 relative">
                                    <Image source={projectImg} className="w-full h-full opacity-60" resizeMode="cover" />
                                    <View className="absolute bottom-2 right-2 bg-black/50 px-1.5 py-0.5 rounded-md">
                                        <Text className="text-white text-[8px] font-lato-bold">{selectedProject.imagesCount}</Text>
                                    </View>
                                </View>
                            </View>

                            <View className="p-3">
                                <View className="flex-row items-center mb-1.5">
                                    <Text className="text-gray-400 text-[9px] font-lato">Possession: {selectedProject.possession}</Text>
                                    <View className="w-1 h-1 rounded-full bg-gray-300 mx-1.5" />
                                    <Text className="text-gray-400 text-[9px] font-lato">Avg Price per sq ft: {selectedProject.avgPrice}</Text>
                                </View>

                                <View className="flex-row items-center justify-between mb-0.5">
                                    <Text className="text-[#1A1A1A] text-[18px] font-lato-bold">{selectedProject.title}</Text>
                                    {selectedProject.rera && (
                                        <View className="bg-green-50 px-1.5 py-0.5 rounded flex-row items-center border border-green-100">
                                            <Text className="text-[#10B981] text-[8px] font-lato-bold mr-1">RERA</Text>
                                            <Ionicons name="checkmark-circle" size={9} color="#10B981" />
                                        </View>
                                    )}
                                </View>
                                <Text className="text-gray-400 text-[11px] font-lato mb-2.5">{selectedProject.location}</Text>

                                <View className="border-t border-dashed border-gray-200 pt-2.5 mb-2.5">
                                    <View className="flex-row">
                                        {selectedProject.apartments.map((apt, idx) => (
                                            <View key={idx} className={`flex-1 ${idx === 0 ? "border-r border-gray-100 pr-3" : "pl-3"}`}>
                                                <Text className="text-gray-400 text-[8px] font-lato-bold uppercase mb-0.5">{apt.type}</Text>
                                                <Text className="text-[#1A1A1A] text-[13px] font-lato-bold">{apt.price}</Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>

                                <View className="flex-row justify-between mb-4">
                                    <View className="flex-1 bg-[#EEF4FF] border border-[#DDE8FF] rounded-lg py-1.5 items-center mr-1.5 min-w-0">
                                        <Text className="text-[#2563EB] text-[8px] font-lato-bold uppercase">Total</Text>
                                        <Text className="text-[#1A1A1A] text-[11px] font-lato-bold">{selectedProject.units.total}</Text>
                                    </View>
                                    <View className="flex-1 bg-[#ECFBF6] border border-[#D7F5E8] rounded-lg py-1.5 items-center mr-1.5 min-w-0">
                                        <Text className="text-[#10B981] text-[8px] font-lato-bold uppercase">Avail</Text>
                                        <Text className="text-[#1A1A1A] text-[11px] font-lato-bold">{selectedProject.units.avail}</Text>
                                    </View>
                                    <View className="flex-1 bg-[#FFF3EF] border border-[#FFE1D6] rounded-lg py-1.5 items-center mr-1.5 min-w-0">
                                        <Text className="text-[#EF4444] text-[8px] font-lato-bold uppercase">Sold</Text>
                                        <Text className="text-[#1A1A1A] text-[11px] font-lato-bold">{selectedProject.units.sold}</Text>
                                    </View>
                                    <View className="flex-1 bg-[#FFF8EA] border border-[#FDECC8] rounded-lg py-1.5 items-center mr-1.5 min-w-0">
                                        <Text className="text-[#D98A1B] text-[8px] font-lato-bold uppercase">Booked</Text>
                                        <Text className="text-[#1A1A1A] text-[11px] font-lato-bold">{selectedProject.units.booked}</Text>
                                    </View>
                                    <View className="flex-1 bg-[#F2F0FF] border border-[#E3DDFF] rounded-lg py-1.5 items-center min-w-0">
                                        <Text className="text-[#6D5EF8] text-[8px] font-lato-bold uppercase">Token</Text>
                                        <Text className="text-[#1A1A1A] text-[11px] font-lato-bold">{selectedProject.units.token}</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>
                ) : activeTab === "Inventory" ? (
                    <View className="p-4">
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-5">
                            {inventoryTabs.map((tab) => (
                                <TouchableOpacity
                                    key={tab.key}
                                    onPress={() => setInventoryType(tab.key)}
                                    className={`px-[18px] py-1.5 rounded-full mr-2.5 ${inventoryType === tab.key ? "bg-[#3D30F2]" : "bg-white border border-gray-100"}`}
                                >
                                    <Text className={`font-lato-bold text-[11px] ${inventoryType === tab.key ? "text-white" : "text-gray-400"}`}>
                                        {tab.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        {inventoryType === "apartment" && selectedInventory.towers?.length ? (
                            <View className="mb-5 rounded-2xl bg-[#E8EDF6] p-1 flex-row">
                                {selectedInventory.towers.map((tower) => {
                                    const isActiveTower = selectedTowerData?.key === tower.key;

                                    return (
                                        <TouchableOpacity
                                            key={tower.key}
                                            onPress={() => setSelectedTower(tower.key)}
                                            className={`flex-1 items-center rounded-[16px] py-3 ${isActiveTower ? "bg-white" : "bg-transparent"}`}
                                            style={{
                                                shadowColor: isActiveTower ? "#000" : "transparent",
                                                shadowOpacity: isActiveTower ? 0.06 : 0,
                                                shadowOffset: { width: 0, height: 2 },
                                                shadowRadius: 6,
                                                elevation: isActiveTower ? 2 : 0,
                                            }}
                                        >
                                            <Text className={`text-[15px] font-lato-bold ${isActiveTower ? "text-[#4A43EC]" : "text-[#718096]"}`}>
                                                {tower.label}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        ) : null}

                        {inventoryType === "plot" && selectedPlotData ? (
                            <View>
                                <View className="flex-row items-center justify-between mb-3 mx-1">
                                    <Text className="text-gray-400 text-[10px] font-lato-bold uppercase tracking-[2px] mx-4">Floor</Text>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                        {selectedInventory.stacks.map((stack) => {
                                            const isActiveStack = selectedPlotData.key === stack.key;

                                            return (
                                                <TouchableOpacity
                                                    key={stack.key}
                                                    onPress={() => setSelectedPlotStack(stack.key)}
                                                    className={`min-w-[112px] px-3.5 py-1.5 rounded-xl mr-2.5 items-center ${isActiveStack ? "bg-[#E8E7FA]" : "bg-[#E8EDF6]"}`}
                                                    style={{
                                                        shadowColor: isActiveStack ? "#000" : "transparent",
                                                        shadowOpacity: isActiveStack ? 0.05 : 0,
                                                        shadowOffset: { width: 0, height: 2 },
                                                        shadowRadius: 4,
                                                        elevation: isActiveStack ? 1 : 0,
                                                    }}
                                                >
                                                    <Text className={`text-[12px] font-lato-bold ${isActiveStack ? "text-[#2F2BEA]" : "text-[#718096]"}`}>
                                                        {stack.label}
                                                    </Text>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </ScrollView>
                                </View>

                                {selectedPlotData.levels.map((level) => {
                                    if (!level.cards || level.cards.length === 0) return null;

                                    return (
                                    <View key={level.level} className="flex-row mb-2.5">
                                        <View className="w-[82px] h-[82px] rounded-2xl bg-[#E8E8F5] border border-[#CFCFE7] items-center justify-center mr-2.5">
                                            <Text className="text-[#7E8096] text-[9px] font-lato-bold uppercase">Level</Text>
                                            <Text className="text-[#1F2330] text-[20px] font-lato-bold leading-6">{level.level}</Text>
                                        </View>

                                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 4 }}>
                                            <View className="flex-row">
                                                {level.cards.map((card, cardIndex) => {
                                                    if (!card.unit) {
                                                        return (
                                                            <View
                                                                key={`empty-${level.level}-${cardIndex}`}
                                                                className="w-[210px] h-[82px] rounded-2xl border border-[#E6E8F2] bg-[#FBFBFE] mr-2.5"
                                                            />
                                                        );
                                                    }

                                                    const isPlotSelected = selectedPlotUnit === card.unit;
                                                    const isPlotActive = isPlotSelected || card.active;

                                                    return (
                                                        <TouchableOpacity
                                                            key={card.unit}
                                                            onPress={() => setSelectedPlotUnit(card.unit)}
                                                            activeOpacity={0.85}
                                                            className={`w-[210px] h-[82px] rounded-2xl border px-3.5 py-3 justify-between mr-2.5 ${isPlotActive ? "bg-[#2F55F0] border-[#1847E6]" : card.disabled ? "bg-white border-[#D7D9EA]" : "bg-[#F6F5FD] border-[#D7D9EA]"}`}
                                                        >
                                                            <View className="flex-row items-start justify-between">
                                                                <View>
                                                                    <Text className={`text-[14px] font-lato-bold ${isPlotActive ? "text-white" : card.disabled ? "text-[#6B7280]" : "text-[#5C2EF7]"}`}>
                                                                        {card.unit}
                                                                    </Text>
                                                                    <Text className={`mt-0.5 text-[10px] font-lato ${isPlotActive ? "text-white/90" : card.disabled ? "text-[#8A92A6]" : "text-[#6B5FD9]"}`}>
                                                                        {card.meta}
                                                                    </Text>
                                                                </View>
                                                                {card.icon ? (
                                                                    <View className={`w-5 h-5 rounded-full items-center justify-center ${isPlotActive ? "bg-white/15" : "bg-white"}`}>
                                                                        <Ionicons name={card.icon} size={12} color={isPlotActive ? "white" : "#5C2EF7"} />
                                                                    </View>
                                                                ) : null}
                                                            </View>

                                                            <View className="flex-row items-center justify-between mt-2.5">
                                                                <Text className={`text-[15px] font-lato-bold ${isPlotActive ? "text-white" : card.disabled ? "text-[#A3AEC1]" : "text-[#2F55F0]"}`}>
                                                                    {card.price}
                                                                </Text>
                                                                <View className={`px-2 py-0.5 rounded-full ${getPlotStatusStyle(card.status)}`}>
                                                                    <Text className="text-[8px] font-lato-bold uppercase">{card.status}</Text>
                                                                </View>
                                                            </View>
                                                        </TouchableOpacity>
                                                    );
                                                })}
                                            </View>
                                        </ScrollView>
                                    </View>
                                    );
                                })}
                            </View>
                        ) : (selectedTowerData?.sections || selectedInventory.sections).length === 0 ? null : (selectedTowerData?.sections || selectedInventory.sections).map((section, idx) => {
                            if (section.units.length === 0) return null;

                            return (
                                <View key={idx} className="mb-6">
                                    <View className="flex-row items-center mb-3">
                                        <Text className="text-gray-400 text-[10px] font-lato-bold uppercase tracking-[2px]">{section.rowLabel}</Text>
                                        <View className="flex-1 h-[1px] bg-gray-100 ml-3" />
                                    </View>

                                    <View className="flex-row flex-wrap justify-between">
                                        {section.units.map((unit) => {
                                            const isSelected = selectedUnits.has(unit.id);
                                            const selectable = isSelectable(unit.status);

                                            return (
                                                <TouchableOpacity
                                                    key={unit.id}
                                                    onPress={() => toggleUnit(unit.id, unit.status)}
                                                    activeOpacity={selectable ? 0.8 : 1}
                                                    className="bg-white rounded-2xl border border-gray-200 shadow-sm mb-3.5 overflow-hidden"
                                                    style={{
                                                        width: "48%",
                                                        minHeight: 166,
                                                        opacity: unit.dimmed ? 0.72 : 1,
                                                        borderColor: isSelected ? "#4A43EC" : "#E5E7EB",
                                                        shadowColor: isSelected ? "#4A43EC" : "#000",
                                                        shadowOffset: { width: 0, height: 6 },
                                                        shadowOpacity: isSelected ? 0.16 : 0.05,
                                                        shadowRadius: 10,
                                                        elevation: isSelected ? 6 : 2,
                                                    }}
                                                >
                                                    <View className="p-3.5 flex-1 justify-between">
                                                        <View className="flex-row items-start justify-between mb-2.5">
                                                            <Text className="text-[#9AA3B2] text-[12px] font-lato-bold">{unit.id}</Text>
                                                            <View className={`px-2.5 py-1 rounded-full ${getBadgeStyle(unit.status)}`}>
                                                                <Text className="text-[9px] font-lato-bold uppercase">{unit.status}</Text>
                                                            </View>
                                                        </View>

                                                        <View className="mb-3.5">
                                                            <Text
                                                                className={`text-[16px] font-lato-bold leading-5 ${unit.dimmed ? "text-[#A3AEC1]" : "text-[#1A1A1A]"}`}
                                                                numberOfLines={2}
                                                            >
                                                                {unit.title}
                                                            </Text>
                                                            <Text className="text-[#7C8698] text-[12px] font-lato mt-0.5">{unit.area}</Text>
                                                        </View>

                                                        <View className="flex-row items-center gap-2">
                                                            <TouchableOpacity
                                                                activeOpacity={selectable ? 0.8 : 1}
                                                                className={`flex-1 rounded-xl border py-2 items-center ${getActionButtonStyle(unit.ctaVariant)}`}
                                                                onPress={() => toggleUnit(unit.id, unit.status)}
                                                            >
                                                                <Text className={`font-lato-bold text-[11px] ${unit.ctaVariant === "primary" ? "text-white" : unit.ctaVariant === "disabled" ? "text-gray-400" : "text-[#64748B]"}`}>
                                                                    {unit.ctaLabel}
                                                                </Text>
                                                            </TouchableOpacity>
                                                            <View className="w-9 h-9 rounded-xl bg-gray-100 items-center justify-center">
                                                                <Feather name={unit.actionIcon} size={16} color="#94A3B8" />
                                                            </View>
                                                        </View>
                                                    </View>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                ) : activeTab === "Visits" ? (
                    <View className="px-5 pt-5">
                        <View className="flex-row justify-between mb-4">
                            {visitsData.metrics.map((metric, index) => (
                                <View
                                    key={metric.label}
                                    className={`flex-1 bg-white rounded-[16px] border border-gray-100 items-center justify-center py-3.5 ${index < visitsData.metrics.length - 1 ? "mr-3" : ""}`}
                                    style={{ minHeight: 96 }}
                                >
                                    <Text className="text-[#7C8AA5] text-[9px] font-lato-bold uppercase tracking-[1px]">{metric.label}</Text>
                                    <Text className="mt-1 text-[24px] leading-[26px] font-lato-bold" style={{ color: metric.valueColor }}>
                                        {metric.value}
                                    </Text>
                                    <Text className="mt-1 text-[10px] font-lato-bold text-[#22C55E]">↑ {metric.delta.replace("+", "")}</Text>
                                </View>
                            ))}
                        </View>

                        <View className="rounded-[18px] border border-[#D9D7FF] bg-[#F7F6FF] px-3 pt-3 pb-3.5 mb-5">
                            <View className="flex-row items-center justify-between mb-3.5">
                                <View className="flex-row items-center">
                                    <Ionicons name="funnel-outline" size={15} color="#4A43EC" />
                                    <Text className="ml-2 text-[16px] font-lato-bold text-[#1F2937]">{visitsData.pipeline.title}</Text>
                                </View>
                                <TouchableOpacity>
                                    <Text className="text-[12px] font-lato text-[#4A43EC]">{visitsData.pipeline.action}</Text>
                                </TouchableOpacity>
                            </View>

                            <View className="h-[88px] relative justify-center">
                                <View className="absolute left-4 right-4 top-[27px] h-[1px] bg-[#E5E7F2]" />
                                <View className="flex-row items-start justify-between px-1">
                                    {visitsData.pipeline.stages.map((stage, index) => {
                                        const palette = ["#7B73F8", "#8B86FF", "#6C7CFF", "#4FA8FF", "#F2BE4B", "#B8B0F2", "#D6F2DE"];
                                        const circleColor = palette[index % palette.length];

                                        return (
                                            <View key={stage.label} className="flex-1 items-center">
                                                <View
                                                    className="w-8 h-8 rounded-full items-center justify-center border border-white"
                                                    style={{ backgroundColor: circleColor }}
                                                >
                                                    <Text className="text-white text-[10px] font-lato-bold">{stage.value}</Text>
                                                </View>
                                                <Text className="mt-2 text-[10px] font-lato text-[#718096] text-center leading-3" numberOfLines={2}>
                                                    {stage.label}
                                                </Text>
                                            </View>
                                        );
                                    })}
                                </View>
                            </View>
                        </View>

                        <View className="flex-row items-center justify-between mb-3">
                            <Text className="text-[16px] font-lato-bold text-[#1F2937]">Upcoming Follow-ups</Text>
                            <TouchableOpacity>
                                <Text className="text-[12px] font-lato-bold text-[#4A43EC]">See All</Text>
                            </TouchableOpacity>
                        </View>

                        <View className="mb-4">
                            {visitsData.followUps.map((item) => (
                                <View
                                    key={`${item.name}-${item.time}`}
                                    className="bg-white rounded-[16px] border border-gray-100 px-3 py-3 mb-2.5"
                                >
                                    <View className="flex-row items-start">
                                        <View className="w-9 h-9 rounded-full bg-[#E8ECFF] items-center justify-center mr-3 mt-0.5">
                                            <Text className="text-[11px] font-lato-bold text-[#4A43EC]">{item.initials}</Text>
                                        </View>

                                        <View className="flex-1 pr-3">
                                            <View className="flex-row items-start justify-between">
                                                <View className="flex-1 pr-2">
                                                    <Text className="text-[14px] font-lato-bold text-[#1F2937] leading-4">{item.name}</Text>
                                                    <Text className="mt-0.5 text-[11px] font-lato text-[#8E9AAF]" numberOfLines={1}>
                                                        {item.project}
                                                    </Text>
                                                </View>
                                                <View className={`px-2.5 py-1 rounded-full ${getVisitChipStyle(item.tone)}`}>
                                                    <Text className="text-[9px] font-lato-bold">{item.tone === "indigo" ? "Hot" : "Warm"}</Text>
                                                </View>
                                            </View>

                                            <View className="flex-row items-center mt-2">
                                                <View className={`px-2.5 py-1 rounded-md ${getVisitChipStyle(item.tone)}`}>
                                                    <Text className="text-[9px] font-lato-bold">{item.type}</Text>
                                                </View>
                                                <Text className="ml-2.5 text-[11px] font-lato text-[#8E9AAF]">{item.time}</Text>
                                            </View>

                                            <Text className="mt-2 text-[10px] font-lato text-[#8E9AAF]">{item.salesperson}</Text>

                                            <View className="flex-row items-center justify-end mt-2.5">
                                                <TouchableOpacity className="px-4 py-2 rounded-full bg-[#6F5DF5]">
                                                    <Text className="text-[11px] font-lato-bold text-white">{item.action}</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>
                ) : activeTab === "Deals" ? (
                    <View className="px-5 pt-5 pb-4">
                        {dealsData.map((deal) => (
                            <TouchableOpacity
                                key={deal.title}
                                activeOpacity={0.9}
                                onPress={() => {
                                    setSelectedDeal(deal);
                                    setIsProjectDetailVisible(true);
                                }}
                                className="bg-white rounded-[16px] border border-[#E3E7F0] mb-3.5 overflow-hidden"
                                style={{
                                    shadowColor: "#0F172A",
                                    shadowOffset: { width: 0, height: 1 },
                                    shadowOpacity: 0.04,
                                    shadowRadius: 8,
                                    elevation: 1,
                                }}
                            >
                                <View className="px-4 pt-3.5 pb-3.5">
                                    <View className="flex-row items-start justify-between mb-2.5">
                                        <View className="flex-1 pr-3">
                                            <Text className="text-[16px] font-lato-bold text-[#1F2937] leading-5" numberOfLines={1}>
                                                {deal.title}
                                            </Text>
                                            <View className="flex-row items-center mt-1.5">
                                                <View className="h-2 w-2 rounded-full bg-[#6F5DF5] mr-2" />
                                                <Text className="text-[12px] font-lato text-[#7E889A]" numberOfLines={1}>
                                                    {deal.bookedBy} • {deal.mobile}
                                                </Text>
                                            </View>
                                        </View>
                                        <View className="items-end">
                                            <View className={`px-3 py-1 rounded-full ${getDealStatusStyle("muted")}`}>
                                                <Text className="text-[10px] font-lato-bold text-[#7B73F8]">{deal.dealStatus}</Text>
                                            </View>
                                            <Text className="mt-1 text-[11px] font-lato text-[#8E98AA]">{deal.bookingDate}</Text>
                                        </View>
                                    </View>

                                    <View className="mb-3">
                                        <View className="flex-row items-center justify-between mb-1.5">
                                            <Text className="text-[12px] font-lato-bold text-[#4B5563]">Payment Progress</Text>
                                            <Text className="text-[12px] font-lato-bold text-[#6F5DF5]">{deal.progress}%</Text>
                                        </View>
                                        <View className="h-[8px] rounded-full bg-[#ECEFF6] overflow-hidden">
                                            <View className="h-full bg-[#3029E8] rounded-full" style={{ width: `${deal.progress}%` }} />
                                        </View>
                                    </View>

                                    <View className="flex-row gap-2 mb-3">
                                        <View className="flex-1 rounded-xl bg-[#F7F8FC] px-3 py-2">
                                            <Text className="text-[9px] font-lato-bold text-[#96A0B2] tracking-[1px]">DEAL VALUE</Text>
                                            <Text className="mt-0.5 text-[13px] font-lato-bold text-[#1F2937]" numberOfLines={1}>{deal.dealValue}</Text>
                                        </View>
                                        <View className="flex-1 rounded-xl bg-[#F7F8FC] px-3 py-2">
                                            <Text className="text-[9px] font-lato-bold text-[#96A0B2] tracking-[1px]">NEXT DUE</Text>
                                            <Text className="mt-0.5 text-[13px] font-lato-bold text-[#1F2937]" numberOfLines={1}>{deal.nextDue}</Text>
                                        </View>
                                    </View>

                                    <View className="flex-row items-center justify-between">
                                        <View className="flex-1 flex-row items-center gap-2">
                                            {deal.steps.map((step, stepIndex) => (
                                                <View key={step.label} className="flex-row items-center">
                                                    <View
                                                        className={`px-2.5 py-1 rounded-full ${step.state === "done" ? "bg-[#E5ECFF]" : step.state === "current" ? "bg-[#F3EFFF]" : "bg-[#F3F4F6]"}`}
                                                    >
                                                        <Text
                                                            className={`text-[9px] font-lato-bold tracking-[1px] ${step.state === "done" ? "text-[#3559E4]" : step.state === "current" ? "text-[#6F5DF5]" : "text-[#8B93A7]"}`}
                                                        >
                                                            {step.label}
                                                        </Text>
                                                    </View>
                                                    {stepIndex < deal.steps.length - 1 ? <View className="w-1.5" /> : null}
                                                </View>
                                            ))}
                                        </View>
                                        <View className={`px-3 py-1.5 rounded-full ${getDealStatusStyle("success")}`}>
                                            <Text className="text-[11px] font-lato-bold text-[#009B79]">{deal.footerStatus}</Text>
                                        </View>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                ) : (
                    <View className="p-10 items-center">
                        <Text className="text-gray-400 font-lato">Coming Soon...</Text>
                    </View>
                )}
            </ScrollView>

            <ProjectDetailModal
                visible={isProjectDetailVisible}
                onClose={() => {
                    setIsProjectDetailVisible(false);
                    setSelectedDeal(null);
                }}
                project={selectedProject}
                variant={selectedDeal}
            />
        </View>
    );
}