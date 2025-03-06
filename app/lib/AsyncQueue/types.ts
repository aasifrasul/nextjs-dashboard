export interface QueueProcessor<T> {
	processItem(item: QueueItem<T>): Promise<void>;
	canProcess(): boolean;
}

export interface QueueItem<T> {
	action: () => Promise<T>;
	resolve: (value: T | PromiseLike<T>) => void;
	reject: (reason?: any) => void;
}
