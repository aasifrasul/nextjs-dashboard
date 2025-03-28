'use client';
import React, { useState, useTransition, useDeferredValue, useMemo } from 'react';

// Move large list outside of the component to prevent re-creation
const LARGE_LIST = Array.from({ length: 10000 }, (_, i) => `Item ${i + 1}`);
const CATEGORIES = [
	{ id: 1, name: 'Laptop', category: 'Electronics' },
	{ id: 2, name: 'Smartphone', category: 'Electronics' },
	{ id: 3, name: 'Headphones', category: 'Accessories' },
	{ id: 4, name: 'Tablet', category: 'Electronics' },
	{ id: 5, name: 'Smartwatch', category: 'Wearables' },
	{ id: 6, name: 'Keyboard', category: 'Accessories' },
	{ id: 7, name: 'Mouse', category: 'Accessories' },
	{ id: 8, name: 'Monitor', category: 'Electronics' },
	{ id: 9, name: 'Printer', category: 'Electronics' },
	{ id: 10, name: 'External Hard Drive', category: 'Storage' },
	{ id: 11, name: 'USB Flash Drive', category: 'Storage' },
	{ id: 12, name: 'Camera', category: 'Photography' },
	{ id: 13, name: 'Lens', category: 'Photography' },
	{ id: 14, name: 'Tripod', category: 'Photography' },
	{ id: 15, name: 'Backpack', category: 'Accessories' },
	{ id: 16, name: 'Charger', category: 'Accessories' },
	{ id: 17, name: 'Cable', category: 'Accessories' },
	{ id: 18, name: 'Router', category: 'Networking' },
	{ id: 19, name: 'Modem', category: 'Networking' },
	{ id: 20, name: 'Speaker', category: 'Audio' },
	{ id: 21, name: 'Microphone', category: 'Audio' },
	{ id: 22, name: 'Gaming Console', category: 'Gaming' },
	{ id: 23, name: 'Game Controller', category: 'Gaming' },
	{ id: 24, name: 'VR Headset', category: 'Gaming' },
	{ id: 25, name: 'Portable SSD', category: 'Storage' },
	{ id: 26, name: 'Memory Card', category: 'Storage' },
	{ id: 27, name: 'Webcam', category: 'Electronics' },
	{ id: 28, name: 'Projector', category: 'Electronics' },
	{ id: 29, name: 'Scanner', category: 'Electronics' },
	{ id: 30, name: 'Drawing Tablet', category: 'Accessories' },
	{ id: 31, name: 'Stylus', category: 'Accessories' },
	{ id: 32, name: 'Smart Bulb', category: 'Smart Home' },
	{ id: 33, name: 'Smart Plug', category: 'Smart Home' },
	{ id: 34, name: 'Security Camera', category: 'Smart Home' },
	{ id: 35, name: 'Thermostat', category: 'Smart Home' },
	{ id: 36, name: 'Fitness Tracker', category: 'Wearables' },
	{ id: 37, name: 'GPS Watch', category: 'Wearables' },
	{ id: 38, name: 'E-reader', category: 'Electronics' },
	{ id: 39, name: 'Portable Power Bank', category: 'Accessories' },
	{ id: 40, name: 'Car Charger', category: 'Accessories' },
	{ id: 41, name: 'Drone', category: 'Photography' },
	{ id: 42, name: 'Action Camera', category: 'Photography' },
	{ id: 43, name: 'Portable Projector', category: 'Electronics' },
	{ id: 44, name: 'Bluetooth Speaker', category: 'Audio' },
	{ id: 45, name: 'Noise-Cancelling Headphones', category: 'Audio' },
	{ id: 46, name: 'Mechanical Keyboard', category: 'Accessories' },
	{ id: 47, name: 'Ergonomic Mouse', category: 'Accessories' },
	{ id: 48, name: 'Curved Monitor', category: 'Electronics' },
	{ id: 49, name: 'Laser Printer', category: 'Electronics' },
	{ id: 50, name: 'NAS Device', category: 'Storage' },
	{ id: 51, name: 'SD Card Reader', category: 'Storage' },
	{ id: 52, name: 'Mirrorless Camera', category: 'Photography' },
	{ id: 53, name: 'Studio Lighting', category: 'Photography' },
	{ id: 54, name: 'Camera Stabilizer', category: 'Photography' },
	{ id: 55, name: 'Laptop Sleeve', category: 'Accessories' },
	{ id: 56, name: 'Wireless Charger', category: 'Accessories' },
	{ id: 57, name: 'Ethernet Cable', category: 'Accessories' },
	{ id: 58, name: 'WiFi Extender', category: 'Networking' },
	{ id: 59, name: 'Powerline Adapter', category: 'Networking' },
	{ id: 60, name: 'Studio Monitor', category: 'Audio' },
	{ id: 61, name: 'Condenser Microphone', category: 'Audio' },
	{ id: 62, name: 'Gaming Headset', category: 'Gaming' },
	{ id: 63, name: 'Racing Wheel', category: 'Gaming' },
	{ id: 64, name: 'Flight Stick', category: 'Gaming' },
	{ id: 65, name: 'NVMe SSD', category: 'Storage' },
	{ id: 66, name: 'CF Card', category: 'Storage' },
	{ id: 67, name: 'Ring Light', category: 'Photography' },
	{ id: 68, name: 'Graphics Tablet', category: 'Accessories' },
	{ id: 69, name: 'Smart Lock', category: 'Smart Home' },
	{ id: 70, name: 'Robot Vacuum', category: 'Smart Home' },
	{ id: 71, name: 'Air Purifier', category: 'Smart Home' },
	{ id: 72, name: 'Blood Pressure Monitor', category: 'Wearables' },
	{ id: 73, name: 'Glucose Monitor', category: 'Wearables' },
	{ id: 74, name: 'Digital Notepad', category: 'Electronics' },
	{ id: 75, name: 'Portable Fan', category: 'Accessories' },
	{ id: 76, name: 'Car Mount', category: 'Accessories' },
	{ id: 77, name: 'HDMI Cable', category: 'Accessories' },
	{ id: 78, name: 'DisplayPort Cable', category: 'Accessories' },
	{ id: 79, name: 'Signal Booster', category: 'Networking' },
	{ id: 80, name: 'Audio Interface', category: 'Audio' },
	{ id: 81, name: 'MIDI Keyboard', category: 'Audio' },
	{ id: 82, name: 'Arcade Stick', category: 'Gaming' },
	{ id: 83, name: 'Game Capture Card', category: 'Gaming' },
	{ id: 84, name: 'UHD Blu-ray Player', category: 'Electronics' },
	{ id: 85, name: 'Digital Audio Player', category: 'Audio' },
	{ id: 86, name: 'Portable DAC', category: 'Audio' },
	{ id: 87, name: 'Smart Scale', category: 'Smart Home' },
	{ id: 88, name: 'Water Leak Detector', category: 'Smart Home' },
	{ id: 89, name: 'Smart Sprinkler Controller', category: 'Smart Home' },
	{ id: 90, name: 'UV Sanitizer', category: 'Accessories' },
	{ id: 91, name: 'Screen Protector', category: 'Accessories' },
	{ id: 92, name: 'Phone Grip', category: 'Accessories' },
	{ id: 93, name: 'Docking Station', category: 'Accessories' },
	{ id: 94, name: 'Thunderbolt Cable', category: 'Accessories' },
	{ id: 95, name: 'Power Strip', category: 'Accessories' },
	{ id: 96, name: 'Fan Controller', category: 'Accessories' },
	{ id: 97, name: 'Liquid Cooler', category: 'Accessories' },
	{ id: 98, name: 'Thermal Paste', category: 'Accessories' },
];

export default function Page() {
	// State for search input
	const [searchTerm, setSearchTerm] = useState('');

	// useTransition example
	const [isPending, startTransition] = useTransition();

	// Use useMemo to memoize filtered list
	const filteredList = useMemo(() => {
		return LARGE_LIST.filter((item) =>
			item.toLowerCase().includes(searchTerm.toLowerCase()),
		);
	}, [searchTerm]);

	// Handler for search input using useTransition
	const handleSearchChange = (e) => {
		const value = e.target.value;

		// Use startTransition to defer less critical updates
		startTransition(() => {
			setSearchTerm(value);
		});
	};

	// Rest of the component remains the same...
	const [products] = useState(CATEGORIES);

	const [filterTerm, setFilterTerm] = useState('');

	const deferredFilterTerm = useDeferredValue(filterTerm);

	const filteredProducts = useMemo(() => {
		return products.filter((product) =>
			product.name.toLowerCase().includes(deferredFilterTerm.toLowerCase()),
		);
	}, [products, deferredFilterTerm]);

	return (
		<div>
			<h2>Performance Hooks Demo</h2>

			{/* useTransition Example */}
			<div>
				<h3>useTransition Example</h3>
				<input
					type="text"
					placeholder="Search large list"
					onChange={handleSearchChange}
				/>
				{isPending && <p>Loading...</p>}
				<ul>
					{filteredList.slice(0, 10).map((item, index) => (
						<li key={index}>{item}</li>
					))}
				</ul>
			</div>

			{/* useDeferredValue Example */}
			<div>
				<h3>useDeferredValue Example</h3>
				<input
					type="text"
					placeholder="Filter products"
					value={filterTerm}
					onChange={(e) => setFilterTerm(e.target.value)}
				/>
				<ul>
					{filteredProducts.map((product) => (
						<li key={product.id}>
							{product.name} - {product.category}
						</li>
					))}
				</ul>
			</div>
		</div>
	);
}
