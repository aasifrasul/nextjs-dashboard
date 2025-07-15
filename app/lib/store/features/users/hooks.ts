import { useCallback } from 'react';
import { useAppSelector, useAppDispatch } from '@/app/lib/store/hooks';
import { usersApi } from './usersApi';
import {
	setCurrentUser,
	toggleUserSelection,
	clearUserSelection,
	selectCurrentUser,
	selectSelectedUsers,
	selectSortedFilteredUsers,
	selectOnlineUsers,
	selectBatchProcessing,
	selectUiState,
	updateUiState,
	processUserBatch,
} from './usersSlice';

// Main hook that combines RTK Query with slice state
export const useUsers = () => {
	const dispatch = useAppDispatch();

	// RTK Query hooks
	const { data: users, isLoading, error, refetch } = usersApi.endpoints.getUsers.useQuery();

	// Slice selectors
	const currentUser = useAppSelector(selectCurrentUser);
	const selectedUsers = useAppSelector(selectSelectedUsers);
	const sortedFilteredUsers = useAppSelector(selectSortedFilteredUsers);
	const onlineUsers = useAppSelector(selectOnlineUsers);
	const batchProcessing = useAppSelector(selectBatchProcessing);
	const uiState = useAppSelector(selectUiState);

	// Actions
	const setCurrentUserId = useCallback(
		(userId: string) => {
			dispatch(setCurrentUser(userId));
		},
		[dispatch],
	);

	const toggleSelection = useCallback(
		(userId: string) => {
			dispatch(toggleUserSelection(userId));
		},
		[dispatch],
	);

	const clearSelection = useCallback(() => {
		dispatch(clearUserSelection());
	}, [dispatch]);

	const updateUI = useCallback(
		(updates: Partial<typeof uiState>) => {
			dispatch(updateUiState(updates));
		},
		[dispatch],
	);

	const processBatch = useCallback(
		async (userIds: string[]) => {
			return dispatch(processUserBatch(userIds));
		},
		[dispatch],
	);

	return {
		// Data
		users: sortedFilteredUsers,
		allUsers: users,
		currentUser,
		selectedUsers,
		onlineUsers,

		// State
		isLoading,
		error,
		batchProcessing,
		uiState,

		// Actions
		setCurrentUserId,
		toggleSelection,
		clearSelection,
		updateUI,
		processBatch,
		refetch,
	};
};

// Specialized hooks for specific use cases
export const useUserSelection = () => {
	const dispatch = useAppDispatch();
	const selectedUsers = useAppSelector(selectSelectedUsers);

	return {
		selectedUsers,
		toggleSelection: (userId: string) => dispatch(toggleUserSelection(userId)),
		clearSelection: () => dispatch(clearUserSelection()),
		isSelected: (userId: string) => selectedUsers.some((user) => user.id === userId),
	};
};

export const useCurrentUser = () => {
	const dispatch = useAppDispatch();
	const currentUser = useAppSelector(selectCurrentUser);

	return {
		currentUser,
		setCurrentUser: (userId: string) => dispatch(setCurrentUser(userId)),
	};
};

// Generic API hook wrapper (your original idea!)
export const useApiQuery = <T>(
	queryHook: () => { data: T; isLoading: boolean; error: any; refetch: () => void },
) => {
	const result = queryHook();

	return {
		...result,
		loading: result.isLoading,
		hasError: !!result.error,
		errorMessage: result.error?.message || 'Something went wrong',
	};
};
