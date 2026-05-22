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
        builderData: {}, // Keyed by typeId, value is visual builder state
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
            if (state.step3.builderData) delete state.step3.builderData[action.payload];
            Object.keys(state.step4.unitData).forEach(id => {
                if (id.startsWith(`${action.payload}-`)) {
                    delete state.step4.unitData[id];
                }
            });
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
        updateBuilderData: (state, action) => {
            const { typeId, subType, builderState } = action.payload;
            if (!state.step3.builderData) state.step3.builderData = {};
            state.step3.builderData[typeId] = builderState;

            const newUnitConfigs = [];
            const newUnitData = {};

            const sections = builderState.sections || [];
            sections.forEach(section => {
                const rows = section.floors ?? section.rows ?? section.lanes ?? 1;
                const cols = section.unitsPerFloor ?? section.plotsPerRow ?? section.villasPerLane ?? 1;

                for (let r = 1; r <= rows; r++) {
                    const rowCols = section.rowUnitCounts?.[r] ?? cols;
                    for (let c = 1; c <= rowCols; c++) {
                        const key = `${r}_${c}`;
                        if (section.unitMap && section.unitMap[key]) {
                            const configId = section.unitMap[key];
                            const config = section.configs?.find(cfg => cfg.id === configId) || {};
                            const override = section.unitOverrides?.[key] || {};

                            const displayNum = `${r}${c.toString().padStart(2, '0')}`;
                            const propertyNumber = override.customName || displayNum;
                            const unitId = `${typeId}-${section.id}-${key}`;

                            const unitConfig = {
                                unitId,
                                sectionId: section.id,
                                gridKey: key,
                                row: r,
                                column: c,
                                tower: section.name,
                                floor: r.toString(),
                                bhk: subType === 'office' ? (config.type || 'Co-working') : (config.type || '2 BHK'),
                                officeType: subType === 'office' ? (config.type || 'Co-working') : '',
                                area: (override.customArea || config.area || '0').toString(),
                                areaUnit: subType === 'plot' ? 'Sq-yrd' : 'Sq-ft',
                                amenities: [config.name || 'Standard'],
                                propertyNumber: propertyNumber,
                                hasShop: false,
                                extraCharges: [{ title: 'Maintenance', amount: '0' }]
                            };

                            newUnitConfigs.push(unitConfig);

                            const unitIndex = newUnitConfigs.length - 1;
                            const sellingPrice = (override.customPrice || config.price || '').toString().replace(/,/g, '');

                            const existing = state.step4.unitData[unitId] || {};
                            newUnitData[unitId] = {
                                images: existing.images || [],
                                documents: existing.documents || [],
                                sellingPrice: sellingPrice || existing.sellingPrice || '',
                                priceNegotiable: existing.priceNegotiable || false,
                                taxExclude: existing.taxExclude || false,
                                paymentMode: existing.paymentMode || 'full',
                                agreed: existing.agreed ?? true,
                            };
                        }
                    }
                }
            });

            state.step3.unitConfigs[typeId] = newUnitConfigs;
            Object.keys(state.step4.unitData).forEach(id => {
                if (!id.startsWith(`${typeId}-`)) {
                    newUnitData[id] = state.step4.unitData[id];
                }
            });
            state.step4.unitData = newUnitData;
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
        bulkUploadProject: (state, action) => {
            const { step1, step2, step3, step4 } = action.payload;
            if (step1) state.step1 = { ...state.step1, ...step1 };
            if (step2) state.step2 = { ...state.step2, ...step2 };
            if (step3) state.step3 = { ...state.step3, ...step3 };
            if (step4) state.step4 = { ...state.step4, ...step4 };
        },
        bulkUploadSubtype: (state, action) => {
            const { typeId, unitConfigs, unitData } = action.payload;
            state.step3.unitConfigs[typeId] = unitConfigs;
            Object.assign(state.step4.unitData, unitData);
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
    updateBuilderData,
    updateStep4,
    bulkUploadProject,
    bulkUploadSubtype,
    resetForm,
} = projectSlice.actions;

export default projectSlice.reducer;
