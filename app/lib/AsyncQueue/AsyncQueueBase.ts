import { QueueItem } from './types';
import { BaseQueue } from './BaseQueue';

export abstract class AsyncQueueBase<T> extends BaseQueue<QueueItem<T>> {
	protected isRunning: boolean = false;
	protected isPaused: boolean = false;
	protected isStopped: boolean = false;

	addToQueue(action: () => Promise<T>, autoDequeue: boolean = true): Promise<T> {
		return new Promise<T>((resolve, reject) => {
			super.enqueue({ action, resolve, reject });
			if (autoDequeue) {
				void this.startProcessing();
			}
		});
	}

	protected abstract canProcessMore(): boolean;
	protected abstract processItem(item: QueueItem<T>): Promise<void>;

	protected async startProcessing(): Promise<boolean> {
		if (this.isEmpty() || this.isPaused || this.isStopped || !this.canProcessMore()) {
			return false;
		}

		const item = this.dequeue();
		if (!item) return false;

		await this.processItem(item);
		return true;
	}

	stop(): void {
		this.isStopped = true;
	}

	pause(): void {
		this.isPaused = true;
	}

	async start(): Promise<boolean> {
		this.isStopped = false;
		this.isPaused = false;
		return this.startProcessing();
	}
}
