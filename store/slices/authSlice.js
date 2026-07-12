import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { kycService } from '../../services/kycService';

const isApprovedKycStatus = (status) => ['verified', 'approved'].includes(String(status || '').toLowerCase());

export const fetchDeveloperKyc = createAsyncThunk(
    'auth/fetchDeveloperKyc',
    async (_, { rejectWithValue }) => {
        try {
            console.log('[KYC THUNK] fetchDeveloperKyc started');
            return await kycService.getMyKyc();
        } catch (error) {
            const diagnostic = {
                message: error.message || 'Unable to fetch KYC status',
                status: error.status,
                data: error.data,
            };
            console.error('[KYC THUNK] fetchDeveloperKyc rejected:', diagnostic);
            return rejectWithValue(diagnostic);
        }
    }
);

export const uploadDeveloperKyc = createAsyncThunk(
    'auth/uploadDeveloperKyc',
    async (payload, { getState, rejectWithValue }) => {
        try {
            const hasExistingKyc = !!getState().auth.kyc;
            return await kycService.uploadKyc(payload, hasExistingKyc);
        } catch (error) {
            return rejectWithValue(error.message || 'Unable to upload KYC documents');
        }
    }
);

export const submitDeveloperKyc = createAsyncThunk(
    'auth/submitDeveloperKyc',
    async (_, { rejectWithValue }) => {
        try {
            return await kycService.submitKyc();
        } catch (error) {
            return rejectWithValue(error.message || 'Unable to submit KYC');
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        firstName: '',
        lastName: '',
        mobile: '',
        password: '',
        newPassword: '',
        confirmPassword: '',
        companyName: '',
        companyType: '',
        reraNumber: '',
        location: '',
        otp: ['', '', '', ''],
        otpFlow: 'register', 
        rememberMe: false,
        isLoggedIn: false,
        isKycCompleted: false,
        kyc: null,
        kycStatus: null,
        kycLoading: false,
        kycError: null,
        user: null,
        token: null,
        loading: false,
        error: null,
    },
    reducers: {
        setFirstName: (state, action) => { state.firstName = action.payload; },
        setLastName: (state, action) => { state.lastName = action.payload; },
        setMobile: (state, action) => { state.mobile = action.payload; },
        setPassword: (state, action) => { state.password = action.payload; },
        setNewPassword: (state, action) => { state.newPassword = action.payload; },
        setConfirmPassword: (state, action) => { state.confirmPassword = action.payload; },
        setCompanyName: (state, action) => { state.companyName = action.payload; },
        setCompanyType: (state, action) => { state.companyType = action.payload; },
        setReraNumber: (state, action) => { state.reraNumber = action.payload; },
        setLocation: (state, action) => { state.location = action.payload; },
        setOtpDigit: (state, action) => {
            const { index, value } = action.payload;
            state.otp[index] = value;
        },
        clearOtp: (state) => { state.otp = ['', '', '', '']; },
        setOtpFlow: (state, action) => { state.otpFlow = action.payload; },
        toggleRememberMe: (state) => { state.rememberMe = !state.rememberMe; },
        setLoggedIn: (state, action) => { state.isLoggedIn = action.payload; },
        setKycCompleted: (state, action) => { state.isKycCompleted = action.payload; },
        setKycStatus: (state, action) => {
            state.kycStatus = action.payload;
            state.isKycCompleted = isApprovedKycStatus(action.payload);
        },
        setUser: (state, action) => { state.user = action.payload; },
        setToken: (state, action) => { state.token = action.payload; },
        setLoading: (state, action) => { state.loading = action.payload; },
        setError: (state, action) => { state.error = action.payload; },
        clearError: (state) => { state.error = null; },
        logout: (state) => {
            state.firstName = '';
            state.lastName = '';
            state.mobile = '';
            state.password = '';
            state.companyName = '';
            state.companyType = '';
            state.reraNumber = '';
            state.location = '';
            state.isLoggedIn = false;
            state.isKycCompleted = false;
            state.kyc = null;
            state.kycStatus = null;
            state.kycError = null;
            state.user = null;
            state.token = null;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchDeveloperKyc.pending, (state) => {
                console.log('[KYC REDUX] Request pending');
                state.kycLoading = true;
                state.kycError = null;
            })
            .addCase(fetchDeveloperKyc.fulfilled, (state, action) => {
                const status = action.payload?.verification_status || null;
                console.log('[KYC REDUX] Request fulfilled:', { hasKyc: !!action.payload, status });
                state.kycLoading = false;
                state.kyc = action.payload;
                state.kycStatus = status;
                state.isKycCompleted = isApprovedKycStatus(status);
            })
            .addCase(fetchDeveloperKyc.rejected, (state, action) => {
                console.error('[KYC REDUX] Request rejected:', action.payload || action.error);
                state.kycLoading = false;
                state.kycError = action.payload?.message || action.error?.message;
                state.isKycCompleted = false;
            })
            .addCase(uploadDeveloperKyc.pending, (state) => {
                state.kycLoading = true;
                state.kycError = null;
            })
            .addCase(uploadDeveloperKyc.fulfilled, (state, action) => {
                const status = action.payload?.verification_status || 'pending';
                state.kycLoading = false;
                state.kyc = action.payload;
                state.kycStatus = status;
                state.isKycCompleted = isApprovedKycStatus(status);
            })
            .addCase(uploadDeveloperKyc.rejected, (state, action) => {
                state.kycLoading = false;
                state.kycError = action.payload;
            })
            .addCase(submitDeveloperKyc.pending, (state) => {
                state.kycLoading = true;
                state.kycError = null;
            })
            .addCase(submitDeveloperKyc.fulfilled, (state, action) => {
                const status = action.payload?.verification_status || 'under_review';
                state.kycLoading = false;
                state.kyc = action.payload;
                state.kycStatus = status;
                state.isKycCompleted = isApprovedKycStatus(status);
            })
            .addCase(submitDeveloperKyc.rejected, (state, action) => {
                state.kycLoading = false;
                state.kycError = action.payload;
            });
    },
});

export const { 
    setFirstName,
    setLastName,
    setMobile, 
    setPassword, 
    setNewPassword, 
    setConfirmPassword, 
    setCompanyName,
    setCompanyType,
    setReraNumber,
    setLocation,
    setOtpDigit, 
    clearOtp, 
    setOtpFlow, 
    toggleRememberMe, 
    setLoggedIn,
    setKycCompleted,
    setKycStatus,
    setUser,
    setToken,
    setLoading,
    setError,
    clearError,
    logout 
} = authSlice.actions;
export default authSlice.reducer;
