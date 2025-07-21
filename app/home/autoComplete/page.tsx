'use client';

import { StoreProvider } from '@/app/stores/provider';
import { QueryProvider } from '@/app/context/QueryProvider';
import AutoComplete from './AutoComplete';

function App() {
	return (
		<StoreProvider>
			<QueryProvider>
				<AutoComplete />
			</QueryProvider>
		</StoreProvider>
	);
}

export default App;
