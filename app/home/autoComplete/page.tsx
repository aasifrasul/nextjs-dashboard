'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { StoreProvider } from '@/app/stores/provider';
import AutoComplete from './AutoComplete';

// Create a client
const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 5 * 60 * 1000, // 5 minutes
			gcTime: 10 * 60 * 1000, // 10 minutes
		},
	},
});

function App() {
	return (
		<StoreProvider>
			<QueryClientProvider client={queryClient}>
				<AutoComplete />
				<ReactQueryDevtools initialIsOpen={false} />
			</QueryClientProvider>
		</StoreProvider>
	);
}

export default App;
