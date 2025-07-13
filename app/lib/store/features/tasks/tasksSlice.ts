import {
	createSlice,
	createAsyncThunk,
	createEntityAdapter,
	PayloadAction,
} from '@reduxjs/toolkit';
import { RootState } from '../../store';
import { Task, TaskFilters } from './types';
import { tasksApi } from './tasksApi'; // Import your tasksApi

// Entity adapter for normalized task storage
const tasksAdapter = createEntityAdapter<Task>({
	//selectId: (task: Task): string => task.id,
	sortComparer: (a, b) => b.createdAt.localeCompare(a.createdAt),
});

// Async thunk for complex operations
export const processTaskBatch = createAsyncThunk(
	'tasks/processTaskBatch',
	async (taskIds: string[], { getState, dispatch }) => {
		const state = getState() as RootState;
		const tasks = taskIds.map((id) => state.tasks.entities[id]).filter(Boolean);

		// Simulate complex processing
		await new Promise((resolve) => setTimeout(resolve, 1000));

		return {
			processed: tasks.length,
			timestamp: Date.now(),
		};
	},
);

// Initial state
interface TasksState {
	entities: Record<string, Task>;
	ids: string[];
	loading: boolean;
	error: string | null;
	filters: TaskFilters;
	selectedTasks: string[];
	batchProcessing: boolean;
	lastSync: number | null;
	searchTerm: string;
	sortBy: 'createdAt' | 'updatedAt' | 'title' | 'priority';
	sortOrder: 'asc' | 'desc';
}

const initialState: TasksState = tasksAdapter.getInitialState({
	loading: false,
	error: null,
	filters: {},
	selectedTasks: [],
	batchProcessing: false,
	lastSync: null,
	searchTerm: '',
	sortBy: 'createdAt' as const,
	sortOrder: 'desc' as const,
});

const tasksSlice = createSlice({
	name: 'tasks',
	initialState,
	reducers: {
		// Task selection for batch operations
		selectTask: (state, action: PayloadAction<string>) => {
			const taskId = action.payload;
			if (!state.selectedTasks.includes(taskId)) {
				state.selectedTasks.push(taskId);
			}
		},

		deselectTask: (state, action: PayloadAction<string>) => {
			const taskId = action.payload;
			state.selectedTasks = state.selectedTasks.filter((id) => id !== taskId);
		},

		selectAllTasks: (state) => {
			state.selectedTasks = state.ids.slice();
		},

		clearSelection: (state) => {
			state.selectedTasks = [];
		},

		// Filters and search
		setFilters: (state, action: PayloadAction<TaskFilters>) => {
			state.filters = action.payload;
		},

		setSearchTerm: (state, action: PayloadAction<string>) => {
			state.searchTerm = action.payload;
		},

		setSorting: (
			state,
			action: PayloadAction<{
				sortBy: 'createdAt' | 'updatedAt' | 'title' | 'priority';
				sortOrder: 'asc' | 'desc';
			}>,
		) => {
			state.sortBy = action.payload.sortBy;
			state.sortOrder = action.payload.sortOrder;
		},

		// Local task operations (for offline support)
		addTaskLocally: tasksAdapter.addOne,
		updateTaskLocally: tasksAdapter.updateOne,
		removeTaskLocally: tasksAdapter.removeOne,
		setTasksLocally: tasksAdapter.setAll,

		// Sync operations
		markSyncComplete: (state) => {
			state.lastSync = Date.now();
		},

		// Optimistic updates
		optimisticTaskUpdate: (
			state,
			action: PayloadAction<{ id: string; changes: Partial<Task> }>,
		) => {
			const { id, changes } = action.payload;
			tasksAdapter.updateOne(state, {
				id,
				changes: {
					...changes,
					updatedAt: new Date().toISOString(),
				},
			});
		},

		// Error handling
		setError: (state, action: PayloadAction<string>) => {
			state.error = action.payload;
		},

		clearError: (state) => {
			state.error = null;
		},
	},
	extraReducers: (builder) => {
		builder
			// Process batch async thunk
			.addCase(processTaskBatch.pending, (state) => {
				state.batchProcessing = true;
			})
			.addCase(processTaskBatch.fulfilled, (state, action) => {
				state.batchProcessing = false;
				state.lastSync = action.payload.timestamp;
				// Clear selection after processing
				state.selectedTasks = [];
			})
			.addCase(processTaskBatch.rejected, (state, action) => {
				state.batchProcessing = false;
				state.error = action.error.message || 'Batch processing failed';
			})

			// RTK Query extraReducers - Alternative approach using isAnyOf
			.addMatcher(tasksApi.endpoints.getTasks.matchPending ?? (() => false), (state) => {
				state.loading = true;
				state.error = null;
			})
			.addMatcher(
				tasksApi.endpoints.getTasks.matchFulfilled ?? (() => false),
				(state, action) => {
					state.loading = false;
					// This is the crucial part - add the fetched tasks to the store
					tasksAdapter.setAll(state, action.payload);
					state.lastSync = Date.now();
				},
			)
			.addMatcher(
				tasksApi.endpoints.getTasks.matchRejected ?? (() => false),
				(state, action) => {
					state.loading = false;
					state.error = action.error.message || 'Failed to fetch tasks';
				},
			)

			// Handle other task operations if they exist
			.addMatcher(
				tasksApi.endpoints.createTask?.matchFulfilled ?? (() => false),
				(state, action) => {
					tasksAdapter.addOne(state, action.payload);
				},
			)
			.addMatcher(
				tasksApi.endpoints.updateTask?.matchFulfilled ?? (() => false),
				(state, action) => {
					tasksAdapter.updateOne(state, {
						id: action.payload.id,
						changes: action.payload,
					});
				},
			)
			.addMatcher(
				tasksApi.endpoints.deleteTask?.matchFulfilled ?? (() => false),
				(state, action) => {
					tasksAdapter.removeOne(state, action.meta.arg.originalArgs);
				},
			);
	},
});

export const {
	selectTask,
	deselectTask,
	clearSelection,
	setFilters,
	setSearchTerm,
	setSorting,
	addTaskLocally,
	updateTaskLocally,
	removeTaskLocally,
	setTasksLocally,
	markSyncComplete,
	optimisticTaskUpdate,
	setError,
	clearError,
} = tasksSlice.actions;

// Selectors using entity adapter
export const {
	selectAll: selectAllTasks,
	selectById: selectTaskById,
	selectIds: selectTaskIds,
} = tasksAdapter.getSelectors((state: RootState) => state.tasks);

// Custom selectors
export const selectFilteredTasks = (state: RootState) => {
	const tasks = selectAllTasks(state);
	const { filters, searchTerm, sortBy, sortOrder } = state.tasks;

	let filtered = tasks;

	// Apply search
	if (searchTerm) {
		filtered = filtered.filter(
			(task) =>
				task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
				task.description?.toLowerCase().includes(searchTerm.toLowerCase()),
		);
	}

	// Apply filters
	if (filters.status) {
		filtered = filtered.filter((task) => task.status === filters.status);
	}

	if (filters.priority) {
		filtered = filtered.filter((task) => task.priority === filters.priority);
	}

	if (filters.assigneeId) {
		filtered = filtered.filter((task) => task.assigneeId === filters.assigneeId);
	}

	// Apply sorting
	filtered.sort((a, b) => {
		let aValue: string | number = a[sortBy];
		let bValue: string | number = b[sortBy];

		if (sortBy === 'priority') {
			const priorityOrder = { low: 1, medium: 2, high: 3 };
			aValue = priorityOrder[a.priority];
			bValue = priorityOrder[b.priority];
		}

		if (sortOrder === 'asc') {
			return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
		} else {
			return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
		}
	});

	return filtered;
};

export const selectSelectedTasks = (state: RootState) => {
	return state.tasks.selectedTasks.map((id) => state.tasks.entities[id]).filter(Boolean);
};

export const selectTasksLoading = (state: RootState) => state.tasks.loading;
export const selectTasksError = (state: RootState) => state.tasks.error;
export const selectBatchProcessing = (state: RootState) => state.tasks.batchProcessing;

export default tasksSlice.reducer;
