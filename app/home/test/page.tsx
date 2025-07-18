'use client';
import React from 'react';

/*
  Exercise


*/

export default function App() {
	const [text, setText] = React.useState<string>('');
	const [show, setShow] = React.useState<boolean>(false);
	const counter = React.useRef<number>(0);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setText(e.target.value);
	}

	const handleClick = () => {
		setShow((prev: boolean) => !prev);
	}

	React.useEffect(() => {
		const interval = setInterval(() => {
			setText('');
		}, 3000);
		return () => clearInterval(interval);
	}, []);

	React.useEffect(() => {
		counter.current += 1;
	}, [text]);

	return (
		<div className="App">
			<h1>Cartrack Frontend Exercises</h1>
			{show && <input type="text" value={text} onChange={handleChange} />}
			<button onClick={handleClick}>{show ? 'Show' : 'Hide'}</button>
			<div>Count of clearing {counter.current}</div>
		</div>
	);
}
