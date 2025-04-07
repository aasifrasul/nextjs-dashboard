'use client';

import React, { createContext, useContext, useState, memo } from 'react';

interface MyContextValue {
	value: string;
	setValue: (newValue: string) => void;
}

const MyContext = createContext<MyContextValue | undefined>(undefined);

interface Props {
	value: string;
}

const MemoizedConsumer = memo<Props>(({ value }) => {
	console.log('MemoizedConsumer rendered');
	return <div>Context Value: {value}</div>;
});

const RegularConsumer: React.FC<Props> = ({ value }) => {
	console.log('RegularConsumer rendered');
	return <div>Context Value: {value}</div>;
};

const Parent: React.FC = () => {
	const [count, setCount] = useState(0);
	const [contextValue, setContextValue] = useState<string>('Initial Value');

	const context: MyContextValue = {
		value: contextValue,
		setValue: setContextValue,
	};

	return (
		<MyContext.Provider value={context}>
			<button onClick={() => setCount(count + 1)}>
				Increment Count (No Context Change)
			</button>
			<button onClick={() => setContextValue(Math.random().toString())}>
				Change Context Value
			</button>

			{/* Passing context value as a prop */}
			<MemoizedConsumer value={contextValue} />

			{/* Directly consuming context */}
			<RegularConsumer value={useContext(MyContext)?.value || ''} />
		</MyContext.Provider>
	);
};

export default Parent;
