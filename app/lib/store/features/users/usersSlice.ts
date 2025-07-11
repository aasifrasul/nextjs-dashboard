import {
	createSlice,
	createAsyncThunk,
	createEntityAdapter,
	PayloadAction,
} from '@reduxjs/toolkit';
import { RootState } from '../../store';
import { usersApi } from './usersApi';
import { User } from '../users/types';

const usersAdapter = createEntityAdapter<User>({
	selectId: (user) => user.id,
	sortComparer: (a, b) => a.name.localeCompare(b.name),
});

// Async thunk for complex operations
export const processUserBatch = createAsyncThunk(
	'users/processUserBatch',
	async (userIds: string[], { getState, dispatch }) => {
		const state = getState() as RootState;
		const users = userIds.map((id) => state.users.entities[id]).filter(Boolean);

		// Simulate complex processing
		await new Promise((resolve) => setTimeout(resolve, 1000));

		return {
			processed: users.length,
			timestamp: Date.now(),
		};
	},
);

interface UsersState {
	entities: Record<string, User>;
	ids: string[];
	loading: boolean;
	error: string | null;
	selectedUsers: string[];
	batchProcessing: boolean;
	lastSync: number | null;
	sortBy: 'createdAt' | 'updatedAt' | 'title' | 'priority';
	sortOrder: 'asc' | 'desc';
}

const initialState: UsersState = usersAdapter.getInitialState({
	currentUserId: null as string | null,
	onlineUsers: [] as string[],
});

const usersSlice = createSlice({
	name: 'users',
	initialState,
	reducers: {
		setCurrentUser: (state, action: PayloadAction<string>) => {
			state.currentUserId = action.payload;
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
	},
	extraReducers: (builder) => {
		builder
			// Process batch async thunk
			.addCase(processUserBatch.pending, (state) => {
				state.batchProcessing = true;
			})
			.addCase(processUserBatch.fulfilled, (state, action) => {
				state.batchProcessing = false;
				state.lastSync = action.payload.timestamp;
				// Clear selection after processing
				state.selectedUsers = [];
			})
			.addCase(processUserBatch.rejected, (state, action) => {
				state.batchProcessing = false;
				state.error = action.error.message || 'Batch processing failed';
			})

			// RTK Query extraReducers - Alternative approach using isAnyOf
			.addMatcher(usersApi.endpoints.getUsers.matchPending ?? (() => false), (state) => {
				state.loading = true;
				state.error = null;
			})
			.addMatcher(
				usersApi.endpoints.getUsers.matchFulfilled ?? (() => false),
				(state, action) => {
					state.loading = false;
					// This is the crucial part - add the fetched users to the store
					usersAdapter.setAll(state, action.payload);
					state.lastSync = Date.now();
				},
			)
			.addMatcher(
				usersApi.endpoints.getUsers.matchRejected ?? (() => false),
				(state, action) => {
					state.loading = false;
					state.error = action.error.message || 'Failed to fetch users';
				},
			)

			// Handle other user operations if they exist
			.addMatcher(
				usersApi.endpoints.addUser?.matchFulfilled ?? (() => false),
				(state, action) => {
					usersAdapter.addOne(state, action.payload);
				},
			)
			.addMatcher(
				usersApi.endpoints.updateUser?.matchFulfilled ?? (() => false),
				(state, action) => {
					usersAdapter.updateOne(state, {
						id: action.payload.id,
						changes: action.payload,
					});
				},
			)
			.addMatcher(
				usersApi.endpoints.deleteUser?.matchFulfilled ?? (() => false),
				(state, action) => {
					usersAdapter.removeOne(state, action.meta.arg.originalArgs);
				},
			);
	},
});

export const { setCurrentUser, setOnlineUsers, addOnlineUser, removeOnlineUser } =
	usersSlice.actions;

export const {
	selectAll: selectAllUsers,
	selectById: selectUserById,
	selectIds: selectUserIds,
} = usersAdapter.getSelectors((state: RootState) => state.users);

export const selectCurrentUser = (state: RootState) =>
	state.users.currentUserId ? state.users.entities[state.users.currentUserId] : null;

export const selectOnlineUsers = (state: RootState) => state.users.onlineUsers;

export default usersSlice.reducer;
