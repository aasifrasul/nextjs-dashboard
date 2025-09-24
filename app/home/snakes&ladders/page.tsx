'use client';
import { useEffect, useState } from 'react';

// Snakes and ladders effects - key is position, value is where you go
const snakesAndLadders: Record<number, number> = {
	2: 38, // Ladder
	7: 14, // Ladder
	8: 31, // Ladder
	15: 26, // Ladder
	21: 42, // Ladder
	28: 84, // Ladder
	36: 44, // Ladder
	51: 67, // Ladder
	71: 91, // Ladder
	78: 98, // Ladder
	16: 6, // Snake
	47: 26, // Snake
	49: 11, // Snake
	56: 53, // Snake
	62: 19, // Snake
	64: 60, // Snake
	87: 24, // Snake
	93: 73, // Snake
	95: 75, // Snake
	98: 78, // Snake
};

export default function App() {
	const [currentPlayer, setCurrentPlayer] = useState<number>(1);
	const [lastRoll, setLastRoll] = useState<number>(0);
	const [gameWon, setGameWon] = useState<boolean>(false);
	const [winner, setWinner] = useState<number | null>(null);
	const [playerPositions, setPlayerPositions] = useState<Record<number, number>>({
		1: 0, // Position 0 means not started yet, position 1 is the first square
		2: 0,
	});

	// Create board positions array (1-100) with snake pattern
	const createBoard = () => {
		const board = [];
		for (let row = 9; row >= 0; row--) {
			// Start from top row in display
			const rowPositions = [];
			const startNum = row * 10 + 1; // First number of this logical row

			for (let col = 0; col < 10; col++) {
				rowPositions.push(startNum + col);
			}

			// Reverse odd-numbered rows (counting from bottom: row 1, 3, 5, 7, 9)
			// This creates the snake pattern where bottom row goes 1->10, next row goes 20->11, etc.
			if (row % 2 === 1) {
				rowPositions.reverse();
			}

			board.push(...rowPositions);
		}
		return board;
	};

	const boardPositions = createBoard();

	const handleRoll = () => {
		if (gameWon) return;

		const roll = Math.ceil(Math.random() * 6);
		setLastRoll(roll);

		setPlayerPositions((prev) => {
			let newPosition = prev[currentPlayer] + roll;

			// Can't move if would exceed 100
			if (newPosition > 100) {
				newPosition = prev[currentPlayer];
			}

			// Apply snakes and ladders
			if (snakesAndLadders[newPosition]) {
				newPosition = snakesAndLadders[newPosition];
			}

			// Check for win
			if (newPosition === 100) {
				setGameWon(true);
				setWinner(currentPlayer);
			}

			return {
				...prev,
				[currentPlayer]: newPosition,
			};
		});
	};

	const resetGame = () => {
		setPlayerPositions({ 1: 0, 2: 0 });
		setCurrentPlayer(1);
		setLastRoll(0);
		setGameWon(false);
		setWinner(null);
	};

	useEffect(() => {
		if (!gameWon) {
			setCurrentPlayer((prev) => (prev === 1 ? 2 : 1));
		}
	}, [playerPositions, gameWon]);

	return (
		<div className="p-4 max-w-4xl mx-auto">
			<div className="mb-6 text-center">
				<h1 className="text-3xl font-bold mb-4">Snakes and Ladders</h1>

				{gameWon ? (
					<div className="mb-4">
						<h2 className="text-2xl font-bold text-green-600">
							🎉 Player {winner} Wins! 🎉
						</h2>
						<button
							onClick={resetGame}
							className="mt-2 bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600"
						>
							Play Again
						</button>
					</div>
				) : (
					<div className="mb-4">
						<div className="text-lg font-semibold mb-2">
							Current Player:{' '}
							<span
								className={
									currentPlayer === 1 ? 'text-blue-600' : 'text-red-600'
								}
							>
								Player {currentPlayer}
							</span>
						</div>
						{lastRoll > 0 && <div className="text-md">Last Roll: {lastRoll}</div>}
						<button
							onClick={handleRoll}
							className="mt-3 bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600 text-lg"
						>
							🎲 Roll Dice
						</button>
					</div>
				)}

				<div className="flex justify-center gap-8 mb-4">
					<div className="text-center">
						<div className="text-blue-600 font-bold">Player 1</div>
						<div>Position: {playerPositions[1]}</div>
					</div>
					<div className="text-center">
						<div className="text-red-600 font-bold">Player 2</div>
						<div>Position: {playerPositions[2]}</div>
					</div>
				</div>
			</div>

			<div className="grid grid-cols-10 gap-1 bg-gray-800 p-3 rounded-lg mx-auto w-fit">
				{boardPositions.map((position, index) => {
					const isSnake =
						Object.keys(snakesAndLadders).includes(position.toString()) &&
						snakesAndLadders[position] < position;
					const isLadder =
						Object.keys(snakesAndLadders).includes(position.toString()) &&
						snakesAndLadders[position] > position;
					const player1Here = playerPositions[1] === position;
					const player2Here = playerPositions[2] === position;

					return (
						<div
							key={position}
							className={`w-12 h-12 border border-gray-400 flex flex-col items-center justify-center text-xs font-bold ${
								position === 1
									? 'bg-green-200'
									: position === 100
									? 'bg-yellow-200'
									: 'bg-white'
							} ${isSnake ? 'bg-red-100' : ''} ${
								isLadder ? 'bg-green-100' : ''
							}`}
						>
							<div className="text-[10px] text-gray-600">{position}</div>

							{isSnake && <div className="text-[8px] text-red-600">🐍</div>}
							{isLadder && <div className="text-[8px] text-green-600">🪜</div>}

							<div className="flex gap-1">
								{player1Here && (
									<span className="text-[10px] text-blue-600 font-bold">
										P1
									</span>
								)}
								{player2Here && (
									<span className="text-[10px] text-red-600 font-bold">
										P2
									</span>
								)}
							</div>
						</div>
					);
				})}
			</div>

			<div className="mt-4 text-sm text-gray-600 text-center">
				<p>
					🪜 Green squares = Ladders (climb up) | 🐍 Red squares = Snakes (slide
					down)
				</p>
				<p>Start at position 1 (green) | Goal: Reach position 100 (yellow)</p>
			</div>
		</div>
	);
}
