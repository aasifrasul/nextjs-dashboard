import { Pool } from 'pg';

const pool = new Pool({
	user: 'test',
	host: 'localhost',
	database: 'test',
	password: 'test',
	port: 5432,
	connectionTimeoutMillis: 10000,
});

const client = await pool.connect();

async function listInvoices() {
	const data = await client.query(`
		SELECT invoices.amount, customers.name
		FROM invoices
		JOIN customers ON invoices.customer_id = customers.id
		WHERE invoices.amount = 666;
   `);

	return data.rows;
}

export async function GET() {
	try {
		return Response.json(await listInvoices());
	} catch (error) {
		return Response.json({ error }, { status: 500 });
	}
}
