'use client';

import { Provider } from 'react-redux';
import { store } from './index';
import { ReactNode } from 'react';

export function StoreProvider({ children }: { children: ReactNode }) {
	return <Provider store={store}>{children}</Provider>;
}
