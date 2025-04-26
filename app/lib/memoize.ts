import { createKey } from './keyGeneration';

type MemoizedFunc<T = any, R = any> = (...args: T[]) => R;

/**
 * Polyfill Memoization
 * @param {*} fn - The function to memoize
 * @returns {Function} - A memoized version of the function
 */
export const memoize = (function () {
	const allCaches = new WeakMap<MemoizedFunc, Record<string, any>>();

	return function outer<T = any, R = any>(fn: MemoizedFunc<T, R>): MemoizedFunc<T, R> {
		if (!allCaches.has(fn)) {
			allCaches.set(fn, Object.create(null));
		}

		const functionCache = allCaches.get(fn)!;

		// Return the inner function that handles the memoization
		return function inner(this: any, ...args: T[]): R {
			const key = createKey(args);

			if (key in functionCache) {
				return functionCache[key];
			}

			const result = fn.apply(this, args);
			functionCache[key] = result;
			return result;
		};
	};
})();
