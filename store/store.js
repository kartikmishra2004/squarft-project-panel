import { configureStore } from '@reduxjs/toolkit';
import appReducer from './slices/appSlice';
import authReducer from './slices/authSlice';
import projectReducer from './slices/projectSlice';
import projectsReducer from './slices/projectsSlice';

export const store = configureStore({
    reducer: {
        app: appReducer,
        auth: authReducer,
        project: projectReducer,
        projects: projectsReducer,
    },
});