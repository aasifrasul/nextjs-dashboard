'use client';

import React from 'react';
import { Button } from '@/app/ui/button';

import { useTimer } from '../../hooks';

interface StopwatchProps {}

const Stopwatch: React.FC<StopwatchProps> = (props) => {
	const { seconds, milliseconds, start, stop, reset } = useTimer();

	return (
		<div>
			<div>
				{seconds} {milliseconds}
			</div>
			<div>
				<Button onClick={start}>Start</Button>
				<Button onClick={stop}>Stop</Button>
				<Button onClick={reset}>Reset</Button>
			</div>
		</div>
	);
};

export default Stopwatch;
