import { useQuery } from '@tanstack/react-query';
import { CompanyItem } from '../types/autoComplete';
import { fetchAPIData } from '@/app/lib/apiUtils';

const COMPANY_SEARCH_URL = 'https://autocomplete.clearbit.com/v1/companies/suggest?query=';

interface UseCompanySearchOptions {
	searchText: string;
	enabled?: boolean;
}

export const useCompanySearch = ({ searchText, enabled = true }: UseCompanySearchOptions) => {
	return useQuery({
		queryKey: ['companies', searchText],
		queryFn: async (): Promise<CompanyItem[]> => {
			if (!searchText.trim()) {
				return [];
			}

			const result = await fetchAPIData(`${COMPANY_SEARCH_URL}${searchText}`);

			if (result.success) {
				return result.data as CompanyItem[];
			} else {
				throw result.error || new Error('Failed to fetch companies');
			}
		},
		enabled: enabled && searchText.length > 0,
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes
		retry: 2,
		refetchOnWindowFocus: false,
	});
};
