import { Task } from '@/app/lib/store/features/tasks/types';

// Mock data storage (in real app, this would be your database)
export let tasks: Task[] = [
	{
		id: '1',
		title: 'Setup Redux Toolkit',
		description: 'Configure RTK with Next.js application',
		status: 'completed',
		priority: 'high',
		assigneeId: 'user-1',
		createdAt: '2024-01-01T10:00:00Z',
		updatedAt: '2024-01-01T12:00:00Z',
		tags: ['setup', 'redux'],
		estimatedHours: 4,
		actualHours: 3,
	},
	{
		id: '2',
		title: 'Create Task Components',
		description: 'Build reusable task components with RTK integration',
		status: 'in_progress',
		priority: 'medium',
		assigneeId: 'user-2',
		createdAt: '2024-01-02T09:00:00Z',
		updatedAt: '2024-01-02T11:00:00Z',
		tags: ['components', 'ui'],
		estimatedHours: 6,
		actualHours: 2,
	},
	{
		id: '3',
		title: 'Implement Real-time Updates',
		description: 'Add WebSocket support for real-time task updates',
		status: 'todo',
		priority: 'low',
		assigneeId: 'user-1',
		createdAt: '2024-01-03T14:00:00Z',
		updatedAt: '2024-01-03T14:00:00Z',
		tags: ['websocket', 'realtime'],
		estimatedHours: 8,
	},
];
