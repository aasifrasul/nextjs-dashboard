import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '@/app/stores';
import { usersApi } from './usersApi';
import { User } from '../users/types';

// Keep async thunks for complex business logic only
export const processUserBatch = createAsyncThunk(
	'users/processUserBatch',
	async (userIds: string[], { getState, dispatch }) => {
		const state = getState() as RootState;

		// Get users from RTK Query cache instead of slice
		const usersResult = usersApi.endpoints.getUsers.select()(state);
		const users = userIds
			.map((id) => usersResult.data?.find((user) => user.id === id))
			.filter(Boolean);

		// Simulate complex processing
		await new Promise((resolve) => setTimeout(resolve, 1000));

		return {
			processed: users.length,
			timestamp: Date.now(),
		};
	},
);

interface UsersState {
	// Only app-specific state, not API state
	currentUserId: string | null;
	selectedUsers: string[];
	onlineUsers: string[];
	batchProcessing: boolean;
	uiState: {
		sortBy: 'createdAt' | 'updatedAt' | 'name' | 'priority';
		sortOrder: 'asc' | 'desc';
		searchTerm: string;
	};
}

const initialState: UsersState = {
	currentUserId: null,
	selectedUsers: [],
	onlineUsers: [],
	batchProcessing: false,
	uiState: {
		sortBy: 'createdAt',
		sortOrder: 'desc',
		searchTerm: '',
	},
};

const usersSlice = createSlice({
	name: 'users',
	initialState,
	reducers: {
		setCurrentUser: (state, action: PayloadAction<string>) => {
			state.currentUserId = action.payload;
		},

		toggleUserSelection: (state, action: PayloadAction<string>) => {
			const userId = action.payload;
			const index = state.selectedUsers.indexOf(userId);

			if (index === -1) {
				state.selectedUsers.push(userId);
			} else {
				state.selectedUsers.splice(index, 1);
			}
		},

		clearUserSelection: (state) => {
			state.selectedUsers = [];
		},

		setOnlineUsers: (state, action: PayloadAction<string[]>) => {
			state.onlineUsers = action.payload;
		},

		addOnlineUser: (state, action: PayloadAction<string>) => {
			if (!state.onlineUsers.includes(action.payload)) {
				state.onlineUsers.push(action.payload);
			}
		},

		removeOnlineUser: (state, action: PayloadAction<string>) => {
			state.onlineUsers = state.onlineUsers.filter((id) => id !== action.payload);
		},

		updateUiState: (state, action: PayloadAction<Partial<UsersState['uiState']>>) => {
			state.uiState = { ...state.uiState, ...action.payload };
		},
	},
	extraReducers: (builder) => {
		builder
			// Only handle complex business logic, not basic CRUD
			.addCase(processUserBatch.pending, (state) => {
				state.batchProcessing = true;
			})
			.addCase(processUserBatch.fulfilled, (state) => {
				state.batchProcessing = false;
				state.selectedUsers = []; // Clear selection after processing
			})
			.addCase(processUserBatch.rejected, (state) => {
				state.batchProcessing = false;
			});
	},
});

export const {
	setCurrentUser,
	toggleUserSelection,
	clearUserSelection,
	setOnlineUsers,
	addOnlineUser,
	removeOnlineUser,
	updateUiState,
} = usersSlice.actions;

// Selectors that combine RTK Query data with slice state
export const selectCurrentUser = (state: RootState) => {
	const { currentUserId } = state.users;
	const usersResult = usersApi.endpoints.getUsers.select()(state);

	return currentUserId && usersResult.data
		? usersResult.data.find((user) => user.id === currentUserId) || null
		: null;
};

export const selectSelectedUsers = (state: RootState) => {
	const { selectedUsers } = state.users;
	const usersResult = usersApi.endpoints.getUsers.select()(state);

	return selectedUsers
		.map((id) => usersResult.data?.find((user) => user.id === id))
		.filter(Boolean) as User[];
};

export const selectSortedFilteredUsers = (state: RootState) => {
	const usersResult = usersApi.endpoints.getUsers.select()(state);
	const { uiState } = state.users;

	if (!usersResult.data) return [];

	let users = [...usersResult.data];

	// Filter
	if (uiState.searchTerm) {
		users = users.filter((user) =>
			user.name.toLowerCase().includes(uiState.searchTerm.toLowerCase()),
		);
	}

	// Sort
	users.sort((a, b) => {
		const aVal = a[uiState.sortBy];
		const bVal = b[uiState.sortBy];
		const comparison = aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
		return uiState.sortOrder === 'desc' ? -comparison : comparison;
	});

	return users;
};

export const selectOnlineUsers = (state: RootState) => state.users.onlineUsers;
export const selectBatchProcessing = (state: RootState) => state.users.batchProcessing;
export const selectUiState = (state: RootState) => state.users.uiState;

export default usersSlice.reducer;
