'use client';
import { useEffect, useState, useRef, useCallback } from 'react';
import QuestionCard from './components/QuestionCard';
import Loader from './components/Loader';
import Scores from './components/Scores';
import Finished from './components/Finished';

import { fetchQuestion } from './api/questions';
import { validateAnswer } from './api/validate';

import { QuestionData } from './api/questions';

const TOTAL_QUESTION = 5;

/*
1. Fetch and display one question at a time using the `fetchQuestion` function.
While the question is loading, render the `Loader` component.

2. If the user selects an answer **before time runs out:
* Disable further input.
* Call the `validateAnswer` API to check if the answer is correct.
* Then move to the **next question** automatically.
* If all questions are completed render `Finished` component

3. Render Scores component by passing accurate values of:
* ✅ Correct answers
* ❌ Incorrect answers

4. Show a 5-second countdown timer for each question.
If time runs out before the user selects an answer:
* Mark the question as `skipped`.
* Automatically move to the `next question`.

Track and display `Skipped` questions count

----
Do NOT make any changes in any file other than App.tsx
*/

const App = ({ maxTimePerQuestion = 5 }) => {
	const [isLoading, setIsLoading] = useState(false);
	const [count, setCount] = useState(0);
	const [remainingTime, setRemainingTime] = useState(maxTimePerQuestion);
	const [data, setData] = useState<QuestionData | null>(null);
	const [stats, setStats] = useState({
		correct: 0,
		incorrect: 0,
		skipped: 0,
	});
	const intervalId = useRef<NodeJS.Timeout | null>(null);

	useEffect(() => {
		if (intervalId.current) return;

		intervalId.current = setInterval(() => {
			setRemainingTime((prev: number) => --prev);
		}, 1000);
	}, []);

	const fetchData = useCallback(async (id: number) => {
		setIsLoading(true);
		const result = await fetchQuestion(id);
		setIsLoading(false);
		setRemainingTime(() => maxTimePerQuestion);
		setData(result);
	}, [maxTimePerQuestion]);

	useEffect(() => {
		fetchData(count);
		if (count === TOTAL_QUESTION) {
			intervalId.current && clearInterval(intervalId.current);
		}
	}, [count]);

	useEffect(() => {
		if (remainingTime === 0) {
			setStats((prev) => ({
				...prev,
				skipped: prev.skipped + 1,
			}));
			setCount((prev) => ++prev);
		}
	}, [remainingTime]);

	const handleSelect = async (value: string) => {
		if (!data) return;
		const result = await validateAnswer(value, data.correct);
		if (result === true) {
			setStats((prev) => ({
				...prev,
				correct: prev.correct + 1,
			}));
		} else {
			setStats((prev) => ({
				...prev,
				incorrect: prev.incorrect + 1,
			}));
		}
		setCount((prev) => ++prev);
	};

	if (isLoading) {
		return <Loader />;
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-white px-4 py-8">
			<div className="max-w-xl mx-auto bg-white rounded-2xl shadow-lg p-6 space-y-6">
				<h1 className="text-2xl font-bold text-center text-blue-600">
					🔥 Rapid Fire Quiz
				</h1>
				<Scores
					correct={stats.correct}
					incorrect={stats.incorrect}
					skipped={stats.skipped}
				/>
				<div className="space-y-4">
					<div className="text-right text-sm text-gray-600">
						⏳ Time Left: <span className="font-semibold">{remainingTime}s</span>
					</div>
					{(count < TOTAL_QUESTION && data) ? (
						<QuestionCard
							question={data.question}
							options={data.options || []}
							disabled={false}
							onSelect={handleSelect}
							selected={undefined}
						/>
					) : (
						<Finished />
					)}
				</div>
			</div>
		</div>
	);
};

export default App;
