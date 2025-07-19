import { createSlice, createEntityAdapter, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '@/app/stores';
import { Notification } from '@/app/lib/store//features/tasks/types';

const notificationsAdapter = createEntityAdapter<Notification>({
	sortComparer: (a, b) => b.createdAt.localeCompare(a.createdAt),
});

const initialState = notificationsAdapter.getInitialState({
	unreadCount: 0,
});

const notificationsSlice = createSlice({
	name: 'notifications',
	initialState,
	reducers: {
		addNotification: (state, action: PayloadAction<Notification>) => {
			notificationsAdapter.addOne(state, action.payload);
			if (!action.payload.read) {
				state.unreadCount += 1;
			}
		},

		markAsRead: (state, action: PayloadAction<string>) => {
			const notification = state.entities[action.payload];
			if (notification && !notification.read) {
				notificationsAdapter.updateOne(state, {
					id: action.payload,
					changes: { read: true },
				});
				state.unreadCount -= 1;
			}
		},

		markAllAsRead: (state) => {
			const updates = state.ids.map((id) => ({
				id,
				changes: { read: true },
			}));
			notificationsAdapter.updateMany(state, updates);
			state.unreadCount = 0;
		},

		removeNotification: (state, action: PayloadAction<string>) => {
			const notification = state.entities[action.payload];
			if (notification && !notification.read) {
				state.unreadCount -= 1;
			}
			notificationsAdapter.removeOne(state, action.payload);
		},

		clearAllNotifications: (state) => {
			notificationsAdapter.removeAll(state);
			state.unreadCount = 0;
		},
	},
});

export const {
	addNotification,
	markAsRead,
	markAllAsRead,
	removeNotification,
	clearAllNotifications,
} = notificationsSlice.actions;

export const {
	selectAll: selectAllNotifications,
	selectById: selectNotificationById,
	selectIds: selectNotificationIds,
} = notificationsAdapter.getSelectors((state: RootState) => state.notifications);

export const selectUnreadCount = (state: RootState) => state.notifications.unreadCount;

export const selectUnreadNotifications = (state: RootState) =>
	selectAllNotifications(state).filter((notification) => !notification.read);

export default notificationsSlice.reducer;
