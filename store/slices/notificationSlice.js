import { createSlice } from '@reduxjs/toolkit';
import { initialNotifications } from '../../data/notifications';

const notificationSlice = createSlice({
    name: 'notifications',
    initialState: {
        list: initialNotifications,
    },
    reducers: {
        markAsWatched: (state, action) => {
            const notification = state.list.find(item => item.id === action.payload);
            if (notification) {
                notification.watched = true;
            }
        },
        markAllAsWatched: (state) => {
            state.list.forEach(item => {
                item.watched = true;
            });
        },
        addNotification: (state, action) => {
            state.list.unshift({
                id: Date.now(),
                watched: false,
                time: 'Just now',
                type: 'default',
                ...action.payload,
            });
        },
        clearNotifications: (state) => {
            state.list = [];
        },
    },
});

export const { markAsWatched, markAllAsWatched, addNotification, clearNotifications } = notificationSlice.actions;
export default notificationSlice.reducer;
