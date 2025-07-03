'use client';
import { useEffect, useRef, useCallback } from 'react';
import { ErrorHandlingOptions, Options, Target, EventMap } from './types';
import { isFunction } from '../lib/typeChecking';

export function useEventListener<K extends keyof EventMap = keyof EventMap>(
	eventType: K,
	callback: (event: EventMap[K]) => void,
	element: Target,
	options?: Options,
	errorHandling: ErrorHandlingOptions = {},
): void {
	const callbackRef = useRef(callback);
	const optionsRef = useRef(options);
	const errorHandlingRef = useRef(errorHandling);

	// Update refs when dependencies change
	useEffect(() => {
		callbackRef.current = callback;
		optionsRef.current = options;
		errorHandlingRef.current = errorHandling;
	}, [callback, options, errorHandling]);

	const handleError = useCallback((message: string, error: unknown): void => {
		const err = error instanceof Error ? error : new Error(message);
		console.error(message, err); // Use message for logging
		errorHandlingRef.current.onError?.(err);
		if (!errorHandlingRef.current.suppressErrors) {
			throw err;
		}
	}, []);

	// Memoize the event handler
	const eventHandler = useCallback(
		(event: Event) => {
			try {
				callbackRef.current?.(event as EventMap[K]);
			} catch (error) {
				handleError('Unknown error in event handler', error);
			}
		},
		[handleError],
	);

	useEffect(() => {
		if (!element) {
			console.debug('No target element provided, skipping event listener attachment');
			return;
		}

		try {
			// Check if the event type is supported
			if (!isFunction(element.addEventListener)) {
				throw new Error('Target element does not support event listeners');
			}

			console.debug(`Attaching ${eventType} listener to element`, {
				element,
				options: optionsRef.current,
			});
			element.addEventListener(eventType, eventHandler, optionsRef.current);

			return () => {
				console.debug(`Removing ${eventType} listener from element`);
				element.removeEventListener(eventType, eventHandler, optionsRef.current);
			};
		} catch (error) {
			handleError('Failed to attach event listener', error);
		}
	}, [eventType, element, eventHandler, handleError]);
}

/**
// Convenience hooks for common use cases

const MyComponent: React.FC = () => {
	const elementRef = useRef<HTMLDivElement>(null);

	useEventListener(
		'click',
		(event) => {
			// Your event handling logic
		},
		elementRef.current,
		{ passive: true },
		{
			onError: (error) => {
				// Custom error handling
				console.error('Event listener failed:', error);
				// Maybe show a toast notification
			},
			suppressErrors: true, // Prevent errors from crashing the app
		}
	);

	return <div ref={elementRef}>Click me</div>;
};
*/
