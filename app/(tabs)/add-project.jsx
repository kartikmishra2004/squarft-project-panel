import React, { useState, useEffect, useRef, useCallback } from "react";
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    Image,
    Dimensions,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    Pressable,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { useDispatch, useSelector } from "react-redux";
import {
    setStep,
    updateStep1,
    addPropertyType,
    removePropertyType,
    updatePropertyType,
    updateStep3,
    updateStep4,
    bulkUploadProject,
    bulkUploadSubtype,
    resetForm,
} from "../../store/slices/projectSlice";
import { addProject } from "../../store/slices/projectsSlice";
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

const { width } = Dimensions.get("window");

const mainTypes = [
    {
        id: "residential",
        label: "Residential",
        image: require("../../assets/icons/property-types/House2.png"),
        cloudImage: require("../../assets/icons/property-types/Clouds.png"),
    },
    {
        id: "commercial",
        label: "Commercial",
        image: require("../../assets/icons/property-types/commercial.png"),
    },
];

const subTypesData = {
    residential: [
        { id: "plot", label: "Plot", image: require("../../assets/icons/property-types/plot.png") },
        { id: "villa", label: "Villa", image: require("../../assets/icons/property-types/villa.png") },
        { id: "apartment", label: "Apartment", image: require("../../assets/icons/property-types/apartment.png") },
        { id: "rowhouse", label: "Rowhouse", image: require("../../assets/icons/property-types/rowhouse.png") },
    ],
    commercial: [
        { id: "shop", label: "Shop", image: require("../../assets/icons/property-types/Shop.png") },
        { id: "showroom", label: "Showroom", image: require("../../assets/icons/property-types/showroom.png") },
        { id: "office", label: "Office", image: require("../../assets/icons/property-types/office.png") },
    ]
};

const bhkOptions = ["1 BHK", "2 BHK", "3 BHK", "4 BHK", "5 BHK", "5 BHK+"];
const officeTypes = ["Co-working", "Ready to Move", "Bare Shell"];
const areaUnits = [
    'Sq-ft', 'Sq-yrd', 'Sq-m', 'Acre', 'Bigha', 
    'Hectare', 'Guntha', 'Kanal', 'Marla', 'Biswa', 'Kottah'
];

const steps = [
    { id: 1, title: "Basic Details" },
    { id: 2, title: "Property Type" },
    { id: 3, title: "Property Detail" },
    { id: 4, title: "Image & Price" },
];

export default function AddProject() {
    const dispatch = useDispatch();
    const { currentStep, step1, step2, step3, step4 } = useSelector((state) => state.project);
    const scrollRef = useRef(null);

    useEffect(() => {
        scrollRef.current?.scrollTo({ y: 0, animated: false });
    }, [currentStep]);

    const handleNext = () => {
        if (currentStep === 1) {
            const {
                location, city, state, pincode,
                salesOfficerName, salesOfficerContact, salesVerified,
                responsiblePersonName, responsiblePersonContact, responsibleVerified
            } = step1;

            if (!location || !city || !state || !pincode ||
                !salesOfficerName || !salesOfficerContact || !salesVerified ||
                !responsiblePersonName || !responsiblePersonContact || !responsibleVerified) {
                // You can add an alert here if you want
                return;
            }
        }

        if (currentStep < 4) {
            dispatch(setStep(currentStep + 1));
        } else {
            // Final Step (Submit)
            const finalProjectData = {
                id: Date.now().toString(),
                ...step1,
                selectedTypes: step2.selectedTypes.map(type => ({
                    ...type,
                    units: step3.unitConfigs[type.id]?.map((unit, idx) => ({
                        ...unit,
                        ...step4.unitData[`${type.id}-${idx}`]
                    })) || []
                })),
                createdAt: new Date().toISOString(),
                status: 'Active'
            };
            
            dispatch(addProject(finalProjectData));
            dispatch(resetForm());
            router.push('/success');
        }
    };

    const isNextDisabled = () => {
        if (currentStep === 1) {
            const {
                projectName, location, city, state, pincode,
                salesOfficerName, salesOfficerContact, salesVerified,
                responsiblePersonName, responsiblePersonContact, responsibleVerified
            } = step1;
            return !projectName || !location || !city || !state || !pincode ||
                !salesOfficerName || !salesOfficerContact || !salesVerified ||
                !responsiblePersonName || !responsiblePersonContact || !responsibleVerified;
        }

        if (currentStep === 2) {
            return step2.selectedTypes.length === 0;
        }

        if (currentStep === 3) {
            if (step2.selectedTypes.length === 0) return true;
            
            // Check if all selected types have at least one unit and all units are filled
            return step2.selectedTypes.some(type => {
                const configs = step3.unitConfigs[type.id] || [];
                if (configs.length === 0) return true;
                
                return configs.some(unit => {
                    const baseFields = !unit.area || !unit.propertyNumber;
                    if (baseFields) return true;

                    if (type.subType === 'apartment') {
                        if (!unit.tower || !unit.floor || !unit.bhk) return true;
                    }
                    if (type.subType === 'villa' || type.subType === 'rowhouse') {
                        if (!unit.bhk) return true;
                    }
                    if (type.subType === 'office') {
                        if (!unit.officeType) return true;
                    }
                    return false;
                });
            });
        }

        if (currentStep === 4) {
            const allUnits = [];
            step2.selectedTypes.forEach(type => {
                const configs = step3.unitConfigs[type.id] || [];
                configs.forEach((_, idx) => {
                    allUnits.push(`${type.id}-${idx}`);
                });
            });

            if (allUnits.length === 0) return true;

            // Check if all units have price, at least one image, and agreement
            return allUnits.some(unitId => {
                const data = step4.unitData[unitId];
                if (!data) return true;
                return !data.sellingPrice || data.images.length === 0 || !data.agreed;
            });
        }

        return false;
    };

    const handleBack = () => {
        if (currentStep > 1) {
            dispatch(setStep(currentStep - 1));
        } else {
            router.back();
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className="flex-1"
        >
            <View className="flex-1 bg-[#F8F9FE]">
                <StatusBar barStyle="light-content" />

                {/* Header Section */}
                <View className="bg-[#4A43EC] pt-12 pb-8 px-5 relative overflow-hidden">
                    {/* Decorative Circle */}
                    <View
                        style={{
                            position: "absolute",
                            right: -width * 0.5,
                            top: -width * 0.25,
                            width: width * 0.85,
                            height: width * 0.85,
                            borderRadius: width * 0.4,
                            backgroundColor: "#3D36C7",
                            opacity: 0.5
                        }}
                    />

                    <View className="flex-row items-center mt-6 justify-between mb-8">
                        <TouchableOpacity onPress={handleBack} className="p-1">
                            <Ionicons name="arrow-back" size={20} color="white" />
                        </TouchableOpacity>
                        <Text className="text-white text-base font-lato-bold">Add Project</Text>
                        <View style={{ width: 20 }} />
                    </View>

                    {/* Step Indicator */}
                    <View className="flex-row justify-between items-start mt-8">
                        {steps.map((step) => (
                            <View key={step.id} className="items-center" style={{ width: (width - 40) / 4 }}>
                                <View
                                    className={`w-7 h-7 rounded-full items-center justify-center mb-1.5 ${currentStep === step.id ? 'bg-white' : 'bg-transparent border border-white/40'
                                        }`}
                                >
                                    <Text className={`text-xs font-lato-bold ${currentStep === step.id ? 'text-[#4A43EC]' : 'text-white/60'
                                        }`}>
                                        {step.id}
                                    </Text>
                                </View>
                                <Text className={`text-[8px] text-center font-lato-medium ${currentStep === step.id ? 'text-white' : 'text-white/60'
                                    }`} numberOfLines={1}>
                                    {step.title}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Content Section */}
                <View className="flex-1 bg-white -mt-5 rounded-t-[20px] overflow-hidden">
                    <ScrollView
                        ref={scrollRef}
                        className="flex-1 px-5 pt-6"
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 100 }}
                        keyboardShouldPersistTaps="handled"
                    >
                        {currentStep === 1 && <Step1 />}
                        {currentStep === 2 && <Step2 />}
                        {currentStep === 3 && <Step3 />}
                        {currentStep === 4 && <Step4 />}

                        {/* Next Button */}
                        <View className="mt-8 mb-4">
                            <TouchableOpacity
                                className={`py-4 rounded-xl items-center ${isNextDisabled() ? 'bg-gray-300' : 'bg-[#4A43EC]'}`}
                                activeOpacity={0.8}
                                onPress={handleNext}
                                disabled={isNextDisabled()}
                            >
                                <Text className="text-white text-sm font-lato-bold">
                                    {currentStep === 4 ? "Submit" : "Next"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

// --- Step 1 Component ---
function Step1() {
    const dispatch = useDispatch();
    const { step1 } = useSelector((state) => state.project);

    const updateField = (field, value) => {
        dispatch(updateStep1({ [field]: value }));
    };

    const salesOtpRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];
    const responsibleOtpRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];
    const projectNameRef = useRef(null);
    const locationRef = useRef(null);
    const cityRef = useRef(null);
    const stateRef = useRef(null);
    const pincodeRef = useRef(null);
    const salesNameRef = useRef(null);
    const salesContactRef = useRef(null);
    const respNameRef = useRef(null);
    const respContactRef = useRef(null);

    const verifyOtp = (type) => {
        const field = type === 'sales' ? 'salesOfficerOtp' : 'responsiblePersonOtp';
        const otpStr = step1[field].join('');

        if (otpStr === "1234") {
            dispatch(updateStep1({
                [type === 'sales' ? 'salesVerified' : 'responsibleVerified']: true,
                [type === 'sales' ? 'salesOtpError' : 'responsibleOtpError']: false
            }));
        } else {
            dispatch(updateStep1({
                [type === 'sales' ? 'salesVerified' : 'responsibleVerified']: false,
                [type === 'sales' ? 'salesOtpError' : 'responsibleOtpError']: true
            }));
        }
    };

    const handleOtpChange = (index, value, type) => {
        const field = type === 'sales' ? 'salesOfficerOtp' : 'responsiblePersonOtp';
        const refs = type === 'sales' ? salesOtpRefs : responsibleOtpRefs;

        const newOtp = [...step1[field]];
        newOtp[index] = value;
        updateField(field, newOtp);

        if (value && index < 3) {
            refs[index + 1].current?.focus();
        }
    };

    const handleKeyPress = (e, index, type) => {
        if (e.nativeEvent.key === 'Backspace' && !step1[type === 'sales' ? 'salesOfficerOtp' : 'responsiblePersonOtp'][index] && index > 0) {
            const refs = type === 'sales' ? salesOtpRefs : responsibleOtpRefs;
            refs[index - 1].current?.focus();
        }
    };

    return (
        <View className="gap-6">
            {/* Project Name */}
            <View>
                <Text className="text-xs font-lato-bold text-black mb-1.5">Project Name</Text>
                <Pressable onPress={() => projectNameRef.current?.focus()} className="bg-white border border-gray-200 rounded-xl px-4 h-12 flex-row items-center">
                    <TextInput
                        ref={projectNameRef}
                        className="flex-1 text-[13px] text-gray-800 font-lato-medium"
                        placeholder="eg. The Grand Residency"
                        placeholderTextColor="#9CA3AF"
                        value={step1.projectName}
                        onChangeText={(v) => updateField('projectName', v)}
                        style={{ paddingVertical: 0, textAlignVertical: 'center', includeFontPadding: false }}
                    />
                </Pressable>
            </View>

            {/* Location */}
            <View>
                <Text className="text-xs font-lato-bold text-black mb-1.5">Location</Text>
                <Pressable onPress={() => locationRef.current?.focus()} className="bg-white border border-gray-200 rounded-xl px-4 h-12 flex-row items-center">
                    <TextInput
                        ref={locationRef}
                        className="flex-1 text-[13px] text-gray-800 font-lato-medium"
                        placeholder="Address & Landmark"
                        placeholderTextColor="#9CA3AF"
                        value={step1.location}
                        onChangeText={(v) => updateField('location', v)}
                        style={{ paddingVertical: 0, textAlignVertical: 'center', includeFontPadding: false }}
                    />
                    <View className="w-7 h-7 rounded-lg bg-[#EBEAFF] items-center justify-center">
                        <Ionicons name="locate" size={16} color="#4A43EC" />
                    </View>
                </Pressable>
            </View>

            {/* City, State, Pincode */}
            <View className="flex-row gap-3">
                <View className="flex-1">
                    <Text className="text-xs font-lato-bold text-black mb-1.5">City</Text>
                    <Pressable onPress={() => cityRef.current?.focus()} className="bg-white border border-gray-200 rounded-xl px-4 h-12 justify-center">
                        <TextInput
                            ref={cityRef}
                            className="text-[13px] text-gray-800 font-lato-medium"
                            placeholder="city"
                            placeholderTextColor="#9CA3AF"
                            value={step1.city}
                            onChangeText={(v) => updateField('city', v)}
                            style={{ paddingVertical: 0, textAlignVertical: 'center', includeFontPadding: false }}
                        />
                    </Pressable>
                </View>
                <View className="flex-1">
                    <Text className="text-xs font-lato-bold text-black mb-1.5">State</Text>
                    <Pressable onPress={() => stateRef.current?.focus()} className="bg-white border border-gray-200 rounded-xl px-4 h-12 justify-center">
                        <TextInput
                            ref={stateRef}
                            className="text-[13px] text-gray-800 font-lato-medium"
                            placeholder="state"
                            placeholderTextColor="#9CA3AF"
                            value={step1.state}
                            onChangeText={(v) => updateField('state', v)}
                            style={{ paddingVertical: 0, textAlignVertical: 'center', includeFontPadding: false }}
                        />
                    </Pressable>
                </View>
                <View className="flex-1">
                    <Text className="text-xs font-lato-bold text-black mb-1.5">Pincode</Text>
                    <Pressable onPress={() => pincodeRef.current?.focus()} className="bg-white border border-gray-200 rounded-xl px-4 h-12 justify-center">
                        <TextInput
                            ref={pincodeRef}
                            className="text-[13px] text-gray-800 font-lato-medium"
                            placeholder="pincode"
                            placeholderTextColor="#9CA3AF"
                            keyboardType="numeric"
                            value={step1.pincode}
                            onChangeText={(v) => updateField('pincode', v)}
                            style={{ paddingVertical: 0, textAlignVertical: 'center', includeFontPadding: false }}
                        />
                    </Pressable>
                </View>
            </View>

            {/* Sales Officer Section */}
            <View>
                <Text className="text-xs font-lato-bold text-black mb-1.5">Sales officer name</Text>
                <Pressable onPress={() => salesNameRef.current?.focus()} className="bg-white border border-gray-200 rounded-xl px-4 h-12 flex-row items-center">
                    <TextInput
                        ref={salesNameRef}
                        className="flex-1 text-[13px] text-gray-800 font-lato-medium"
                        placeholder="eg. manas gangrade"
                        placeholderTextColor="#9CA3AF"
                        value={step1.salesOfficerName}
                        onChangeText={(v) => updateField('salesOfficerName', v)}
                        style={{ paddingVertical: 0, textAlignVertical: 'center', includeFontPadding: false }}
                    />
                    <View className="w-7 h-7 rounded-lg bg-[#EBEAFF] items-center justify-center">
                        <Ionicons name="person" size={16} color="#4A43EC" />
                    </View>
                </Pressable>
            </View>

            <View>
                <Text className="text-xs font-lato-bold text-black mb-1.5">Contact No.</Text>
                <Pressable onPress={() => salesContactRef.current?.focus()} className="flex-row bg-white border border-gray-200 rounded-xl px-4 h-12 items-center">
                    <TextInput
                        ref={salesContactRef}
                        className="flex-1 text-[13px] text-gray-800 font-lato-medium"
                        placeholder="eg. 8120180101"
                        placeholderTextColor="#9CA3AF"
                        keyboardType="phone-pad"
                        value={step1.salesOfficerContact}
                        onChangeText={(v) => updateField('salesOfficerContact', v)}
                        style={{ paddingVertical: 0, textAlignVertical: 'center', includeFontPadding: false }}
                    />
                    <TouchableOpacity onPress={() => updateField('salesOtpSent', true)}>
                        <Text className="text-[10px] font-lato-bold text-[#4A43EC]">
                            {step1.salesOtpSent ? "Resend OTP" : "Send OTP"}
                        </Text>
                    </TouchableOpacity>
                </Pressable>
            </View>

            {step1.salesOtpSent && (
                <View>
                    <View className="flex-row items-center gap-2 mb-4">
                        <Text className="text-sm font-lato-bold text-black">Enter OTP</Text>
                        {step1.salesVerified && (
                            <View className="bg-green-100 px-2 py-0.5 rounded-full flex-row items-center">
                                <Ionicons name="checkmark-circle" size={10} color="#10B981" />
                                <Text className="text-[8px] text-[#10B981] font-lato-bold ml-1">Verified</Text>
                            </View>
                        )}
                        {step1.salesOtpError && !step1.salesVerified && (
                            <View className="bg-red-100 px-2 py-0.5 rounded-full flex-row items-center">
                                <Ionicons name="alert-circle" size={10} color="#EF4444" />
                                <Text className="text-[8px] text-[#EF4444] font-lato-bold ml-1">Invalid OTP</Text>
                            </View>
                        )}
                    </View>
                    <View className="flex-row gap-3">
                        {[0, 1, 2, 3].map((i) => (
                            <View
                                key={i}
                                className={`w-14 h-14 bg-white border rounded-xl items-center justify-center ${step1.salesVerified ? 'border-green-500 bg-green-50' : step1.salesOtpError ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
                            >
                                <TextInput
                                    ref={salesOtpRefs[i]}
                                    className="text-lg font-lato-bold text-black text-center w-full h-full"
                                    maxLength={1}
                                    keyboardType="number-pad"
                                    value={step1.salesOfficerOtp[i]}
                                    onChangeText={(v) => handleOtpChange(i, v, 'sales')}
                                    onKeyPress={(e) => handleKeyPress(e, i, 'sales')}
                                    editable={!step1.salesVerified}
                                    style={{ paddingVertical: 0, textAlignVertical: 'center', includeFontPadding: false }}
                                />
                            </View>
                        ))}
                    </View>

                    {!step1.salesVerified && (
                        <TouchableOpacity
                            onPress={() => verifyOtp('sales')}
                            className="bg-[#4A43EC] mt-3 py-3.5 rounded-xl items-center"
                        >
                            <Text className="text-white text-[13px] font-lato-bold">Verify OTP</Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}

            {/* Responsible Person Section */}
            <View>
                <Text className="text-xs font-lato-bold text-black mb-1.5">Responsible person name</Text>
                <Pressable onPress={() => respNameRef.current?.focus()} className="bg-white border border-gray-200 rounded-xl px-4 h-12 justify-center">
                    <TextInput
                        ref={respNameRef}
                        className="text-[13px] text-gray-800 font-lato-medium"
                        placeholder="eg. manas gangrade"
                        placeholderTextColor="#9CA3AF"
                        value={step1.responsiblePersonName}
                        onChangeText={(v) => updateField('responsiblePersonName', v)}
                        style={{ paddingVertical: 0, textAlignVertical: 'center', includeFontPadding: false }}
                    />
                </Pressable>
            </View>

            <View>
                <Text className="text-xs font-lato-bold text-black mb-1.5">Contact No.</Text>
                <Pressable onPress={() => respContactRef.current?.focus()} className="flex-row bg-white border border-gray-200 rounded-xl px-4 h-12 items-center">
                    <TextInput
                        ref={respContactRef}
                        className="flex-1 text-[13px] text-gray-800 font-lato-medium"
                        placeholder="eg. 8120180101"
                        placeholderTextColor="#9CA3AF"
                        keyboardType="phone-pad"
                        value={step1.responsiblePersonContact}
                        onChangeText={(v) => updateField('responsiblePersonContact', v)}
                        style={{ paddingVertical: 0, textAlignVertical: 'center', includeFontPadding: false }}
                    />
                    <TouchableOpacity onPress={() => updateField('responsibleOtpSent', true)}>
                        <Text className="text-[10px] font-lato-bold text-[#4A43EC]">
                            {step1.responsibleOtpSent ? "Resend OTP" : "Send OTP"}
                        </Text>
                    </TouchableOpacity>
                </Pressable>
            </View>

            {step1.responsibleOtpSent && (
                <View>
                    <View className="flex-row items-center gap-2 mb-4">
                        <Text className="text-sm font-lato-bold text-black">Enter OTP</Text>
                        {step1.responsibleVerified && (
                            <View className="bg-green-100 px-2 py-0.5 rounded-full flex-row items-center">
                                <Ionicons name="checkmark-circle" size={10} color="#10B981" />
                                <Text className="text-[8px] text-[#10B981] font-lato-bold ml-1">Verified</Text>
                            </View>
                        )}
                        {step1.responsibleOtpError && !step1.responsibleVerified && (
                            <View className="bg-red-100 px-2 py-0.5 rounded-full flex-row items-center">
                                <Ionicons name="alert-circle" size={10} color="#EF4444" />
                                <Text className="text-[8px] text-[#EF4444] font-lato-bold ml-1">Invalid OTP</Text>
                            </View>
                        )}
                    </View>
                    <View className="flex-row gap-3">
                        {[0, 1, 2, 3].map((i) => (
                            <View
                                key={i}
                                className={`w-14 h-14 bg-white border rounded-xl items-center justify-center ${step1.responsibleVerified ? 'border-green-500 bg-green-50' : step1.responsibleOtpError ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
                            >
                                <TextInput
                                    ref={responsibleOtpRefs[i]}
                                    className="text-lg font-lato-bold text-black text-center w-full h-full"
                                    maxLength={1}
                                    keyboardType="number-pad"
                                    value={step1.responsiblePersonOtp[i]}
                                    onChangeText={(v) => handleOtpChange(i, v, 'responsible')}
                                    onKeyPress={(e) => handleKeyPress(e, i, 'responsible')}
                                    editable={!step1.responsibleVerified}
                                    style={{ paddingVertical: 0, textAlignVertical: 'center', includeFontPadding: false }}
                                />
                            </View>
                        ))}
                    </View>

                    {!step1.responsibleVerified && (
                        <TouchableOpacity
                            onPress={() => verifyOtp('responsible')}
                            className="bg-[#4A43EC] mt-3 py-3.5 rounded-xl items-center"
                        >
                            <Text className="text-white text-[13px] font-lato-bold">Verify OTP</Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}
        </View>
    );
}

// --- CSV Helper ---
const parseCSV = (text) => {
    const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
    if (lines.length === 0) return [];
    
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const data = lines.slice(1).map(line => {
        const values = [];
        let current = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                values.push(current.trim().replace(/^"|"$/g, ''));
                current = '';
            } else {
                current += char;
            }
        }
        values.push(current.trim().replace(/^"|"$/g, ''));
        const obj = {};
        headers.forEach((h, i) => {
            obj[h] = values[i];
        });
        return obj;
    });
    return data;
};

// --- Step 2 Component ---
function Step2() {
    const { width } = Dimensions.get('window');
    const dispatch = useDispatch();
    const { step2 } = useSelector((state) => state.project);
    const [showUnitDropdown, setShowUnitDropdown] = useState(false);

    const towerRef = useRef(null);
    const floorRef = useRef(null);
    const areaRef = useRef(null);
    const propertyNumberRef = useRef(null);

    // Local state for the current type being added
    const [currentConfig, setCurrentConfig] = useState({
        id: '',
        mainType: null,
        subType: null,
        tower: '',
        floor: '',
        bhk: '',
        officeType: '',
        area: '',
        areaUnit: 'Sq-ft',
        amenities: [''],
        propertyNumber: '',
        hasShop: false,
        extraCharges: [{ title: '', amount: '' }]
    });

    const resetCurrentConfig = () => {
        setCurrentConfig({
            id: '',
            mainType: null,
            subType: null,
            tower: '',
            floor: '',
            bhk: '',
            officeType: '',
            area: '',
            areaUnit: 'Sq-ft',
            amenities: [''],
            propertyNumber: '',
            hasShop: false,
            extraCharges: [{ title: '', amount: '' }]
        });
    };

    const handleAddType = () => {
        if (!currentConfig.mainType || !currentConfig.subType) return;
        
        // Check if already added
        const exists = step2.selectedTypes.find(t => t.mainType === currentConfig.mainType && t.subType === currentConfig.subType);
        if (exists) return;

        dispatch(addPropertyType({
            mainType: currentConfig.mainType,
            subType: currentConfig.subType,
            id: Date.now().toString(),
        }));
        resetCurrentConfig();
    };

    const handleRemoveType = (id) => {
        dispatch(removePropertyType(id));
    };

    const subTypes = currentConfig.mainType ? subTypesData[currentConfig.mainType] : [];

    return (
        <View className="gap-5">
            <Text className="text-base font-lato-bold text-black">Configure Property Types</Text>

            {/* Added Types List */}
            {step2.selectedTypes.length > 0 && (
                <View className="gap-3">
                    {step2.selectedTypes.map((item) => {
                        const typeIcon = subTypesData[item.mainType]?.find(t => t.id === item.subType)?.image;
                        return (
                            <View key={item.id} className="bg-white border border-gray-100 rounded-xl px-4 py-3 flex-row justify-between items-center shadow-sm mb-3">
                                <View className="flex-row items-center flex-1">
                                    <View className="w-18 h-18 bg-[#F4F7FF] rounded-2xl items-center justify-center mr-4">
                                        <Image source={typeIcon} className="w-14 h-14" resizeMode="contain" />
                                    </View>
                                    <View className="justify-center">
                                        <Text className="font-lato-bold text-black text-[13px] leading-tight">
                                            {item.subType.toUpperCase()}
                                        </Text>
                                        <Text className="text-[11px] text-[#4A43EC] font-lato-bold uppercase mt-0.5 leading-tight">
                                            {item.mainType}
                                        </Text>
                                    </View>
                                </View>
                                <TouchableOpacity onPress={() => handleRemoveType(item.id)} className="ml-4">
                                    <Ionicons name="trash-outline" size={18} color="#EF4444" />
                                </TouchableOpacity>
                            </View>
                        );
                    })}
                </View>
            )}

            <View className="h-[1px] bg-gray-100 my-2" />

            {/* Main Property Type Selection */}
            <Text className="text-xs font-lato-bold text-black">Select Main Type</Text>
            <View className="flex-row justify-between">
                {mainTypes.map((type) => (
                    <TouchableOpacity
                        key={type.id}
                        onPress={() => setCurrentConfig(prev => ({ ...prev, mainType: type.id, subType: null }))}
                        style={{ width: (width - 50) / 2 }}
                        className={`bg-white rounded-xl h-24 border ${currentConfig.mainType === type.id ? 'border-[#4A43EC] bg-[#F4F7FF]' : 'border-gray-100'
                            } shadow-sm relative overflow-hidden`}
                    >
                        <Text className="text-[10px] font-lato-bold text-black absolute top-2 left-2.5 z-10">{type.label}</Text>
                        <View className="flex-1 justify-end items-end">
                            <Image source={type.image} className="w-[80%] h-[70%] mt-auto" resizeMode="contain" />
                        </View>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Sub Type Selection */}
            {currentConfig.mainType && (
                <>
                    <View className="flex-row justify-between items-center">
                        <Text className="text-sm font-lato-bold text-black">Select Sub Type</Text>
                        {currentConfig.subType && (
                            <TouchableOpacity 
                                onPress={handleAddType}
                                className="bg-[#4A43EC] px-4 py-1.5 rounded-full"
                            >
                                <Text className="text-white text-[10px] font-lato-bold">Add This Type</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-3">
                        {subTypes.map((type) => (
                            <TouchableOpacity
                                key={type.id}
                                onPress={() => setCurrentConfig(prev => ({ ...prev, subType: type.id }))}
                                style={{ width: width * 0.22 }}
                                className={`bg-white rounded-lg h-20 border mr-3 ${currentConfig.subType === type.id ? 'border-[#4A43EC] bg-[#F4F7FF]' : 'border-gray-100'
                                    } shadow-sm items-center overflow-hidden`}
                            >
                                <Text className={`text-[9px] font-lato-bold mt-1.5 mb-0.5 ${currentConfig.subType === type.id ? 'text-[#4A43EC]' : 'text-black'}`}>{type.label}</Text>
                                <Image source={type.image} className="w-full h-[60%]" resizeMode="contain" />
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </>
            )}
        </View>
    );
}

// --- Step 3 Component ---
function Step3() {
    const dispatch = useDispatch();
    const { step2, step3 } = useSelector((state) => state.project);
    const { width } = Dimensions.get('window');
    
    // Use the first selected type as the default active tab if available
    const [activeTypeTab, setActiveTypeTab] = useState(step2.selectedTypes[0]?.id);
    const [uploadModes, setUploadModes] = useState({}); // { [typeId]: 'manual' | 'bulk' }
    const [openUploadModeDropdown, setOpenUploadModeDropdown] = useState(false);
    const [openAreaDropdown, setOpenAreaDropdown] = useState(null); // format: "typeId-unitIdx"

    // Keep active tab valid if types are removed
    useEffect(() => {
        if (step2.selectedTypes.length > 0 && !step2.selectedTypes.find(t => t.id === activeTypeTab)) {
            setActiveTypeTab(step2.selectedTypes[0].id);
        }
    }, [step2.selectedTypes, activeTypeTab]);

    const updateQuantity = (typeId, quantity) => {
        dispatch(updateStep3({ typeId, quantity: parseInt(quantity) || 0 }));
    };

    const updateUnitDetail = (typeId, unitIndex, field, value) => {
        dispatch(updateStep3({ typeId, unitIndex, data: { [field]: value } }));
    };

    const handleDownloadFormat = async (type) => {
        try {
            let headers = ['Sub Type', 'Property Number', 'Area', 'Area Unit'];
            
            if (type.subType === 'apartment') {
                headers.push('BHK', 'Tower', 'Floor');
            } else if (type.subType === 'villa' || type.subType === 'rowhouse') {
                headers.push('BHK');
            } else if (type.subType === 'office') {
                headers.push('Office Type');
            }
            
            headers.push('Selling Price', 'Price Negotiable', 'Tax Exclude', 'Payment Mode');
            
            const headersStr = headers.join(',');
            
            // Generate a sample row
            const sampleRow = headers.map(h => {
                if (h === 'Sub Type') return type.subType;
                if (h === 'Property Number') return 'A-101';
                if (h === 'Area') return '1200';
                if (h === 'Area Unit') return 'Sq-ft';
                if (h === 'BHK') return '2 BHK';
                if (h === 'Tower') return 'Tower A';
                if (h === 'Floor') return '1st';
                if (h === 'Office Type') return 'Co-working';
                if (h === 'Selling Price') return '5000000';
                if (h === 'Price Negotiable' || h === 'Tax Exclude') return 'false';
                if (h === 'Payment Mode') return 'full';
                return '';
            }).join(',');

            const csvContent = `${headersStr}\n${sampleRow}`;
            const fileUri = `${FileSystem.documentDirectory}${type.subType}_format.csv`;
            
            await FileSystem.writeAsStringAsync(fileUri, csvContent);
            await Sharing.shareAsync(fileUri);
        } catch (error) {
            console.error(error);
        }
    };

    const handleBulkUpload = async (type) => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: "text/comma-separated-values",
                copyToCacheDirectory: true
            });

            if (result.canceled) return;

            const fileUri = result.assets[0].uri;
            const content = await FileSystem.readAsStringAsync(fileUri);
            const data = parseCSV(content);

            if (data.length === 0) {
                alert("The CSV file is empty.");
                return;
            }

            const unitConfigs = [];
            const unitData = {};

            data.forEach((row, index) => {
                // Basic validation: skip rows without a property number
                if (!row['Property Number']) return;

                unitConfigs.push({
                    tower: row['Tower'] || '',
                    floor: row['Floor'] || '',
                    bhk: row['BHK'] || '',
                    officeType: row['Office Type'] || '',
                    area: row['Area'] || '',
                    areaUnit: row['Area Unit'] || 'Sq-ft',
                    amenities: [''],
                    propertyNumber: row['Property Number'] || '',
                    hasShop: false,
                    extraCharges: [{ title: '', amount: '' }]
                });

                unitData[`${type.id}-${index}`] = {
                    images: [],
                    documents: [],
                    sellingPrice: row['Selling Price'] || '',
                    priceNegotiable: row['Price Negotiable']?.toLowerCase() === 'true',
                    taxExclude: row['Tax Exclude']?.toLowerCase() === 'true',
                    paymentMode: row['Payment Mode'] || 'full',
                    agreed: true,
                };
            });

            dispatch(bulkUploadSubtype({ typeId: type.id, unitConfigs, unitData }));
            alert(`Bulk upload successful! Added ${unitConfigs.length} units for ${type.subType}.`);
        } catch (error) {
            console.error(error);
            alert("Error uploading CSV. Please check the format.");
        }
    };

    if (step2.selectedTypes.length === 0) {
        return (
            <View className="items-center py-10">
                <Text className="text-gray-400 font-lato">No property types selected in Step 2.</Text>
            </View>
        );
    }

    const activeType = step2.selectedTypes.find(t => t.id === activeTypeTab) || step2.selectedTypes[0];

    return (
        <View className="gap-6">
            <Text className="text-base font-lato-bold text-black">Configure Units</Text>

            {/* Subtypes Tabs */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-3">
                {step2.selectedTypes.map((type) => {
                    const typeIcon = subTypesData[type.mainType]?.find(t => t.id === type.subType)?.image;
                    const isActive = activeTypeTab === type.id;
                    return (
                        <TouchableOpacity
                            key={type.id}
                            onPress={() => setActiveTypeTab(type.id)}
                            className={`bg-white border rounded-lg px-3 py-2 mb-1 flex-row items-center mr-3 ${isActive ? 'border-[#4A43EC]' : 'border-gray-100'}`}
                        >
                            <View className="w-8 h-8 bg-[#F4F7FF] rounded-md items-center justify-center mr-2">
                                <Image source={typeIcon} className="w-5 h-5" resizeMode="contain" />
                            </View>
                            <View className="justify-center">
                                <Text className={`font-lato-bold text-[11px] leading-tight ${isActive ? 'text-[#4A43EC]' : 'text-black'}`}>
                                    {type.subType.toUpperCase()}
                                </Text>
                                <Text className={`text-[9px] font-lato-bold uppercase mt-0.5 leading-tight ${isActive ? 'text-[#4A43EC]/80' : 'text-gray-500'}`}>
                                    {type.mainType}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>

            <View className="h-[1px] bg-gray-100 my-2" />

            {/* Active Subtype Configuration */}
            {activeType && (() => {
                const configs = step3.unitConfigs[activeType.id] || [];
                return (
                    <View className="gap-4">
                        <View className="mb-4 z-[60]">
                            <Text className="text-xs font-lato-bold text-gray-500 mb-2.5">Upload Type for {activeType.subType}</Text>
                            <TouchableOpacity
                                onPress={() => setOpenUploadModeDropdown(!openUploadModeDropdown)}
                                className="bg-white border border-gray-200 rounded-xl px-4 h-12 flex-row items-center justify-between"
                            >
                                <Text className="text-sm font-lato-medium text-black">
                                    {uploadModes[activeType.id] === 'bulk' ? 'Bulk upload' : 'Manual'}
                                </Text>
                                <Ionicons name={openUploadModeDropdown ? "chevron-up" : "chevron-down"} size={18} color="#666" />
                            </TouchableOpacity>

                            {openUploadModeDropdown && (
                                <View className="absolute top-[72px] left-0 right-0 bg-white border border-gray-100 rounded-xl shadow-lg z-[61] overflow-hidden">
                                    <TouchableOpacity
                                        onPress={() => {
                                            setUploadModes(prev => ({ ...prev, [activeType.id]: 'manual' }));
                                            setOpenUploadModeDropdown(false);
                                        }}
                                        className={`px-4 py-3 border-b border-gray-50 ${uploadModes[activeType.id] !== 'bulk' ? 'bg-[#F4F7FF]' : ''}`}
                                    >
                                        <Text className={`text-sm font-lato-bold ${uploadModes[activeType.id] !== 'bulk' ? 'text-[#4A43EC]' : 'text-gray-800'}`}>Manual</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => {
                                            setUploadModes(prev => ({ ...prev, [activeType.id]: 'bulk' }));
                                            setOpenUploadModeDropdown(false);
                                        }}
                                        className={`px-4 py-3 ${uploadModes[activeType.id] === 'bulk' ? 'bg-[#F4F7FF]' : ''}`}
                                    >
                                        <Text className={`text-sm font-lato-bold ${uploadModes[activeType.id] === 'bulk' ? 'text-[#4A43EC]' : 'text-gray-800'}`}>Bulk upload</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>

                        {uploadModes[activeType.id] === 'bulk' ? (
                            <View className="bg-[#4A43EC]/5 p-6 rounded-2xl border border-[#4A43EC]/10 items-center justify-center gap-5">
                                <MaterialIcons name="cloud-upload" size={48} color="#4A43EC" opacity={0.5} />
                                <Text className="text-center text-sm font-lato-medium text-gray-600 mb-2">
                                    Download the format, fill in your {activeType.subType} details, and upload the CSV file.
                                </Text>
                                <View className="flex-row gap-3 w-full">
                                    <TouchableOpacity 
                                        onPress={() => handleBulkUpload(activeType)}
                                        className="flex-1 bg-[#4A43EC] h-12 rounded-xl flex-row items-center justify-center gap-2"
                                    >
                                        <MaterialIcons name="file-upload" size={18} color="white" />
                                        <Text className="text-white font-lato-bold text-[11px]">Upload CSV</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity 
                                        onPress={() => handleDownloadFormat(activeType)}
                                        className="flex-1 bg-white border border-gray-200 h-12 rounded-xl flex-row items-center justify-center gap-2"
                                    >
                                        <MaterialIcons name="file-download" size={18} color="#6B7280" />
                                        <Text className="text-gray-500 font-lato-bold text-[11px]">Down format</Text>
                                    </TouchableOpacity>
                                </View>
                                {configs.length > 0 && (
                                    <Text className="text-xs text-green-600 font-lato-bold mt-2">
                                        ✓ {configs.length} units currently added.
                                    </Text>
                                )}
                            </View>
                        ) : (
                            <View className="gap-4">
                                <View className="bg-[#4A43EC]/5 p-4 rounded-2xl border border-[#4A43EC]/10">
                                    <Text className="text-sm font-lato-bold text-black mb-2.5">How many units of this type?</Text>
                                    <View className="bg-white border border-gray-200 rounded-xl px-4 h-14 justify-center">
                                        <TextInput
                                            className="text-base font-lato-medium text-black"
                                            placeholder="eg. 2"
                                            keyboardType="numeric"
                                            value={configs.length.toString()}
                                            onChangeText={(v) => updateQuantity(activeType.id, v)}
                                            style={{ paddingVertical: 0, textAlignVertical: 'center', includeFontPadding: false }}
                                        />
                                    </View>
                                </View>

                                {configs.map((unit, idx) => (
                                    <View key={`${activeType.id}-${idx}`} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                                        <Text className="font-lato-bold text-black text-base mb-5">Unit {idx + 1} Details</Text>
                                        
                                        {activeType.subType === 'apartment' && (
                                    <View className="flex-row gap-4 mb-5">
                                        <View className="flex-1">
                                            <Text className="text-xs font-lato-bold text-gray-500 mb-2">Tower</Text>
                                            <View className="bg-white border border-gray-200 rounded-xl px-4 h-12 justify-center">
                                                <TextInput
                                                    className="text-sm text-gray-800 font-lato-medium"
                                                    placeholder="A"
                                                    value={unit.tower}
                                                    onChangeText={v => updateUnitDetail(activeType.id, idx, 'tower', v)}
                                                    style={{ paddingVertical: 0, textAlignVertical: 'center', includeFontPadding: false }}
                                                />
                                            </View>
                                        </View>
                                        <View className="flex-1">
                                            <Text className="text-xs font-lato-bold text-gray-500 mb-2">Floor</Text>
                                            <View className="bg-white border border-gray-200 rounded-xl px-4 h-12 justify-center">
                                                <TextInput
                                                    className="text-sm text-gray-800 font-lato-medium"
                                                    placeholder="5"
                                                    value={unit.floor}
                                                    onChangeText={v => updateUnitDetail(activeType.id, idx, 'floor', v)}
                                                    style={{ paddingVertical: 0, textAlignVertical: 'center', includeFontPadding: false }}
                                                />
                                            </View>
                                        </View>
                                    </View>
                                )}

                                {(activeType.subType === 'villa' || activeType.subType === 'rowhouse' || activeType.subType === 'apartment') && (
                                    <View className="mb-5">
                                        <Text className="text-xs font-lato-bold text-gray-500 mb-2.5">BHK Type</Text>
                                        <View className="flex-row flex-wrap gap-2.5">
                                            {bhkOptions.map((opt) => (
                                                <TouchableOpacity
                                                    key={opt}
                                                    onPress={() => updateUnitDetail(activeType.id, idx, 'bhk', opt)}
                                                    className={`px-4 py-2 rounded-xl border ${unit.bhk === opt ? 'bg-[#4A43EC] border-[#4A43EC]' : 'bg-white border-gray-200'}`}
                                                >
                                                    <Text className={`text-xs font-lato-bold ${unit.bhk === opt ? 'text-white' : 'text-gray-500'}`}>{opt}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </View>
                                )}

                                {activeType.subType === 'office' && (
                                    <View className="mb-5">
                                        <Text className="text-xs font-lato-bold text-gray-500 mb-2.5">Office Type</Text>
                                        <View className="flex-row flex-wrap gap-2.5">
                                            {officeTypes.map((opt) => (
                                                <TouchableOpacity
                                                    key={opt}
                                                    onPress={() => updateUnitDetail(activeType.id, idx, 'officeType', opt)}
                                                    className={`px-4 py-2 rounded-xl border ${unit.officeType === opt ? 'bg-[#4A43EC] border-[#4A43EC]' : 'bg-white border-gray-200'}`}
                                                >
                                                    <Text className={`text-xs font-lato-bold ${unit.officeType === opt ? 'text-white' : 'text-gray-500'}`}>{opt}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </View>
                                )}

                                <View className="flex-row gap-4 mb-5">
                                    <View className="flex-[3]">
                                        <Text className="text-xs font-lato-bold text-gray-500 mb-2">Area ({unit.areaUnit})</Text>
                                        <View className="bg-white border border-gray-200 rounded-xl px-4 h-12 justify-center">
                                            <TextInput
                                                className="text-sm text-gray-800 font-lato-medium"
                                                placeholder="1200"
                                                keyboardType="numeric"
                                                value={unit.area}
                                                onChangeText={v => updateUnitDetail(activeType.id, idx, 'area', v)}
                                                style={{ paddingVertical: 0, textAlignVertical: 'center', includeFontPadding: false }}
                                            />
                                        </View>
                                    </View>
                                    <View className="flex-[2]">
                                        <Text className="text-xs font-lato-bold text-gray-500 mb-2">Property No.</Text>
                                        <View className="bg-white border border-gray-200 rounded-xl px-4 h-12 justify-center">
                                            <TextInput
                                                className="text-sm text-gray-800 font-lato-medium"
                                                placeholder="A-101"
                                                value={unit.propertyNumber}
                                                onChangeText={v => updateUnitDetail(activeType.id, idx, 'propertyNumber', v)}
                                                style={{ paddingVertical: 0, textAlignVertical: 'center', includeFontPadding: false }}
                                            />
                                        </View>
                                    </View>
                                </View>

                                {activeType.subType === 'apartment' && (
                                    <TouchableOpacity 
                                        onPress={() => updateUnitDetail(activeType.id, idx, 'hasShop', !unit.hasShop)}
                                        className="flex-row items-center gap-3 mb-5 py-1"
                                    >
                                        <View className={`w-5 h-5 rounded-md border items-center justify-center ${unit.hasShop ? 'bg-[#4A43EC] border-[#4A43EC]' : 'bg-white border-gray-300'}`}>
                                            {unit.hasShop && <Ionicons name="checkmark" size={14} color="white" />}
                                        </View>
                                        <Text className="text-[13px] font-lato-medium text-gray-700">Has shop at ground floor?</Text>
                                    </TouchableOpacity>
                                )}

                                {/* Per-Unit Area Unit Dropdown */}
                                <View className="mb-5 z-[50]">
                                    <Text className="text-xs font-lato-bold text-gray-500 mb-2.5">Area Unit</Text>
                                    <TouchableOpacity
                                        onPress={() => setOpenAreaDropdown(openAreaDropdown === `${activeType.id}-${idx}` ? null : `${activeType.id}-${idx}`)}
                                        className="bg-white border border-gray-200 rounded-xl px-4 h-12 flex-row items-center justify-between"
                                    >
                                        <Text className="text-sm font-lato-medium text-black">{unit.areaUnit}</Text>
                                        <Ionicons name={openAreaDropdown === `${activeType.id}-${idx}` ? "chevron-up" : "chevron-down"} size={18} color="#666" />
                                    </TouchableOpacity>

                                    {openAreaDropdown === `${activeType.id}-${idx}` && (
                                        <View className="absolute top-[72px] left-0 right-0 bg-white border border-gray-100 rounded-xl shadow-lg z-[51] overflow-hidden">
                                            <ScrollView nestedScrollEnabled={true} style={{ maxHeight: 200 }}>
                                                {areaUnits.map((u) => (
                                                    <TouchableOpacity
                                                        key={u}
                                                        onPress={() => {
                                                            updateUnitDetail(activeType.id, idx, 'areaUnit', u);
                                                            setOpenAreaDropdown(null);
                                                        }}
                                                        className={`px-4 py-3 border-b border-gray-50 ${unit.areaUnit === u ? 'bg-[#F4F7FF]' : ''}`}
                                                    >
                                                        <Text className={`text-sm font-lato-bold ${unit.areaUnit === u ? 'text-[#4A43EC]' : 'text-gray-800'}`}>
                                                            {u}
                                                        </Text>
                                                    </TouchableOpacity>
                                                ))}
                                            </ScrollView>
                                        </View>
                                    )}
                                </View>

                                {/* Per-Unit Amenities */}
                                <View className="mb-5">
                                    <Text className="text-xs font-lato-bold text-gray-500 mb-2.5">Unit Amenities</Text>
                                    {unit.amenities?.map((amenity, aIdx) => (
                                        <View key={aIdx} className="flex-row gap-3 mb-3">
                                            <View className="flex-1 bg-white border border-gray-200 rounded-xl px-4 h-12 justify-center">
                                                <TextInput
                                                    className="text-sm text-gray-800 font-lato-medium"
                                                    placeholder="eg. Garden Facing"
                                                    value={amenity}
                                                    onChangeText={v => {
                                                        const newAmenities = [...unit.amenities];
                                                        newAmenities[aIdx] = v;
                                                        updateUnitDetail(activeType.id, idx, 'amenities', newAmenities);
                                                    }}
                                                    style={{ paddingVertical: 0, textAlignVertical: 'center', includeFontPadding: false }}
                                                />
                                            </View>
                                            {unit.amenities.length > 1 && (
                                                <TouchableOpacity 
                                                    onPress={() => {
                                                        const newAmenities = unit.amenities.filter((_, i) => i !== aIdx);
                                                        updateUnitDetail(activeType.id, idx, 'amenities', newAmenities);
                                                    }}
                                                    className="w-12 h-12 bg-red-50 rounded-xl items-center justify-center border border-red-100"
                                                >
                                                    <Ionicons name="trash-outline" size={20} color="#EF4444" />
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                    ))}
                                    <TouchableOpacity 
                                        onPress={() => updateUnitDetail(activeType.id, idx, 'amenities', [...(unit.amenities || []), ''])}
                                        className="flex-row items-center py-1"
                                    >
                                        <Ionicons name="add-circle-outline" size={18} color="#4A43EC" />
                                        <Text className="text-xs font-lato-bold text-[#4A43EC] ml-2">Add More Amenity</Text>
                                    </TouchableOpacity>
                                </View>

                                {/* Per-Unit Extra Charges */}
                                <View>
                                    <Text className="text-xs font-lato-bold text-gray-500 mb-2.5">Unit Specific Charges</Text>
                                    {unit.extraCharges?.map((charge, cIdx) => (
                                        <View key={cIdx} className="flex-row gap-3 mb-3">
                                            <View className="flex-[2] bg-white border border-gray-200 rounded-xl px-4 h-12 justify-center">
                                                <TextInput
                                                    className="text-sm text-gray-800 font-lato-medium"
                                                    placeholder="Charge Title"
                                                    value={charge.title}
                                                    onChangeText={v => {
                                                        const newCharges = [...unit.extraCharges];
                                                        newCharges[cIdx] = { ...newCharges[cIdx], title: v };
                                                        updateUnitDetail(activeType.id, idx, 'extraCharges', newCharges);
                                                    }}
                                                    style={{ paddingVertical: 0, textAlignVertical: 'center', includeFontPadding: false }}
                                                />
                                            </View>
                                            <View className="flex-1 bg-white border border-gray-200 rounded-xl px-4 h-12 justify-center">
                                                <TextInput
                                                    className="text-sm text-gray-800 font-lato-medium"
                                                    placeholder="Amount"
                                                    keyboardType="numeric"
                                                    value={charge.amount}
                                                    onChangeText={v => {
                                                        const newCharges = [...unit.extraCharges];
                                                        newCharges[cIdx] = { ...newCharges[cIdx], amount: v };
                                                        updateUnitDetail(activeType.id, idx, 'extraCharges', newCharges);
                                                    }}
                                                    style={{ paddingVertical: 0, textAlignVertical: 'center', includeFontPadding: false }}
                                                />
                                            </View>
                                            {unit.extraCharges.length > 1 && (
                                                <TouchableOpacity 
                                                    onPress={() => {
                                                        const newCharges = unit.extraCharges.filter((_, i) => i !== cIdx);
                                                        updateUnitDetail(activeType.id, idx, 'extraCharges', newCharges);
                                                    }}
                                                    className="w-12 h-12 bg-red-50 rounded-xl items-center justify-center border border-red-100"
                                                >
                                                    <Ionicons name="trash-outline" size={20} color="#EF4444" />
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                    ))}
                                    <TouchableOpacity 
                                        onPress={() => updateUnitDetail(activeType.id, idx, 'extraCharges', [...(unit.extraCharges || []), { title: '', amount: '' }])}
                                        className="flex-row items-center py-1"
                                    >
                                        <Ionicons name="add-circle-outline" size={18} color="#4A43EC" />
                                        <Text className="text-xs font-lato-bold text-[#4A43EC] ml-2">Add Extra Charge</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}
                            </View>
                        )}
                    </View>
                );
            })()}
        </View>
    );
}

// --- Step 4 Component ---
function Step4() {
    const dispatch = useDispatch();
    const { step2, step3, step4 } = useSelector((state) => state.project);
    const [showUnitDropdown, setShowUnitDropdown] = useState(false);
    const priceRef = useRef(null);

    // Generate all units from step3.unitConfigs
    const allUnits = useMemo(() => {
        const units = [];
        step2.selectedTypes.forEach(type => {
            const configs = step3.unitConfigs[type.id] || [];
            configs.forEach((unit, idx) => {
                units.push({
                    id: `${type.id}-${idx}`,
                    typeId: type.id,
                    unitIndex: idx,
                    label: `${unit.propertyNumber || 'N/A'} - Unit ${idx + 1} (${type.subType.toUpperCase()})`,
                    subType: type.subType,
                    mainType: type.mainType,
                    bhk: unit.bhk || unit.officeType || 'Standard'
                });
            });
        });
        return units;
    }, [step2.selectedTypes, step3.unitConfigs]);

    // Initialize first unit if none selected
    useEffect(() => {
        if (!step4.currentSelectedUnitId && allUnits.length > 0) {
            dispatch(updateStep4({ currentSelectedUnitId: allUnits[0].id }));
        }
    }, [allUnits, step4.currentSelectedUnitId]);

    const currentUnitId = step4.currentSelectedUnitId;
    const currentData = step4.unitData[currentUnitId] || {
        images: [],
        documents: [],
        sellingPrice: '',
        priceNegotiable: false,
        taxExclude: false,
        paymentMode: 'full',
        agreed: false,
    };

    const updateField = (field, value) => {
        dispatch(updateStep4({
            unitId: currentUnitId,
            data: { [field]: value }
        }));
    };

    const pickImages = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            quality: 0.8,
        });

        if (!result.canceled) {
            updateField('images', [...currentData.images, ...result.assets]);
        }
    };

    const pickDocuments = async () => {
        const result = await DocumentPicker.getDocumentAsync({
            type: "*/*",
            multiple: true,
        });

        if (!result.canceled) {
            updateField('documents', [...currentData.documents, ...result.assets]);
        }
    };

    const Checkbox = ({ label, value, onValueChange }) => (
        <TouchableOpacity
            className="flex-row items-center gap-3 mb-4"
            onPress={() => onValueChange(!value)}
            activeOpacity={0.7}
        >
            <View
                className="w-5 h-5 rounded border items-center justify-center"
                style={{
                    borderColor: value ? "#4A43EC" : "#D1D5DB",
                    backgroundColor: value ? "#4A43EC" : "white"
                }}
            >
                {value && <Ionicons name="checkmark" size={14} color="white" />}
            </View>
            <Text className="text-xs text-gray-600 font-lato-medium flex-1">{label}</Text>
        </TouchableOpacity>
    );

    const selectedUnit = allUnits.find(u => u.id === currentUnitId);

    if (allUnits.length === 0) {
        return (
            <View className="items-center py-10">
                <Text className="text-gray-400 font-lato text-center px-10">Please add property types and their quantities in the previous steps.</Text>
            </View>
        );
    }

    return (
        <View className="gap-5">
            <Text className="text-base font-lato-bold text-black">Upload Images & Pricing</Text>

            {/* Unit Selector Dropdown */}
            <View className="z-[100]">
                <Text className="text-xs font-lato-bold text-black mb-2">Select Unit to Configure</Text>
                <TouchableOpacity
                    onPress={() => setShowUnitDropdown(!showUnitDropdown)}
                    className="bg-white border border-gray-200 rounded-xl px-4 h-12 flex-row items-center justify-between"
                >
                    <View>
                        <Text className="text-[13px] font-lato-bold text-black">
                            {selectedUnit ? selectedUnit.label : 'Select Unit'}
                        </Text>
                        <Text className="text-[10px] text-gray-500 font-lato">
                            {selectedUnit?.bhk}
                        </Text>
                    </View>
                    <Ionicons name={showUnitDropdown ? "chevron-up" : "chevron-down"} size={20} color="#666" />
                </TouchableOpacity>

                {showUnitDropdown && (
                    <View className="absolute top-[72px] left-0 right-0 bg-white border border-gray-100 rounded-xl shadow-lg z-[101] overflow-hidden max-h-60">
                        <ScrollView nestedScrollEnabled={true}>
                            {allUnits.map((item) => (
                                <TouchableOpacity
                                    key={item.id}
                                    onPress={() => {
                                        dispatch(updateStep4({ currentSelectedUnitId: item.id }));
                                        setShowUnitDropdown(false);
                                    }}
                                    className={`px-4 py-3 border-b border-gray-50 ${currentUnitId === item.id ? 'bg-[#F4F7FF]' : ''}`}
                                >
                                    <Text className={`text-[12px] font-lato-bold ${currentUnitId === item.id ? 'text-[#4A43EC]' : 'text-gray-800'}`}>
                                        {item.label}
                                    </Text>
                                    <Text className="text-[10px] text-gray-500 font-lato mt-0.5">
                                        {item.bhk}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                )}
            </View>

            <View className="h-[1px] bg-gray-100 my-1" />

            {/* Image Upload */}
            <View className="mt-1">
                <Text className="text-xs font-lato-bold text-black mb-2.5">Upload Images for this unit</Text>
                <TouchableOpacity
                    className="bg-[#F4F7FF] border border-dashed border-[#4A43EC]/30 rounded-2xl py-8 items-center justify-center"
                    onPress={pickImages}
                >
                    <View className="w-10 h-10 bg-[#EBEAFF] rounded-full items-center justify-center mb-2.5">
                        <Ionicons name="cloud-upload-outline" size={20} color="#4A43EC" />
                    </View>
                    <Text className="text-xs font-lato-bold text-[#4A43EC]">
                        {currentData.images.length > 0 ? `${currentData.images.length} Photos Added` : "Add atleast 5 Photos"}
                    </Text>
                    <Text className="text-[9px] text-gray-400 font-lato mt-0.5">click from camera or browse to upload</Text>
                </TouchableOpacity>
                {currentData.images.length > 0 && (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3">
                        {currentData.images.map((img, idx) => (
                            <Image key={idx} source={{ uri: img.uri }} className="w-16 h-16 rounded-lg mr-2" />
                        ))}
                    </ScrollView>
                )}
            </View>

            {/* Document Upload */}
            <View>
                <View className="flex-row items-center gap-1 mb-2.5">
                    <Text className="text-xs font-lato-bold text-black">Upload Property Documents</Text>
                    <Text className="text-[9px] text-gray-400 font-lato">(Optional)</Text>
                </View>
                <TouchableOpacity
                    className="bg-[#F4F7FF] border border-dashed border-[#4A43EC]/30 rounded-2xl py-8 items-center justify-center"
                    onPress={pickDocuments}
                >
                    <View className="w-10 h-10 bg-[#EBEAFF] rounded-full items-center justify-center mb-2.5">
                        <Ionicons name="document-text-outline" size={20} color="#4A43EC" />
                    </View>
                    <Text className="text-xs font-lato-bold text-[#4A43EC]">
                        {currentData.documents.length > 0 ? `${currentData.documents.length} Documents Added` : "Upload Documents"}
                    </Text>
                    <Text className="text-[9px] text-gray-400 font-lato mt-0.5">click from camera or browse to upload</Text>
                </TouchableOpacity>
            </View>

            {/* Price Section */}
            <View className="mt-1">
                <Text className="text-xs font-lato-bold text-black mb-2.5">Selling Price</Text>
                <Pressable onPress={() => priceRef.current?.focus()} className="flex-row bg-white border border-gray-200 rounded-xl px-4 h-12 items-center">
                    <Text className="text-base font-lato-bold text-gray-500 mr-2">₹</Text>
                    <TextInput
                        ref={priceRef}
                        className="flex-1 text-[13px] font-lato-bold text-black"
                        placeholder="0.00"
                        placeholderTextColor="#9CA3AF"
                        keyboardType="numeric"
                        value={currentData.sellingPrice}
                        onChangeText={(v) => updateField('sellingPrice', v)}
                        style={{ paddingVertical: 0, textAlignVertical: 'center', includeFontPadding: false }}
                    />
                </Pressable>
            </View>

            {/* Checkboxes */}
            <View>
                <Checkbox
                    label="Price Negotiable"
                    value={currentData.priceNegotiable}
                    onValueChange={(v) => updateField('priceNegotiable', v)}
                />
                <Checkbox
                    label="Tax and Govt. charges exclude"
                    value={currentData.taxExclude}
                    onValueChange={(v) => updateField('taxExclude', v)}
                />
            </View>

            {/* Payment Mode */}
            <View>
                <Text className="text-xs font-lato-bold text-black mb-3">Preferred Payment Mode</Text>
                <View className="flex-row gap-3">
                    <TouchableOpacity
                        onPress={() => updateField('paymentMode', 'full')}
                        className={`flex-1 py-2.5 rounded-full border items-center ${currentData.paymentMode === 'full' ? 'bg-[#EBEAFF] border-[#4A43EC]' : 'bg-white border-gray-200'}`}
                    >
                        <Text className={`text-[10px] font-lato-bold ${currentData.paymentMode === 'full' ? 'text-[#4A43EC]' : 'text-gray-500'}`}>Full Payment</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => updateField('paymentMode', 'emi')}
                        className={`flex-1 py-2.5 rounded-full border items-center ${currentData.paymentMode === 'emi' ? 'bg-[#EBEAFF] border-[#4A43EC]' : 'bg-white border-gray-200'}`}
                    >
                        <Text className={`text-[10px] font-lato-bold ${currentData.paymentMode === 'emi' ? 'text-[#4A43EC]' : 'text-gray-500'}`}>EMI/ Loan Available</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Agreement */}
            <View className="mt-2">
                <Text className="text-xs font-lato-bold text-black mb-3">Agreement & Submission</Text>
                <Checkbox
                    label="I confirm that the provided details are accurate and that I am the legal owner or have the right to list this property for sale."
                    value={currentData.agreed}
                    onValueChange={(v) => updateField('agreed', v)}
                />
            </View>
        </View>
    );
}
