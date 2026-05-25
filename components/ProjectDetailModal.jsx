import { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, Image, TouchableOpacity, Dimensions } from "react-native";
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

const projectFallbackImage = require("../assets/images/project_main.png");

const { width } = Dimensions.get("window");

const AMENITY_ICONS = {
    "Gymnasium": { icon: "dumbbell", color: "#4A43EC" },
    "Swimming Pool": { icon: "pool", color: "#4A43EC" },
    "24/7 Security": { icon: "shield-check-outline", color: "#4A43EC" },
    "Power Backup": { icon: "lightning-bolt", color: "#4A43EC" },
    Landscaping: { icon: "tree-outline", color: "#4A43EC" },
    "Car Parking": { icon: "car-outline", color: "#4A43EC" },
    "Sports Court": { icon: "tennis", color: "#4A43EC" },
    "Wi-Fi Zone": { icon: "wifi", color: "#4A43EC" },
    Clubhouse: { icon: "home-group", color: "#4A43EC" },
    Garden: { icon: "flower-outline", color: "#4A43EC" },
};

function AmenityItem({ label }) {
    const config = AMENITY_ICONS[label] ?? { icon: "star-outline", color: "#003D9B" };

    return (
        <View className="flex-row items-center gap-3 w-[50%] mb-4">
            <View className="w-10 h-10 rounded-[14px] bg-[#F1F3FF] items-center justify-center">
                <MaterialCommunityIcons name={config.icon} size={18} color={config.color} />
            </View>
            <Text className="text-[13px] font-lato text-[#101010] flex-1">{label}</Text>
        </View>
    );
}

export default function ProjectDetailModal({ visible, onClose, project, variant, showDealSummary = false, showFollowUps = false }) {
    const sheetRef = useRef(null);
    const [sheetView, setSheetView] = useState("property");
    const snapPoints = useMemo(() => ["88%"], []);

    useEffect(() => {
        if (visible) {
            setSheetView("property");
            sheetRef.current?.present();
            return;
        }

        sheetRef.current?.dismiss();
    }, [visible]);

    if (!project || !variant) return null;

    const goToSchedule = () => setSheetView("schedule");
    const goToProperty = () => setSheetView("property");

    const title = variant.type || variant.propertyType || variant.title || "Property";
    const priceLabel = variant.priceRange || variant.footerTotal || project.avgPrice || "Contact for price";
    const possession = variant.possession || project.possession || "—";
    const avgPrice = variant.avgPricePerSqft || project.avgPrice || "—";
    const area = variant.area || project.area || "—";
    const bookedBy = variant.bookedBy || variant.contactName || variant.contactLine?.split("•")?.[0]?.trim() || "—";
    const mobile = variant.mobile || variant.contactLine?.split("•")?.[1]?.trim() || "—";
    const bookingDate = variant.bookingDate || variant.date || "—";
    const tokenAmount = variant.tokenAmount || variant.amount || "—";
    const dealValue = variant.dealValue || variant.footerTotal || priceLabel;
    const received = variant.received || variant.receivedAmount || "—";
    const pending = variant.pending || variant.pendingAmount || "—";
    const nextDue = variant.nextDue || variant.footerDue || "—";
    const dealStatus = variant.dealStatus || variant.topStatus || variant.footerStatus || "Agreement Pending";
    const totalImages = variant.totalImages || project.totalImages || 1;
    const heroImage = project.imageMain || projectFallbackImage;
    const heroThumb = variant.image || project.imageThumb || heroImage;
    const amenitiesList = variant.amenities?.length
        ? variant.amenities
        : project.amenities?.length
            ? project.amenities
            : ["Gymnasium", "Swimming Pool", "24/7 Security", "Power Backup"];

    const stats = [
        { label: "AREA", value: area },
        { label: "POSSESSION", value: possession },
        { label: "STATUS", value: variant.topStatus || variant.footerStatus || "Active" },
        { label: "PROGRESS", value: `${variant.progress ?? 0}%` },
    ];

    const dealSummaryRows = [
        { label: "Booked By", value: bookedBy, valueColor: "#111827" },
        { label: "Mobile", value: mobile, valueColor: "#111827" },
        { label: "Booking Date", value: bookingDate, valueColor: "#111827" },
        { label: "Token Amount", value: tokenAmount, valueColor: "#10B981" },
        { label: "Deal Value", value: dealValue, valueColor: "#111827" },
        { label: "Received", value: received, valueColor: "#10B981" },
        { label: "Pending", value: pending, valueColor: "#F97316" },
        { label: "Next Due", value: nextDue, valueColor: "#F59E0B" },
    ];

    const paymentSummary = [
        { label: "Total Value", value: dealValue, tone: "#5B5CE2", bg: "#EAEBFF" },
        { label: "Received", value: received, tone: "#059669", bg: "#E6FBF3" },
        { label: "Pending", value: pending, tone: "#D97706", bg: "#FFF1E6" },
        { label: "Next Due", value: nextDue, tone: "#D97706", bg: "#FFF4DB" },
    ];

    const paymentMilestones = variant.paymentSchedule?.length
        ? variant.paymentSchedule
        : [
            {
                title: "Token",
                amount: tokenAmount,
                detail: `${bookingDate} • Received by SquarFT`,
                status: "Paid",
                tone: "success",
                actionLabel: "View Receipt",
            },
            {
                title: "Booking Amount",
                amount: variant.bookingAmount || "₹10,00,000",
                detail: variant.bookingAmountDate || "30 May 2026",
                status: "Paid",
                tone: "success",
                actionLabel: "View Receipt",
            },
            {
                title: "Agreement",
                amount: variant.agreementAmount || pending,
                detail: `Due: ${nextDue}`,
                status: "Upcoming",
                tone: "warning",
            },
            {
                title: "Registry",
                amount: variant.registryAmount || pending,
                detail: variant.registryDate || `Due: ${variant.registryDue || "—"}`,
                status: "Pending",
                tone: "danger",
            },
        ];

    const followUps = variant.followUps?.length
        ? variant.followUps
        : project.visits?.followUps?.length
            ? project.visits.followUps
            : [];

    const statusToneClasses = {
        success: {
            container: "border-[#93E6C8] bg-[#EAFBF5]",
            status: "text-[#0F9B68]",
            amount: "text-[#0F9B68]",
        },
        warning: {
            container: "border-[#F3D08A] bg-[#FFF7E9]",
            status: "text-[#D58A00]",
            amount: "text-[#D58A00]",
        },
        danger: {
            container: "border-[#F1C0B7] bg-[#FFF3F1]",
            status: "text-[#D45A3F]",
            amount: "text-[#D45A3F]",
        },
    };

    return (
        <BottomSheetModal
            ref={sheetRef}
            index={0}
            snapPoints={snapPoints}
            enablePanDownToClose
            onDismiss={onClose}
            backdropComponent={(props) => (
                <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.45} pressBehavior="close" />
            )}
            backgroundStyle={{ borderTopLeftRadius: 28, borderTopRightRadius: 28, backgroundColor: "#fff" }}
            handleIndicatorStyle={{ backgroundColor: "#CBD5E1" }}
        >
            <BottomSheetScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 18 }}>

                {sheetView === "property" ? (
                    <>
                        <View className="mx-5 rounded-3xl overflow-hidden border border-[#E8ECF4] bg-white">
                            <View style={{ height: 170, overflow: "hidden" }}>
                                <View style={{ flex: 1, flexDirection: "row" }}>
                                    <Image source={heroImage} style={{ flex: 1.35, height: 170 }} resizeMode="cover" />
                                    <View style={{ width: 2, backgroundColor: "#fff" }} />
                                    <View style={{ flex: 1, height: 170, position: "relative" }}>
                                        <Image source={heroThumb} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
                                        <View
                                            style={{
                                                position: "absolute",
                                                bottom: 8,
                                                right: 8,
                                                backgroundColor: "rgba(0,0,0,0.55)",
                                                borderRadius: 6,
                                                paddingHorizontal: 6,
                                                paddingVertical: 2,
                                            }}
                                        >
                                            <Text style={{ color: "#fff", fontSize: 10, fontWeight: "700" }}>1/{totalImages}</Text>
                                        </View>
                                    </View>
                                </View>

                                <View
                                    style={{
                                        position: "absolute",
                                        top: 12,
                                        left: 12,
                                        flexDirection: "row",
                                        alignItems: "center",
                                        backgroundColor: "#fff",
                                        borderRadius: 30,
                                        paddingHorizontal: 12,
                                        paddingVertical: 6,
                                        gap: 3,
                                        shadowColor: "#000",
                                        shadowOpacity: 0.1,
                                        shadowRadius: 4,
                                        elevation: 3,
                                    }}
                                >
                                    <MaterialCommunityIcons name="check-decagram" size={16} color="#0052CC" />
                                    <Text style={{ fontSize: 10, fontWeight: "700", color: "#0052CC", letterSpacing: 0.2 }}>SQUARFT VERIFIED</Text>
                                </View>

                                <View
                                    style={{
                                        position: "absolute",
                                        top: 10,
                                        right: 10,
                                        backgroundColor: "rgba(0,0,0,0.55)",
                                        borderRadius: 20,
                                        padding: 6,
                                    }}
                                >
                                    <Ionicons name="chevron-down" size={20} color="#fff" />
                                </View>
                            </View>

                            <View className="px-5 pt-4 pb-3">
                                <View className="flex-row items-center gap-5 mb-3">
                                    <Text className="text-[12px] font-lato text-gray-500">Possession: {possession}</Text>
                                    <Text className="text-[12px] font-lato text-gray-500">• Avg Price per sq ft: {avgPrice}</Text>
                                </View>

                                <View style={{ borderBottomWidth: 1, borderBottomColor: "#D1D5DB", borderStyle: "dashed" }} />

                                <View className="mt-3">
                                    <View className="flex-row items-center justify-between mb-2">
                                        <View>
                                            <Text className="text-[12px] font-lato-bold text-gray-500">{title}</Text>
                                            <Text className="text-[16px] font-lato-bold text-[#0F172A]">{priceLabel}</Text>
                                        </View>
                                    </View>
                                </View>

                                <View className="flex-row flex-wrap justify-between mt-4">
                                    {stats.map((item) => (
                                        <View key={item.label} className="bg-[#F1F3FF] border border-[#E0E8FF] rounded-2xl p-4 py-4 mb-4" style={{ width: (width - 68) / 2 - 6 }}>
                                            <Text className="text-[10px] font-lato-bold text-gray-400 tracking-widest">{item.label}</Text>
                                            <Text className="text-[16px] font-lato-bold text-[#041B3C]">{item.value}</Text>
                                        </View>
                                    ))}
                                </View>

                                <View className="bg-white border border-gray-100 rounded-2xl p-4 px-5 mb-2">
                                    <Text className="text-[15px] font-lato text-[#1A1A1A] mb-4">World-Class Amenities</Text>
                                    <View className="flex-row flex-wrap">
                                        {amenitiesList.map((item, index) => (
                                            <AmenityItem key={`${item}-${index}`} label={item} />
                                        ))}
                                    </View>
                                </View>

                                {showDealSummary ? (
                                    <View className="border border-[#CFC5FF] rounded-[16px] bg-[#F8F6FF] p-3 mt-2">
                                        <View className="flex-row items-start justify-between mb-2.5">
                                            <Text className="text-[16px] font-lato-bold text-[#4C3FE0]">Deal Summary</Text>
                                            <Text className="text-[11px] font-lato text-[#6C63F0]">{dealStatus}</Text>
                                        </View>

                                        <View className="border-t border-[#D8D2F7]">
                                            {dealSummaryRows.map((row) => (
                                                <View key={row.label} className="flex-row items-start justify-between py-2 border-b border-[#D8D2F7] gap-3">
                                                    <Text className="text-[12px] font-lato text-[#4B5563] flex-1">{row.label}</Text>
                                                    <Text className="text-[12px] font-lato-bold flex-1 text-right" style={{ color: row.valueColor }}>
                                                        {row.value}
                                                    </Text>
                                                </View>
                                            ))}
                                        </View>

                                        <TouchableOpacity
                                            activeOpacity={0.9}
                                            className="mt-3 rounded-[12px] py-3 items-center justify-center"
                                            style={{ backgroundColor: "#6C5CE7" }}
                                            onPress={goToSchedule}
                                        >
                                            <Text className="text-white text-[13px] font-lato-bold">View Payment Schedule</Text>
                                        </TouchableOpacity>
                                    </View>
                                ) : null}

                                {showFollowUps ? (
                                    <View className="border border-[#CFC5FF] rounded-[16px] bg-[#F8F6FF] p-3 mt-2">
                                        <View className="flex-row items-start justify-between mb-2.5">
                                            <Text className="text-[16px] font-lato-bold text-[#4C3FE0]">Upcoming Follow-ups</Text>
                                            <Text className="text-[11px] font-lato text-[#6C63F0]">Visits</Text>
                                        </View>

                                        <View className="space-y-2">
                                            {followUps.map((item) => (
                                                <View key={`${item.name}-${item.time}`} className="bg-white rounded-[14px] border border-[#E6E0FF] px-3 py-2.5 mb-2">
                                                    <View className="flex-row items-start">
                                                        <View className="w-8 h-8 rounded-full bg-[#E8ECFF] items-center justify-center mr-3 mt-0.5">
                                                            <Text className="text-[10px] font-lato-bold text-[#4A43EC]">{item.initials}</Text>
                                                        </View>

                                                        <View className="flex-1 pr-2">
                                                            <View className="flex-row items-start justify-between gap-2">
                                                                <View className="flex-1 pr-1">
                                                                    <Text className="text-[12px] font-lato-bold text-[#1F2937] leading-4">{item.name}</Text>
                                                                    <Text className="mt-0.5 text-[10px] font-lato text-[#8E9AAF]" numberOfLines={1}>
                                                                        {item.project}
                                                                    </Text>
                                                                </View>
                                                                <View className={`px-2 py-0.5 rounded-full ${item.tone === "indigo" ? "bg-[#E8ECFF]" : "bg-[#FFF2E5]"}`}>
                                                                    <Text className={`text-[8px] font-lato-bold ${item.tone === "indigo" ? "text-[#4A43EC]" : "text-[#F97316]"}`}>
                                                                        {item.tone === "indigo" ? "Hot" : "Warm"}
                                                                    </Text>
                                                                </View>
                                                            </View>

                                                            <Text className="mt-1 text-[10px] font-lato-bold text-[#6B7280]" numberOfLines={1}>
                                                                {item.type} • {item.time}
                                                            </Text>
                                                            <Text className="mt-0.5 text-[10px] font-lato text-[#8E9AAF]" numberOfLines={1}>
                                                                {item.salesperson}
                                                            </Text>
                                                        </View>
                                                    </View>
                                                </View>
                                            ))}
                                        </View>
                                    </View>
                                ) : null}
                            </View>
                        </View>
                    </>
                ) : (
                    <>
                        <View className="px-3 pb-1.5">
                            <View className="flex-row items-center justify-between mb-2">
                                <TouchableOpacity
                                    onPress={goToProperty}
                                    className="w-7 h-7 rounded-full bg-[#F3F4F8] items-center justify-center"
                                    activeOpacity={0.85}
                                >
                                    <Ionicons name="arrow-back" size={12} color="#1F2937" />
                                </TouchableOpacity>
                                <View className="flex-1 ml-2">
                                    <Text className="text-[14px] font-lato-bold text-[#1F2937]">Payment Schedule</Text>
                                    <Text className="mt-0.5 text-[9px] font-lato text-[#8E98AA]" numberOfLines={1}>
                                        {title} · {bookedBy}
                                    </Text>
                                </View>
                                {/* Calendar icon removed per design */}
                            </View>

                            <View className="flex-row flex-wrap justify-between">
                                {paymentSummary.map((item) => (
                                    <View key={item.label} className="rounded-[10px] px-2 py-2 mb-2" style={{ width: (width - 62) / 2, backgroundColor: item.bg }}>
                                        <Text className="text-[8px] font-lato text-[#6B7280]">{item.label}</Text>
                                        <Text className="mt-0.5 text-[11px] font-lato-bold" style={{ color: item.tone }} numberOfLines={1}>
                                            {item.value}
                                        </Text>
                                    </View>
                                ))}
                            </View>

                            <Text className="mt-2 mb-1 text-[10px] font-lato-bold tracking-[1px] text-[#53637D]">MILESTONE SCHEDULE</Text>

                            <View>
                                {paymentMilestones.map((milestone, index) => {
                                    const tone = statusToneClasses[milestone.tone] || statusToneClasses.success;
                                    const isLast = index === paymentMilestones.length - 1;

                                    return (
                                        <View key={`${milestone.title}-${index}`} className={`rounded-[12px] border px-3 py-2 mb-2 ${tone.container}`}>
                                            <View className="flex-row items-center justify-between mb-1">
                                                <Text className="text-[11px] font-lato-bold text-[#1F2937]">{milestone.title}</Text>
                                                <Text className={`text-[9px] font-lato-bold ${tone.status}`}>{milestone.status}</Text>
                                            </View>

                                            <Text className={`text-[13px] font-lato-bold ${tone.amount}`}>{milestone.amount}</Text>
                                            <Text className="mt-0.5 text-[9px] font-lato text-[#52607A]">{milestone.detail}</Text>

                                            {milestone.actionLabel ? (
                                                <TouchableOpacity activeOpacity={0.85} className="mt-1.5 self-start">
                                                    <Text className="text-[9px] font-lato-bold text-[#4A43EC]">{milestone.actionLabel}</Text>
                                                </TouchableOpacity>
                                            ) : null}

                                            {!isLast ? <View className="mt-1.5 h-px bg-[#DDE6DD]" /> : null}
                                        </View>
                                    );
                                })}
                            </View>
                        </View>
                    </>
                )}

                <View className="px-5 pt-3 border-t border-gray-100 mt-1" style={{ paddingBottom: 8 }}>
                    {sheetView === "property" ? (
                        <TouchableOpacity
                            onPress={onClose}
                            className="rounded-2xl py-4 items-center flex-row justify-center gap-2"
                            style={{ backgroundColor: "#4A43EC" }}
                        >
                            <MaterialCommunityIcons name="check-circle-outline" size={18} color="#fff" />
                            <Text className="text-white text-[15px] font-lato-bold">Close</Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            onPress={goToProperty}
                            className="rounded-2xl py-3 items-center flex-row justify-center gap-2"
                            style={{ backgroundColor: "#4A43EC" }}
                        >
                            <Ionicons name="arrow-back" size={14} color="#fff" />
                            <Text className="text-white text-[12px] font-lato-bold">Back to Property Details</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </BottomSheetScrollView>
        </BottomSheetModal>
    );
}