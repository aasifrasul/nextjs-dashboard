import { executeQueryWithResult } from '../lib/db-utils';

async function listInvoices() {
	try {
		const query = `
			SELECT invoices.amount, customers.name
			FROM invoices
			JOIN customers ON invoices.customer_id = customers.id
			WHERE invoices.amount = $1;
	   `;
		return await executeQueryWithResult(query, [666]);
	} catch (error) {
		console.error('Database Error:', error);
		throw new Error('Failed to fetch revenue data.');
	}
}

export async function GET() {
	try {
		return Response.json(await listInvoices());
	} catch (error) {
		return Response.json({ error }, { status: 500 });
	}
}
