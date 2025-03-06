import { AsyncQueueBase } from './AsyncQueueBase';
import { QueueItem } from './types';

export class ConcurrentAsyncQueue<T> extends AsyncQueueBase<T> {
	private runningTasks: number = 0;

	constructor(private concurrentLimit: number = 3) {
		super();
	}

	protected canProcessMore(): boolean {
		return this.runningTasks < this.concurrentLimit;
	}

	protected async processItem(item: QueueItem<T>): Promise<void> {
		this.runningTasks++;
		this.isRunning = true;

		try {
			const payload = await item.action();
			item.resolve(payload);
		} catch (error) {
			console.error('Error processing queue item:', error);
			item.reject(error);
		} finally {
			this.runningTasks--;
			this.isRunning = this.runningTasks > 0;
			void this.startProcessing();
		}
	}
}
