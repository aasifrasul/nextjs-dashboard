import { Pool, PoolConfig, PoolClient, QueryResult, QueryResultRow } from 'pg';
import { logger } from '@/app/lib/Logger';

export interface PostgresDBConnectionConfig extends PoolConfig {
	maxConnections?: number;
	connectionTimeoutMillis?: number;
}

export class DatabaseConnectionError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'DatabaseConnectionError';
	}
}

export class QueryExecutionError extends Error {
	public query: string;

	constructor(message: string, query: string) {
		super(message);
		this.query = query;
	}
}

export class PostgresDBConnection {
	private static instance: PostgresDBConnection;
	private pool: Pool;
	private isShuttingDown: boolean = false;

	private constructor(config: PostgresDBConnectionConfig) {
		this.pool = new Pool({
			user: 'test',
			host: 'localhost',
			database: 'postgres',
			password: 'test',
			port: 5432,
			maxConnections: 20,
			max: config.maxConnections || 20, // Default max connections
			connectionTimeoutMillis: config.connectionTimeoutMillis || 10000, // Default timeout
			...config,
		});

		this.pool.on('connect', () => {
			logger.info('PostgresDBConnection Pool connected');
		});

		this.pool.on('error', (err) => {
			logger.error(`Unexpected error on idle client: ${err.message}`);
		});

		this.pool.on('remove', () => {
			logger.info('PostgresDBConnection Pool connection removed');
		});
	}

	public static async getInstance(
		config: PostgresDBConnectionConfig,
	): Promise<PostgresDBConnection> {
		if (PostgresDBConnection.instance) return PostgresDBConnection.instance;

		PostgresDBConnection.instance = await PostgresDBConnection.createInstance(config);
		return PostgresDBConnection.instance;
	}

	private static async createInstance(
		config: PostgresDBConnectionConfig,
	): Promise<PostgresDBConnection> {
		try {
			const instance = new PostgresDBConnection(config);
			await instance.testConnection();
			return instance;
		} catch (err) {
			logger.error(`Failed to connect to database: ${(err as Error).message}`);
			throw new DatabaseConnectionError(
				`Failed to connect to database: ${(err as Error).message}`,
			);
		}
	}

	private async testConnection(): Promise<void> {
		let client: PoolClient | null = null;
		try {
			client = await this.pool.connect();
		} catch (err) {
			logger.error(`PostgresDBConnection Pool creation Error: ${(err as Error).stack}`);
			throw err;
		} finally {
			if (client) client.release();
		}
	}

	public async executeQuery<T extends QueryResultRow = QueryResultRow>(
		query: string,
		params?: any[],
	): Promise<T[]> {
		if (this.isShuttingDown) {
			throw new Error('Database connection is shutting down, no new queries allowed');
		}

		let client: PoolClient | null = null;
		try {
			client = await this.pool.connect();
			const result: QueryResult<T> = await client.query(query, params);
			return result.rows;
		} catch (err) {
			logger.error(`PostgresDBConnection executeQuery failed: ${(err as Error).stack}`);
			throw new QueryExecutionError(
				`Failed to execute query: ${(err as Error).message}`,
				query,
			);
		} finally {
			if (client) client.release();
		}
	}

	public async cleanup(): Promise<void> {
		this.isShuttingDown = true;
		if (this.pool) {
			try {
				await this.pool.end();
			} catch (err) {
				logger.error(
					`PostgresDBConnection failed to close pool: ${(err as Error).stack}`,
				);
			}
		}
	}
}

export type { QueryResultRow };
