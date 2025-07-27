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

const App = ({ maxTimePerQuestion = 5 }) => {
	const [isLoading, setIsLoading] = useState(true);
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
	const [remainingTime, setRemainingTime] = useState(maxTimePerQuestion);
	const [currentQuestion, setCurrentQuestion] = useState<QuestionData | null>(null);
	const [isAnswered, setIsAnswered] = useState(false);
	const [stats, setStats] = useState({
		correct: 0,
		incorrect: 0,
		skipped: 0,
	});
	const timerRef = useRef<NodeJS.Timeout | null>(null);

	// Move to next question
	const moveToNextQuestion = useCallback(() => {
		setCurrentQuestionIndex((prev) => prev + 1);
	}, []);

	// Stop timer
	const stopTimer = useCallback(() => {
		if (timerRef.current) {
			clearInterval(timerRef.current);
			timerRef.current = null;
		}
	}, []);

	// Start/restart timer
	const startTimer = useCallback(() => {
		// Clear existing timer
		stopTimer();

		timerRef.current = setInterval(() => {
			setRemainingTime((prev) => {
				if (prev <= 1) {
					// Time's up - mark as skipped and move to next
					setStats((prevStats) => ({
						...prevStats,
						skipped: prevStats.skipped + 1,
					}));
					moveToNextQuestion();
					return 0;
				}
				return prev - 1;
			});
		}, 1000);
	}, [moveToNextQuestion, stopTimer]);

	// Load question data
	const loadQuestion = useCallback(
		async (questionIndex: number) => {
			if (questionIndex >= TOTAL_QUESTION) return;

			setIsLoading(true);
			setIsAnswered(false);
			stopTimer(); // Stop any existing timer

			try {
				const questionData = await fetchQuestion(questionIndex);
				setCurrentQuestion(questionData);
				setRemainingTime(maxTimePerQuestion);

				// Start timer immediately after question is loaded
				setIsLoading(false);
				startTimer();
			} catch (error) {
				console.error('Failed to fetch question:', error);
				setIsLoading(false);
			}
		},
		[maxTimePerQuestion, stopTimer, startTimer],
	);

	// Handle answer selection
	const handleSelect = useCallback(
		async (selectedAnswer: string) => {
			if (!currentQuestion || isAnswered) return;

			setIsAnswered(true);
			stopTimer();

			try {
				const isCorrect = await validateAnswer(
					selectedAnswer,
					currentQuestion.correct,
				);

				setStats((prevStats) => ({
					...prevStats,
					correct: isCorrect ? prevStats.correct + 1 : prevStats.correct,
					incorrect: isCorrect ? prevStats.incorrect : prevStats.incorrect + 1,
				}));

				// Move to next question after a brief delay
				setTimeout(() => {
					moveToNextQuestion();
				}, 500);
			} catch (error) {
				console.error('Failed to validate answer:', error);
				setIsAnswered(false);
			}
		},
		[currentQuestion, isAnswered, stopTimer, moveToNextQuestion],
	);

	// Load question when index changes
	useEffect(() => {
		loadQuestion(currentQuestionIndex);
	}, [currentQuestionIndex, loadQuestion]);

	// Cleanup timer on unmount
	useEffect(() => {
		return () => stopTimer();
	}, [stopTimer]);

	if (isLoading && currentQuestionIndex < TOTAL_QUESTION) {
		return <Loader />;
	}

	const isQuizFinished = currentQuestionIndex >= TOTAL_QUESTION;

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
					{!isQuizFinished && (
						<div className="text-right text-sm text-gray-600">
							⏳ Time Left:{' '}
							<span className="font-semibold">{remainingTime}s</span>
						</div>
					)}
					{isQuizFinished ? (
						<Finished />
					) : currentQuestion ? (
						<QuestionCard
							question={currentQuestion.question}
							options={currentQuestion.options || []}
							disabled={isAnswered}
							onSelect={handleSelect}
							selected={undefined}
						/>
					) : null}
				</div>
			</div>
		</div>
	);
};

export default App;
