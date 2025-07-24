
// Define the shape of the history state
interface HistoryState {
	queue: any[];
	currentIndex: number;
}

// Define the types of actions that can be dispatched to the reducer
type HistoryAction =
	| { type: 'PUSH'; value: any; capacity: number }
	| { type: 'UNDO' }
	| { type: 'REDO' }
	| { type: 'RESET'; initialState: any }
	| { type: 'GO_TO'; index: number };

/**
 * The reducer function that manages the state transitions for the history hook.
 * It takes the current state and an action, and returns the new state.
 */
export function historyReducer(state: HistoryState, action: HistoryAction): HistoryState {
	switch (action.type) {
		case 'PUSH': {
			let newQueue = [...state.queue];
			let newIndex = state.currentIndex;

			// 1. Truncate "future" history if currentIndex is not at the end.
			// This is crucial for correct undo/redo behavior when a new action
			// is performed after an undo.
			if (newIndex < newQueue.length - 1) {
				newQueue = newQueue.slice(0, newIndex + 1);
			}

			// 2. Handle capacity limit: If adding the new item would exceed capacity,
			// remove the oldest item from the beginning.
			if (newQueue.length >= action.capacity) {
				newQueue.shift();
				// If an item was shifted, the effective index for the current state
				// also shifts down by one, unless it was already at the beginning.
				newIndex = Math.max(0, newIndex - 1);
			} else {
				// If no shift occurred, and we truncated, the new index is simply the current index
				// (before the push)
				newIndex = newQueue.length; // The new item will be at this index
			}

			// 3. Add the new value to the end of the queue
			newQueue.push(action.value);

			// 4. Set the current index to the last item in the new queue
			return {
				queue: newQueue,
				currentIndex: newQueue.length - 1,
			};
		}

		case 'UNDO':
			return {
				...state,
				currentIndex: Math.max(0, state.currentIndex - 1),
			};

		case 'REDO':
			return {
				...state,
				currentIndex: Math.min(state.queue.length - 1, state.currentIndex + 1),
			};

		case 'RESET':
			return {
				queue: [action.initialState],
				currentIndex: 0,
			};

		case 'GO_TO':
			// Ensure the target index is within valid bounds
			if (action.index >= 0 && action.index < state.queue.length) {
				return {
					...state,
					currentIndex: action.index,
				};
			}
			// If index is invalid, return current state unchanged
			return state;

		default:
			// For any unknown action types, return the current state
			return state;
	}
}
