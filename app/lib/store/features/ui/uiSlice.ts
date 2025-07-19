import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from '@/app/stores';

interface UIState {
	sidebarOpen: boolean;
	theme: 'light' | 'dark';
	activeModal: string | null;
	loading: {
		[key: string]: boolean;
	};
	toast: {
		show: boolean;
		message: string;
		type: 'success' | 'error' | 'info' | 'warning';
	} | null;
}

const initialState: UIState = {
	sidebarOpen: true,
	theme: 'light',
	activeModal: null,
	loading: {},
	toast: null,
};

const uiSlice = createSlice({
	name: 'ui',
	initialState,
	reducers: {
		toggleSidebar: (state) => {
			state.sidebarOpen = !state.sidebarOpen;
		},

		setSidebarOpen: (state, action: PayloadAction<boolean>) => {
			state.sidebarOpen = action.payload;
		},

		setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
			state.theme = action.payload;
		},

		openModal: (state, action: PayloadAction<string>) => {
			state.activeModal = action.payload;
		},

		closeModal: (state) => {
			state.activeModal = null;
		},

		setLoading: (state, action: PayloadAction<{ key: string; loading: boolean }>) => {
			state.loading[action.payload.key] = action.payload.loading;
		},

		showToast: (
			state,
			action: PayloadAction<{
				message: string;
				type: 'success' | 'error' | 'info' | 'warning';
			}>,
		) => {
			state.toast = {
				show: true,
				message: action.payload.message,
				type: action.payload.type,
			};
		},

		hideToast: (state) => {
			state.toast = null;
		},
	},
});

export const {
	toggleSidebar,
	setSidebarOpen,
	setTheme,
	openModal,
	closeModal,
	setLoading,
	showToast,
	hideToast,
} = uiSlice.actions;

export const selectSidebarOpen = (state: RootState) => state.ui.sidebarOpen;
export const selectTheme = (state: RootState) => state.ui.theme;
export const selectActiveModal = (state: RootState) => state.ui.activeModal;
export const selectLoading = (key: string) => (state: RootState) =>
	state.ui.loading[key] || false;
export const selectToast = (state: RootState) => state.ui.toast;

export default uiSlice.reducer;
