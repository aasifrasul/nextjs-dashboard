'use server';
import { AuthError } from 'next-auth';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { executeQuery } from './db-utils';
import { signIn, signOut } from '@/auth';
import { logger } from '../lib/Logger';

const FormSchema = z.object({
	id: z.string(),
	customerId: z.string({
		invalid_type_error: 'Please select a customer.',
	}),
	amount: z.coerce.number().gt(0, { message: 'Please enter an amount greater than $0.' }),
	status: z.enum(['pending', 'paid'], {
		invalid_type_error: 'Please select an invoice status.',
	}),
	date: z.string(),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true });
const UpdateInvoice = FormSchema.omit({ id: true, date: true });

export type State = {
	errors?: {
		customerId?: string[];
		amount?: string[];
		status?: string[];
	};
	message?: string | null;
};

export async function logOut() {
	await signOut({ redirectTo: '/' });
}

export async function authenticate(prevState: string | undefined, formData: FormData) {
	try {
		await signIn('credentials', formData);
	} catch (error) {
		if (error instanceof AuthError) {
			switch (error.type) {
				case 'CredentialsSignin':
					return 'Invalid credentials.';
				default:
					return 'Something went wrong.';
			}
		}
		throw error;
	}
}

export async function createInvoice(prevState: State, formData: FormData) {
	const validatedFields = CreateInvoice.safeParse({
		customerId: formData.get('customerId'),
		amount: formData.get('amount'),
		status: formData.get('status'),
	});

	if (!validatedFields.success) {
		return {
			errors: validatedFields.error.flatten().fieldErrors,
			message: 'Missing Fields. Failed to Create Invoice.',
		};
	}

	const { customerId, amount, status } = validatedFields.data;
	const amountInCents = amount * 100;
	const date = new Date().toISOString().split('T')[0];

	try {
		const query = `INSERT INTO invoices (customer_id, amount, status, date) VALUES ($1, $2, $3, $4)`;
		const params = [customerId, amountInCents, status, date];
		await executeQuery(query, params);
	} catch (error) {
		logger.error(error);
		return {
			message: 'Database Error: Failed to Create Invoice.',
		};
	}

	revalidatePath('/dashboard/invoices');
	redirect('/dashboard/invoices');
}

export async function updateInvoice(id: string, prevState: State, formData: FormData) {
	const validatedFields = UpdateInvoice.safeParse({
		customerId: formData.get('customerId'),
		amount: formData.get('amount'),
		status: formData.get('status'),
	});

	if (!validatedFields.success) {
		return {
			errors: validatedFields.error.flatten().fieldErrors,
			message: 'Missing Fields. Failed to Edit Invoice.',
		};
	}

	const { customerId, amount, status } = validatedFields.data;
	const amountInCents = amount * 100;

	try {
		const query = `UPDATE invoices SET customer_id = $1, amount = $2, status = $3 WHERE id = $4`;
		const params = [customerId, amountInCents, status, id];
		await executeQuery(query, params);
	} catch (err) {
		logger.error(err);
		return {
			message: 'Database Error: Failed to Edit Invoice.',
		};
	}

	revalidatePath('/dashboard/invoices');
	redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) {
	try {
		const query = `DELETE FROM invoices WHERE id = $1`;
		const params = [id];
		await executeQuery(query, params);
	} catch (err) {
		logger.error(err);
	}
	revalidatePath('/dashboard/invoices');
}
