'use client';
import React from 'react';

import styles from './styles.module.css';

const DigitalClock = () => {
	const [timeString, setTimeString] = React.useState('');
	const timerRef = React.useRef<NodeJS.Timeout | null>(null);

	const clearTimer = () => timerRef.current && clearTimeout(timerRef.current);

	const updateTime = (k: number) => (k < 10 ? '0' + k : k);

	function getCurrentTime(format: '12-hour' | '24-hour') {
		const date = new Date();
		let hour = updateTime(date.getHours());
		const minute = updateTime(date.getMinutes());
		const second = updateTime(date.getSeconds());
		const hourNumber = Number(hour);
		const meridiem = hourNumber >= 12 ? 'PM' : 'AM';
		clearTimer();

		if (format === '12-hour') {
			hour = hourNumber === 0 ? 12 : hourNumber > 12 ? hourNumber - 12 : hourNumber;
		}

		let timeText = hour + ' : ' + minute + ' : ' + second;
		if (format === '12-hour') {
			timeText += ' ' + meridiem;
		}

		setTimeString(() => timeText);

		// Schedule the next update
		const msUntilNextSecond = 1000 - new Date().getMilliseconds();
		setTimeout(() => {
			getCurrentTime('24-hour');
			setInterval(() => getCurrentTime('24-hour'), 1000);
		}, msUntilNextSecond);
	}

	React.useEffect(() => {
		getCurrentTime('24-hour');

		const interval = setInterval(() => getCurrentTime('24-hour'), 1000);

		return () => clearInterval(interval);
	}, []);

	return <div className={styles.clock}>{timeString}</div>;
};

export default DigitalClock;
