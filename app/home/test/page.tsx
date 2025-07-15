'use client';

import React, { useEffect, useRef, useState } from 'react';

export default function Test() {
	const [name, setName] = useState<string>('');
	const [disabled, setDisabled] = useState<boolean>(false);
	const textRef = useRef<string>('Input Field is enabled');

	const handleClick = () => {
		setDisabled((prev) => !prev);
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setName(e.target.value);
	};

	useEffect(() => {
		alert(`disabled: ${disabled}`);
	}, [disabled]);

	const textMessage = disabled ? 'Input Field is disabled' : 'Input Field is enabled';

	return (
		<div>
			<span>{textMessage}</span>
			<input
				type="text"
				name="name"
				value={name}
				onChange={handleChange}
				disabled={disabled}
			/>
			<button onClick={handleClick}>Toggle</button>
		</div>
	);
}
