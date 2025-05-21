export type Player = 1 | 2;

export type CellState = 'hit' | 'miss' | 'empty' | 'ship';

export type GameState = 'playing' | 'won' | 'draw' | 'setup' | 'gameover';

export type FireShotResult =
	| 'hit'
	| 'miss'
	| 'sunk'
	| 'invalid'
	| 'invalid:already hit'
	| 'invalid:out of bounds';

// Ship orientation
export enum Orientation {
	Horizontal = 'horizontal',
	Vertical = 'vertical',
}

// Ship types with their respective sizes
export enum ShipType {
	Carrier = 'Carrier', // 5 spaces
	Battleship = 'Battleship', // 4 spaces
	Cruiser = 'Cruiser', // 3 spaces
	Submarine = 'Submarine', // 3 spaces
	Destroyer = 'Destroyer', // 2 spaces
}

// Ship configuration
export interface ShipConfig {
	id: string,
	type: ShipType;
	position: { x: number; y: number }; // Starting position
	orientation: Orientation;
	hits: boolean[]; // Track which segments are hit
	isSunk: boolean; // Method to check if ship is sunk
}

// Player's board representation
export interface PlayerBoard {
	grid: CellState[][]; // 10x10 grid showing cell states
	ships: ShipConfig[]; // List of ships on this board
	remainingShips: number; // Count of non-sunk ships
}

// Return type for placeShip function
export type PlaceShipResult =
	| { success: true; shipId: string }
	| { success: false; reason: PlaceShipError };

// Possible errors when placing ships
export enum PlaceShipError {
	OutOfBounds = 'Ship placement exceeds board boundaries',
	Overlap = 'Ship overlaps with an existing ship',
	InvalidShipType = 'Invalid ship type specified',
	TooManyShips = 'Maximum number of this ship type already placed',
	InvalidOrientation = 'Invalid orientation specified',
	GameAlreadyStarted = 'Cannot place ships after game has started',
	InvalidGameState = 'Invalid Game State',
	NoShipSelected = 'No Ship Selected',
	InvalidPosition = 'Invalid Position',
}

export type PlayerState = {
	board: PlayerBoard; // Player's own board with ships
	trackingGrid: CellState[][]; // Grid to track shots at opponent
};
