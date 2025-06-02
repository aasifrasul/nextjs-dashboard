// GamePlay.ts
import {
	CellState,
	FireShotResult,
	GameState,
	Orientation,
	PlaceShipError,
	PlaceShipResult,
	Player,
	PlayerBoard,
	PlayerState,
	ShipConfig,
	ShipType,
} from './types';

// Player mapping
const PLAYERS: Record<number, Player> = {
	0: 1,
	1: 2,
};

// Board size constants
export const BOARD_SIZE: number = 10; // Standard 10x10 grid for Battleship

// Standard fleet configuration - each player gets these ships
const STANDARD_FLEET = [
	{ type: ShipType.Carrier, count: 1 },
	{ type: ShipType.Battleship, count: 1 },
	{ type: ShipType.Cruiser, count: 1 },
	{ type: ShipType.Submarine, count: 1 },
	{ type: ShipType.Destroyer, count: 1 },
];

// Helper for creating deep copies
const deepClone = <T>(obj: T): T => JSON.parse(JSON.stringify(obj));

// Create a proper 2D array initialization function
const create2DArray = (size: number, initialValue: any): any[][] => {
	return Array(size)
		.fill(null)
		.map(() => Array(size).fill(initialValue));
};

// Initialize player states
const initializePlayerStates = (): Record<number, PlayerState> => ({
	1: {
		board: {
			grid: create2DArray(BOARD_SIZE, 'empty'),
			ships: [],
			remainingShips: 0,
		},
		trackingGrid: create2DArray(BOARD_SIZE, 'empty'),
	},
	2: {
		board: {
			grid: create2DArray(BOARD_SIZE, 'empty'),
			ships: [],
			remainingShips: 0,
		},
		trackingGrid: create2DArray(BOARD_SIZE, 'empty'),
	},
});

export type GamePlayListener = (gameState: GamePlayState) => void;

export interface GamePlayState {
	currentState: GameState;
	currentPlayer: Player;
	players: Record<number, PlayerState>;
	setupPhase: {
		currentShipType: ShipType | null;
		currentOrientation: Orientation;
		placedShips: Record<Player, ShipType[]>;
	};
}

export class GamePlay {
	private currentState: GameState = 'setup';
	private currentPlayer: Player = PLAYERS[0];
	private players: Record<number, PlayerState>;
	private listeners: GamePlayListener[] = [];
	private setupPhase = {
		currentShipType: ShipType.Carrier as ShipType | null,
		currentOrientation: Orientation.Horizontal,
		placedShips: {
			1: [] as ShipType[],
			2: [] as ShipType[],
		},
	};

	// Singleton instance
	private static instance: GamePlay | null = null;

	// Private constructor for singleton pattern
	private constructor() {
		this.players = initializePlayerStates();
	}

	// Singleton accessor
	public static getInstance(): GamePlay {
		if (!GamePlay.instance) {
			GamePlay.instance = new GamePlay();
		}
		return GamePlay.instance;
	}

	// Add a listener to be notified of state changes
	subscribe(listener: GamePlayListener): () => void {
		this.listeners.push(listener);

		// Return unsubscribe function
		return () => {
			this.listeners = this.listeners.filter((l) => l !== listener);
		};
	}

	// Notify all listeners of state change
	private notifyListeners(): void {
		const state: GamePlayState = {
			currentState: this.currentState,
			currentPlayer: this.currentPlayer,
			players: deepClone(this.players),
			setupPhase: deepClone(this.setupPhase),
		};

		this.listeners.forEach((listener) => listener(state));
	}

	// Reset the game state
	resetGame(): void {
		this.currentState = 'setup';
		this.currentPlayer = PLAYERS[0];
		this.players = initializePlayerStates();
		this.setupPhase = {
			currentShipType: ShipType.Carrier,
			currentOrientation: Orientation.Horizontal,
			placedShips: {
				1: [],
				2: [],
			},
		};
		this.notifyListeners();
	}

	// Game state accessor
	getState(): GamePlayState {
		return {
			currentState: this.currentState,
			currentPlayer: this.currentPlayer,
			players: deepClone(this.players),
			setupPhase: deepClone(this.setupPhase),
		};
	}

	getPlayerData(player: Player): PlayerState {
		return deepClone(this.players[player]);
	}

	// Setup phase methods
	selectShipType(shipType: ShipType): void {
		this.setupPhase.currentShipType = shipType;
		this.notifyListeners();
	}

	toggleOrientation(): void {
		this.setupPhase.currentOrientation =
			this.setupPhase.currentOrientation === Orientation.Horizontal
				? Orientation.Vertical
				: Orientation.Horizontal;
		this.notifyListeners();
	}

	getShipSize(shipType: ShipType): number {
		const shipSizes: Record<ShipType, number> = {
			[ShipType.Carrier]: 5,
			[ShipType.Battleship]: 4,
			[ShipType.Cruiser]: 3,
			[ShipType.Submarine]: 3,
			[ShipType.Destroyer]: 2,
		};
		return shipSizes[shipType];
	}

	getAvailableShips(player: Player): ShipType[] {
		const placedShips = this.setupPhase.placedShips[player];
		return STANDARD_FLEET.filter((ship) => {
			const count = placedShips.filter((type) => type === ship.type).length;
			return count < ship.count;
		}).map((ship) => ship.type);
	}

	canPlaceShip(
		player: Player,
		x: number,
		y: number,
		shipType: ShipType,
		orientation: Orientation,
	): boolean {
		if (!shipType) return false;

		const size = this.getShipSize(shipType);
		const grid = this.players[player].board.grid;

		// Check if ship goes out of bounds
		if (orientation === 'horizontal' && x + size > BOARD_SIZE) return false;
		if (orientation === 'vertical' && y + size > BOARD_SIZE) return false;

		// Check if cells are already occupied
		for (let i = 0; i < size; i++) {
			const checkX = orientation === 'horizontal' ? x + i : x;
			const checkY = orientation === 'vertical' ? y + i : y;
			if (grid[checkY][checkX] !== 'empty') return false;
		}

		return true;
	}

	// Game actions
	placeShip(player: Player, x: number, y: number): PlaceShipResult {
		if (this.currentState !== 'setup') {
			return { success: false, reason: PlaceShipError.InvalidGameState };
		}

		const shipType = this.setupPhase.currentShipType;
		const orientation = this.setupPhase.currentOrientation;

		if (!shipType) {
			return { success: false, reason: PlaceShipError.NoShipSelected };
		}

		if (!this.canPlaceShip(player, x, y, shipType, orientation)) {
			return { success: false, reason: PlaceShipError.InvalidPosition };
		}

		// Place the ship on the grid
		const size = this.getShipSize(shipType);
		const newGrid = deepClone(this.players[player].board.grid);
		const shipId = `${player}-${shipType}-${Date.now()}`;

		for (let i = 0; i < size; i++) {
			const placeX = orientation === 'horizontal' ? x + i : x;
			const placeY = orientation === 'vertical' ? y + i : y;
			newGrid[placeY][placeX] = 'ship';
		}

		// Update the player's board
		this.players[player].board.grid = newGrid;

		// Add the ship to the player's ships
		this.players[player].board.ships.push({
			id: shipId,
			type: shipType,
			position: { x, y },
			orientation,
			hits: [],
			isSunk: false,
		});

		// Update the placed ships in setup phase
		this.setupPhase.placedShips[player].push(shipType);

		// Update remaining ships count
		this.players[player].board.remainingShips = this.players[player].board.ships.length;

		// Check if all ships are placed for both players
		const allShipsPlaced = [1, 2].every((p) => {
			return STANDARD_FLEET.every((ship) => {
				const count = this.setupPhase.placedShips[p as Player].filter(
					(type) => type === ship.type,
				).length;
				return count >= ship.count;
			});
		});

		// If all ships placed, move to playing phase
		if (allShipsPlaced) {
			this.currentState = 'playing';
			this.currentPlayer = 1;
		} else {
			// Auto-switch to next player if current player placed all ships
			const currentPlayerShipsComplete = STANDARD_FLEET.every((ship) => {
				const count = this.setupPhase.placedShips[player].filter(
					(type) => type === ship.type,
				).length;
				return count >= ship.count;
			});

			if (currentPlayerShipsComplete) {
				this.currentPlayer = player === 1 ? 2 : 1;
			}

			// Select next available ship for this player
			const availableShips = this.getAvailableShips(player);
			this.setupPhase.currentShipType =
				availableShips.length > 0 ? availableShips[0] : null;
		}

		// Notify listeners after state change
		this.notifyListeners();
		return { success: true, shipId };
	}

	fireShot(player: Player, x: number, y: number): FireShotResult {
		// Can only fire shots when in playing state
		if (this.currentState !== 'playing') {
			return 'invalid';
		}

		// Can only fire shots on your turn
		if (player !== this.currentPlayer) {
			return 'invalid';
		}

		// Check if coordinates are valid
		if (x < 0 || x >= BOARD_SIZE || y < 0 || y >= BOARD_SIZE) {
			return 'invalid';
		}

		// Get the opponent player
		const targetPlayer = player === 1 ? 2 : 1;

		// Check if this cell has already been fired upon
		const trackingGrid = this.players[player].trackingGrid;
		if (trackingGrid[y][x] !== 'empty') {
			return 'invalid:already hit'; // Already fired here
		}

		// Get the target cell state
		const targetGrid = this.players[targetPlayer].board.grid;
		const isHit = targetGrid[y][x] === 'ship';

		// Update the target player's board
		const newTargetGrid = deepClone(targetGrid);
		newTargetGrid[y][x] = isHit ? 'hit' : 'miss';
		this.players[targetPlayer].board.grid = newTargetGrid;

		// Update the player's tracking grid
		const newTrackingGrid = deepClone(trackingGrid);
		newTrackingGrid[y][x] = isHit ? 'hit' : 'miss';
		this.players[player].trackingGrid = newTrackingGrid;

		// If hit, update the ship's hits array
		if (isHit) {
			for (const ship of this.players[targetPlayer].board.ships) {
				const shipX = ship.position.x;
				const shipY = ship.position.y;
				const shipSize = this.getShipSize(ship.type);

				// Check if this hit belongs to this ship
				let hitIndex = -1;
				for (let i = 0; i < shipSize; i++) {
					const checkX = ship.orientation === 'horizontal' ? shipX + i : shipX;
					const checkY = ship.orientation === 'vertical' ? shipY + i : shipY;

					if (checkX === x && checkY === y) {
						hitIndex = i;
						break;
					}
				}

				if (hitIndex !== -1) {
					// Add hit to this ship
					ship.hits[hitIndex] = true;

					// Check if ship is sunk
					if (ship.hits.length === shipSize) {
						// Decrement remaining ships count
						this.players[targetPlayer].board.remainingShips--;

						// Check if all ships are sunk
						if (this.players[targetPlayer].board.remainingShips === 0) {
							this.currentState = 'gameover';
						}
					}

					break;
				}
			}
		}

		// Toggle current player if not game over
		if (this.currentState !== 'gameover') {
			this.currentPlayer = player === 1 ? 2 : 1;
		}

		// Notify listeners of state change
		this.notifyListeners();

		return isHit ? 'hit' : 'miss';
	}

	isGameOver(): boolean {
		return this.currentState === 'gameover';
	}

	getWinner(): Player | null {
		if (this.currentState !== 'gameover') {
			return null;
		}

		// The winner is the player with ships remaining
		if (this.players[1].board.remainingShips > 0) {
			return 1;
		} else if (this.players[2].board.remainingShips > 0) {
			return 2;
		}

		return null; // Should not happen in normal gameplay
	}

	// Helper methods for setup phase
	getSetupStatus(): string {
		if (this.currentState !== 'setup') {
			return 'Setup complete';
		}

		const player1ShipsPlaced = this.setupPhase.placedShips[1].length;
		const player2ShipsPlaced = this.setupPhase.placedShips[2].length;
		const totalShipsNeeded = STANDARD_FLEET.reduce((sum, ship) => sum + ship.count, 0);

		return `Player 1: ${player1ShipsPlaced}/${totalShipsNeeded} ships placed
Player 2: ${player2ShipsPlaced}/${totalShipsNeeded} ships placed`;
	}
}

export const generateRandomNumberUnderNum = (num: number): number =>
	Math.floor(Math.random() * num);
