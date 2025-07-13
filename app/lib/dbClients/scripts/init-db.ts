import { config } from 'dotenv';
import path from 'path';

// Load environment variables first
config({ path: path.resolve(process.cwd(), '.env.local') });

// Now import modules that depend on environment variables
import { initializeDatabase, seedTasks, seedUsers } from '../mongodb-setup';

async function main() {
	try {
		console.log('Environment check...');
		console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);
		console.log('Current working directory:', process.cwd());

		console.log('Initializing database...');
		await initializeDatabase();

		console.log('Seeding database...');
		await seedTasks();
		await seedUsers();

		console.log('Database initialization complete!');
		process.exit(0);
	} catch (error) {
		console.error('Database initialization failed:', error);
		process.exit(1);
	}
}

main();
