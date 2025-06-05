'use client';

import React, { useReducer } from 'react';
import { Button } from '@/app/ui/button';

interface State {
	count: number;
}

interface Action {
	type: 'increment' | 'decrement';
}

function reducer(state: State, action: Action): State {
	switch (action.type) {
		case 'increment':
			return { count: state.count + 1 };
		case 'decrement':
			return { count: state.count - 1 };
		default:
			throw new Error();
	}
}

export default function Counter() {
	const [state, dispatch] = useReducer(reducer, { count: 0 });

	return (
		<>
			Count: {state.count}
			<Button onClick={() => dispatch({ type: 'increment' })}>+</Button>
			<Button onClick={() => dispatch({ type: 'decrement' })}>-</Button>
		</>
	);
}
