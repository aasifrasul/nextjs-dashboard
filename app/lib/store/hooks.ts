import { useCallback } from 'react';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from './store';

// Typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Custom hooks for common operations
export const useTaskSelection = () => {
	const dispatch = useAppDispatch();
	const selectedTasks: string[] = useAppSelector((state) => {
		return state.tasks.selectedTasks;
	});

	const selectTask = useCallback(
		(taskId: string) => {
			dispatch({ type: 'tasks/selectTask', payload: taskId });
		},
		[dispatch],
	);

	const deselectTask = useCallback(
		(taskId: string) => {
			dispatch({ type: 'tasks/deselectTask', payload: taskId });
		},
		[dispatch],
	);

	const selectAllTasks = useCallback(() => {
		dispatch({ type: 'tasks/selectAllTasks' });
	}, [dispatch]);

	const clearSelection = useCallback(() => {
		dispatch({ type: 'tasks/clearSelection' });
	}, [dispatch]);

	return {
		selectedTasks,
		selectTask,
		deselectTask,
		selectAllTasks,
		clearSelection,
	};
};

export const useToast = () => {
	const dispatch = useAppDispatch();
	const toast = useAppSelector((state) => state.ui.toast);

	const showToast = useCallback(
		(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
			dispatch({
				type: 'ui/showToast',
				payload: { message, type },
			});
		},
		[dispatch],
	);

	const hideToast = useCallback(() => {
		dispatch({ type: 'ui/hideToast' });
	}, [dispatch]);

	return {
		toast,
		showToast,
		hideToast,
	};
};

// Hook for managing loading states
export const useLoading = (key: string) => {
	const dispatch = useAppDispatch();
	const loading = useAppSelector((state) => state.ui.loading[key] || false);

	const setLoading = useCallback(
		(loading: boolean) => {
			dispatch({
				type: 'ui/setLoading',
				payload: { key, loading },
			});
		},
		[dispatch, key],
	);

	return {
		loading,
		setLoading,
	};
};

// Hook for notifications
export const useNotifications = () => {
	const dispatch = useAppDispatch();
	const notifications = useAppSelector((state) => state.notifications);

	const addNotification = useCallback(
		(notification: Omit<Notification, 'id'>) => {
			dispatch({
				type: 'notifications/addNotification',
				payload: {
					...notification,
					id: `notification-${Date.now()}`,
				},
			});
		},
		[dispatch],
	);

	const markAsRead = useCallback(
		(id: string) => {
			dispatch({
				type: 'notifications/markAsRead',
				payload: id,
			});
		},
		[dispatch],
	);

	const markAllAsRead = useCallback(() => {
		dispatch({ type: 'notifications/markAllAsRead' });
	}, [dispatch]);

	return {
		notifications: notifications.ids.map((id) => notifications.entities[id]),
		unreadCount: notifications.unreadCount,
		addNotification,
		markAsRead,
		markAllAsRead,
	};
};
