import { AsyncQueueBase } from './AsyncQueueBase';
import { QueueItem } from './types';

export class AsyncQueue<T> extends AsyncQueueBase<T> {
	protected canProcessMore(): boolean {
		return !this.isRunning;
	}

	protected async processItem(item: QueueItem<T>): Promise<void> {
		this.isRunning = true;
		try {
			const payload = await item.action();
			item.resolve(payload);
		} catch (error) {
			console.error('Error processing queue item:', error);
			item.reject(error);
		} finally {
			this.isRunning = false;
			void this.startProcessing();
		}
	}
}
