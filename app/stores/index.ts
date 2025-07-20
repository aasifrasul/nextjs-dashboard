import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { tasksApi } from '@/app/lib/store/features/tasks/tasksApi';
import { usersApi } from '@/app/lib/store/features/users/usersApi';
import tasksReducer from '@/app/lib/store/features/tasks/tasksSlice';
import usersReducer from '@/app/lib/store/features/users/usersSlice';
import notificationsReducer from '@/app/lib/store/features/notifications/notificationsSlice';
import uiReducer from '@/app/lib/store/features/ui/uiSlice';
import autoCompleteReducer from './slices/autoCompleteSlice';

// Custom middleware for logging and analytics
const loggerMiddleware = (store: any) => (next: any) => (action: any) => {
	if (process.env.NODE_ENV === 'development') {
		console.log('🔄 Dispatching:', action.type);
	}

	const result = next(action);

	// Analytics tracking for specific actions
	if (action.type.includes('task') || action.type.includes('user')) {
		// Track user interactions
		console.log('📊 Tracking:', action.type);
	}

	return result;
};

export const store = configureStore({
	reducer: {
		// RTK Query APIs
		[tasksApi.reducerPath]: tasksApi.reducer,
		[usersApi.reducerPath]: usersApi.reducer,

		// Regular slices
		tasks: tasksReducer,
		users: usersReducer,
		notifications: notificationsReducer,
		ui: uiReducer,
		autoComplete: autoCompleteReducer,
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			serializableCheck: {
				ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
			},
		})
			.concat(tasksApi.middleware)
			.concat(usersApi.middleware)
			.concat(loggerMiddleware),
});

// Enable RTK Query refetchOnFocus/refetchOnReconnect
setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
