import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    currentStep: 1,
    step1: {
        projectName: '',
        location: '',
        city: '',
        state: '',
        pincode: '',
        salesOfficerName: '',
        salesOfficerContact: '',
        salesOfficerOtp: ['', '', '', ''],
        responsiblePersonName: '',
        responsiblePersonContact: '',
        responsiblePersonOtp: ['', '', '', ''],
        salesVerified: false,
        responsibleVerified: false,
        salesOtpSent: false,
        responsibleOtpSent: false,
        salesOtpError: false,
        responsibleOtpError: false,
    },
    step2: {
        selectedTypes: [], // Array of objects matching the hierarchy
    },
    step3: {
        unitConfigs: {}, // Keyed by typeId, value is array of unit detail objects
    },
    step4: {
        unitData: {}, // Keyed by unique unit ID (e.g. "typeId-unitIndex")
        currentSelectedUnitId: null,
    },
};

const projectSlice = createSlice({
    name: 'project',
    initialState,
    reducers: {
        setStep: (state, action) => {
            state.currentStep = action.payload;
        },
        updateStep1: (state, action) => {
            state.step1 = { ...state.step1, ...action.payload };
        },
        addPropertyType: (state, action) => {
            state.step2.selectedTypes.push(action.payload);
        },
        removePropertyType: (state, action) => {
            state.step2.selectedTypes = state.step2.selectedTypes.filter(t => t.id !== action.payload);
            delete state.step3.unitConfigs[action.payload];
        },
        updatePropertyType: (state, action) => {
            const index = state.step2.selectedTypes.findIndex(t => t.id === action.payload.id);
            if (index !== -1) {
                state.step2.selectedTypes[index] = action.payload;
            }
        },
        updateStep3: (state, action) => {
            const { typeId, unitIndex, data, quantity } = action.payload;
            if (quantity !== undefined) {
                // Initialize or resize the array of unit configs
                const currentConfigs = state.step3.unitConfigs[typeId] || [];
                if (quantity > currentConfigs.length) {
                    const diff = quantity - currentConfigs.length;
                    const newConfigs = Array(diff).fill(null).map(() => ({
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
                    }));
                    state.step3.unitConfigs[typeId] = [...currentConfigs, ...newConfigs];
                } else if (quantity < currentConfigs.length) {
                    state.step3.unitConfigs[typeId] = currentConfigs.slice(0, quantity);
                } else if (quantity === 0) {
                    delete state.step3.unitConfigs[typeId];
                }
            } else if (typeId && unitIndex !== undefined) {
                if (!state.step3.unitConfigs[typeId]) state.step3.unitConfigs[typeId] = [];
                state.step3.unitConfigs[typeId][unitIndex] = {
                    ...state.step3.unitConfigs[typeId][unitIndex],
                    ...data
                };
            } else {
                state.step3 = { ...state.step3, ...action.payload };
            }
        },
        updateStep4: (state, action) => {
            const { unitId, data } = action.payload;
            if (unitId) {
                state.step4.unitData[unitId] = {
                    ...(state.step4.unitData[unitId] || {
                        images: [],
                        documents: [],
                        sellingPrice: '',
                        priceNegotiable: false,
                        taxExclude: false,
                        paymentMode: 'full',
                        agreed: false,
                    }),
                    ...data
                };
            } else {
                state.step4 = { ...state.step4, ...action.payload };
            }
        },
        resetForm: () => initialState,
    },
});

export const {
    setStep,
    updateStep1,
    addPropertyType,
    removePropertyType,
    updatePropertyType,
    updateStep3,
    updateStep4,
    resetForm,
} = projectSlice.actions;

export default projectSlice.reducer;
