import {
	CustomerField,
	CustomersTableType,
	InvoiceForm,
	InvoicesTable,
	LatestInvoiceRaw,
	Revenue,
} from './definitions';
import { formatCurrency } from './utils';
import { logger } from './Logger';
import { executeQueryWithResult } from './db-utils';

export async function fetchRevenue() {
	try {
		logger.info('Fetching revenue data...');
		const data = await executeQueryWithResult(`SELECT * FROM revenue`);
		return data;
	} catch (error) {
		logger.error('Database Error:', error);
		throw new Error('Failed to fetch revenue data.');
	}
}

export async function fetchLatestInvoices() {
	try {
		const data: LatestInvoiceRaw[] = await executeQueryWithResult(`
			SELECT invoices.amount, customers.name, customers.image_url, customers.email, invoices.id
			FROM invoices
			JOIN customers ON invoices.customer_id = customers.id
			ORDER BY invoices.date DESC
			LIMIT 5`);

		const latestInvoices = data.map((invoice) => ({
			...invoice,
			amount: formatCurrency(invoice.amount),
		}));
		return latestInvoices;
	} catch (error) {
		logger.error('Database Error:', error);
		throw new Error('Failed to fetch the latest invoices.');
	}
}

export async function fetchCardData() {
	try {
		// You can probably combine these into a single SQL query
		// However, we are intentionally splitting them to demonstrate
		// how to initialize multiple queries in parallel with JS.
		const invoiceCountPromise = executeQueryWithResult(`SELECT COUNT(*) FROM invoices`);
		const customerCountPromise = executeQueryWithResult(`SELECT COUNT(*) FROM customers`);
		const invoiceStatusPromise = executeQueryWithResult(`SELECT
			SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) AS "paid",
			SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) AS "pending"
			FROM invoices`);

		const data = await Promise.all([
			invoiceCountPromise,
			customerCountPromise,
			invoiceStatusPromise,
		]);

		const numberOfInvoices = Number((data as any[])[0][0].count ?? '0');
		const numberOfCustomers = Number((data as any[])[1][0].count ?? '0');
		const totalPaidInvoices = formatCurrency((data as any[])[2][0].paid ?? '0');
		const totalPendingInvoices = formatCurrency((data as any[])[2][0].pending ?? '0');

		return {
			numberOfCustomers,
			numberOfInvoices,
			totalPaidInvoices,
			totalPendingInvoices,
		};
	} catch (error) {
		logger.error('Database Error:', error);
		throw new Error('Failed to fetch card data.');
	}
}

const ITEMS_PER_PAGE = 6;
export async function fetchFilteredInvoices(query: string, currentPage: number) {
	const offset = (currentPage - 1) * ITEMS_PER_PAGE;

	try {
		const query = `
			SELECT
				invoices.id,
				invoices.amount,
				invoices.date,
				invoices.status,
				customers.name,
				customers.email,
				customers.image_url
			FROM invoices
			JOIN customers ON invoices.customer_id = customers.id
			WHERE
				customers.name ILIKE $1 OR
				customers.email ILIKE $1 OR
				invoices.amount::text ILIKE $1 OR
				invoices.date::text ILIKE $1 OR
				invoices.status ILIKE $1
			ORDER BY invoices.date DESC
			LIMIT $2 OFFSET $3
		`;
		const params = [`%${query}%`, ITEMS_PER_PAGE, offset];
		return await executeQueryWithResult(query, params);
	} catch (error) {
		logger.error('Database Error:', error);
		throw new Error('Failed to fetch invoices.');
	}
}

export async function fetchInvoicesPages(query: string) {
	try {
		const query = `SELECT COUNT(*)
			FROM invoices
			JOIN customers ON invoices.customer_id = customers.id
			WHERE
			customers.name ILIKE $1 OR
			customers.email ILIKE $1 OR
			invoices.amount::text ILIKE $1 OR
			invoices.date::text ILIKE $1 OR
			invoices.status ILIKE $1`;
		const count = await executeQueryWithResult(query, [`%${query}%`]);
		return Math.ceil(Number((count as any[])[0].count) / ITEMS_PER_PAGE);
	} catch (error) {
		logger.error('Database Error:', error);
		throw new Error('Failed to fetch total number of invoices.');
	}
}

export async function fetchInvoiceById(id: string) {
	try {
		const data: InvoiceForm[] = await executeQueryWithResult(
			`
			SELECT
				invoices.id,
				invoices.customer_id,
				invoices.amount,
				invoices.status
			FROM invoices
			WHERE invoices.id = $1;
		`,
			[id],
		);

		const invoice = data.map((invoice) => ({
			...invoice,
			// Convert amount from cents to dollars
			amount: invoice.amount / 100,
		}));

		return invoice[0];
	} catch (error) {
		logger.error('Database Error:', error);
		throw new Error('Failed to fetch invoice.');
	}
}

export async function fetchCustomers() {
	try {
		const customers: CustomerField[] = await executeQueryWithResult(`
			SELECT
				id,
				name
			FROM customers
			ORDER BY name ASC
		`);

		return customers;
	} catch (err) {
		logger.error('Database Error:', err);
		throw new Error('Failed to fetch all customers.');
	}
}

export async function fetchFilteredCustomers(query: string) {
	let client;

	try {
		const customers: CustomersTableType[] = await executeQueryWithResult(
			`
			SELECT
			customers.id,
			customers.name,
			customers.email,
			customers.image_url,
			COUNT(invoices.id) AS total_invoices,
			SUM(CASE WHEN invoices.status = 'pending' THEN invoices.amount ELSE 0 END) AS total_pending,
			SUM(CASE WHEN invoices.status = 'paid' THEN invoices.amount ELSE 0 END) AS total_paid
			FROM customers
			LEFT JOIN invoices ON customers.id = invoices.customer_id
			WHERE
			customers.name ILIKE $1 OR
			customers.email ILIKE $1
			GROUP BY customers.id, customers.name, customers.email, customers.image_url
			ORDER BY customers.name ASC
		`,
			[`%${query}%`],
		);

		return customers.map((customer) => ({
			...customer,
			total_pending: formatCurrency(customer.total_pending),
			total_paid: formatCurrency(customer.total_paid),
		}));
	} catch (err) {
		logger.error('Database Error:', err);
		throw new Error('Failed to fetch customer table.');
	}
}
