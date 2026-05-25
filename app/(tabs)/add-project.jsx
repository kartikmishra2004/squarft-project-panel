import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    Image,
    Dimensions,
    TextInput,
    Platform,
    Pressable,
    Keyboard,
    TouchableWithoutFeedback,
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
    updateBuilderData,
    updateStep4,
    bulkUploadSubtype,
    resetForm,
} from "../../store/slices/projectSlice";
import { addProject } from "../../store/slices/projectsSlice";
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

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

const ANDROID_KEYBOARD_EXTRA_SCROLL = 72;
const ANDROID_KEYBOARD_EXTRA_HEIGHT = 240;
const IOS_KEYBOARD_EXTRA_SCROLL = 40;
const IOS_KEYBOARD_EXTRA_HEIGHT = 66;
const ANDROID_CONTENT_BOTTOM_PADDING = 180;
const IOS_CONTENT_BOTTOM_PADDING = 140;
const RANGE_BASED_SUB_TYPES = new Set(["plot", "villa", "rowhouse"]);

export default function AddProject() {
    const dispatch = useDispatch();
    const { currentStep, step1, step2, step3, step4 } = useSelector((state) => state.project);
    const scrollRef = useRef(null);
    const [step1Errors, setStep1Errors] = useState({});

    useEffect(() => {
        scrollRef.current?.scrollToPosition?.(0, 0, false);
        scrollRef.current?.scrollTo?.({ y: 0, animated: false });
    }, [currentStep]);

    const validateStep1Fields = (values) => {
        const errors = {};

        if (!values.projectName || values.projectName.trim().length < 3) {
            errors.projectName = 'Project name must be at least 3 characters';
        }

        if (!values.location || values.location.trim().length === 0) {
            errors.location = 'Location is required';
        }

        if (!values.city || values.city.trim().length === 0) {
            errors.city = 'City is required';
        }

        if (!values.state || values.state.trim().length === 0) {
            errors.state = 'State is required';
        }

        if (!values.pincode || !/^[0-9]{5,6}$/.test(values.pincode.trim())) {
            errors.pincode = 'Enter a valid pincode (5-6 digits)';
        }

        const nameValidator = (v) => v && v.trim().length >= 2;
        if (!nameValidator(values.salesOfficerName)) {
            errors.salesOfficerName = 'Enter sales officer name';
        }
        if (!/^[0-9]{10}$/.test((values.salesOfficerContact || '').trim())) {
            errors.salesOfficerContact = 'Enter a valid 10-digit contact number';
        }

        if (!nameValidator(values.responsiblePersonName)) {
            errors.responsiblePersonName = 'Enter responsible person name';
        }
        if (!/^[0-9]{10}$/.test((values.responsiblePersonContact || '').trim())) {
            errors.responsiblePersonContact = 'Enter a valid 10-digit contact number';
        }

        return { valid: Object.keys(errors).length === 0, errors };
    };

    const handleNext = () => {
        if (currentStep === 1) {
            const { valid, errors } = validateStep1Fields(step1);
            if (!valid) {
                setStep1Errors(errors);
                return;
            }
            setStep1Errors({});
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
                        ...step4.unitData[unit.unitId || `${type.id}-${idx}`]
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
            return !validateStep1Fields(step1).valid;
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
                        <KeyboardAwareScrollView
                            innerRef={(ref) => {
                                scrollRef.current = ref;
                            }}
                            className="flex-1 px-5 pt-6"
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={{
                                paddingBottom: Platform.OS === "android" ? ANDROID_CONTENT_BOTTOM_PADDING : IOS_CONTENT_BOTTOM_PADDING,
                                flexGrow: 1,
                            }}
                            keyboardShouldPersistTaps="handled"
                            keyboardDismissMode="on-drag"
                            enableOnAndroid
                            extraScrollHeight={Platform.OS === "android" ? ANDROID_KEYBOARD_EXTRA_SCROLL : IOS_KEYBOARD_EXTRA_SCROLL}
                            extraHeight={Platform.OS === "android" ? ANDROID_KEYBOARD_EXTRA_HEIGHT : IOS_KEYBOARD_EXTRA_HEIGHT}
                            viewIsInsideTabBar={Platform.OS === "android"}
                            enableAutomaticScroll
                            keyboardOpeningTime={250}
                            enableResetScrollToCoords={false}
                            nestedScrollEnabled={Platform.OS === "android"}
                        >
                            <View>
                                {currentStep === 1 && <Step1 errors={step1Errors} setErrors={setStep1Errors} />}
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
                            </View>
                        </KeyboardAwareScrollView>
                    </View>
                </View>
    );
}

// --- Step 1 Component ---
function Step1({ errors = {}, setErrors }) {
    const dispatch = useDispatch();
    const { step1 } = useSelector((state) => state.project);
    const updateField = (field, value) => {
        dispatch(updateStep1({ [field]: value }));
        if (setErrors) {
            setErrors(prev => {
                if (!prev) return {};
                const copy = { ...prev };
                delete copy[field];
                return copy;
            });
        }
    };
    const projectNameRef = useRef(null);
    const locationRef = useRef(null);
    const cityRef = useRef(null);
    const stateRef = useRef(null);
    const pincodeRef = useRef(null);
    const salesNameRef = useRef(null);
    const salesContactRef = useRef(null);
    const respNameRef = useRef(null);
    const respContactRef = useRef(null);


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
                {errors.projectName && (
                    <Text className="text-[11px] text-red-500 mt-1">{errors.projectName}</Text>
                )}
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
                {errors.location && (
                    <Text className="text-[11px] text-red-500 mt-1">{errors.location}</Text>
                )}
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
                    {errors.city && (
                        <Text className="text-[11px] text-red-500 mt-1">{errors.city}</Text>
                    )}
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
                    {errors.state && (
                        <Text className="text-[11px] text-red-500 mt-1">{errors.state}</Text>
                    )}
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
                    {errors.pincode && (
                        <Text className="text-[11px] text-red-500 mt-1">{errors.pincode}</Text>
                    )}
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
                {errors.salesOfficerName && (
                    <Text className="text-[11px] text-red-500 mt-1">{errors.salesOfficerName}</Text>
                )}
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
                </Pressable>
                {errors.salesOfficerContact && (
                    <Text className="text-[11px] text-red-500 mt-1">{errors.salesOfficerContact}</Text>
                )}
            </View>
            

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
                {errors.responsiblePersonName && (
                    <Text className="text-[11px] text-red-500 mt-1">{errors.responsiblePersonName}</Text>
                )}
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
                </Pressable>
                {errors.responsiblePersonContact && (
                    <Text className="text-[11px] text-red-500 mt-1">{errors.responsiblePersonContact}</Text>
                )}
            </View>
            
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

// --- Project Engine Helper ---
const getDefaultBuilderState = (subType) => {
    let secName = 'Tower A';
    let rCount = 8;
    let cCount = 4;

    if (RANGE_BASED_SUB_TYPES.has(subType)) {
        secName = 'A';
        rCount = 1;
        cCount = 4;
    } else if (subType === 'apartment') {
        secName = 'Tower A';
        rCount = 8;
        cCount = 4;
    } else {
        secName = 'Section 1';
        rCount = 4;
        cCount = 6;
    }

    return {
        sections: [
            {
                id: 1,
                name: secName,
                floors: rCount,
                rows: rCount,
                lanes: rCount,
                unitsPerFloor: cCount,
                plotsPerRow: cCount,
                villasPerLane: cCount,
                configs: [], // No variants by default
                unitMap: {}, // No units assigned by default
                rowUnitCounts: {},
                unitOverrides: {}
            }
        ],
        activeSectionId: 1,
        activeConfigId: null, // No active config by default
        gridMode: 'paint', // 'paint' | 'edit'
        selectedUnitKey: null
    };
};

// --- Step 3 Component ---
function Step3() {
    const dispatch = useDispatch();
    const { step2, step3 } = useSelector((state) => state.project);
    const { width } = Dimensions.get('window');
    
    // Use the first selected type as the default active tab if available
    const [activeTypeTab, setActiveTypeTab] = useState(step2.selectedTypes[0]?.id);
    const [uploadModes, setUploadModes] = useState({}); // { [typeId]: 'manual' | 'bulk' }
    const [openUploadModeDropdown, setOpenUploadModeDropdown] = useState(false);
    const [openGridModeDropdown, setOpenGridModeDropdown] = useState(false);

    // Keep active tab valid if types are removed
    useEffect(() => {
        if (step2.selectedTypes.length > 0 && !step2.selectedTypes.find(t => t.id === activeTypeTab)) {
            setActiveTypeTab(step2.selectedTypes[0].id);
        }
    }, [step2.selectedTypes, activeTypeTab]);

    const activeType = step2.selectedTypes.find(t => t.id === activeTypeTab) || step2.selectedTypes[0];

    // Initialize builder data if not present
    useEffect(() => {
        if (activeType && !step3.builderData?.[activeType.id]) {
            dispatch(updateBuilderData({
                typeId: activeType.id,
                subType: activeType.subType,
                builderState: getDefaultBuilderState(activeType.subType)
            }));
        }
    }, [activeType, step3.builderData]);

    const builderState = step3.builderData?.[activeType?.id] || (activeType ? getDefaultBuilderState(activeType.subType) : null);

    const handleUpdateBuilder = (updater) => {
        if (!activeType) return;
        const currentState = step3.builderData?.[activeType.id] || getDefaultBuilderState(activeType.subType);
        const newState = updater(currentState);
        dispatch(updateBuilderData({
            typeId: activeType.id,
            subType: activeType.subType,
            builderState: newState
        }));
    };

    const handleSetActiveSection = (secId) => {
        handleUpdateBuilder(prev => ({ ...prev, activeSectionId: secId, selectedUnitKey: null }));
    };

    const handleAddSection = () => {
        handleUpdateBuilder(prev => {
            const newId = (prev.sections[prev.sections.length - 1]?.id || 0) + 1;
            let newSecName = '';
            if (RANGE_BASED_SUB_TYPES.has(activeType.subType)) {
                newSecName = String.fromCharCode(64 + newId);
            } else if (activeType.subType === 'apartment') {
                newSecName = `Tower ${String.fromCharCode(64 + newId)}`;
            } else {
                newSecName = `Section ${newId}`;
            }
            const newSection = {
                id: newId,
                name: newSecName,
                floors: prev.sections[0]?.floors ?? 5,
                rows: prev.sections[0]?.rows ?? 5,
                lanes: prev.sections[0]?.lanes ?? 5,
                unitsPerFloor: prev.sections[0]?.unitsPerFloor ?? 4,
                plotsPerRow: prev.sections[0]?.plotsPerRow ?? 4,
                villasPerLane: prev.sections[0]?.villasPerLane ?? 4,
                configs: prev.sections[0]?.configs ? JSON.parse(JSON.stringify(prev.sections[0].configs)) : [],
                unitMap: {},
                rowUnitCounts: prev.sections[0]?.rowUnitCounts ? JSON.parse(JSON.stringify(prev.sections[0].rowUnitCounts)) : {},
                unitOverrides: {}
            };
            
            if (newSection.configs.length > 0) {
                const rCount = newSection.floors;
                const cCount = newSection.unitsPerFloor;
                for (let r = 1; r <= rCount; r++) {
                    for (let c = 1; c <= cCount; c++) {
                        newSection.unitMap[`${r}_${c}`] = newSection.configs[0].id;
                    }
                }
            }

            return {
                ...prev,
                sections: [...prev.sections, newSection],
                activeSectionId: newId,
                selectedUnitKey: null
            };
        });
    };

    const handleUpdateDimensions = (field, value) => {
        const parsed = parseInt(value);
        const val = isNaN(parsed) ? 0 : parsed;
        handleUpdateBuilder(prev => ({
            ...prev,
            sections: prev.sections.map(sec => {
                if (sec.id !== prev.activeSectionId) return sec;
                const updated = { ...sec, [field]: val };
                if (field === 'floors') { updated.rows = val; updated.lanes = val; }
                if (field === 'rows') { updated.floors = val; updated.lanes = val; }
                if (field === 'lanes') { updated.floors = val; updated.rows = val; }
                if (field === 'unitsPerFloor') { updated.plotsPerRow = val; updated.villasPerLane = val; }
                if (field === 'plotsPerRow') { updated.unitsPerFloor = val; updated.villasPerLane = val; }
                if (field === 'villasPerLane') { updated.unitsPerFloor = val; updated.plotsPerRow = val; }
                return updated;
            })
        }));
    };

    const handleUpdateSectionName = (name) => {
        handleUpdateBuilder(prev => ({
            ...prev,
            sections: prev.sections.map(sec => sec.id === prev.activeSectionId ? { ...sec, name } : sec)
        }));
    };

    const handleRemoveSection = (secId) => {
        handleUpdateBuilder(prev => {
            if (prev.sections.length <= 1) return prev;
            const remaining = prev.sections.filter(s => s.id !== secId);
            return {
                ...prev,
                sections: remaining,
                activeSectionId: prev.activeSectionId === secId ? remaining[0].id : prev.activeSectionId,
                selectedUnitKey: null
            };
        });
    };

    const handleSetActiveConfig = (cfgId) => {
        handleUpdateBuilder(prev => ({ ...prev, activeConfigId: cfgId }));
    };

    const handleAddConfig = () => {
        handleUpdateBuilder(prev => {
            const activeSec = prev.sections.find(s => s.id === prev.activeSectionId);
            if (!activeSec) return prev;
            const shouldApplyAllRanges = RANGE_BASED_SUB_TYPES.has(activeType?.subType);
            const newCfgId = 'cfg_' + Date.now();
            const colors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6'];
            const nextColor = colors[activeSec.configs.length % colors.length];
            const newCfg = {
                id: newCfgId,
                type: '',
                name: '',
                area: '',
                price: '',
                color: nextColor,
                images: [],
                brochure: null,
                amenities: ['']
            };
            return {
                ...prev,
                sections: prev.sections.map(sec => {
                    if (!shouldApplyAllRanges && sec.id !== prev.activeSectionId) return sec;
                    return { ...sec, configs: [...sec.configs, JSON.parse(JSON.stringify(newCfg))] };
                }),
                activeConfigId: newCfgId
            };
        });
    };

    const handleRemoveConfig = (cfgId) => {
        handleUpdateBuilder(prev => {
            const activeSec = prev.sections.find(s => s.id === prev.activeSectionId);
            if (!activeSec) return prev;
            const shouldApplyAllRanges = RANGE_BASED_SUB_TYPES.has(activeType?.subType);
            const targetSectionIds = shouldApplyAllRanges ? prev.sections.map(sec => sec.id) : [prev.activeSectionId];

            const remainingConfigs = activeSec.configs.filter(c => c.id !== cfgId);

            return {
                ...prev,
                sections: prev.sections.map(sec => {
                    if (!targetSectionIds.includes(sec.id)) return sec;
                    const secRemainingConfigs = sec.configs.filter(c => c.id !== cfgId);
                    const newUnitMap = { ...sec.unitMap };
                    Object.keys(newUnitMap).forEach(key => {
                        if (newUnitMap[key] === cfgId) {
                            delete newUnitMap[key];
                        }
                    });
                    return {
                        ...sec,
                        configs: secRemainingConfigs,
                        unitMap: newUnitMap
                    };
                }),
                activeConfigId: prev.activeConfigId === cfgId ? (remainingConfigs[0]?.id || null) : prev.activeConfigId
            };
        });
    };

    const handleUpdateConfigField = (cfgId, field, value) => {
        handleUpdateBuilder(prev => ({
            ...prev,
            sections: prev.sections.map(sec => {
                if (!RANGE_BASED_SUB_TYPES.has(activeType?.subType) && sec.id !== prev.activeSectionId) return sec;
                return {
                    ...sec,
                    configs: sec.configs.map(c => c.id === cfgId ? { ...c, [field]: value } : c)
                };
            })
        }));
    };

    const handleAddAmenity = (cfgId) => {
        const config = activeSection?.configs?.find(c => c.id === cfgId);
        if (!config) return;
        handleUpdateConfigField(cfgId, 'amenities', [...(config.amenities || ['']), '']);
    };

    const handleUpdateAmenity = (cfgId, index, value) => {
        const config = activeSection?.configs?.find(c => c.id === cfgId);
        if (!config) return;
        const amenities = [...(config.amenities || [''])];
        amenities[index] = value;
        handleUpdateConfigField(cfgId, 'amenities', amenities);
    };

    const handleRemoveAmenity = (cfgId, index) => {
        const config = activeSection?.configs?.find(c => c.id === cfgId);
        if (!config) return;
        const amenities = [...(config.amenities || [''])];
        amenities.splice(index, 1);
        handleUpdateConfigField(cfgId, 'amenities', amenities.length > 0 ? amenities : ['']);
    };

    const handlePickVariantImages = async (cfgId) => {
        const config = activeSection?.configs?.find(c => c.id === cfgId);
        if (!config) return;

        const currentImages = config.images || [];
        if (currentImages.length >= 5) {
            alert('You can add up to 5 images for each variant.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            selectionLimit: 5 - currentImages.length,
            quality: 0.8,
        });

        if (!result.canceled) {
            const nextImages = [...currentImages, ...result.assets.map(asset => asset.uri)].slice(0, 5);
            handleUpdateConfigField(cfgId, 'images', nextImages);
        }
    };

    const handleRemoveVariantImage = (cfgId, imageUri) => {
        const config = activeSection?.configs?.find(c => c.id === cfgId);
        if (!config) return;
        const nextImages = (config.images || []).filter(uri => uri !== imageUri);
        handleUpdateConfigField(cfgId, 'images', nextImages);
    };

    const handlePickVariantBrochure = async (cfgId) => {
        const config = activeSection?.configs?.find(c => c.id === cfgId);
        if (!config) return;

        const result = await DocumentPicker.getDocumentAsync({
            type: [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            ],
            multiple: false,
            copyToCacheDirectory: true
        });

        if (!result.canceled && result.assets?.[0]) {
            const brochure = result.assets[0];
            handleUpdateConfigField(cfgId, 'brochure', {
                name: brochure.name || 'Brochure',
                uri: brochure.uri,
                mimeType: brochure.mimeType || '',
                size: brochure.size || 0,
            });
        }
    };

    const handleRemoveVariantBrochure = (cfgId) => {
        handleUpdateConfigField(cfgId, 'brochure', null);
    };

    const handleCellClick = (key, sectionId) => {
        handleUpdateBuilder(prev => {
            const targetSectionId = sectionId || prev.activeSectionId;
            const targetSec = prev.sections.find(s => s.id === targetSectionId);
            if (!targetSec) return prev;
            const selectedKey = `${targetSectionId}:${key}`;

            if (prev.gridMode === 'paint') {
                if (!prev.activeConfigId) {
                    alert("Please add and select a variant first before assigning units.");
                    return prev;
                }
                const newMap = { ...targetSec.unitMap };
                if (newMap[key] === prev.activeConfigId) {
                    delete newMap[key];
                } else {
                    newMap[key] = prev.activeConfigId;
                }
                return {
                    ...prev,
                    activeSectionId: targetSectionId,
                    sections: prev.sections.map(sec => sec.id === targetSectionId ? { ...sec, unitMap: newMap } : sec)
                };
            } else {
                if (!targetSec.unitMap?.[key]) {
                    alert("Please assign a base variant to this unit in 'Assign Variants' mode before customizing.");
                    return prev;
                }
                return {
                    ...prev,
                    activeSectionId: targetSectionId,
                    selectedUnitKey: selectedKey
                };
            }
        });
    };

    const handleSelectAll = () => {
        handleUpdateBuilder(prev => {
            if (!prev.activeConfigId) {
                alert("Please add and select a variant first before assigning units.");
                return prev;
            }

            const shouldApplyAllRanges = RANGE_BASED_SUB_TYPES.has(activeType?.subType);
            const targetSectionIds = shouldApplyAllRanges
                ? prev.sections.map(sec => sec.id)
                : [prev.activeSectionId];

            return {
                ...prev,
                sections: prev.sections.map(sec => {
                    if (!targetSectionIds.includes(sec.id)) return sec;
                    const rows = sec.floors ?? sec.rows ?? sec.lanes ?? 1;
                    const cols = sec.unitsPerFloor ?? sec.plotsPerRow ?? sec.villasPerLane ?? 1;
                    const newMap = {};
                    for (let r = 1; r <= rows; r++) {
                        const rowCols = sec.rowUnitCounts?.[r] ?? cols;
                        for (let c = 1; c <= rowCols; c++) {
                            newMap[`${r}_${c}`] = prev.activeConfigId;
                        }
                    }
                    return { ...sec, unitMap: newMap };
                })
            };
        });
    };

    const handleClearAll = () => {
        handleUpdateBuilder(prev => {
            const shouldApplyAllRanges = RANGE_BASED_SUB_TYPES.has(activeType?.subType);
            const targetSectionIds = shouldApplyAllRanges
                ? prev.sections.map(sec => sec.id)
                : [prev.activeSectionId];

            return {
                ...prev,
                selectedUnitKey: shouldApplyAllRanges ? null : prev.selectedUnitKey,
                sections: prev.sections.map(sec => {
                    if (!targetSectionIds.includes(sec.id)) return sec;
                    return { ...sec, unitMap: {} };
                })
            };
        });
    };

    const handleAdjustRowUnits = (rowNumber, delta, sectionId) => {
        handleUpdateBuilder(prev => {
            const targetSectionId = sectionId || prev.activeSectionId;
            const activeSec = prev.sections.find(s => s.id === targetSectionId);
            if (!activeSec) return prev;

            const defaultCount = activeSec.unitsPerFloor ?? activeSec.plotsPerRow ?? activeSec.villasPerLane ?? 1;
            const currentCount = activeSec.rowUnitCounts?.[rowNumber] ?? defaultCount;
            const nextCount = Math.max(1, currentCount + delta);
            if (nextCount === currentCount) return prev;

            const nextRowUnitCounts = { ...(activeSec.rowUnitCounts || {}) };
            if (nextCount === defaultCount) {
                delete nextRowUnitCounts[rowNumber];
            } else {
                nextRowUnitCounts[rowNumber] = nextCount;
            }

            const nextUnitMap = { ...(activeSec.unitMap || {}) };
            const nextOverrides = { ...(activeSec.unitOverrides || {}) };
            Object.keys(nextUnitMap).forEach(key => {
                const [rowValue, colValue] = key.split('_').map(Number);
                if (rowValue === rowNumber && colValue > nextCount) {
                    delete nextUnitMap[key];
                }
            });
            Object.keys(nextOverrides).forEach(key => {
                const [rowValue, colValue] = key.split('_').map(Number);
                if (rowValue === rowNumber && colValue > nextCount) {
                    delete nextOverrides[key];
                }
            });

            const selectedUnitKey = prev.selectedUnitKey && (() => {
                const [selectedSectionId, selectedCellKey] = prev.selectedUnitKey.includes(':')
                    ? prev.selectedUnitKey.split(':')
                    : [String(prev.activeSectionId), prev.selectedUnitKey];

                if (parseInt(selectedSectionId, 10) !== targetSectionId) {
                    return prev.selectedUnitKey;
                }

                const [rowValue, colValue] = selectedCellKey.split('_').map(Number);
                return rowValue === rowNumber && colValue > nextCount ? null : prev.selectedUnitKey;
            })();

            return {
                ...prev,
                selectedUnitKey,
                sections: prev.sections.map(sec => sec.id === targetSectionId ? {
                    ...sec,
                    rowUnitCounts: nextRowUnitCounts,
                    unitMap: nextUnitMap,
                    unitOverrides: nextOverrides,
                } : sec)
            };
        });
    };

    const handleUpdateOverride = (compositeKey, field, value) => {
        handleUpdateBuilder(prev => {
            const [sectionIdRaw, key] = compositeKey.includes(':')
                ? compositeKey.split(':')
                : [String(prev.activeSectionId), compositeKey];
            const sectionId = parseInt(sectionIdRaw, 10);
            const activeSec = prev.sections.find(s => s.id === sectionId);
            if (!activeSec) return prev;
            const currentOverrides = { ...activeSec.unitOverrides };
            const unitOverride = { ...(currentOverrides[key] || {}) };
            unitOverride[field] = value;
            currentOverrides[key] = unitOverride;
            return {
                ...prev,
                sections: prev.sections.map(sec => sec.id === sectionId ? { ...sec, unitOverrides: currentOverrides } : sec)
            };
        });
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

    const activeSection = builderState?.sections?.find(s => s.id === builderState.activeSectionId) || builderState?.sections?.[0];
    const activeConfig = activeSection?.configs?.find(c => c.id === builderState?.activeConfigId) || activeSection?.configs?.[0];
    const configsList = step3.unitConfigs[activeType?.id] || [];
    const getRowUnitCount = (section, rowNumber) => section?.rowUnitCounts?.[rowNumber] ?? (section?.unitsPerFloor ?? section?.plotsPerRow ?? section?.villasPerLane ?? 1);
    const sectionsForGrid = RANGE_BASED_SUB_TYPES.has(activeType?.subType)
        ? (builderState?.sections || [])
        : (activeSection ? [activeSection] : []);

    return (
        <View className="gap-6">
            <Text className="text-base font-lato-bold text-black">Configure Units (Project Engine)</Text>

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

            <View className="h-[1px] bg-gray-100 my-1" />

            {/* Upload Mode Switcher */}
            {activeType && (
                <View className="gap-4">
                    <View className="z-[60]">
                        <Text className="text-xs font-lato-bold text-gray-500 mb-2.5">Configuration Mode for {activeType.subType}</Text>
                        <TouchableOpacity
                            onPress={() => setOpenUploadModeDropdown(!openUploadModeDropdown)}
                            className="bg-white border border-gray-200 rounded-xl px-4 h-12 flex-row items-center justify-between"
                        >
                            <Text className="text-sm font-lato-medium text-black">
                                {uploadModes[activeType.id] === 'bulk' ? 'Bulk upload (CSV)' : 'Visual Builder (Project Engine)'}
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
                                    <Text className={`text-sm font-lato-bold ${uploadModes[activeType.id] !== 'bulk' ? 'text-[#4A43EC]' : 'text-gray-800'}`}>Visual Builder (Project Engine)</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => {
                                        setUploadModes(prev => ({ ...prev, [activeType.id]: 'bulk' }));
                                        setOpenUploadModeDropdown(false);
                                    }}
                                    className={`px-4 py-3 ${uploadModes[activeType.id] === 'bulk' ? 'bg-[#F4F7FF]' : ''}`}
                                >
                                    <Text className={`text-sm font-lato-bold ${uploadModes[activeType.id] === 'bulk' ? 'text-[#4A43EC]' : 'text-gray-800'}`}>Bulk upload (CSV)</Text>
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
                            {configsList.length > 0 && (
                                <Text className="text-xs text-green-600 font-lato-bold mt-2">
                                    ✓ {configsList.length} units currently added.
                                </Text>
                            )}
                        </View>
                    ) : (
                        <View className="gap-6">
                            {/* Section Management Header */}
                            {builderState && activeSection && (
                                <View className="gap-4">
                                    <View className="flex-row items-center justify-between">
                                        <Text className="text-sm font-lato-bold text-black">
                                            {RANGE_BASED_SUB_TYPES.has(activeType.subType)
                                                ? 'Range Types & Property Count'
                                                : (activeType.subType === 'apartment' ? 'Towers / Buildings' : 'Sections / Divisions')}
                                        </Text>
                                        <TouchableOpacity 
                                            onPress={handleAddSection}
                                            className="flex-row items-center bg-[#F4F7FF] border border-[#4A43EC]/30 px-3 py-1.5 rounded-full gap-1"
                                        >
                                            <Ionicons name="add-circle-outline" size={16} color="#4A43EC" />
                                            <Text className="text-[#4A43EC] text-xs font-lato-bold">
                                                Add {RANGE_BASED_SUB_TYPES.has(activeType.subType) ? 'Range' : (activeType.subType === 'apartment' ? 'Tower' : 'Section')}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>

                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
                                        {builderState.sections.map(sec => (
                                            <TouchableOpacity
                                                key={sec.id}
                                                onPress={() => handleSetActiveSection(sec.id)}
                                                className={`px-4 py-2 rounded-xl border flex-row items-center gap-2 mr-2 ${sec.id === builderState.activeSectionId ? 'bg-[#4A43EC] border-[#4A43EC]' : 'bg-white border-gray-200'}`}
                                            >
                                                <Text className={`text-xs font-lato-bold ${sec.id === builderState.activeSectionId ? 'text-white' : 'text-gray-700'}`}>
                                                    {sec.name}
                                                </Text>
                                                {builderState.sections.length > 1 && (
                                                    <TouchableOpacity onPress={() => handleRemoveSection(sec.id)} className="p-0.5">
                                                        <Ionicons name="close-circle" size={16} color={sec.id === builderState.activeSectionId ? "white" : "#9CA3AF"} />
                                                    </TouchableOpacity>
                                                )}
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>

                                    {/* Active Section Settings Card */}
                                    <View className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm gap-4">
                                        <View>
                                            <Text className="text-xs font-lato-bold text-gray-500 mb-2">
                                                {RANGE_BASED_SUB_TYPES.has(activeType.subType)
                                                    ? 'Range Type (A, B, C...)'
                                                    : (activeType.subType === 'apartment' ? 'Tower Name' : 'Section Name')}
                                            </Text>
                                            <View className="bg-white border border-gray-200 rounded-xl px-4 h-12 justify-center">
                                                <TextInput
                                                    className="text-sm text-gray-800 font-lato-medium"
                                                    value={activeSection.name}
                                                    onChangeText={handleUpdateSectionName}
                                                    style={{ paddingVertical: 0, textAlignVertical: 'center', includeFontPadding: false }}
                                                />
                                            </View>
                                        </View>

                                        {RANGE_BASED_SUB_TYPES.has(activeType.subType) ? (
                                            <View>
                                                <Text className="text-xs font-lato-bold text-gray-500 mb-2">No. of Properties in this Range</Text>
                                                <View className="bg-white border border-gray-200 rounded-xl px-4 h-12 justify-center">
                                                    <TextInput
                                                        className="text-sm text-gray-800 font-lato-medium"
                                                        keyboardType="numeric"
                                                        value={(activeSection.unitsPerFloor ?? activeSection.plotsPerRow ?? activeSection.villasPerLane ?? 0).toString()}
                                                        onChangeText={v => handleUpdateDimensions(activeType.subType === 'plot' ? 'plotsPerRow' : (activeType.subType === 'villa' || activeType.subType === 'rowhouse' ? 'villasPerLane' : 'unitsPerFloor'), v)}
                                                        style={{ paddingVertical: 0, textAlignVertical: 'center', includeFontPadding: false }}
                                                    />
                                                </View>
                                            </View>
                                        ) : (
                                            <View className="flex-row gap-4">
                                                <View className="flex-1">
                                                    <Text className="text-xs font-lato-bold text-gray-500 mb-2">
                                                        {activeType.subType === 'plot' ? 'Number of Rows' : (activeType.subType === 'villa' || activeType.subType === 'rowhouse' ? 'Number of Lanes' : 'Number of Floors')}
                                                    </Text>
                                                    <View className="bg-white border border-gray-200 rounded-xl px-4 h-12 justify-center">
                                                        <TextInput
                                                            className="text-sm text-gray-800 font-lato-medium"
                                                            keyboardType="numeric"
                                                            value={(activeSection.floors ?? activeSection.rows ?? activeSection.lanes ?? 0).toString()}
                                                            onChangeText={v => handleUpdateDimensions(activeType.subType === 'plot' ? 'rows' : (activeType.subType === 'villa' || activeType.subType === 'rowhouse' ? 'lanes' : 'floors'), v)}
                                                            style={{ paddingVertical: 0, textAlignVertical: 'center', includeFontPadding: false }}
                                                        />
                                                    </View>
                                                </View>
                                                <View className="flex-1">
                                                    <Text className="text-xs font-lato-bold text-gray-500 mb-2">
                                                        {activeType.subType === 'plot' ? 'Plots per Row' : (activeType.subType === 'villa' || activeType.subType === 'rowhouse' ? 'Villas per Lane' : 'Units per Floor')}
                                                    </Text>
                                                    <View className="bg-white border border-gray-200 rounded-xl px-4 h-12 justify-center">
                                                        <TextInput
                                                            className="text-sm text-gray-800 font-lato-medium"
                                                            keyboardType="numeric"
                                                            value={(activeSection.unitsPerFloor ?? activeSection.plotsPerRow ?? activeSection.villasPerLane ?? 0).toString()}
                                                            onChangeText={v => handleUpdateDimensions(activeType.subType === 'plot' ? 'plotsPerRow' : (activeType.subType === 'villa' || activeType.subType === 'rowhouse' ? 'villasPerLane' : 'unitsPerFloor'), v)}
                                                            style={{ paddingVertical: 0, textAlignVertical: 'center', includeFontPadding: false }}
                                                        />
                                                    </View>
                                                </View>
                                            </View>
                                        )}
                                    </View>

                                    {/* Variant Configs Section */}
                                    <View className="gap-4 mt-2">
                                        <View className="flex-row items-center justify-between">
                                            <Text className="text-sm font-lato-bold text-black">Define Variant Types & Pricing</Text>
                                            <TouchableOpacity 
                                                onPress={handleAddConfig}
                                                className="flex-row items-center bg-[#F4F7FF] border border-[#4A43EC]/30 px-3 py-1.5 rounded-full gap-1"
                                            >
                                                <Ionicons name="add-circle-outline" size={16} color="#4A43EC" />
                                                <Text className="text-[#4A43EC] text-xs font-lato-bold">Add Variant</Text>
                                            </TouchableOpacity>
                                        </View>

                                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-3">
                                            {activeSection.configs?.length === 0 && (
                                                <View className="bg-gray-50 border border-dashed border-gray-300 rounded-2xl p-4 mr-3 w-48 opacity-60">
                                                    <View className="flex-row items-center gap-1.5 mb-2">
                                                        <View className="w-3 h-3 rounded-full bg-gray-400" />
                                                        <Text className="text-xs font-lato-bold text-gray-500">Example: 2 BHK</Text>
                                                    </View>
                                                    <Text className="text-[11px] text-gray-400 font-lato-medium mb-2">Standard</Text>
                                                    <View className="flex-row items-center justify-between border-t border-gray-200 pt-2 mt-1">
                                                        <Text className="text-[11px] font-lato-bold text-gray-400">1150 {activeType.subType === 'plot' ? 'sqyd' : 'sqft'}</Text>
                                                        <Text className="text-[11px] font-lato-bold text-gray-400">₹65,00,000</Text>
                                                    </View>
                                                </View>
                                            )}

                                            {activeSection.configs?.map(cfg => (
                                                <TouchableOpacity
                                                    key={cfg.id}
                                                    onPress={() => handleSetActiveConfig(cfg.id)}
                                                    className={`bg-white border rounded-xl p-3 mb-1 mr-3 w-40 shadow-xs ${cfg.id === builderState.activeConfigId ? 'border-[#4A43EC] bg-[#F4F7FF]/50' : 'border-gray-200'}`}
                                                >
                                                    <View className="flex-row items-center justify-between mb-1.5">
                                                        <View className="flex-row items-center gap-1.5 flex-1 mr-1">
                                                            <View className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cfg.color || '#3B82F6' }} />
                                                            <Text className="text-xs font-lato-bold text-gray-800" numberOfLines={1}>
                                                                {cfg.type || (activeType.subType === 'office' ? 'New Office' : (activeType.subType === 'plot' ? 'New Plot' : 'New Variant'))}
                                                            </Text>
                                                        </View>
                                                        <View className="flex-row items-center gap-1">
                                                            {cfg.id === builderState.activeConfigId && (
                                                                <View className="bg-[#4A43EC] rounded-full p-0.5">
                                                                    <Ionicons name="checkmark" size={10} color="white" />
                                                                </View>
                                                            )}
                                                            <TouchableOpacity onPress={() => handleRemoveConfig(cfg.id)} className="p-0.5">
                                                                <Ionicons name="close-circle" size={16} color="#EF4444" />
                                                            </TouchableOpacity>
                                                        </View>
                                                    </View>
                                                    <Text className="text-[10px] text-gray-500 font-lato-medium mb-1.5" numberOfLines={1}>{cfg.name || 'Unnamed'}</Text>
                                                    <View className="flex-row items-center justify-between border-t border-gray-100 pt-1.5 mt-0.5">
                                                        <Text className="text-[10px] font-lato-bold text-gray-700">{cfg.area ? `${cfg.area} ${activeType.subType === 'plot' ? 'sqyd' : 'sqft'}` : '0 sqft'}</Text>
                                                        <Text className="text-[10px] font-lato-bold text-[#4A43EC]">{cfg.price ? `₹${cfg.price}` : '₹0'}</Text>
                                                    </View>
                                                </TouchableOpacity>
                                            ))}
                                        </ScrollView>

                                        {/* Edit Active Config Form */}
                                        {activeConfig && (
                                            <View className="bg-[#F4F7FF]/40 border border-[#4A43EC]/20 rounded-3xl p-5 gap-4">
                                                <Text className="text-xs font-lato-bold text-[#4A43EC]">
                                                    Edit Active Variant: {activeConfig.type || 'New Variant'}
                                                </Text>
                                                <View className="flex-row gap-4">
                                                    <View className="flex-1">
                                                        <Text className="text-[11px] font-lato-bold text-gray-500 mb-1.5">Category / Type</Text>
                                                        <View className="bg-white border border-gray-200 rounded-xl px-3 h-11 justify-center">
                                                            <TextInput
                                                                className="text-xs text-gray-800 font-lato-medium"
                                                                placeholder={activeType.subType === 'office' ? 'eg. Co-working' : (activeType.subType === 'plot' ? 'eg. Standard Plot' : 'eg. 2 BHK')}
                                                                placeholderTextColor="#9CA3AF"
                                                                value={activeConfig.type}
                                                                onChangeText={v => handleUpdateConfigField(activeConfig.id, 'type', v)}
                                                                style={{ paddingVertical: 0, textAlignVertical: 'center', includeFontPadding: false }}
                                                            />
                                                        </View>
                                                    </View>
                                                    <View className="flex-1">
                                                        <Text className="text-[11px] font-lato-bold text-gray-500 mb-1.5">Variant Name</Text>
                                                        <View className="bg-white border border-gray-200 rounded-xl px-3 h-11 justify-center">
                                                            <TextInput
                                                                className="text-xs text-gray-800 font-lato-medium"
                                                                placeholder="eg. Standard / Premium"
                                                                placeholderTextColor="#9CA3AF"
                                                                value={activeConfig.name}
                                                                onChangeText={v => handleUpdateConfigField(activeConfig.id, 'name', v)}
                                                                style={{ paddingVertical: 0, textAlignVertical: 'center', includeFontPadding: false }}
                                                            />
                                                        </View>
                                                    </View>
                                                </View>

                                                <View className="gap-3">
                                                    <View className="flex-row items-center justify-between">
                                                        <Text className="text-[11px] font-lato-bold text-gray-500">Variant Images</Text>
                                                        <TouchableOpacity
                                                            onPress={() => handlePickVariantImages(activeConfig.id)}
                                                            className="px-3 py-1.5 rounded-full bg-white border border-[#4A43EC]/20"
                                                        >
                                                            <Text className="text-[10px] font-lato-bold text-[#4A43EC]">Add Images</Text>
                                                        </TouchableOpacity>
                                                    </View>

                                                    <Text className="text-[10px] text-gray-500 font-lato-medium px-1">
                                                        Add up to 5 images for this variant.
                                                    </Text>

                                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
                                                        {(activeConfig.images || []).map((uri) => (
                                                            <View key={uri} className="mr-2 relative">
                                                                <View className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-100 border border-gray-200">
                                                                    <Image source={{ uri }} className="w-full h-full" resizeMode="cover" />
                                                                </View>
                                                                <TouchableOpacity
                                                                    onPress={() => handleRemoveVariantImage(activeConfig.id, uri)}
                                                                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/70 items-center justify-center"
                                                                >
                                                                    <Ionicons name="close" size={12} color="white" />
                                                                </TouchableOpacity>
                                                            </View>
                                                        ))}

                                                        {(activeConfig.images || []).length < 5 && (
                                                            <TouchableOpacity
                                                                onPress={() => handlePickVariantImages(activeConfig.id)}
                                                                className="w-20 h-20 rounded-2xl border border-dashed border-[#4A43EC]/40 bg-[#F4F7FF] items-center justify-center mr-2"
                                                            >
                                                                <Ionicons name="add" size={22} color="#4A43EC" />
                                                                <Text className="text-[9px] font-lato-bold text-[#4A43EC] mt-1">Add</Text>
                                                            </TouchableOpacity>
                                                        )}
                                                    </ScrollView>
                                                </View>

                                                <View className="gap-3">
                                                    <View className="flex-row items-center justify-between">
                                                        <Text className="text-[11px] font-lato-bold text-gray-500">Brochure Document</Text>
                                                        <TouchableOpacity
                                                            onPress={() => handlePickVariantBrochure(activeConfig.id)}
                                                            className="px-3 py-1.5 rounded-full bg-white border border-[#4A43EC]/20"
                                                        >
                                                            <Text className="text-[10px] font-lato-bold text-[#4A43EC]">
                                                                {activeConfig.brochure?.uri ? 'Replace Brochure' : 'Upload Brochure'}
                                                            </Text>
                                                        </TouchableOpacity>
                                                    </View>

                                                    {activeConfig.brochure?.uri ? (
                                                        <View className="flex-row items-center justify-between bg-white border border-gray-200 rounded-xl px-3 py-3">
                                                            <View className="flex-row items-center flex-1 mr-3">
                                                                <View className="w-8 h-8 rounded-lg bg-[#F4F7FF] items-center justify-center mr-2">
                                                                    <Ionicons name="document-text-outline" size={16} color="#4A43EC" />
                                                                </View>
                                                                <Text className="text-[11px] font-lato-medium text-gray-700 flex-1" numberOfLines={1}>
                                                                    {activeConfig.brochure.name || 'Brochure'}
                                                                </Text>
                                                            </View>
                                                            <TouchableOpacity
                                                                onPress={() => handleRemoveVariantBrochure(activeConfig.id)}
                                                                className="w-8 h-8 rounded-lg bg-red-50 border border-red-100 items-center justify-center"
                                                            >
                                                                <Ionicons name="trash-outline" size={14} color="#EF4444" />
                                                            </TouchableOpacity>
                                                        </View>
                                                    ) : (
                                                        <TouchableOpacity
                                                            onPress={() => handlePickVariantBrochure(activeConfig.id)}
                                                            className="bg-white border border-dashed border-[#4A43EC]/35 rounded-xl px-3 py-3 flex-row items-center"
                                                        >
                                                            <View className="w-8 h-8 rounded-lg bg-[#F4F7FF] items-center justify-center mr-2">
                                                                <Ionicons name="attach-outline" size={16} color="#4A43EC" />
                                                            </View>
                                                            <Text className="text-[11px] font-lato-medium text-gray-600">
                                                                Add brochure (PDF/DOC)
                                                            </Text>
                                                        </TouchableOpacity>
                                                    )}
                                                </View>

                                                <View className="gap-3">
                                                    <View className="flex-row items-center justify-between">
                                                        <Text className="text-[11px] font-lato-bold text-gray-500">Amenities</Text>
                                                        <TouchableOpacity
                                                            onPress={() => handleAddAmenity(activeConfig.id)}
                                                            className="px-3 py-1.5 rounded-full bg-white border border-[#4A43EC]/20"
                                                        >
                                                            <Text className="text-[10px] font-lato-bold text-[#4A43EC]">Add Amenity</Text>
                                                        </TouchableOpacity>
                                                    </View>

                                                    {(activeConfig.amenities || ['']).map((amenity, index) => (
                                                        <View key={`${activeConfig.id}-amenity-${index}`} className="flex-row items-center gap-2">
                                                            <View className="flex-1 bg-white border border-gray-200 rounded-xl px-3 h-11 justify-center">
                                                                <TextInput
                                                                    className="text-xs text-gray-800 font-lato-medium"
                                                                    placeholder="Add amenity"
                                                                    value={amenity}
                                                                    onChangeText={(v) => handleUpdateAmenity(activeConfig.id, index, v)}
                                                                    style={{ paddingVertical: 0, textAlignVertical: 'center', includeFontPadding: false }}
                                                                />
                                                            </View>
                                                            {(activeConfig.amenities || ['']).length > 1 && (
                                                                <TouchableOpacity
                                                                    onPress={() => handleRemoveAmenity(activeConfig.id, index)}
                                                                    className="w-10 h-11 rounded-xl bg-red-50 border border-red-100 items-center justify-center"
                                                                >
                                                                    <Ionicons name="trash-outline" size={16} color="#EF4444" />
                                                                </TouchableOpacity>
                                                            )}
                                                        </View>
                                                    ))}
                                                </View>

                                                <View className="flex-row gap-4">
                                                    <View className="flex-1">
                                                        <Text className="text-[11px] font-lato-bold text-gray-500 mb-1.5">Area ({activeType.subType === 'plot' ? 'sqyd' : 'sqft'})</Text>
                                                        <View className="bg-white border border-gray-200 rounded-xl px-3 h-11 justify-center">
                                                            <TextInput
                                                                className="text-xs text-gray-800 font-lato-medium"
                                                                placeholder={activeType.subType === 'plot' ? 'eg. 150' : 'eg. 1150'}
                                                                placeholderTextColor="#9CA3AF"
                                                                keyboardType="numeric"
                                                                value={activeConfig.area}
                                                                onChangeText={v => handleUpdateConfigField(activeConfig.id, 'area', v)}
                                                                style={{ paddingVertical: 0, textAlignVertical: 'center', includeFontPadding: false }}
                                                            />
                                                        </View>
                                                    </View>
                                                    <View className="flex-1">
                                                        <Text className="text-[11px] font-lato-bold text-gray-500 mb-1.5">Selling Price (₹)</Text>
                                                        <View className="bg-white border border-gray-200 rounded-xl px-3 h-11 justify-center">
                                                            <TextInput
                                                                className="text-xs text-gray-800 font-lato-medium"
                                                                placeholder="eg. 6500000"
                                                                placeholderTextColor="#9CA3AF"
                                                                keyboardType="numeric"
                                                                value={activeConfig.price}
                                                                onChangeText={v => handleUpdateConfigField(activeConfig.id, 'price', v)}
                                                                style={{ paddingVertical: 0, textAlignVertical: 'center', includeFontPadding: false }}
                                                            />
                                                        </View>
                                                    </View>
                                                </View>
                                            </View>
                                        )}
                                    </View>

                                    {/* Grid Mode Switcher & Visual Grid */}
                                    <View className="gap-4 mt-2">
                                        <View className="flex-row items-center justify-between z-40">
                                            <View className="flex-1 mr-4">
                                                <Text className="text-xs font-lato-bold text-gray-700 mb-1">Matrix Interaction Mode</Text>
                                                <Text className="text-[11px] font-lato text-gray-400">Choose whether to paint variants or edit individual unit overrides</Text>
                                            </View>
                                            
                                            <View className="relative w-48">
                                                <TouchableOpacity
                                                    onPress={() => setOpenGridModeDropdown(!openGridModeDropdown)}
                                                    className="flex-row items-center justify-between bg-white border border-gray-200 rounded-xl px-3 py-2.5 shadow-sm"
                                                >
                                                    <View className="flex-row items-center gap-2">
                                                        <Ionicons name={builderState.gridMode === 'paint' ? "color-palette-outline" : "create-outline"} size={16} color="#4A43EC" />
                                                        <Text className="text-xs font-lato-bold text-[#4A43EC]">
                                                            {builderState.gridMode === 'paint' ? 'Paint Grid' : 'Edit Overrides'}
                                                        </Text>
                                                    </View>
                                                    <Ionicons name={openGridModeDropdown ? "chevron-up" : "chevron-down"} size={16} color="#4A43EC" />
                                                </TouchableOpacity>

                                                {openGridModeDropdown && (
                                                    <View className="absolute top-12 left-0 right-0 bg-white border border-gray-100 rounded-xl shadow-lg shadow-gray-200 py-1.5 z-50">
                                                        <TouchableOpacity
                                                            onPress={() => {
                                                                handleUpdateBuilder(prev => ({ ...prev, gridMode: 'paint', selectedUnitKey: null }));
                                                                setOpenGridModeDropdown(false);
                                                            }}
                                                            className="px-4 py-2.5 hover:bg-gray-50 flex-row items-center justify-between"
                                                        >
                                                            <View className="flex-row items-center gap-2">
                                                                <Ionicons name="color-palette-outline" size={16} color="#4A43EC" />
                                                                <Text className="text-xs font-lato-medium text-gray-800">Paint Grid</Text>
                                                            </View>
                                                            {builderState.gridMode === 'paint' && <Ionicons name="checkmark-circle" size={16} color="#4A43EC" />}
                                                        </TouchableOpacity>
                                                        <TouchableOpacity
                                                            onPress={() => {
                                                                handleUpdateBuilder(prev => ({ ...prev, gridMode: 'edit' }));
                                                                setOpenGridModeDropdown(false);
                                                            }}
                                                            className="px-4 py-2.5 hover:bg-gray-50 flex-row items-center justify-between border-t border-gray-50"
                                                        >
                                                            <View className="flex-row items-center gap-2">
                                                                <Ionicons name="create-outline" size={16} color="#4A43EC" />
                                                                <Text className="text-xs font-lato-medium text-gray-800">Edit Overrides</Text>
                                                            </View>
                                                            {builderState.gridMode === 'edit' && <Ionicons name="checkmark-circle" size={16} color="#4A43EC" />}
                                                        </TouchableOpacity>
                                                    </View>
                                                )}
                                            </View>
                                        </View>

                                        {builderState.gridMode === 'paint' ? (
                                            <View className="gap-3">
                                                <View className="flex-row items-center justify-between px-1">
                                                    <Text className="text-xs font-lato-bold text-gray-500">
                                                        Click units below to assign: <Text className="text-[#4A43EC]">{activeConfig?.type}</Text>
                                                    </Text>
                                                    <View className="flex-row gap-2">
                                                        <TouchableOpacity onPress={handleSelectAll} className="px-3 py-1 bg-[#F4F7FF] border border-[#4A43EC]/20 rounded-lg">
                                                            <Text className="text-[10px] font-lato-bold text-[#4A43EC]">Select All</Text>
                                                        </TouchableOpacity>
                                                        <TouchableOpacity onPress={handleClearAll} className="px-3 py-1 bg-red-50 border border-red-100 rounded-lg">
                                                            <Text className="text-[10px] font-lato-bold text-red-500">Clear All</Text>
                                                        </TouchableOpacity>
                                                    </View>
                                                </View>

                                                <View className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm gap-4 overflow-hidden">
                                                    {sectionsForGrid.map((section) => {
                                                        const rows = section.floors ?? section.rows ?? section.lanes ?? 1;
                                                        const rowsArr = Array.from({ length: rows }, (_, i) => activeType.subType === 'plot' ? i + 1 : rows - i);

                                                        return (
                                                            <View key={`paint-section-${section.id}`} className="gap-3">
                                                                {rowsArr.map(r => (
                                                                    <View key={`${section.id}-${r}`} className="flex-row items-center gap-3">
                                                                        <View className="w-16 h-16 bg-[#F8FAFC] border border-gray-200 rounded-2xl items-center justify-center shadow-xs">
                                                                            <Text className="text-xs font-lato-bold text-gray-700 uppercase tracking-wider">
                                                                                {RANGE_BASED_SUB_TYPES.has(activeType.subType)
                                                                                    ? `RANGE ${section.name}`
                                                                                    : (activeType.subType === 'plot' ? `ROW ${r}` : (activeType.subType === 'villa' || activeType.subType === 'rowhouse' ? `LANE ${r}` : `FL ${r}`))}
                                                                            </Text>
                                                                            <Text className="text-[9px] font-lato-bold text-gray-400 mt-1">
                                                                                {getRowUnitCount(section, r)} units
                                                                            </Text>
                                                                        </View>

                                                                        <View className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs">
                                                                            <TouchableOpacity
                                                                                onPress={() => handleAdjustRowUnits(r, 1, section.id)}
                                                                                className="w-10 h-8 items-center justify-center border-b border-gray-100"
                                                                            >
                                                                                <Ionicons name="add" size={16} color="#4A43EC" />
                                                                            </TouchableOpacity>
                                                                            <TouchableOpacity
                                                                                onPress={() => handleAdjustRowUnits(r, -1, section.id)}
                                                                                className="w-10 h-8 items-center justify-center"
                                                                            >
                                                                                <Ionicons name="remove" size={16} color="#EF4444" />
                                                                            </TouchableOpacity>
                                                                        </View>

                                                                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-1 flex-row gap-3">
                                                                            {Array.from({ length: getRowUnitCount(section, r) }, (_, i) => i + 1).map(c => {
                                                                                const key = `${r}_${c}`;
                                                                                const assignedCfgId = section.unitMap?.[key];
                                                                                const assignedCfg = section.configs?.find(cfg => cfg.id === assignedCfgId);
                                                                                const override = section.unitOverrides?.[key] || {};
                                                                                const displayNum = `${r}${c.toString().padStart(2, '0')}`;
                                                                                const label = override.customName || displayNum;
                                                                                const hasOverride = override.customName || override.customArea || override.customPrice;

                                                                                return (
                                                                                    <TouchableOpacity
                                                                                        key={`${section.id}-${key}`}
                                                                                        onPress={() => handleCellClick(key, section.id)}
                                                                                        style={{
                                                                                            backgroundColor: assignedCfg ? assignedCfg.color : '#FFFFFF',
                                                                                            borderColor: assignedCfg ? assignedCfg.color : '#CBD5E1',
                                                                                            borderWidth: assignedCfg ? 0 : 1.5,
                                                                                            borderStyle: assignedCfg ? 'solid' : 'dashed'
                                                                                        }}
                                                                                        className="w-28 h-16 rounded-2xl items-center justify-center mr-3 relative overflow-hidden shadow-xs"
                                                                                    >
                                                                                        <Text className={`text-xs font-lato-bold ${assignedCfg ? 'text-white' : 'text-gray-400'}`} numberOfLines={1}>
                                                                                            {label}
                                                                                        </Text>
                                                                                        {assignedCfg ? (
                                                                                            <>
                                                                                                <Text className="text-[10px] font-lato-bold text-white/95 mt-0.5" numberOfLines={1}>
                                                                                                    {assignedCfg.type}
                                                                                                </Text>
                                                                                                <Text className="text-[9px] font-lato-bold text-white/85 uppercase tracking-wider mt-0.5" numberOfLines={1}>
                                                                                                    {assignedCfg.name}
                                                                                                </Text>
                                                                                            </>
                                                                                        ) : (
                                                                                            <Text className="text-[9px] font-lato text-gray-300 mt-1 uppercase" numberOfLines={1}>
                                                                                                Unassigned
                                                                                            </Text>
                                                                                        )}

                                                                                        {hasOverride && (
                                                                                            <View className="absolute top-0 right-0 w-4 h-4 bg-[#F59E0B] rounded-bl-lg items-center justify-center shadow-xs">
                                                                                                <Ionicons name="star" size={9} color="white" />
                                                                                            </View>
                                                                                        )}
                                                                                    </TouchableOpacity>
                                                                                );
                                                                            })}
                                                                        </ScrollView>
                                                                    </View>
                                                                ))}
                                                            </View>
                                                        );
                                                    })}

                                                    {/* Bottom Foundation Bar */}
                                                    <View className="bg-[#E2E8F0] h-6 rounded-xl mt-2 border border-gray-300 shadow-xs" />
                                                </View>
                                            </View>
                                        ) : (
                                            <View className="gap-4">
                                                <Text className="text-xs font-lato-bold text-gray-500 px-1">
                                                    Click any unit on the grid below to customize its specific price, area, or property number.
                                                </Text>

                                                <View className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm gap-4 overflow-hidden">
                                                    {sectionsForGrid.map((section) => {
                                                        const rows = section.floors ?? section.rows ?? section.lanes ?? 1;
                                                        const rowsArr = Array.from({ length: rows }, (_, i) => activeType.subType === 'plot' ? i + 1 : rows - i);

                                                        return (
                                                            <View key={`edit-section-${section.id}`} className="gap-3">
                                                                {rowsArr.map(r => (
                                                                    <View key={`${section.id}-${r}`} className="flex-row items-center gap-3">
                                                                        <View className="w-16 h-16 bg-[#F8FAFC] border border-gray-200 rounded-2xl items-center justify-center shadow-xs">
                                                                            <Text className="text-xs font-lato-bold text-gray-700 uppercase tracking-wider">
                                                                                {RANGE_BASED_SUB_TYPES.has(activeType.subType)
                                                                                    ? `RANGE ${section.name}`
                                                                                    : (activeType.subType === 'plot' ? `ROW ${r}` : (activeType.subType === 'villa' || activeType.subType === 'rowhouse' ? `LANE ${r}` : `FL ${r}`))}
                                                                            </Text>
                                                                            <Text className="text-[9px] font-lato-bold text-gray-400 mt-1">
                                                                                {getRowUnitCount(section, r)} units
                                                                            </Text>
                                                                        </View>

                                                                        <View className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs">
                                                                            <TouchableOpacity
                                                                                onPress={() => handleAdjustRowUnits(r, 1, section.id)}
                                                                                className="w-10 h-8 items-center justify-center border-b border-gray-100"
                                                                            >
                                                                                <Ionicons name="add" size={16} color="#4A43EC" />
                                                                            </TouchableOpacity>
                                                                            <TouchableOpacity
                                                                                onPress={() => handleAdjustRowUnits(r, -1, section.id)}
                                                                                className="w-10 h-8 items-center justify-center"
                                                                            >
                                                                                <Ionicons name="remove" size={16} color="#EF4444" />
                                                                            </TouchableOpacity>
                                                                        </View>

                                                                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-1 flex-row gap-3">
                                                                            {Array.from({ length: getRowUnitCount(section, r) }, (_, i) => i + 1).map(c => {
                                                                                const key = `${r}_${c}`;
                                                                                const compositeKey = `${section.id}:${key}`;
                                                                                const isSelected = builderState.selectedUnitKey === compositeKey;
                                                                                const assignedCfgId = section.unitMap?.[key];
                                                                                const assignedCfg = section.configs?.find(cfg => cfg.id === assignedCfgId);
                                                                                const override = section.unitOverrides?.[key] || {};
                                                                                const displayNum = `${r}${c.toString().padStart(2, '0')}`;
                                                                                const label = override.customName || displayNum;
                                                                                const hasOverride = override.customName || override.customArea || override.customPrice;

                                                                                return (
                                                                                    <TouchableOpacity
                                                                                        key={`${section.id}-${key}`}
                                                                                        onPress={() => handleCellClick(key, section.id)}
                                                                                        style={{
                                                                                            backgroundColor: isSelected ? '#4A43EC' : (assignedCfg ? assignedCfg.color : '#FFFFFF'),
                                                                                            borderColor: isSelected ? '#000000' : (assignedCfg ? assignedCfg.color : '#CBD5E1'),
                                                                                            borderWidth: isSelected ? 3 : (assignedCfg ? 0 : 1.5),
                                                                                            borderStyle: assignedCfg || isSelected ? 'solid' : 'dashed'
                                                                                        }}
                                                                                        className="w-28 h-16 rounded-2xl items-center justify-center mr-3 relative overflow-hidden shadow-xs"
                                                                                    >
                                                                                        <Text className={`text-xs font-lato-bold ${assignedCfg || isSelected ? 'text-white' : 'text-gray-400'}`} numberOfLines={1}>
                                                                                            {label}
                                                                                        </Text>
                                                                                        {assignedCfg ? (
                                                                                            <>
                                                                                                <Text className="text-[10px] font-lato-bold text-white/95 mt-0.5" numberOfLines={1}>
                                                                                                    {assignedCfg.type}
                                                                                                </Text>
                                                                                                <Text className="text-[9px] font-lato-bold text-white/90 uppercase tracking-wider mt-0.5" numberOfLines={1}>
                                                                                                    {override.customPrice ? `₹${override.customPrice}` : `₹${assignedCfg.price}`}
                                                                                                </Text>
                                                                                            </>
                                                                                        ) : (
                                                                                            <Text className="text-[9px] font-lato text-gray-300 mt-1 uppercase" numberOfLines={1}>
                                                                                                Unassigned
                                                                                            </Text>
                                                                                        )}

                                                                                        {hasOverride && (
                                                                                            <View className="absolute top-0 right-0 w-4 h-4 bg-[#F59E0B] rounded-bl-lg items-center justify-center shadow-xs">
                                                                                                <Ionicons name="star" size={9} color="white" />
                                                                                            </View>
                                                                                        )}
                                                                                    </TouchableOpacity>
                                                                                );
                                                                            })}
                                                                        </ScrollView>
                                                                    </View>
                                                                ))}
                                                            </View>
                                                        );
                                                    })}

                                                    {/* Bottom Foundation Bar */}
                                                    <View className="bg-[#E2E8F0] h-6 rounded-xl mt-2 border border-gray-300 shadow-xs" />
                                                </View>

                                                {/* Selected Unit Override Card */}
                                                {builderState.selectedUnitKey && (() => {
                                                    const [sectionIdRaw, key] = builderState.selectedUnitKey.includes(':')
                                                        ? builderState.selectedUnitKey.split(':')
                                                        : [String(builderState.activeSectionId), builderState.selectedUnitKey];
                                                    const selectedSection = builderState.sections.find(sec => sec.id === parseInt(sectionIdRaw, 10));
                                                    if (!selectedSection) return null;

                                                    const [r, c] = key.split('_');
                                                    const assignedCfgId = selectedSection.unitMap?.[key];
                                                    const assignedCfg = selectedSection.configs?.find(cfg => cfg.id === assignedCfgId) || {};
                                                    const override = selectedSection.unitOverrides?.[key] || {};
                                                    const displayNum = `${r}${c.padStart(2, '0')}`;
                                                    const defaultPropNum = RANGE_BASED_SUB_TYPES.has(activeType.subType)
                                                        ? `${selectedSection.name || 'A'}-${c}`
                                                        : displayNum;
                                                    const selectedCompositeKey = `${selectedSection.id}:${key}`;

                                                    return (
                                                        <View className="bg-white border border-[#4A43EC] rounded-3xl p-6 shadow-md gap-4">
                                                            <View className="flex-row items-center justify-between border-b border-gray-100 pb-3">
                                                                <View>
                                                                    <Text className="text-sm font-lato-bold text-black">Customize Unit: {override.customName || defaultPropNum}</Text>
                                                                    <Text className="text-xs text-gray-500 font-lato mt-0.5">{RANGE_BASED_SUB_TYPES.has(activeType.subType) ? `Range ${selectedSection.name} • ` : ''}Base Variant: {assignedCfg.type || 'Unassigned'}</Text>
                                                                </View>
                                                                <TouchableOpacity onPress={() => handleUpdateBuilder(prev => ({ ...prev, selectedUnitKey: null }))}>
                                                                    <Ionicons name="close-circle" size={24} color="#9CA3AF" />
                                                                </TouchableOpacity>
                                                            </View>

                                                            <View className="gap-4">
                                                                <View>
                                                                    <Text className="text-xs font-lato-bold text-gray-500 mb-1.5">Custom Property Number</Text>
                                                                    <View className="bg-white border border-gray-200 rounded-xl px-4 h-12 justify-center">
                                                                        <TextInput
                                                                            className="text-sm text-gray-800 font-lato-medium"
                                                                            placeholder={defaultPropNum}
                                                                            value={override.customName || ''}
                                                                            onChangeText={v => handleUpdateOverride(selectedCompositeKey, 'customName', v)}
                                                                            style={{ paddingVertical: 0, textAlignVertical: 'center', includeFontPadding: false }}
                                                                        />
                                                                    </View>
                                                                </View>

                                                                <View className="flex-row gap-4">
                                                                    <View className="flex-1">
                                                                        <Text className="text-xs font-lato-bold text-gray-500 mb-1.5">Custom Area</Text>
                                                                        <View className="bg-white border border-gray-200 rounded-xl px-4 h-12 justify-center">
                                                                            <TextInput
                                                                                className="text-sm text-gray-800 font-lato-medium"
                                                                                placeholder={assignedCfg.area || '0'}
                                                                                keyboardType="numeric"
                                                                                value={override.customArea || ''}
                                                                                onChangeText={v => handleUpdateOverride(selectedCompositeKey, 'customArea', v)}
                                                                                style={{ paddingVertical: 0, textAlignVertical: 'center', includeFontPadding: false }}
                                                                            />
                                                                        </View>
                                                                    </View>
                                                                    <View className="flex-1">
                                                                        <Text className="text-xs font-lato-bold text-gray-500 mb-1.5">Custom Price (₹)</Text>
                                                                        <View className="bg-white border border-gray-200 rounded-xl px-4 h-12 justify-center">
                                                                            <TextInput
                                                                                className="text-sm text-gray-800 font-lato-medium"
                                                                                placeholder={assignedCfg.price || '0'}
                                                                                keyboardType="numeric"
                                                                                value={override.customPrice || ''}
                                                                                onChangeText={v => handleUpdateOverride(selectedCompositeKey, 'customPrice', v)}
                                                                                style={{ paddingVertical: 0, textAlignVertical: 'center', includeFontPadding: false }}
                                                                            />
                                                                        </View>
                                                                    </View>
                                                                </View>
                                                            </View>
                                                        </View>
                                                    );
                                                })()}
                                            </View>
                                        )}
                                    </View>

                                    {/* Summary Banner at Bottom */}
                                    <View className="bg-green-50 border border-green-200 rounded-2xl p-4 flex-row items-center gap-3 mt-4">
                                        <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                                        <View className="flex-1">
                                            <Text className="text-xs font-lato-bold text-green-800">
                                                ✓ {configsList.length} units successfully generated & synced.
                                            </Text>
                                            <Text className="text-[10px] text-green-600 font-lato mt-0.5">
                                                Project Engine automatically maintains data structure for Step 4.
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            )}
                        </View>
                    )}
                </View>
            )}
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
                    id: unit.unitId || `${type.id}-${idx}`,
                    typeId: type.id,
                    unitIndex: idx,
                    label: `${unit.propertyNumber || 'N/A'} - ${unit.gridKey || `Unit ${idx + 1}`} (${type.subType.toUpperCase()})`,
                    subType: type.subType,
                    mainType: type.mainType,
                    bhk: unit.bhk || unit.officeType || 'Standard',
                    price: unit.price || '',
                    images: unit.images || [],
                    area: unit.area || '',
                });
            });
        });
        return units;
    }, [step2.selectedTypes, step3.unitConfigs]);

    // Initialize first unit if none selected
    useEffect(() => {
        if (allUnits.length === 0) return;
        const selectedExists = allUnits.some(unit => unit.id === step4.currentSelectedUnitId);
        if (!selectedExists) {
            dispatch(updateStep4({ currentSelectedUnitId: allUnits[0].id }));
        }
    }, [allUnits, step4.currentSelectedUnitId]);

    const currentUnitId = step4.currentSelectedUnitId;
    const currentSelectedUnit = allUnits.find(unit => unit.id === currentUnitId);
    const currentData = step4.unitData[currentUnitId] || {
        images: currentSelectedUnit?.images || [],
        documents: [],
        sellingPrice: currentSelectedUnit?.price || '',
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
