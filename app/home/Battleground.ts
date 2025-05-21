`Design the data models for the front-end of a Battleship game.
Your design should include:
Board Configuration: 
	A 10x10 grid representing the board state with values indicating 
	whether a square is empty, occupied by a ship, or hit/missed.
Ship Configuration: 
	Representation of ships, including their type (size), position, 
		and orientation (horizontal/vertical).
Number of Ships:
	Track the count of each type of ship (e.g., 1 Carrier, 1 Battleship, 2 Destroyers).
Provide a structured data model and any assumptions made in your design.
`;

// Player type definition
type Player = 1 | 2 | null;

// Player mapping
const PLAYERS: Record<number, Player> = {
	0: 1,
	1: 2,
};

// Board size constants
const BOARD_SIZE = 10; // Standard 10x10 grid for Battleship

// Cell states for tracking shots
type CellState = 'empty' | 'ship' | 'hit' | 'miss';

// Game states
type GameState = 'setup' | 'playing' | 'won' | 'draw';
type FireShotResult =
	| 'hit'
	| 'miss'
	| 'sunk'
	| 'invalid:already hit'
	| 'invalid:out of bounds';

// Ship orientation
enum Orientation {
	Horizontal = 'horizontal',
	Vertical = 'vertical',
}

// Ship types with their respective sizes
enum ShipType {
	Carrier = 'Carrier', // 5 spaces
	Battleship = 'Battleship', // 4 spaces
	Cruiser = 'Cruiser', // 3 spaces
	Submarine = 'Submarine', // 3 spaces
	Destroyer = 'Destroyer', // 2 spaces
}

// Map ship types to their sizes
const SHIP_SIZES: Record<ShipType, number> = {
	[ShipType.Carrier]: 5,
	[ShipType.Battleship]: 4,
	[ShipType.Cruiser]: 3,
	[ShipType.Submarine]: 3,
	[ShipType.Destroyer]: 2,
};

// Ship configuration
interface ShipConfig {
	type: ShipType;
	position: { x: number; y: number }; // Starting position
	orientation: Orientation;
	hits: boolean[]; // Track which segments are hit
	isSunk(): boolean; // Method to check if ship is sunk
}

// Standard fleet configuration - each player gets these ships
const STANDARD_FLEET = [
	{ type: ShipType.Carrier, count: 1 },
	{ type: ShipType.Battleship, count: 1 },
	{ type: ShipType.Cruiser, count: 1 },
	{ type: ShipType.Submarine, count: 1 },
	{ type: ShipType.Destroyer, count: 1 },
];

// Player's board representation
interface PlayerBoard {
	grid: CellState[][]; // 10x10 grid showing cell states
	ships: ShipConfig[]; // List of ships on this board
	remainingShips: number; // Count of non-sunk ships
}

// Return type for placeShip function
type PlaceShipResult =
	| { success: true; shipId: string }
	| { success: false; reason: PlaceShipError };

// Possible errors when placing ships
enum PlaceShipError {
	OutOfBounds = 'Ship placement exceeds board boundaries',
	Overlap = 'Ship overlaps with an existing ship',
	InvalidShipType = 'Invalid ship type specified',
	TooManyShips = 'Maximum number of this ship type already placed',
	InvalidOrientation = 'Invalid orientation specified',
	GameAlreadyStarted = 'Cannot place ships after game has started',
}

// Game state management
interface GameModel {
	currentState: GameState;
	currentPlayer: Player;
	players: {
		1: {
			board: PlayerBoard; // Player's own board with ships
			trackingGrid: CellState[][]; // Grid to track shots at opponent
		};
		2: {
			board: PlayerBoard;
			trackingGrid: CellState[][];
		};
	};

	// Game actions
	placeShip(player: Player, shipConfig: ShipConfig): PlaceShipResult;
	fireShot(player: Player, x: number, y: number): FireShotResult;
	isGameOver(): boolean;
	getWinner(): Player | null;
}
