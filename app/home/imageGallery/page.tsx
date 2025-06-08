'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';

import { useSearchParams } from '../../hooks/';

import styles from './ImageGallery.module.css';

const images = [
	'amy-burns.png',
	'balazs-orban.png',
	'delba-de-oliveira.png',
	'evil-rabbit.png',
	'lee-robinson.png',
	'michael-novotny.png',
];

export default function ImageGallery() {
	const { searchParams, updateParams } = useSearchParams();
	const currentId = Number(searchParams.get('id')) || 0;

	const findNextId = (num: number): number =>
		(num + currentId + images.length) % images.length;

	const handleGalleryNavigation = (num: number) => {
		const nextId = findNextId(num);
		updateParams({ id: nextId.toString() });
	};

	return (
		<div className={styles.mainContainer}>
			<span
				className={styles.navigationArrow}
				onClick={() => handleGalleryNavigation(-1)}
			>
				{'<'}
			</span>
			<img
				src={`/customers/${images[currentId]}`}
				alt={`Gallery image ${currentId + 1}`}
				className={styles.galleryImage}
			/>
			<span
				className={styles.navigationArrow}
				onClick={() => handleGalleryNavigation(1)}
			>
				{'>'}
			</span>
		</div>
	);
}
