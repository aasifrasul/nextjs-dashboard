import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Task, TaskFilters, CreateTaskData, UpdateTaskData } from './types';

export const tasksApi = createApi({
	reducerPath: 'tasksApi',
	baseQuery: fetchBaseQuery({
		baseUrl: '/api/tasks',
		prepareHeaders: (headers, { getState }) => {
			// Add auth token if available
			const token = (getState() as any).auth?.token;
			if (token) {
				headers.set('authorization', `Bearer ${token}`);
			}
			return headers;
		},
	}),
	tagTypes: ['Task', 'TaskStats'],
	endpoints: (builder) => ({
		// Get all tasks with filtering
		getTasks: builder.query<Task[], TaskFilters>({
			query: (filters = {}) => ({
				url: '',
				params: filters,
			}),
			providesTags: (result) =>
				result
					? [
							...result.map(({ id }) => ({ type: 'Task' as const, id })),
							{ type: 'Task', id: 'LIST' },
						]
					: [{ type: 'Task', id: 'LIST' }],
			// Transform response for consistent data structure
			transformResponse: (response: any) => {
				return response.data || response;
			},
		}),

		// Get single task
		getTask: builder.query<Task, string>({
			query: (id) => `/${id}`,
			providesTags: (result, error, id) => [{ type: 'Task', id }],
		}),

		// Create task with optimistic update
		createTask: builder.mutation<Task, CreateTaskData>({
			query: (newTask) => ({
				url: '',
				method: 'POST',
				body: newTask,
			}),
			invalidatesTags: [{ type: 'Task', id: 'LIST' }, 'TaskStats'],
			// Optimistic update
			async onQueryStarted(newTask, { dispatch, queryFulfilled }) {
				const optimisticTask: Task = {
					...(newTask as Task),
					id: `temp-${Date.now()}`,
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString(),
				};

				const patchResult = dispatch(
					tasksApi.util.updateQueryData('getTasks', {}, (draft) => {
						draft.unshift(optimisticTask);
					}),
				);

				try {
					await queryFulfilled;
				} catch {
					patchResult.undo();
				}
			},
		}),

		// Update task
		updateTask: builder.mutation<Task, { id: string; updates: UpdateTaskData }>({
			query: ({ id, updates }) => ({
				url: `/${id}`,
				method: 'PATCH',
				body: updates,
			}),
			invalidatesTags: (result, error, { id }) => [
				{ type: 'Task', id },
				{ type: 'Task', id: 'LIST' },
				'TaskStats',
			],
			// Optimistic update
			async onQueryStarted({ id, updates }, { dispatch, queryFulfilled }) {
				const patchResult = dispatch(
					tasksApi.util.updateQueryData('getTasks', {}, (draft) => {
						const task = draft.find((t) => t.id === id);
						if (task) {
							Object.assign(task, updates, {
								updatedAt: new Date().toISOString(),
							});
						}
					}),
				);

				try {
					await queryFulfilled;
				} catch {
					patchResult.undo();
				}
			},
		}),

		// Delete task
		deleteTask: builder.mutation<void, string>({
			query: (id) => ({
				url: `/${id}`,
				method: 'DELETE',
			}),
			invalidatesTags: (result, error, id) => [
				{ type: 'Task', id },
				{ type: 'Task', id: 'LIST' },
				'TaskStats',
			],
		}),

		// Bulk operations
		bulkUpdateTasks: builder.mutation<Task[], { ids: string[]; updates: UpdateTaskData }>({
			query: ({ ids, updates }) => ({
				url: '/bulk',
				method: 'PATCH',
				body: { ids, updates },
			}),
			invalidatesTags: [{ type: 'Task', id: 'LIST' }, 'TaskStats'],
		}),

		// Get task statistics
		getTaskStats: builder.query<
			{
				total: number;
				completed: number;
				pending: number;
				inProgress: number;
			},
			void
		>({
			query: () => '/stats',
			providesTags: ['TaskStats'],
			transformResponse: (response: any) => {
				return response.data || response;
			},
		}),

		// Real-time updates simulation
		subscribeToTaskUpdates: builder.query<Task[], void>({
			query: () => '/subscribe',
			// Streaming updates
			async onCacheEntryAdded(
				arg,
				{ updateCachedData, cacheDataLoaded, cacheEntryRemoved },
			) {
				// Simulate WebSocket connection
				let ws: WebSocket;
				try {
					await cacheDataLoaded;
					// In real app, this would be a WebSocket connection
					ws = new WebSocket('ws://localhost:3000/ws/tasks');

					ws.addEventListener('message', (event) => {
						const data = JSON.parse(event.data);
						updateCachedData((draft) => {
							if (data.type === 'task_updated') {
								const index = draft.findIndex(
									(task) => task.id === data.task.id,
								);
								if (index !== -1) {
									draft[index] = data.task;
								}
							}
						});
					});
				} catch {
					// Handle connection errors
				} finally {
					await cacheEntryRemoved;
					ws?.close();
				}
			},
		}),
	}),
});

export const {
	useGetTasksQuery,
	useGetTaskQuery,
	useCreateTaskMutation,
	useUpdateTaskMutation,
	useDeleteTaskMutation,
	useBulkUpdateTasksMutation,
	useGetTaskStatsQuery,
	useSubscribeToTaskUpdatesQuery,
} = tasksApi;
