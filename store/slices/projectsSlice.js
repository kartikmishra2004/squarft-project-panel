import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    projects: [],
};

const projectsSlice = createSlice({
    name: 'projects',
    initialState,
    reducers: {
        addProject: (state, action) => {
            state.projects.unshift(action.payload);
        },
    },
});

export const { addProject } = projectsSlice.actions;
export default projectsSlice.reducer;
