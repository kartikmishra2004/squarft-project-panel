import { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, Image, TouchableOpacity, Dimensions, TextInput } from "react-native";
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

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

const MILESTONE_ORDER = ["Token", "Booking Amount", "Agreement", "Registry"];

const parseAmount = (value) => {
    if (typeof value === "number") return Number.isFinite(value) ? value : 0;
    const cleaned = String(value ?? "").replace(/[^\d.-]/g, "");
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : 0;
};

const formatAmount = (value) => `₹${Math.round(value || 0).toLocaleString("en-IN")}`;

const normalizeMilestone = (title, source, fallbackAmount, fallbackDetail) => {
    const totalAmount = parseAmount(source?.totalAmount ?? source?.amount ?? fallbackAmount);
    const collectedAmount = Math.min(
        totalAmount,
        parseAmount(source?.collectedAmount ?? source?.paidAmount ?? (source?.status === "Paid" ? source?.amount : 0))
    );

    return {
        title,
        totalAmount,
        collectedAmount,
        dueDetail: source?.dueDetail ?? source?.detail ?? fallbackDetail ?? "—",
        receiptDetail: source?.receiptDetail ?? source?.detail ?? "—",
    };
};

const buildPaymentPlan = (variant) => {
    const schedule = variant?.paymentSchedule || [];
    const scheduleMap = new Map(schedule.map((item) => [String(item?.title ?? "").toLowerCase(), item]));

    return MILESTONE_ORDER.map((title, index) => {
        const fallbackAmount = [variant?.tokenAmount, variant?.bookingAmount, variant?.agreementAmount, variant?.registryAmount][index];
        const fallbackDetail = [variant?.bookingDate, variant?.bookingAmountDate, variant?.nextDue, variant?.registryDate || variant?.registryDue][index];
        return normalizeMilestone(title, scheduleMap.get(title.toLowerCase()), fallbackAmount, fallbackDetail);
    });
};

const derivePaymentSummary = (paymentPlan, variant) => {
    const totalAmount = paymentPlan.reduce((sum, milestone) => sum + milestone.totalAmount, 0) || parseAmount(variant?.dealValue);
    const collectedAmount = paymentPlan.reduce((sum, milestone) => sum + milestone.collectedAmount, 0);
    const pendingAmount = Math.max(totalAmount - collectedAmount, 0);
    const nextDueMilestone = paymentPlan.find((milestone) => milestone.collectedAmount < milestone.totalAmount);
    const progress = totalAmount > 0 ? Math.min(100, Math.round((collectedAmount / totalAmount) * 100)) : 0;
    const allPaid = pendingAmount === 0 && totalAmount > 0;

    return {
        totalAmount,
        collectedAmount,
        pendingAmount,
        nextDueLabel: allPaid ? "Paid" : nextDueMilestone?.title || "Upcoming",
        progress,
        allPaid,
    };
};

export default function ProjectDetailModal({ visible, onClose, project, variant, onVariantUpdate, showDealSummary = false, showFollowUps = false }) {
    const sheetRef = useRef(null);
    const [sheetView, setSheetView] = useState("property");
    const [paymentPlan, setPaymentPlan] = useState(() => buildPaymentPlan(variant));
    const [activeMilestoneIndex, setActiveMilestoneIndex] = useState(null);
    const [collectAmount, setCollectAmount] = useState("");
    const [collectError, setCollectError] = useState("");
    const snapPoints = useMemo(() => ["88%"], []);

    useEffect(() => {
        if (visible) {
            setSheetView("property");
            setPaymentPlan(buildPaymentPlan(variant));
            setActiveMilestoneIndex(null);
            setCollectAmount("");
            setCollectError("");
            sheetRef.current?.present();
            return;
        }

        sheetRef.current?.dismiss();
    }, [visible, variant]);

    if (!project || !variant) return null;

    const goToSchedule = () => setSheetView("schedule");
    const goToProperty = () => setSheetView("property");
    const paymentSummaryState = derivePaymentSummary(paymentPlan, variant);

    const openCollectForm = (milestoneIndex) => {
        const milestone = paymentPlan[milestoneIndex];
        if (!milestone || milestone.collectedAmount >= milestone.totalAmount) return;
        setActiveMilestoneIndex(milestoneIndex);
        setCollectAmount(String(Math.max(1, Math.round(milestone.totalAmount - milestone.collectedAmount))));
        setCollectError("");
        setSheetView("collect");
    };

    const closeCollectForm = () => {
        setSheetView("schedule");
        setActiveMilestoneIndex(null);
        setCollectAmount("");
        setCollectError("");
    };

    const handleSaveCollection = () => {
        const amount = parseAmount(collectAmount);
        const milestoneIndex = activeMilestoneIndex;

        if (milestoneIndex === null || !paymentPlan[milestoneIndex]) return;
        if (!Number.isFinite(amount) || amount <= 0) {
            setCollectError("Enter a valid amount");
            return;
        }

        const selectedMilestone = paymentPlan[milestoneIndex];
        const selectedRemaining = Math.max(selectedMilestone.totalAmount - selectedMilestone.collectedAmount, 0);
        if (amount > selectedRemaining) {
            setCollectError(`Amount cannot exceed ${formatAmount(selectedRemaining)}`);
            return;
        }

        const nextPlan = paymentPlan.map((milestone, index) => {
            if (index !== milestoneIndex) return milestone;
            return {
                ...milestone,
                collectedAmount: milestone.collectedAmount + amount,
            };
        });

        setPaymentPlan(nextPlan);

        const summary = derivePaymentSummary(nextPlan, variant);
        if (typeof onVariantUpdate === "function") {
            onVariantUpdate({
                ...variant,
                paymentSchedule: nextPlan.map((milestone) => {
                    const remainingAmount = Math.max(milestone.totalAmount - milestone.collectedAmount, 0);
                    const isPaid = remainingAmount === 0;

                    return {
                        title: milestone.title,
                        amount: formatAmount(milestone.totalAmount),
                        totalAmount: milestone.totalAmount,
                        collectedAmount: milestone.collectedAmount,
                        status: isPaid ? "Paid" : "Upcoming",
                        tone: isPaid ? "success" : "warning",
                        detail: isPaid
                            ? `Collected: ${formatAmount(milestone.collectedAmount)}`
                            : `Remaining: ${formatAmount(remainingAmount)}`,
                    };
                }),
                dealValue: formatAmount(summary.totalAmount),
                received: formatAmount(summary.collectedAmount),
                pending: formatAmount(summary.pendingAmount),
                nextDue: summary.nextDueLabel,
                progress: summary.progress,
                topStatus: summary.allPaid ? "Paid" : "Upcoming",
                footerStatus: summary.allPaid ? "Paid" : "Upcoming",
                footerTotal: `${formatAmount(summary.totalAmount)} Total`,
                footerDue: summary.allPaid ? "All Paid" : `Next Due: ${summary.nextDueLabel}`,
                dealStatus: summary.allPaid ? "Paid" : "Upcoming",
            });
        }

        closeCollectForm();
    };

    const title = variant.type || variant.propertyType || variant.title || "Property";
    const priceLabel = paymentSummaryState.totalAmount > 0
        ? formatAmount(paymentSummaryState.totalAmount)
        : variant.price || variant.priceRange || variant.footerTotal || project.avgPrice || "Contact for price";
    const possession = variant.possession || project.possession || "—";
    const avgPrice = variant.avgPricePerSqft || project.avgPrice || "—";
    const area = variant.area || project.area || "—";
    const bookedBy = variant.bookedBy || variant.contactName || variant.contactLine?.split("•")?.[0]?.trim() || "—";
    const mobile = variant.mobile || variant.contactLine?.split("•")?.[1]?.trim() || "—";
    const bookingDate = variant.bookingDate || variant.date || "—";
    const tokenAmount = formatAmount(paymentPlan[0]?.totalAmount || parseAmount(variant.tokenAmount || variant.amount));
    const dealValue = formatAmount(paymentSummaryState.totalAmount);
    const received = formatAmount(paymentSummaryState.collectedAmount);
    const pending = formatAmount(paymentSummaryState.pendingAmount);
    const nextDue = paymentSummaryState.nextDueLabel;
    const dealStatus = paymentSummaryState.allPaid ? "Paid" : "Upcoming";
    const normalizeImage = (image) => {
        if (!image) return null;
        if (typeof image === "string") return { uri: image };
        return image.uri ? { uri: image.uri } : null;
    };
    const propertyImages = (variant.images?.length ? variant.images : project.projectImages || [])
        .map(normalizeImage)
        .filter(Boolean);
    const totalImages = propertyImages.length;
    const heroImage = propertyImages[0] || null;
    const heroThumb = propertyImages[1] || propertyImages[0] || null;
    const amenitiesList = variant.amenities?.length
        ? variant.amenities
        : project.amenities?.length
            ? project.amenities
            : [];

    const stats = [
        { label: "AREA", value: area },
        { label: "POSSESSION", value: possession },
        { label: "STATUS", value: dealStatus },
        { label: "PROGRESS", value: `${paymentSummaryState.progress}%` },
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
        { label: "Collected", value: received, tone: "#059669", bg: "#E6FBF3" },
        { label: "Remaining", value: pending, tone: "#D97706", bg: "#FFF1E6" },
        { label: "Next Due", value: nextDue, tone: paymentSummaryState.allPaid ? "#059669" : "#D97706", bg: paymentSummaryState.allPaid ? "#E6FBF3" : "#FFF4DB" },
    ];

    const paymentMilestones = paymentPlan.map((milestone) => {
        const remainingAmount = Math.max(milestone.totalAmount - milestone.collectedAmount, 0);
        const status = remainingAmount === 0 ? "Paid" : "Upcoming";

        return {
            ...milestone,
            remainingAmount,
            status,
            tone: status === "Paid" ? "success" : "warning",
            amount: formatAmount(milestone.totalAmount),
            detail: status === "Paid"
                ? `Collected: ${formatAmount(milestone.collectedAmount)}`
                : `Remaining: ${formatAmount(remainingAmount)}`,
        };
    });

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
                                    {heroImage ? (
                                        <Image source={heroImage} style={{ flex: 1.35, height: 170 }} resizeMode="cover" />
                                    ) : (
                                        <View style={{ flex: 1.35, height: 170, backgroundColor: "#F4F7FF", alignItems: "center", justifyContent: "center", paddingHorizontal: 16 }}>
                                            <Ionicons name="image-outline" size={28} color="#9CA3AF" />
                                            <Text className="mt-2 text-[11px] font-lato-bold text-gray-400 text-center">No images available</Text>
                                        </View>
                                    )}
                                    <View style={{ width: 2, backgroundColor: "#fff" }} />
                                    <View style={{ flex: 1, height: 170, position: "relative" }}>
                                        {heroThumb ? (
                                            <Image source={heroThumb} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
                                        ) : (
                                            <View style={{ width: "100%", height: "100%", backgroundColor: "#F3F4F6", alignItems: "center", justifyContent: "center", paddingHorizontal: 10 }}>
                                                <Ionicons name="image-outline" size={22} color="#9CA3AF" />
                                                <Text className="mt-1 text-[9px] font-lato-bold text-gray-400 text-center">No Image</Text>
                                            </View>
                                        )}
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
                                            <Text style={{ color: "#fff", fontSize: 10, fontWeight: "700" }}>{totalImages > 0 ? `1/${totalImages}` : "0/0"}</Text>
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
                                    {amenitiesList.length > 0 ? (
                                        <View className="flex-row flex-wrap">
                                            {amenitiesList.map((item, index) => (
                                                <AmenityItem key={`${item}-${index}`} label={item} />
                                            ))}
                                        </View>
                                    ) : (
                                        <View className="bg-[#F8FAFC] rounded-2xl border border-gray-100 py-5 px-4">
                                            <Text className="text-[12px] font-lato text-gray-400 text-center">No amenities available for this property yet.</Text>
                                        </View>
                                    )}
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

                                        {followUps.length > 0 ? (
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
                                        ) : (
                                            <View className="bg-white rounded-[14px] border border-[#E6E0FF] px-3 py-5">
                                                <Text className="text-[12px] font-lato text-gray-400 text-center">No follow-ups available for this property yet.</Text>
                                            </View>
                                        )}
                                    </View>
                                ) : null}
                            </View>
                        </View>
                    </>
                ) : sheetView === "schedule" ? (
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

                                            {milestone.remainingAmount > 0 ? (
                                                <TouchableOpacity
                                                    activeOpacity={0.9}
                                                    onPress={() => openCollectForm(index)}
                                                    className="mt-2 self-start flex-row items-center gap-1.5 rounded-full bg-[#4A43EC] px-3 py-1.5"
                                                >
                                                    <MaterialCommunityIcons name="cash-plus" size={12} color="#fff" />
                                                    <Text className="text-[10px] font-lato-bold text-white">Collect</Text>
                                                </TouchableOpacity>
                                            ) : (
                                                <View className="mt-2 self-start flex-row items-center gap-1.5 rounded-full bg-[#E6FBF3] px-3 py-1.5">
                                                    <MaterialCommunityIcons name="check-circle-outline" size={12} color="#10B981" />
                                                    <Text className="text-[10px] font-lato-bold text-[#10B981]">Paid</Text>
                                                </View>
                                            )}

                                            {!isLast ? <View className="mt-1.5 h-px bg-[#DDE6DD]" /> : null}
                                        </View>
                                    );
                                })}
                            </View>
                        </View>
                    </>
                ) : (
                    <View className="px-5 pb-2">
                        <View className="flex-row items-center justify-between mb-4">
                            <TouchableOpacity
                                onPress={closeCollectForm}
                                className="w-8 h-8 rounded-full bg-[#F3F4F8] items-center justify-center"
                                activeOpacity={0.85}
                            >
                                <Ionicons name="arrow-back" size={14} color="#1F2937" />
                            </TouchableOpacity>
                            <View className="flex-1 ml-3">
                                <Text className="text-[16px] font-lato-bold text-[#1F2937]">Collect Payment</Text>
                                <Text className="mt-0.5 text-[10px] font-lato text-[#8E98AA]" numberOfLines={1}>
                                    {paymentMilestones[activeMilestoneIndex]?.title || "Milestone"} · {title}
                                </Text>
                            </View>
                        </View>

                        <View className="rounded-[18px] border border-[#E6E0FF] bg-[#F8F6FF] p-4">
                            <Text className="text-[12px] font-lato text-[#6B7280]">
                                Enter the amount to collect for {paymentMilestones[activeMilestoneIndex]?.title || "this milestone"}.
                            </Text>

                            <View className="mt-4 rounded-[14px] bg-white border border-[#ECE8FF] p-3">
                                <Text className="text-[10px] font-lato-bold text-[#6B7280] uppercase mb-1">Pending Amount</Text>
                                <Text className="text-[18px] font-lato-bold text-[#4A43EC]">
                                    {formatAmount(paymentMilestones[activeMilestoneIndex]?.remainingAmount || 0)}
                                </Text>
                            </View>

                            <View className="mt-4">
                                <Text className="text-[10px] font-lato-bold text-[#6B7280] uppercase mb-1.5">Amount</Text>
                                <TextInput
                                    value={collectAmount}
                                    onChangeText={(value) => {
                                        setCollectAmount(value);
                                        setCollectError("");
                                    }}
                                    keyboardType="numeric"
                                    placeholder="Enter amount"
                                    placeholderTextColor="#94A3B8"
                                    className="h-12 rounded-2xl border border-gray-200 px-4 text-[14px] font-lato text-[#111827] bg-white"
                                    returnKeyType="done"
                                />
                                {collectError ? <Text className="mt-1 text-[11px] text-red-500">{collectError}</Text> : null}
                            </View>
                        </View>
                    </View>
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
                    ) : sheetView === "schedule" ? (
                        <TouchableOpacity
                            onPress={goToProperty}
                            className="rounded-2xl py-3 items-center flex-row justify-center gap-2"
                            style={{ backgroundColor: "#4A43EC" }}
                        >
                            <Ionicons name="arrow-back" size={14} color="#fff" />
                            <Text className="text-white text-[12px] font-lato-bold">Back to Property Details</Text>
                        </TouchableOpacity>
                    ) : (
                        <View className="flex-row gap-3">
                            <TouchableOpacity
                                onPress={closeCollectForm}
                                className="flex-1 rounded-2xl py-3 items-center justify-center border border-gray-200 bg-white"
                            >
                                <Text className="text-[12px] font-lato-bold text-[#374151]">Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleSaveCollection}
                                className="flex-1 rounded-2xl py-3 items-center justify-center bg-[#4A43EC]"
                            >
                                <Text className="text-[12px] font-lato-bold text-white">Save</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </BottomSheetScrollView>
        </BottomSheetModal>
    );
}
