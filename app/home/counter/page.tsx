'use client';

import { useReducer } from 'react';
import { Button } from '@/app/ui/button';

interface Action {
	type: 'increment' | 'decrement';
	payload?: number;
}

interface State {
	count: number;
}

const initialState: State = {
	count: 0,
};

const countReducer = (state: State = initialState, action: Action) => {
	switch (action.type) {
		case 'increment':
			return {
				...state,
				count: state.count + 1,
			};
		case 'decrement':
			return {
				...state,
				count: state.count - 1,
			};
	}
};

export default function Page() {
	const [state, dispatch] = useReducer(countReducer, initialState);

	const handleIncrement = () => dispatch({ type: 'increment' });
	const handleDecrement = () => dispatch({ type: 'decrement' });

	return (
		<>
			<div>Count: {state.count}</div>
			<div className={'flex flex-direction-row'}>
				<Button onClick={() => handleIncrement()}>+</Button>
				<Button onClick={() => handleDecrement()}>-</Button>
			</div>
		</>
	);
}
