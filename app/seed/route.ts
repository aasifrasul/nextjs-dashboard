import bcrypt from 'bcrypt';

import { executeQuery } from '../lib/db-utils';
import { invoices, customers, revenue, users } from '../lib/placeholder-data';

async function seedUsers() {
	try {
		await executeQuery(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
		await executeQuery(`
			CREATE TABLE IF NOT EXISTS users (
				id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
				name VARCHAR(255) NOT NULL,
				email TEXT NOT NULL UNIQUE,
				password TEXT NOT NULL
			);
		`);

		const insertedUsers = await Promise.all(
			users.map(async (user) => {
				const hashedPassword = await bcrypt.hash(user.password, 10);
				return executeQuery(
					`
					INSERT INTO users (id, name, email, password)
					VALUES ($1, $2, $3, $4)
					ON CONFLICT (id) DO NOTHING;
				`,
					[user.id, user.name, user.email, hashedPassword],
				);
			}),
		);
		return insertedUsers;
	} catch (error) {
		console.error('Database Error:', error);
	}
}

async function seedInvoices() {
	try {
		await executeQuery(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
		await executeQuery(`
			CREATE TABLE IF NOT EXISTS invoices (
				id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
				customer_id UUID NOT NULL,
				amount INT NOT NULL,
				status VARCHAR(255) NOT NULL,
				date DATE NOT NULL
			);
		`);

		const insertedInvoices = await Promise.all(
			invoices.map((invoice) =>
				executeQuery(
					`
					INSERT INTO invoices (customer_id, amount, status, date)
					VALUES ($1, $2, $3, $4)
					ON CONFLICT (id) DO NOTHING;
				`,
					[invoice.customer_id, invoice.amount, invoice.status, invoice.date],
				),
			),
		);
		return insertedInvoices;
	} catch (error) {
		console.error('Database Error:', error);
	}
}

async function seedCustomers() {
	try {
		await executeQuery(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
		await executeQuery(`
			CREATE TABLE IF NOT EXISTS customers (
				id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
				name VARCHAR(255) NOT NULL,
				email VARCHAR(255) NOT NULL,
				image_url VARCHAR(255) NOT NULL
			);
		`);

		const insertedCustomers = await Promise.all(
			customers.map((customer) =>
				executeQuery(
					`
					INSERT INTO customers (id, name, email, image_url)
					VALUES ($1, $2, $3, $4)
					ON CONFLICT (id) DO NOTHING;
				`,
					[customer.id, customer.name, customer.email, customer.image_url],
				),
			),
		);
		return insertedCustomers;
	} catch (error) {
		console.error('Database Error:', error);
	}
}

async function seedRevenue() {
	try {
		await executeQuery(`
			CREATE TABLE IF NOT EXISTS revenue (
				month VARCHAR(4) NOT NULL UNIQUE,
				revenue INT NOT NULL
			);
		`);

		const insertedRevenue = await Promise.all(
			revenue.map((rev) =>
				executeQuery(
					`
					INSERT INTO revenue (month, revenue)
					VALUES ($1, $2)
					ON CONFLICT (month) DO NOTHING;
				`,
					[rev.month, rev.revenue],
				),
			),
		);
		return insertedRevenue;
	} catch (error) {
		console.error('Database Error:', error);
	}
}

export async function GET() {
	try {
		await executeQuery(`BEGIN`);
		await seedUsers();
		await seedCustomers();
		await seedInvoices();
		await seedRevenue();
		await executeQuery(`COMMIT`);
		return Response.json({ message: 'Database seeded successfully' });
	} catch (error) {
		await executeQuery(`ROLLBACK`);
		console.error('Seed error:', error);
		return Response.json({ error }, { status: 500 });
	}
}
