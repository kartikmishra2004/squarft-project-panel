import { Text, View, ScrollView, Image, TouchableOpacity, Modal, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialIcons, Feather } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { mockData } from "../../constants/mockData";
import ProjectDetailModal from "../../components/ProjectDetailModal";

const projectImg = require("../../assets/images/project_main.png");
const profileImg = require("../../assets/images/user_profile.png");

export default function Home() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("Overview");

    const [projectsData, setProjectsData] = useState(mockData.projects);
    const [selectedProjectId, setSelectedProjectId] = useState(mockData.projects[0]?.id ?? "");
    const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
    const [isProjectDetailVisible, setIsProjectDetailVisible] = useState(false);
    const [selectedDeal, setSelectedDeal] = useState(null);
    const [isInventoryEditVisible, setIsInventoryEditVisible] = useState(false);
    const [inventoryEditTarget, setInventoryEditTarget] = useState(null);
    const [editPrice, setEditPrice] = useState("");
    const [editArea, setEditArea] = useState("");
    const [editStatus, setEditStatus] = useState("Available");
    const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
    const [inventoryType, setInventoryType] = useState("apartment");
    const [selectedTower, setSelectedTower] = useState("tower-a");
    const [selectedPlotStack, setSelectedPlotStack] = useState("stack-a");
    const [selectedPlotUnit, setSelectedPlotUnit] = useState("A-1202");
    const tabs = ["Overview", "Inventory", "Visits", "Deals"];
    const inventoryTabs = [
        { key: "apartment", label: "Apartment" },
        { key: "villa", label: "Villa" },
        { key: "rowhouse", label: "Rowhouse" },
        { key: "plot", label: "Plot" },
        { key: "shop", label: "Shop" },
        { key: "showroom", label: "Showroom" }
    ];
    const statusOptions = ["Available", "Booked", "Sold"];
    const insets = useSafeAreaInsets();

    const getBadgeStyle = (status) => {
        switch (status) {
            case "Available":
                return "bg-emerald-100 text-emerald-600";
            case "Booked":
                return "bg-amber-100 text-amber-600";
            case "Sold":
                return "bg-rose-100 text-rose-500";
            default:
                return "bg-gray-100 text-gray-500";
        }
    };

    const selectedProject = projectsData.find((project) => project.id === selectedProjectId) || projectsData[0] || { inventory: {} };

    const getInventoryDealTemplate = (inventoryTypeValue, unit) => {
        const deals = selectedProject.deals || [];
        const propertyLabel = (unit?.title || unit?.meta || inventoryTypeValue || "").toLowerCase();

        const exactMatch = deals.find((deal) => (deal.propertyType || "").toLowerCase().includes(propertyLabel) || propertyLabel.includes((deal.propertyType || "").toLowerCase()));
        if (exactMatch) return exactMatch;

        const typeMatchMap = {
            apartment: deals.find((deal) => (deal.propertyType || "").toLowerCase().includes("apartment")),
            villa: deals.find((deal) => (deal.propertyType || "").toLowerCase().includes("villa")),
            rowhouse: deals.find((deal) => (deal.propertyType || "").toLowerCase().includes("rowhouse")),
            plot: deals.find((deal) => (deal.propertyType || "").toLowerCase().includes("plot")),
            shop: deals.find((deal) => (deal.propertyType || "").toLowerCase().includes("shop") || (deal.propertyType || "").toLowerCase().includes("retail")),
        };

        return typeMatchMap[inventoryTypeValue] || deals[0] || null;
    };

    const updateInventoryUnit = (target, updater) => {
        setProjectsData((currentProjects) => currentProjects.map((project) => {
            if (project.id !== selectedProjectId) return project;

            const inventory = project.inventory || {};

            if (target.inventoryType === "apartment") {
                return {
                    ...project,
                    inventory: {
                        ...inventory,
                        apartment: {
                            ...inventory.apartment,
                            towers: inventory.apartment?.towers?.map((tower) => {
                                if (tower.key !== target.towerKey) return tower;

                                return {
                                    ...tower,
                                    sections: tower.sections.map((section, sectionIndex) => {
                                        if (sectionIndex !== target.sectionIndex) return section;

                                        return {
                                            ...section,
                                            units: section.units.map((unit, unitIndex) => {
                                                if (unitIndex !== target.unitIndex) return unit;
                                                return updater(unit);
                                            }),
                                        };
                                    }),
                                };
                            }),
                        },
                    },
                };
            }

            if (target.inventoryType === "villa" || target.inventoryType === "rowhouse" || target.inventoryType === "shop" || target.inventoryType === "showroom") {
                return {
                    ...project,
                    inventory: {
                        ...inventory,
                        [target.inventoryType]: {
                            ...inventory[target.inventoryType],
                            sections: inventory[target.inventoryType]?.sections?.map((section, sectionIndex) => {
                                if (sectionIndex !== target.sectionIndex) return section;

                                return {
                                    ...section,
                                    units: section.units.map((unit, unitIndex) => {
                                        if (unitIndex !== target.unitIndex) return unit;
                                        return updater(unit);
                                    }),
                                };
                            }),
                        },
                    },
                };
            }

            if (target.inventoryType === "plot") {
                return {
                    ...project,
                    inventory: {
                        ...inventory,
                        plot: {
                            ...inventory.plot,
                            stacks: inventory.plot?.stacks?.map((stack) => {
                                if (stack.key !== target.stackKey) return stack;

                                return {
                                    ...stack,
                                    levels: stack.levels.map((level, levelIndex) => {
                                        if (levelIndex !== target.levelIndex) return level;

                                        return {
                                            ...level,
                                            cards: level.cards.map((card, cardIndex) => {
                                                if (cardIndex !== target.cardIndex) return card;
                                                return updater(card);
                                            }),
                                        };
                                    }),
                                };
                            }),
                        },
                    },
                };
            }

            return project;
        }));
    };

    const openInventoryEdit = (unit, target) => {
        setInventoryEditTarget(target);
        setEditPrice(unit.price || unit.dealValue || unit.amount || "");
        setEditArea(unit.area || "");
        setEditStatus(unit.status || "Available");
        setIsStatusDropdownOpen(false);
        setIsInventoryEditVisible(true);
    };

    const saveInventoryEdit = () => {
        if (!inventoryEditTarget) return;

        updateInventoryUnit(inventoryEditTarget, (unit) => ({
            ...unit,
            price: editPrice.trim(),
            area: editArea.trim(),
            status: editStatus,
            dimmed: editStatus === "Sold" ? true : false,
        }));
        setIsInventoryEditVisible(false);
        setInventoryEditTarget(null);
        setIsStatusDropdownOpen(false);
    };

    const getPlotStatusStyle = (status) => {
        switch (status) {
            case "Booked":
                return "bg-emerald-100 text-emerald-700";
            case "Sold":
                return "bg-slate-100 text-slate-500";
            default:
                return "bg-gray-100 text-gray-500";
        }
    };

    const getPropertyDetailText = (inventoryTypeValue, item) => {
        if (inventoryTypeValue === "plot" || inventoryTypeValue === "shop" || inventoryTypeValue === "showroom") {
            return item.area || item.label || "-";
        }

        const sourceText = item.title || item.label || "";
        const bhkMatch = sourceText.match(/\b\d+\s*BHK\b/i);
        if (bhkMatch) {
            return bhkMatch[0].replace(/\s+/g, " ").toUpperCase();
        }

        return sourceText || "-";
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

    const getRangeLabel = (index, section) => section?.name || section?.label || `Range ${String.fromCharCode(65 + index)}`;

    const getSectionLabel = (index, inventoryTypeValue) => {
        if (inventoryTypeValue === "apartment") return `Floor ${index + 1}`;
        if (inventoryTypeValue === "shop" || inventoryTypeValue === "showroom") return `Section ${index + 1}`;
        return `Range ${String.fromCharCode(65 + index)}`;
    };

    const renderCardGrid = (items, gridKey) => (
        <View className="flex-row flex-wrap justify-between">
            {items.map((item, index) => {
                const statusStyle = getBadgeStyle(item.status);

                return (
                    <TouchableOpacity
                        key={item.key || `${gridKey}-${index}`}
                        onPress={() => openInventoryDetail(item.raw, item.context)}
                        activeOpacity={0.9}
                        className="bg-white rounded-2xl border border-gray-200 shadow-sm mb-2.5 overflow-hidden"
                        style={{
                            width: "47%",
                            minHeight: 132,
                            opacity: item.isDimmed ? 0.72 : 1,
                            borderColor: "#E5E7EB",
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 6 },
                            shadowOpacity: 0.05,
                            shadowRadius: 10,
                            elevation: 2,
                        }}
                    >
                        <View className="p-2 flex-1 justify-between">
                            <View className="flex-row items-start justify-between mb-0">
                                <View className="flex-1 pr-2">
                                    <Text className="text-[#9AA3B2] text-[9px] font-lato-bold" numberOfLines={1}>
                                        {item.unitNumber}
                                    </Text>
                                    <Text className="mt-0.5 text-[10px] font-lato text-[#7C8698]" numberOfLines={1}>
                                        {item.detail}
                                    </Text>
                                </View>
                                <View className={`px-1.5 py-0.5 rounded-full ${statusStyle}`}>
                                    <Text className="text-[7px] font-lato-bold uppercase">{item.status}</Text>
                                </View>
                            </View>

                            <View className="mb-0.5">
                                <Text className="text-[13px] font-lato-bold text-[#1A1A1A]" numberOfLines={1}>
                                    {item.raw.title || item.raw.meta || item.detail}
                                </Text>
                                <Text className="mt-0.5 text-[10px] font-lato-bold text-[#4A43EC]" numberOfLines={1}>
                                    {item.price}
                                </Text>
                            </View>

                            <View className="flex-row items-center justify-end">
                                <TouchableOpacity
                                    activeOpacity={0.9}
                                    onPress={() => openInventoryEdit(item.raw, item.target)}
                                    className="w-10 h-10 rounded-xl bg-gray-100 items-center justify-center"
                                >
                                    <Feather name="edit-3" size={16} color="#94A3B8" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableOpacity>
                );
            })}
        </View>
    );

    const renderInventoryBoxes = () => {
        const inventoryLabel = inventoryTabs.find((tab) => tab.key === inventoryType)?.label || "Inventory";

        if (inventoryType === "apartment") {
            if (!selectedInventory.towers?.length) return null;

            return (
                <View>
                    <View className="mb-5 rounded-2xl bg-[#E8EDF6] p-1 flex-row">
                        {selectedInventory.towers.map((tower) => {
                            const isActiveTower = selectedTowerData?.key === tower.key;

                            return (
                                <TouchableOpacity
                                    key={tower.key}
                                    onPress={() => setSelectedTower(tower.key)}
                                    className={`flex-1 items-center rounded-[14px] py-2 ${isActiveTower ? "bg-white" : "bg-transparent"}`}
                                    style={{
                                        shadowColor: isActiveTower ? "#000" : "transparent",
                                        shadowOpacity: isActiveTower ? 0.06 : 0,
                                        shadowOffset: { width: 0, height: 1 },
                                        shadowRadius: 4,
                                        elevation: isActiveTower ? 2 : 0,
                                    }}
                                >
                                    <Text className={`text-[12px] font-lato-bold ${isActiveTower ? "text-[#4A43EC]" : "text-[#718096]"}`}>
                                        {tower.label}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    <View>
                        {(selectedTowerData?.sections || []).map((section, sectionIndex) => {
                            const sectionLabel = section.rowLabel || `Floor ${sectionIndex + 1}`;
                            const sectionUnits = (section.units || []).map((unit, unitIndex) => ({
                                key: unit.id || `${selectedTowerData?.key}-${sectionLabel}-${unitIndex}`,
                                raw: unit,
                                context: { towerLabel: selectedTowerData?.label, sectionLabel, inventoryLabel, inventoryType },
                                unitNumber: unit.id,
                                detail: getPropertyDetailText(inventoryType, unit),
                                price: unit.price || selectedProject.avgPrice,
                                status: unit.status || "Available",
                                isDimmed: unit.dimmed,
                                target: {
                                    inventoryType: "apartment",
                                    towerKey: selectedTowerData?.key,
                                    sectionIndex,
                                    unitIndex,
                                },
                            }));

                            if (!sectionUnits.length) return null;

                            return (
                                <View key={`${selectedTowerData?.key}-${sectionLabel}`} className="mb-4">
                                    <View className="mb-2 flex-row items-center justify-between">
                                        <Text className="text-[12px] font-lato-bold text-[#4A43EC]">{sectionLabel}</Text>
                                        <Text className="text-[10px] font-lato text-gray-400">{selectedTowerData?.label}</Text>
                                    </View>
                                    {renderCardGrid(sectionUnits, `${selectedTowerData?.key}-${sectionLabel}`)}
                                </View>
                            );
                        })}
                    </View>
                </View>
            );
        }

        if (inventoryType === "plot") {
            const rangeGroups = (selectedInventory.stacks || []).map((stack, stackIndex) => ({
                key: stack.key || `stack-${stackIndex}`,
                label: getRangeLabel(stackIndex, stack),
                rows: (stack.levels || []).map((level, levelIndex) => ({
                    key: `${stack.key || stackIndex}-${level.level}`,
                    label: `Level ${level.level}`,
                    cards: (level.cards || []).map((card, cardIndex) => ({
                        key: card.unit || `${stack.key}-${level.level}-${cardIndex}`,
                        raw: card,
                        context: { stackLabel: getRangeLabel(stackIndex, stack), sectionLabel: `Level ${level.level}`, inventoryLabel, inventoryType },
                        unitNumber: card.unit,
                        detail: getPropertyDetailText(inventoryType, card),
                        price: card.price || selectedProject.avgPrice,
                        status: card.status || "Available",
                        isDimmed: card.active === false && card.status === "Sold",
                        target: {
                            inventoryType: "plot",
                            stackKey: stack.key,
                            levelIndex,
                            cardIndex,
                        },
                    })),
                })),
            }));

            if (!rangeGroups.length) return null;

            return (
                <View>
                    {rangeGroups.map((rangeGroup) => (
                        <View key={rangeGroup.key} className="mb-4">
                            <View className="mb-2 flex-row items-center justify-between">
                                <Text className="text-[12px] font-lato-bold text-[#4A43EC]">{rangeGroup.label}</Text>
                                <Text className="text-[10px] font-lato text-gray-400">Range Wise</Text>
                            </View>
                            {rangeGroup.rows.map((row) => (
                                <View key={row.key} className="mb-3">
                                    <Text className="mb-2 text-[11px] font-lato-bold text-gray-500">{row.label}</Text>
                                    {renderCardGrid(row.cards, row.key)}
                                </View>
                            ))}
                        </View>
                    ))}
                </View>
            );
        }

        const sectionGroups = (selectedInventory.sections || []).map((section, sectionIndex) => {
            const sectionLabel = getSectionLabel(sectionIndex, inventoryType);
            return {
                key: section.id || `${inventoryType}-${sectionIndex}`,
                label: sectionLabel,
                units: (section.units || []).map((unit, unitIndex) => ({
                    key: unit.id || `${sectionLabel}-${unitIndex}`,
                    raw: unit,
                    context: { towerLabel: selectedTowerData?.label, sectionLabel, inventoryLabel, inventoryType },
                    unitNumber: unit.id,
                    detail: getPropertyDetailText(inventoryType, unit),
                    price: unit.price || selectedProject.avgPrice,
                    status: unit.status || "Available",
                    isDimmed: unit.dimmed,
                    target: {
                        inventoryType,
                        sectionIndex,
                        unitIndex,
                    },
                })),
            };
        });

        if (!sectionGroups.length) return null;

        return (
            <View>
                {sectionGroups.map((sectionGroup) => (
                    <View key={sectionGroup.key} className="mb-4">
                        <View className="mb-2 flex-row items-center justify-between">
                            <Text className="text-[12px] font-lato-bold text-[#4A43EC]">{sectionGroup.label}</Text>
                            <Text className="text-[10px] font-lato text-gray-400">
                                {inventoryType === "shop" || inventoryType === "showroom" ? "Section Wise" : "Range Wise"}
                            </Text>
                        </View>
                        {renderCardGrid(sectionGroup.units, sectionGroup.key)}
                    </View>
                ))}
            </View>
        );
    };

    const openInventoryDetail = (unit, context = {}) => {
        const sectionLabel = context.sectionLabel || context.towerLabel || context.stackLabel || selectedProject.title;
        const unitLabel = unit.id || unit.unit || unit.title || "Property";
        const isBookedOrSoldUnit = unit.status === "Booked" || unit.status === "Sold";
        const dealTemplate = isBookedOrSoldUnit ? getInventoryDealTemplate(context.inventoryType, unit) : null;

        setSelectedDeal({
            ...(dealTemplate || {}),
            ...unit,
            title: `${sectionLabel} • ${unitLabel}`,
            propertyType: unit.title || unit.meta || context.inventoryLabel || "Property",
            topStatus: unit.status,
            dealStatus: unit.status,
            footerStatus: unit.ctaLabel === "DETAILS" ? "View Details" : unit.status,
            footerTotal: unit.price || unit.area || selectedProject.avgPrice,
            avgPricePerSqft: unit.avgPricePerSqft || selectedProject.avgPrice,
            possession: unit.possession || selectedProject.possession,
            amenities: unit.amenities || selectedProject.amenities,
            progress: unit.progress ?? 0,
            followUps: selectedProject.visits?.followUps || [],
            showDealSummary: isBookedOrSoldUnit,
            showFollowUps: unit.status === "Available",
        });
        setIsProjectDetailVisible(true);
    };

    const projectOptions = projectsData;
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

    useEffect(() => {
        if (!isInventoryEditVisible) return;

        if (!inventoryEditTarget) return;

        const latestProject = projectsData.find((project) => project.id === selectedProjectId) || projectsData[0];
        if (!latestProject) return;

        const latestInventory = latestProject.inventory?.[inventoryEditTarget.inventoryType];
        if (!latestInventory) return;

        let targetUnit = null;

        if (inventoryEditTarget.inventoryType === "apartment") {
            targetUnit = latestInventory.towers?.find((tower) => tower.key === inventoryEditTarget.towerKey)
                ?.sections?.[inventoryEditTarget.sectionIndex]?.units?.[inventoryEditTarget.unitIndex] || null;
        } else if (inventoryEditTarget.inventoryType === "villa" || inventoryEditTarget.inventoryType === "rowhouse" || inventoryEditTarget.inventoryType === "shop") {
            targetUnit = latestInventory.sections?.[inventoryEditTarget.sectionIndex]?.units?.[inventoryEditTarget.unitIndex] || null;
        } else if (inventoryEditTarget.inventoryType === "plot") {
            targetUnit = latestInventory.stacks?.find((stack) => stack.key === inventoryEditTarget.stackKey)
                ?.levels?.[inventoryEditTarget.levelIndex]?.cards?.[inventoryEditTarget.cardIndex] || null;
        }

        if (targetUnit) {
            setEditPrice(targetUnit.price || targetUnit.dealValue || targetUnit.amount || "");
            setEditArea(targetUnit.area || "");
        }
    }, [isInventoryEditVisible, inventoryEditTarget, projectsData, selectedProjectId]);

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
                            <TouchableOpacity
                                className="h-9 px-3 rounded-xl flex-row items-center border border-white/50"
                                onPress={() => router.push("/add-project")}
                            >
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

                        {renderInventoryBoxes()}
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
                showDealSummary={selectedDeal?.showDealSummary ?? true}
                showFollowUps={selectedDeal?.showFollowUps ?? false}
            />

            <Modal
                visible={isInventoryEditVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setIsInventoryEditVisible(false)}
            >
                <KeyboardAvoidingView
                    className="flex-1"
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                >
                    <View className="flex-1 bg-black/45 justify-end">
                        <TouchableOpacity
                            activeOpacity={1}
                            className="flex-1"
                            onPress={() => setIsInventoryEditVisible(false)}
                        />

                        <View className="bg-white rounded-t-[28px] px-5 pt-4 pb-6">
                            <View className="items-center mb-4">
                                <View className="w-14 h-1.5 rounded-full bg-gray-300" />
                            </View>

                            <Text className="text-[18px] font-lato-bold text-[#1A1A1A]">Edit Property</Text>
                            <Text className="mt-1 text-[12px] font-lato text-[#6B7280]">You can update price and status here.</Text>

                            <View className="mt-5">
                                <Text className="text-[11px] font-lato-bold text-[#6B7280] uppercase mb-2">Price</Text>
                                <TextInput
                                    value={editPrice}
                                    onChangeText={setEditPrice}
                                    placeholder="Enter price"
                                    placeholderTextColor="#94A3B8"
                                    className="h-12 rounded-2xl border border-gray-200 px-4 text-[14px] font-lato text-[#111827] bg-white"
                                />
                            </View>

                            <View className="mt-4">
                                <Text className="text-[11px] font-lato-bold text-[#6B7280] uppercase mb-2">Area</Text>
                                <View className="h-12 rounded-2xl border border-gray-200 px-4 justify-center bg-gray-50">
                                    <Text className="text-[14px] font-lato text-[#6B7280]">{editArea || "-"}</Text>
                                </View>
                            </View>

                            <View className="mt-4">
                                <Text className="text-[11px] font-lato-bold text-[#6B7280] uppercase mb-2">Status</Text>
                                <View className="relative z-20">
                                    <TouchableOpacity
                                        activeOpacity={0.9}
                                        onPress={() => setIsStatusDropdownOpen((current) => !current)}
                                        className="h-12 rounded-2xl border border-gray-200 px-4 flex-row items-center justify-between bg-white"
                                    >
                                        <Text className="text-[14px] font-lato text-[#111827]">{editStatus}</Text>
                                        <Ionicons name={isStatusDropdownOpen ? "chevron-up" : "chevron-down"} size={16} color="#94A3B8" />
                                    </TouchableOpacity>
                                    {isStatusDropdownOpen ? (
                                        <View className="absolute left-0 right-0 bottom-[52px] z-30 rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
                                            {statusOptions.map((statusOption) => {
                                                const isSelectedStatus = editStatus === statusOption;

                                                return (
                                                    <TouchableOpacity
                                                        key={statusOption}
                                                        activeOpacity={0.85}
                                                        onPress={() => {
                                                            setEditStatus(statusOption);
                                                            setIsStatusDropdownOpen(false);
                                                        }}
                                                        className={`px-4 py-3 ${isSelectedStatus ? "bg-[#F4F3FF]" : "bg-white"}`}
                                                    >
                                                        <Text className={`text-[13px] font-lato-bold ${isSelectedStatus ? "text-[#4A43EC]" : "text-[#1F2937]"}`}>
                                                            {statusOption}
                                                        </Text>
                                                    </TouchableOpacity>
                                                );
                                            })}
                                        </View>
                                    ) : null}
                                </View>
                            </View>

                            <View className="flex-row gap-3 mt-6">
                                <TouchableOpacity
                                    onPress={() => setIsInventoryEditVisible(false)}
                                    className="flex-1 h-12 rounded-2xl border border-gray-200 items-center justify-center bg-white"
                                >
                                    <Text className="text-[13px] font-lato-bold text-[#64748B]">Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={saveInventoryEdit}
                                    className="flex-1 h-12 rounded-2xl items-center justify-center bg-[#4A43EC]"
                                >
                                    <Text className="text-[13px] font-lato-bold text-white">Save</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
}