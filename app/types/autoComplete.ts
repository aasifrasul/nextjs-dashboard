export interface CompanyItem {
	name: string;
	logo: string;
	domain: string;
}

export interface AutoCompleteState {
	searchText: string;
	isModalOpen: boolean;
	currentItem: CompanyItem | null;
}
