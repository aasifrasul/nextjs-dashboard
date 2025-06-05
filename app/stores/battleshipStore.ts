// store/battleshipStore.ts
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import {
	Player,
	ShipType,
	ShipConfig,
	Orientation,
	GamePlayState,
	CellState,
} from '../home/battleShip/types';

// Pure game logic functions (no classes needed)
const BOARD_SIZE = 10;

const shipSizes = {
	[ShipType.Carrier]: 5,
	[ShipType.Battleship]: 4,
	[ShipType.Cruiser]: 3,
	[ShipType.Submarine]: 3,
	[ShipType.Destroyer]: 2,
};

export const getShipSize = (shipType: ShipType): number => shipSizes[shipType];

const canPlaceShip = (
	grid: CellState[][],
	x: number,
	y: number,
	shipType: ShipType,
	orientation: Orientation,
): boolean => {
	const size = getShipSize(shipType);

	if (orientation === 'horizontal' && x + size > BOARD_SIZE) return false;
	if (orientation === 'vertical' && y + size > BOARD_SIZE) return false;

	for (let i = 0; i < size; i++) {
		const checkX = orientation === 'horizontal' ? x + i : x;
		const checkY = orientation === 'vertical' ? y + i : y;
		if (grid[checkY][checkX] !== 'empty') return false;
	}

	return true;
};

const createEmptyGrid = (): CellState[][] =>
	Array(BOARD_SIZE)
		.fill(null)
		.map(() => Array(BOARD_SIZE).fill('empty'));

const getInitialState = (): GamePlayState => ({
	currentState: 'setup',
	currentPlayer: 1,
	players: {
		1: {
			board: {
				grid: createEmptyGrid(),
				ships: [],
				remainingShips: 0,
			},
			trackingGrid: createEmptyGrid(),
		},
		2: {
			board: {
				grid: createEmptyGrid(),
				ships: [],
				remainingShips: 0,
			},
			trackingGrid: createEmptyGrid(),
		},
	},
	setupPhase: {
		currentShipType: ShipType.Carrier,
		currentOrientation: Orientation.Horizontal,
		placedShips: { 1: [], 2: [] },
	},
});

// Zustand store with immer for immutable updates
interface BattleshipStore extends GamePlayState {
	// Actions
	placeShip: (player: Player, x: number, y: number) => boolean;
	fireShot: (player: Player, x: number, y: number) => 'hit' | 'miss' | 'invalid';
	selectShipType: (shipType: ShipType) => void;
	toggleOrientation: () => void;
	resetGame: () => void;

	// Computed values
	getAvailableShips: (player: Player) => ShipType[];
	canPlaceShipAt: (player: Player, x: number, y: number) => boolean;
	getWinner: () => Player | null;
}

export const useBattleshipStore = create<BattleshipStore>()(
	subscribeWithSelector(
		immer((set, get) => ({
			...getInitialState(),

			placeShip: (player: Player, x: number, y: number) => {
				const state = get();
				if (state.currentState !== 'setup' || !state.setupPhase.currentShipType) {
					return false;
				}

				const shipType = state.setupPhase.currentShipType;
				const orientation = state.setupPhase.currentOrientation;

				if (
					!canPlaceShip(
						state.players[player].board.grid,
						x,
						y,
						shipType,
						orientation,
					)
				) {
					return false;
				}

				set((draft) => {
					const size = getShipSize(shipType);

					// Place ship on grid
					for (let i = 0; i < size; i++) {
						const placeX = orientation === 'horizontal' ? x + i : x;
						const placeY = orientation === 'vertical' ? y + i : y;
						draft.players[player].board.grid[placeY][placeX] = 'ship';
					}

					// Add ship to ships array
					draft.players[player].board.ships.push({
						id: `${player}-${shipType}-${Date.now()}`,
						type: shipType,
						position: { x, y },
						orientation,
						hits: [],
						isSunk: false,
					});

					// Update placed ships
					draft.setupPhase.placedShips[player].push(shipType);
					draft.players[player].board.remainingShips++;

					// Check if setup is complete
					const allShipsPlaced = [1, 2].every((p) => {
						return draft.setupPhase.placedShips[p as Player].length === 5;
					});

					if (allShipsPlaced) {
						draft.currentState = 'playing';
						draft.currentPlayer = 1;
					} else {
						// Switch to next player if current player is done
						const currentPlayerDone =
							draft.setupPhase.placedShips[player].length === 5;
						if (currentPlayerDone) {
							draft.currentPlayer = player === 1 ? 2 : 1;
						}
					}
				});

				return true;
			},

			fireShot: (player: Player, x: number, y: number) => {
				const state = get();
				if (state.currentState !== 'playing' || player !== state.currentPlayer) {
					return 'invalid';
				}

				const targetPlayer = player === 1 ? 2 : 1;
				const trackingGrid = state.players[player].trackingGrid;

				if (trackingGrid[y][x] !== 'empty') {
					return 'invalid';
				}

				const isHit = state.players[targetPlayer].board.grid[y][x] === 'ship';

				set((draft) => {
					// Update grids
					draft.players[targetPlayer].board.grid[y][x] = isHit ? 'hit' : 'miss';
					draft.players[player].trackingGrid[y][x] = isHit ? 'hit' : 'miss';

					if (isHit) {
						// Update ship hits
						const ship = draft.players[targetPlayer].board.ships.find(
							(s: ShipConfig) => {
								const size = getShipSize(s.type);
								for (let i = 0; i < size; i++) {
									const checkX =
										s.orientation === 'horizontal'
											? s.position.x + i
											: s.position.x;
									const checkY =
										s.orientation === 'vertical'
											? s.position.y + i
											: s.position.y;
									if (checkX === x && checkY === y) return true;
								}
								return false;
							},
						);

						if (ship) {
							const hitIndex =
								ship.orientation === 'horizontal'
									? x - ship.position.x
									: y - ship.position.y;
							ship.hits[hitIndex] = true;

							// Check if ship is sunk
							if (ship.hits.length === getShipSize(ship.type)) {
								ship.isSunk = true;
								draft.players[targetPlayer].board.remainingShips--;

								// Check win condition
								if (draft.players[targetPlayer].board.remainingShips === 0) {
									draft.currentState = 'gameover';
								}
							}
						}
					}

					// Switch players
					if (draft.currentState !== 'gameover') {
						draft.currentPlayer = player === 1 ? 2 : 1;
					}
				});

				return isHit ? 'hit' : 'miss';
			},

			selectShipType: (shipType: ShipType) => {
				set((draft) => {
					draft.setupPhase.currentShipType = shipType;
				});
			},

			toggleOrientation: () => {
				set((draft) => {
					draft.setupPhase.currentOrientation =
						draft.setupPhase.currentOrientation === Orientation.Horizontal
							? Orientation.Vertical
							: Orientation.Horizontal;
				});
			},

			resetGame: () => {
				set(() => getInitialState());
			},

			// Computed values
			getAvailableShips: (player: Player) => {
				const state = get();
				const placed = state.setupPhase.placedShips[player];
				const standardFleet = [
					ShipType.Carrier,
					ShipType.Battleship,
					ShipType.Cruiser,
					ShipType.Submarine,
					ShipType.Destroyer,
				];
				return standardFleet.filter((ship) => !placed.includes(ship));
			},

			canPlaceShipAt: (player: Player, x: number, y: number) => {
				const state = get();
				if (!state.setupPhase.currentShipType) return false;
				return canPlaceShip(
					state.players[player].board.grid,
					x,
					y,
					state.setupPhase.currentShipType,
					state.setupPhase.currentOrientation,
				);
			},

			getWinner: () => {
				const state = get();
				if (state.currentState !== 'gameover') return null;
				return state.players[1].board.remainingShips > 0 ? 1 : 2;
			},
		})),
	),
);
