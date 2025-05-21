'use client';
import { useState, useEffect } from 'react';
import { Player, ShipType  } from './types';
import { GamePlay, generateRandomNumberUnderNum, BOARD_SIZE, GamePlayState } from './GamePlay';
import styles from './index.module.css';

export default function BattleShip() {
	// State to store the game state
	const [gameState, setGameState] = useState<GamePlayState | null>(null);
	const [hoveredCell, setHoveredCell] = useState<{ x: number, y: number } | null>(null);
  
	// Get the singleton instance of GamePlay
	const gameplay = GamePlay.getInstance();
  
	// Subscribe to changes in the GamePlay state
	useEffect(() => {
		// Initialize with current state
		setGameState(gameplay.getState());
    
		// Subscribe to future updates
		const unsubscribe = gameplay.subscribe((newState) => {
			setGameState(newState);
		});
    
		// Cleanup subscription when component unmounts
		return () => {
			unsubscribe();
		};
	}, []);
  
	// Handle loading state
	if (!gameState) {
		return <div>Loading...</div>;
	}
  
	const handleCellClick = (player: Player, x: number, y: number) => {
		if (gameState.currentState === 'setup' && player === gameState.currentPlayer) {
			// In setup phase, clicking a cell attempts to place a ship
			gameplay.placeShip(player, x, y);
		} else if (gameState.currentState === 'playing' && player !== gameState.currentPlayer) {
			// In playing phase, clicking a cell fires a shot at the opponent's board
			gameplay.fireShot(gameState.currentPlayer, x, y);
		}
	};
  
	const handleCellHover = (x: number, y: number) => {
		setHoveredCell({ x, y });
	};
  
	const handleCellHoverEnd = () => {
		setHoveredCell(null);
	};
  
	const handleToggleOrientation = () => {
		gameplay.toggleOrientation();
	};
  
	const handleSelectShipType = (shipType: ShipType) => {
		gameplay.selectShipType(shipType);
	};
  
	const handleReset = () => {
		gameplay.resetGame();
	};
  
	const isShipPlacementPreview = (player: Player, x: number, y: number) => {
		if (
			gameState.currentState !== 'setup' ||
			player !== gameState.currentPlayer ||
			!hoveredCell ||
			hoveredCell.x !== x ||
			hoveredCell.y !== y ||
			!gameState.setupPhase.currentShipType
		) {
			return false;
		}
    
		return gameplay.canPlaceShip(
			player,
			x,
			y,
			gameState.setupPhase.currentShipType,
			gameState.setupPhase.currentOrientation
		);
	};

	// Determine what boards to show based on game state
	const renderSetupControls = () => {
		if (gameState.currentState !== 'setup') return null;
    
		const currentPlayer = gameState.currentPlayer;
		const currentShipType = gameState.setupPhase.currentShipType;
		const orientation = gameState.setupPhase.currentOrientation;
		const availableShips = gameplay.getAvailableShips(currentPlayer);
    
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
						{availableShips.map(shipType => (
							<button
								key={shipType}
								className={`${styles.shipButton} ${currentShipType === shipType ? styles.selected : ''}`}
								onClick={() => handleSelectShipType(shipType)}
							>
								{ShipType[shipType]} ({gameplay.getShipSize(shipType)})
							</button>
						))}
					</div>
				</div>
			</div>
		);
	};
  
	const renderGameStatus = () => {
		if (gameState.currentState === 'setup') {
			return <div className={styles.gameStatus}>{gameplay.getSetupStatus()}</div>;
		} else if (gameState.currentState === 'playing') {
			return <div className={styles.gameStatus}>Current Player: {gameState.currentPlayer}</div>;
		} else if (gameState.currentState === 'gameover') {
			const winner = gameplay.getWinner();
			return <div className={styles.gameStatus}>Game Over! Player {winner} wins!</div>;
		}
    
		return null;
	};
  
	const renderBoard = (player: Player, showShips: boolean) => {
		// In setup phase, only show the current player's board
		// In playing phase, show both boards but with different views
		const grid = showShips 
			? gameState.players[player].board.grid 
			: gameState.players[player === 1 ? 2 : 1].trackingGrid;
    
		const isCurrentPlayerBoard = player === gameState.currentPlayer;
		const isSetupPhase = gameState.currentState === 'setup';
		const isPlayingPhase = gameState.currentState === 'playing';
    
		// Determine if this board is interactive in the current phase
		const isInteractive = (isSetupPhase && isCurrentPlayerBoard) || 
			(isPlayingPhase && !isCurrentPlayerBoard);
    
		return (
			<div className={styles.board}>
				{grid.map((row, y) => (
					<div key={y} className={styles.row}>
						{row.map((cell, x) => {
							const isPreview = isSetupPhase && isCurrentPlayerBoard && 
								isShipPlacementPreview(player, x, y);
                              
							return (
								<button 
									key={x} 
									className={`
                    ${styles.cell} 
                    ${styles[cell]} 
                    ${isPreview ? styles.preview : ''}
                    ${isInteractive ? styles.interactive : ''}
                  `}
									onClick={() => isInteractive && handleCellClick(player, x, y)}
									onMouseEnter={() => isInteractive && handleCellHover(x, y)}
									onMouseLeave={handleCellHoverEnd}
								>
									{isSetupPhase && showShips && cell === 'ship' ? '■' : 
										isPlayingPhase && cell === 'hit' ? '✓' : 
											isPlayingPhase && cell === 'miss' ? '✗' : ''}
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
					{gameState.currentState === 'setup' ? (
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
        
				{gameState.currentState !== 'setup' && (
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