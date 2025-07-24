interface HistoryState {
	queue: string[];
	currentIndex: number;
}

type HistoryAction =
	| { type: 'PUSH'; value: string; capacity: number }
	| { type: 'UNDO' }
	| { type: 'REDO' }
	| { type: 'RESET'; initialState: string }
	| { type: 'GO_TO'; index: number };

export function historyReducer(state: HistoryState, action: HistoryAction): HistoryState {
	switch (action.type) {
		case 'PUSH': {
			let newQueue = [...state.queue];
			let newIndex = state.currentIndex;

			// Remove from beginning if at capacity
			if (newQueue.length >= action.capacity) {
				newQueue.shift();
				newIndex = Math.max(0, newIndex - 1);
			}

			newQueue.push(action.value);
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
			return {
				...state,
				currentIndex:
					action.index >= 0 && action.index < state.queue.length
						? action.index
						: state.currentIndex,
			};

		default:
			return state;
	}
}
