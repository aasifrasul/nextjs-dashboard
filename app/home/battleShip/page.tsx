'use client';
import { useState, useEffect } from 'react';

import { getShipSize, useBattleshipStore } from '../../stores/battleshipStore';

import { ShipType } from './types';

import styles from './index.module.css';

export default function BattleshipWith() {
	const {
		currentState,
		currentPlayer,
		players,
		setupPhase,
		placeShip,
		fireShot,
		selectShipType,
		toggleOrientation,
		resetGame,
		getAvailableShips,
		canPlaceShipAt,
		getWinner,
	} = useBattleshipStore();

	const [hoveredCell, setHoveredCell] = useState<{ x: number; y: number } | null>(null);

	const handleCellClick = (player: Player, x: number, y: number) => {
		if (currentState === 'setup' && player === currentPlayer) {
			placeShip(player, x, y);
		} else if (currentState === 'playing' && player !== currentPlayer) {
			fireShot(currentPlayer, x, y);
		}
	};

	const isShipPlacementPreview = (player: Player, x: number, y: number) => {
		return (
			currentState === 'setup' &&
			player === currentPlayer &&
			hoveredCell?.x === x &&
			hoveredCell?.y === y &&
			canPlaceShipAt(player, x, y)
		);
	};

	const handleCellHover = (x: number, y: number) => {
		setHoveredCell({ x, y });
	};

	const handleCellHoverEnd = () => {
		setHoveredCell(null);
	};

	const handleToggleOrientation = () => {
		toggleOrientation();
	};

	const handleSelectShipType = (shipType: ShipType) => {
		selectShipType(shipType);
	};

	const handleReset = () => {
		resetGame();
	};

	// Determine what boards to show based on game state
	const renderSetupControls = () => {
		if (currentState !== 'setup') return null;

		const currentShipType = setupPhase.currentShipType;
		const orientation = setupPhase.currentOrientation;
		const availableShips = getAvailableShips(currentPlayer);

		return (
			<div className={styles.setupControls}>
				<h3>Setup Phase - Player {currentPlayer}</h3>
				<div>
					<button onClick={handleToggleOrientation}>
						Orientation: {orientation}
					</button>
				</div>
				<div className={styles.shipSelection}>
					<h4>Select Ship:</h4>
					<div className={styles.shipButtons}>
						{availableShips.map((shipType) => (
							<button
								key={shipType}
								className={`${styles.shipButton} ${currentShipType === shipType ? styles.selected : ''}`}
								onClick={() => handleSelectShipType(shipType)}
							>
								{ShipType[shipType]} ({getShipSize(shipType)})
							</button>
						))}
					</div>
				</div>
			</div>
		);
	};

	const renderGameStatus = () => {
		if (currentState === 'setup') {
			return <div className={styles.gameStatus}>{currentState}</div>;
		} else if (currentState === 'playing') {
			return <div className={styles.gameStatus}>Current Player: {currentPlayer}</div>;
		} else if (currentState === 'gameover') {
			const winner = getWinner();
			return <div className={styles.gameStatus}>Game Over! Player {winner} wins!</div>;
		}

		return null;
	};

	const renderBoard = (player: Player, showShips: boolean) => {
		// In setup phase, only show the current player's board
		// In playing phase, show both boards but with different views
		const grid = showShips
			? players[player!].board.grid
			: players[player === 1 ? 2 : 1].trackingGrid;

		const isCurrentPlayerBoard = player === currentPlayer;
		const isSetupPhase = currentState === 'setup';
		const isPlayingPhase = currentState === 'playing';

		// Determine if this board is interactive in the current phase
		const isInteractive =
			(isSetupPhase && isCurrentPlayerBoard) ||
			(isPlayingPhase && !isCurrentPlayerBoard);

		return (
			<div className={styles.board}>
				{grid.map((row, y) => (
					<div key={y} className={styles.row}>
						{row.map((cell, x) => {
							const isPreview =
								isSetupPhase &&
								isCurrentPlayerBoard &&
								isShipPlacementPreview(player, x, y);

							return (
								<button
									key={x}
									className={`
										${styles.cell}
										${isPreview ? styles.preview : ''}
										${isInteractive ? styles.interactive : ''}
									`}
									onClick={() =>
										isInteractive && handleCellClick(player, x, y)
									}
									onMouseEnter={() => isInteractive && handleCellHover(x, y)}
									onMouseLeave={handleCellHoverEnd}
								>
									{isSetupPhase && showShips && cell === 'ship'
										? '■'
										: isPlayingPhase && cell === 'hit'
											? '✓'
											: isPlayingPhase && cell === 'miss'
												? '✗'
												: ''}
								</button>
							);
						})}
					</div>
				))}
			</div>
		);
	};

	return (
		<div className={styles.main}>
			<div className={styles.header}>
				<h1>Battleship Game</h1>
				<div className={styles.controls}>
					<button onClick={handleReset}>Reset Game</button>
					{renderGameStatus()}
				</div>
				{renderSetupControls()}
			</div>

			<div className={styles.gameContainer}>
				<div className={styles.playerSection}>
					<h2>Player 1</h2>
					{currentState === 'setup' ? (
						// In setup phase, show own board
						renderBoard(1, true)
					) : (
						// In playing phase, show own board and opponent's tracking grid
						<div className={styles.boardContainer}>
							<div>
								<h3>Your Board</h3>
								{renderBoard(1, true)}
							</div>
							<div>
								<h3>Opponent's Board</h3>
								{renderBoard(2, false)}
							</div>
						</div>
					)}
				</div>

				{currentState !== 'setup' && (
					<div className={styles.playerSection}>
						<h2>Player 2</h2>
						<div className={styles.boardContainer}>
							<div>
								<h3>Your Board</h3>
								{renderBoard(2, true)}
							</div>
							<div>
								<h3>Opponent's Board</h3>
								{renderBoard(1, false)}
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
