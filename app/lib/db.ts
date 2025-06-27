import postgres from 'postgres';
import { Pool } from 'pg';

// Parse connection string to remove pgbouncer parameter if present
const getConnectionString = (url: string): string => {
	try {
		const urlObj = new URL(url);
		const params = new URLSearchParams(urlObj.search);
		params.delete('pgbouncer'); // Remove pgbouncer parameter

		// Rebuild the connection string without pgbouncer
		urlObj.search = params.toString();
		return urlObj.toString();
	} catch (e) {
		console.error(e);
		// If URL parsing fails, return original string
		return url;
	}
};

const connectionString: string =
	process.env.POSTGRES_URL_POOLED || process.env.POSTGRES_URL || '';

export const sql = postgres(getConnectionString(connectionString), {
	ssl: process.env.NODE_ENV === 'production' ? 'require' : false,
	max: 10, // Set connection pool size
	idle_timeout: 20, // Idle connection timeout in seconds
	connect_timeout: 15, // Connection timeout in seconds
});

export const pool = new Pool({
	user: 'test',
	host: 'localhost',
	database: 'postgres',
	password: 'test',
	port: 5432,
	max: 20, // maximum number of clients in the pool
	idleTimeoutMillis: 1000, // close idle clients after 1 second
	connectionTimeoutMillis: 1000, // return an error after 1 second if connection could not be established
});
