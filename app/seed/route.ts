import bcrypt from 'bcrypt';
import { logger } from '../lib/Logger';
import { executeQuery } from '../lib/db-utils';
import { invoices, customers, revenue, users } from '../lib/placeholder-data';

export async function GET() {
	try {
		// Start transaction
		await executeQuery('BEGIN');

		// 1. Setup extensions
		await executeQuery(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

		// 2. Create all tables with proper constraints
		await executeQuery(`
			CREATE TABLE IF NOT EXISTS users (
				id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
				name VARCHAR(255) NOT NULL,
				email TEXT NOT NULL UNIQUE,
				password TEXT NOT NULL
			);
		`);

		await executeQuery(`
			CREATE TABLE IF NOT EXISTS customers (
				id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
				name VARCHAR(255) NOT NULL,
				email VARCHAR(255) NOT NULL UNIQUE,
				image_url VARCHAR(255) NOT NULL
			);
		`);

		await executeQuery(`
			CREATE TABLE IF NOT EXISTS revenue (
				month VARCHAR(4) NOT NULL UNIQUE PRIMARY KEY,
				revenue INT NOT NULL
			);
		`);

		await executeQuery(`
			CREATE TABLE IF NOT EXISTS invoices (
				id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
				customer_id UUID NOT NULL,
				amount INT NOT NULL,
				status VARCHAR(255) NOT NULL,
				date DATE NOT NULL,
				FOREIGN KEY (customer_id) REFERENCES customers(id)
			);
		`);

		// 3. Clear existing data (optional - remove if you want to keep existing data)
		await executeQuery('TRUNCATE TABLE invoices, customers, users, revenue CASCADE');

		// 4. Insert users with hashed passwords
		for (const user of users) {
			const hashedPassword = await bcrypt.hash(user.password, 10);
			await executeQuery(`
				INSERT INTO users (id, name, email, password)
				VALUES ($1, $2, $3, $4)
				ON CONFLICT (email) DO UPDATE SET
					name = EXCLUDED.name,
					password = EXCLUDED.password
			`,
				[user.id, user.name, user.email, hashedPassword],
			);
		}

		// 5. Insert all customers
		for (const customer of customers) {
			await executeQuery(`
				INSERT INTO customers (id, name, email, image_url)
				VALUES ($1, $2, $3, $4)
				ON CONFLICT (email) DO UPDATE SET
					name = EXCLUDED.name,
					image_url = EXCLUDED.image_url
			`,
				[customer.id, customer.name, customer.email, customer.image_url],
			);
		}

		// 6. Insert revenue data
		for (const rev of revenue) {
			await executeQuery(`
				INSERT INTO revenue (month, revenue)
				VALUES ($1, $2)
				ON CONFLICT (month) DO UPDATE SET
					revenue = EXCLUDED.revenue
			`,
				[rev.month, rev.revenue],
			);
		}

		// 7. Insert invoices
		for (const invoice of invoices) {
			await executeQuery(`
				INSERT INTO invoices (customer_id, amount, status, date)
				VALUES ($1, $2, $3, $4)
			`,
				[invoice.customer_id, invoice.amount, invoice.status, invoice.date],
			);
		}

		// Commit transaction
		await executeQuery('COMMIT');

		logger.info('Database seeded successfully');
		return Response.json({ message: 'Database seeded successfully' });
	} catch (error) {
		// Rollback on any error
		try {
			await executeQuery('ROLLBACK');
		} catch (rollbackError) {
			logger.error('Rollback error:', rollbackError);
		}

		logger.error('Seed error:', error);
		return Response.json(
			{
				error: 'Failed to seed database',
				details: (error as Error).message,
			},
			{ status: 500 },
		);
	}
}
