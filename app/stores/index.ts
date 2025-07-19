import { configureStore } from '@reduxjs/toolkit';
import autoCompleteReducer from './slices/autoCompleteSlice';

export const store = configureStore({
	reducer: {
		autoComplete: autoCompleteReducer,
	},
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
