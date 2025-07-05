'use client';
// Types for our response handling
type SuccessResult<T> = {
	success: true;
	data: T;
};

type ErrorResult = {
	success: false;
	error: Error;
};

type Result<T> = SuccessResult<T> | ErrorResult;

export interface ResponseLike {
	ok: boolean;
	status?: number;
	json(): Promise<any>;
}

export async function handleAsyncCalls<T>(promise: Promise<T>): Promise<Result<T>> {
	try {
		const data = await promise;
		return {
			success: true,
			data,
		};
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error : new Error(String(error)),
		};
	}
}

export async function fetchAPIData<T>(url: string): Promise<Result<T>> {
	const result = await handleAsyncCalls(fetch(url));

	if (!result.success) {
		return result;
	}

	const response = result.data;

	// Check if response has the required interface
	if (!response || typeof response !== 'object' || !('ok' in response)) {
		return {
			success: false,
			error: new Error('Expected Response-like object'),
		};
	}

	if (!response.ok) {
		return {
			success: false,
			error: new Error(`HTTP Error ${response.status || 'unknown'}`),
		};
	}

	return handleAsyncCalls(response.json());
}
