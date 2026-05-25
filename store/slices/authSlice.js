import { createSlice } from '@reduxjs/toolkit';

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
            state.user = null;
            state.token = null;
            state.error = null;
        },
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
    setUser,
    setToken,
    setLoading,
    setError,
    clearError,
    logout 
} = authSlice.actions;
export default authSlice.reducer;
