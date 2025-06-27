// Arrow characters to use: ▼ ▶ •

import React, { useState, useEffect } from 'react';

interface Category {
	id: string;
	name: string;
	children?: Category[];
}

const backendData: Category[] = [
	{
		id: '1',
		name: 'Office Map',
	},
	{
		id: '2',
		name: 'New Employee Onboarding',
		children: [
			{
				id: '8',
				name: 'Onboarding Materials',
			},
			{
				id: '9',
				name: 'Training',
			},
		],
	},
	{
		id: '3',
		name: 'Office Events',
		children: [
			{
				id: '6',
				name: '2018',
				children: [
					{
						id: '10',
						name: 'Summer Picnic',
					},
					{
						id: '11',
						name: "Valentine's Day Party",
					},
					{
						id: '12',
						name: "New Year's Party",
					},
				],
			},
			{
				id: '7',
				name: '2017',
				children: [
					{
						id: '13',
						name: 'Company Anniversary Celebration',
					},
				],
			},
		],
	},
	{
		id: '4',
		name: 'Public Holidays',
	},
	{
		id: '5',
		name: 'Vacations and Sick Leaves',
	},
];

function fetchData() {
	return new Promise((resolve) => {
		setTimeout(resolve, 100, backendData);
	});
}

function DeeplyNestedData() {
	const [categories, setCategories] = useState<Category[]>([]);
	const [hiddenChildren, setHiddenChildren] = useState<{ [key: string]: boolean }>({});

	useEffect(() => {
		fetchData().then((data) => {
			setCategories(data as Category[]);
		});
	}, []);

	function handleToggle(id: string) {
		setHiddenChildren((items) => {
			const newItems = { ...items };
			newItems[id] = !newItems[id];
			return newItems;
		});
	}

	function buildHtml(items: Category[] | undefined) {
		return items?.map((item, index) => {
			const childHtml =
				item.children && !hiddenChildren[item.id] ? (
					<div style={{ marginLeft: 10 }}>{buildHtml(item.children)}</div>
				) : null;
			return (
				<div>
					<span onClick={() => handleToggle(item.id)} key={item.id}>
						{item.children ? (hiddenChildren[item.id] ? '▶' : '▼') : '•'}
					</span>{' '}
					{item.name}
					{childHtml}
				</div>
			);
		});
	}

	return <div>{buildHtml(categories)}</div>;
}

export default DeeplyNestedData;
