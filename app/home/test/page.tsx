'use client';

import React from 'react';
import { isNumber } from 'util';

/**
 * you are given an array of strings representing 
 * book titles. Sort the titles alphabetically, 
 * but ignore the articles "a", "an", and "the" 
 * at the beginning of the titles when comparing them. 
 * Example: Input:["The Lord of the Rings", 
 * "A Game of Thrones", "Ancillary Justice", "1984"]
 
*/
const ignoreList = ['a', 'an', 'the'];
export default function App() {
	const [books, setBooks] = React.useState([
		'The Lord of the Rings',
		'A Game of Thrones',
		'Ancillary Justice',
		'1984',
	]);
	const hash = React.useRef<Record<string, string[]>>({});

	React.useEffect(() => {
		books.forEach((item, index) => {
			hash.current[item] = item.split(' ');
		});
		const sortedBooks = books.sort((a: any, b: any): any => {
			const tempA: any[] = hash.current[a];
			const tempB: any[] = hash.current[b];
			console.log(tempA);
			console.log(tempB);

			const compareA: any = ignoreList.includes(tempA[0].toLowerCase())
				? tempA[1]
				: tempA[0];
			const compareB: any = ignoreList.includes(tempB[0].toLowerCase())
				? tempB[1]
				: tempB[0];

			if (Number.isInteger(compareA) && Number.isInteger(compareB)) {
				return compareA - compareB;
			} else if (Number.isInteger(compareA)) {
				return 1;
			} else {
				return compareA.charCodeAt(0) - compareB.charCodeAt(0);
			}
		});
		console.log(`books`, books);
		console.log(`sortedBooks`, sortedBooks);
	}, []);

	return (
		<div className="App">
			<h1>Hello CodeSandbox</h1>
			<h2>Start editing to see some magic happen!</h2>
		</div>
	);
}
