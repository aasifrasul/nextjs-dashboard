'use client';
import { useCallback, useRef, RefObject } from 'react';
import { useEventListener } from './useEventListener';
import { useToggle } from './useToggle';

type EventType =
	| 'mousedown'
	| 'mouseup'
	| 'click'
	| 'touchstart'
	| 'touchend'
	| 'mouseover'
	| 'mouseout'
	| 'mouseenter'
	| 'mouseleave';

interface UseClickOutside<T extends ElementRef> {
	isOutsideClick: boolean;
	outsideRef: RefObject<T | null>;
}

type ElementRef =
	| HTMLElement
	| HTMLDivElement
	| HTMLInputElement
	| HTMLButtonElement
	| HTMLTextAreaElement
	| HTMLSelectElement
	| HTMLUListElement
	| null;

export const useClickOutside = <T extends ElementRef = ElementRef>(
	initialState: boolean = false,
	eventType: EventType = 'mousedown', // Or 'pointerdown' for combined mouse/touch
): UseClickOutside<T> => {
	const [isOutsideClick, setIsOutsideClick] = useToggle(initialState);
	const outsideRef = useRef<T>(null);

	const handleClickOutside = useCallback(
		(event: Event): void => {
			if (outsideRef.current && event.target instanceof Element) {
				setIsOutsideClick(!outsideRef.current.contains(event.target));
			} else if (outsideRef.current) {
				setIsOutsideClick(true); // If no target element and there is a ref, its an outside click
			}
		},
		[setIsOutsideClick],
	);

	useEventListener(
		eventType,
		handleClickOutside,
		typeof document !== undefined ? document : null,
	);

	return { isOutsideClick, outsideRef };
};
