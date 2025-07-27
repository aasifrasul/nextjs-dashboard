export interface HistoryState {
	queue: any[];
	currentIndex: number;
}

export type HistoryAction =
	| { type: 'PUSH'; value: any; capacity: number }
	| { type: 'UNDO' }
	| { type: 'REDO' }
	| { type: 'RESET'; initialState: any }
	| { type: 'GO_TO'; index: number }
	| { type: 'INITIALIZE'; state: HistoryState };

export function historyReducer(state: HistoryState, action: HistoryAction): HistoryState {
	switch (action.type) {
		case 'PUSH': {
			// Remove any future states if we're not at the end
			const newQueue = state.queue.slice(0, state.currentIndex + 1);
			newQueue.push(action.value);

			// Trim queue if it exceeds capacity
			if (newQueue.length > action.capacity) {
				newQueue.shift();
				return {
					queue: newQueue,
					currentIndex: newQueue.length - 1,
				};
			}

			return {
				queue: newQueue,
				currentIndex: newQueue.length - 1,
			};
		}

		case 'UNDO': {
			return {
				...state,
				currentIndex: Math.max(0, state.currentIndex - 1),
			};
		}

		case 'REDO': {
			return {
				...state,
				currentIndex: Math.min(state.queue.length - 1, state.currentIndex + 1),
			};
		}

		case 'RESET': {
			return {
				queue: [action.initialState],
				currentIndex: 0,
			};
		}

		case 'GO_TO': {
			const clampedIndex = Math.max(0, Math.min(state.queue.length - 1, action.index));
			return {
				...state,
				currentIndex: clampedIndex,
			};
		}

		case 'INITIALIZE': {
			const { queue, currentIndex } = action.state;
			return { queue, currentIndex };
		}

		default:
			return state;
	}
}
