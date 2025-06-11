import { PostgresDBConnection } from './PostgresDBConnection';
import { logger } from '../lib/Logger';

export async function executeQuery(query: string, params?: any[]): Promise<void> {
	try {
		const dbClient = await PostgresDBConnection.getInstance({});
		if (params) {
			await dbClient.executeQuery(query, params);
		} else {
			await dbClient.executeQuery(query);
		}
	} catch (error) {
		logger.error(error);
		throw error; // Re-throw to let calling function handle specific error messages
	}
}

// For queries that return data
export async function executeQueryWithResult<T>(query: string, params?: any[]): Promise<T[]> {
	try {
		const dbClient = await PostgresDBConnection.getInstance({});
		if (params) {
			return (await dbClient.executeQuery(query, params)) as T[];
		} else {
			return (await dbClient.executeQuery(query)) as T[];
		}
	} catch (error) {
		logger.error(error);
		throw error;
	}
}
