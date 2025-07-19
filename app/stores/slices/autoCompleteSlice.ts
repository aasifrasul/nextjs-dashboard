import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CompanyItem, AutoCompleteState } from '../../types/autoComplete';

const initialState: AutoCompleteState = {
	searchText: '',
	isModalOpen: false,
	currentItem: null,
};

export const autoCompleteSlice = createSlice({
	name: 'autoComplete',
	initialState,
	reducers: {
		setSearchText: (state, action: PayloadAction<string>) => {
			state.searchText = action.payload;
		},
		clearSearchText: (state) => {
			state.searchText = '';
		},
		openModal: (state, action: PayloadAction<CompanyItem>) => {
			state.isModalOpen = true;
			state.currentItem = action.payload;
		},
		closeModal: (state) => {
			state.isModalOpen = false;
			state.currentItem = null;
		},
		clearAll: (state) => {
			state.searchText = '';
			state.isModalOpen = false;
			state.currentItem = null;
		},
	},
});

export const { setSearchText, clearSearchText, openModal, closeModal, clearAll } =
	autoCompleteSlice.actions;

export default autoCompleteSlice.reducer;
