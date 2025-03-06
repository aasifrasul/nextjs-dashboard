import { fetchFilteredCustomers } from '@/app/lib/data';
import { FormattedCustomersTable } from '@/app/lib/definitions';
import Table from '@/app/ui/customers/table';

export default async function page(props: {
	searchParams?: Promise<{
		query?: string;
		page?: string;
	}>;
}) {
	const searchParams = await props.searchParams;
	const query = searchParams!.query || '';
	console.log('params', searchParams);
	const customers: FormattedCustomersTable[] = await fetchFilteredCustomers(query);

	return (
		<main>
			<Table customers={customers} />
		</main>
	);
}
