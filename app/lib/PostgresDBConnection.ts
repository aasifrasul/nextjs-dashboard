import { Pool, PoolConfig, PoolClient, QueryResult, QueryResultRow } from 'pg';
import { logger } from '@/app/lib/Logger';

export interface PostgresDBConnectionConfig extends PoolConfig {
	maxConnections?: number;
	connectionTimeoutMillis?: number;
	enableQueryCache?: boolean;
	enablePreparedStatements?: boolean;
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
	private static instance: PostgresDBConnection | null;
	private pool: Pool;
	private isShuttingDown: boolean = false;
	private queryCache: Map<string, any[]> = new Map();
	private preparedStatements: Map<string, string> = new Map();
	private enableQueryCache: boolean;
	private enablePreparedStatements: boolean;

	private constructor(config: PostgresDBConnectionConfig) {
		this.enableQueryCache = config.enableQueryCache ?? false;
		this.enablePreparedStatements = config.enablePreparedStatements ?? false;

		this.pool = new Pool({
			user: process.env.DB_USER || config.user,
			host: process.env.DB_HOST || config.host,
			database: process.env.DB_NAME || config.database,
			password: process.env.DB_PASSWORD || config.password,
			port: parseInt(process.env.DB_PORT || '5432', 10) || config.port,
			max: config.maxConnections || 20,
			connectionTimeoutMillis: config.connectionTimeoutMillis || 10000,
			// Performance optimizations
			idleTimeoutMillis: 30000,
			allowExitOnIdle: true,
			// Connection pooling optimizations
			statement_timeout: 30000,
			query_timeout: 30000,
			...config,
		});

		this.pool.on('connect', (client) => {
			logger.info('PostgresDBConnection Pool connected');
			// Optimize connection settings
			client.query('SET statement_timeout = 30000');
			client.query('SET lock_timeout = 10000');
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

		return await PostgresDBConnection.createInstance(config);
	}

	private static async createInstance(
		config: PostgresDBConnectionConfig,
	): Promise<PostgresDBConnection> {
		try {
			const instance = new PostgresDBConnection(config);
			await instance.testConnection();
			PostgresDBConnection.instance = instance;
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
			await client.query('SELECT 1'); // Quick health check
		} catch (err) {
			logger.error(`PostgresDBConnection Pool creation Error: ${(err as Error).stack}`);
			throw err;
		} finally {
			if (client) client.release();
		}
	}

	private getCacheKey(query: string, params?: any[]): string {
		return `${query}|${JSON.stringify(params || [])}`;
	}

	public async executeQuery<T extends QueryResultRow = QueryResultRow>(
		query: string,
		params?: any[],
		options?: { useCache?: boolean; cacheTtl?: number },
	): Promise<T[]> {
		if (this.isShuttingDown) {
			throw new Error('Database connection is shutting down, no new queries allowed');
		}

		const cacheKey = this.getCacheKey(query, params);

		// Check cache if enabled
		if (this.enableQueryCache && options?.useCache && this.queryCache.has(cacheKey)) {
			return this.queryCache.get(cacheKey) as T[];
		}

		let client: PoolClient | null = null;

		try {
			client = await this.pool.connect();

			// Use prepared statements if enabled
			let result: QueryResult<T>;
			if (this.enablePreparedStatements && params && params.length > 0) {
				// Use pg's built-in named query feature
				result = await client.query({
					name: query, // Use the query string itself as the name, or a hash of it
					text: query,
					values: params,
				});
			} else {
				result = await client.query(query, params);
			}

			// Cache result if enabled
			if (this.enableQueryCache && options?.useCache) {
				this.queryCache.set(cacheKey, result.rows);

				// Auto-expire cache entries
				if (options.cacheTtl) {
					setTimeout(() => {
						this.queryCache.delete(cacheKey);
					}, options.cacheTtl);
				}
			}

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

	// Batch query execution for better performance
	public async executeBatch<T extends QueryResultRow = QueryResultRow>(
		queries: Array<{ query: string; params?: any[] }>,
	): Promise<T[][]> {
		if (this.isShuttingDown) {
			throw new Error('Database connection is shutting down, no new queries allowed');
		}

		let client: PoolClient | null = null;
		try {
			client = await this.pool.connect();

			const results: T[][] = [];
			for (const { query, params } of queries) {
				const result: QueryResult<T> = await client.query(query, params);
				results.push(result.rows);
			}

			return results;
		} catch (err) {
			logger.error(`PostgresDBConnection executeBatch failed: ${(err as Error).stack}`);
			throw new QueryExecutionError(
				`Failed to execute batch queries: ${(err as Error).message}`,
				'batch_queries',
			);
		} finally {
			if (client) client.release();
		}
	}

	// Transaction support
	public async executeTransaction<T>(
		callback: (client: PoolClient) => Promise<T>,
	): Promise<T> {
		if (this.isShuttingDown) {
			throw new Error('Database connection is shutting down, no new queries allowed');
		}

		let client: PoolClient | null = null;
		try {
			client = await this.pool.connect();
			await client.query('BEGIN');

			const result = await callback(client);

			await client.query('COMMIT');
			return result;
		} catch (err) {
			if (client) {
				try {
					await client.query('ROLLBACK');
				} catch (rollbackErr) {
					logger.error(`Rollback failed: ${(rollbackErr as Error).message}`);
				}
			}
			logger.error(`Transaction failed: ${(err as Error).stack}`);
			throw new QueryExecutionError(
				`Transaction failed: ${(err as Error).message}`,
				'transaction',
			);
		} finally {
			if (client) client.release();
		}
	}

	public async executeTransactionQueries<T extends QueryResultRow = QueryResultRow>(
		queries: Array<{ query: string; params?: any[] }>,
	): Promise<T[][]> {
		if (this.isShuttingDown) {
			throw new Error('Database connection is shutting down, no new queries allowed');
		}

		let client: PoolClient | null = null;
		try {
			client = await this.pool.connect();
			await client.query('BEGIN');

			const results: T[][] = [];
			for (const { query, params } of queries) {
				const result: QueryResult<T> = await client.query(query, params);
				results.push(result.rows);
			}

			await client.query('COMMIT');
			return results;
		} catch (err) {
			if (client) {
				try {
					await client.query('ROLLBACK');
				} catch (rollbackErr) {
					logger.error(`Rollback failed: ${(rollbackErr as Error).message}`);
				}
			}
			logger.error(`Transaction queries failed: ${(err as Error).stack}`);
			throw new QueryExecutionError(
				`Transaction queries failed: ${(err as Error).message}`,
				'transaction_queries',
			);
		} finally {
			if (client) client.release();
		}
	}

	public clearCache(): void {
		this.queryCache.clear();
	}

	public getPoolStats() {
		return {
			totalCount: this.pool.totalCount,
			idleCount: this.pool.idleCount,
			waitingCount: this.pool.waitingCount,
			cacheSize: this.queryCache.size,
			preparedStatementsCount: this.preparedStatements.size,
		};
	}

	public async cleanup(): Promise<void> {
		this.isShuttingDown = true;
		this.queryCache.clear();
		this.preparedStatements.clear();

		if (this.pool) {
			try {
				await this.pool.end();
				PostgresDBConnection.instance = null; // Reset singleton instance on successful cleanup
			} catch (err) {
				logger.error(
					`PostgresDBConnection failed to close pool: ${(err as Error).stack}`,
				);
				// Decide if you want to re-throw or just log.
				// If re-thrown, the caller knows cleanup failed.
				throw err;
			} finally {
				this.isShuttingDown = false; // Reset even on failure, to allow re-initialization
			}
		}
	}
}

export type { QueryResultRow };

/**
 * Usage
 * 
 * // Complex transaction with conditional logic
const result = await db.executeTransaction(async (client) => {
	const user = await client.query('SELECT * FROM users WHERE id = $1', [userId]);

	if (user.rows[0].balance < amount) {
		throw new Error('Insufficient funds');
	}

	await client.query('UPDATE users SET balance = balance - $1 WHERE id = $2', [amount, userId]);

	const transactionId = await client.query(
		'INSERT INTO transactions (user_id, amount) VALUES ($1, $2) RETURNING id',
		[userId, amount]
	);

	return transactionId.rows[0].id;
});
 *
// Simple transaction with predetermined queries
const results = await db.executeTransactionQueries([
	{ query: 'UPDATE inventory SET quantity = quantity - 1 WHERE product_id = $1', params: [productId] },
	{ query: 'INSERT INTO orders (product_id, user_id) VALUES ($1, $2)', params: [productId, userId] },
	{ query: 'INSERT INTO audit_log (action, table_name) VALUES ($1, $2)', params: ['order_created', 'orders'] }
]);
*/
