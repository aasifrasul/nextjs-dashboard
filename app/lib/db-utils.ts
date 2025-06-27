import { PostgresDBConnection, QueryResultRow } from './PostgresDBConnection';
import { logger } from '../lib/Logger';

export async function executeQuery<T extends QueryResultRow>(
	query: string,
	params?: any[],
): Promise<T[]> {
	try {
		const dbClient = await PostgresDBConnection.getInstance({});
		return await dbClient.executeQuery<T>(query, params);
	} catch (error) {
		logger.error(error);
		throw error;
	}
}
