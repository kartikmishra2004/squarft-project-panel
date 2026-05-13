import { configureStore } from '@reduxjs/toolkit';
import appSlice from './slices/appSlice';
import authSlice from './slices/authSlice';
import projectSlice from './slices/projectSlice';

export const store = configureStore({
    reducer: {
        app: appSlice,
        auth: authSlice,
        project: projectSlice,
    },
});