import { MongoClient, Db } from 'mongodb';
import { config } from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
config({ path: path.resolve(process.cwd(), '.env.local') });

const uri = process.env.MONGODB_URI;

if (!uri) {
	console.error(
		'Available environment variables:',
		Object.keys(process.env).filter((key) => key.includes('MONGO')),
	);
	console.error('MONGODB_URI value:', process.env.MONGODB_URI);
	throw new Error('Please add your MongoDB URI to .env.local');
}

console.log('MongoDB URI found:', uri.replace(/\/\/.*@/, '//***:***@')); // Log URI without credentials

const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
	// In development mode, use a global variable so the MongoClient instance
	// is not constantly being created and destroyed
	let globalWithMongo = global as typeof globalThis & {
		_mongoClientPromise?: Promise<MongoClient>;
	};

	if (!globalWithMongo._mongoClientPromise) {
		client = new MongoClient(uri, options);
		globalWithMongo._mongoClientPromise = client.connect();
	}
	clientPromise = globalWithMongo._mongoClientPromise;
} else {
	// In production mode, create a new MongoClient instance
	client = new MongoClient(uri, options);
	clientPromise = client.connect();
}

export default clientPromise;

// Helper function to get database
export async function getDatabase(dbName: string = 'taskmanager'): Promise<Db> {
	try {
		const client = await clientPromise;
		return client.db(dbName);
	} catch (error) {
		console.error('Failed to connect to MongoDB:', error);
		throw error;
	}
}

export async function getCollection<T>(collectionName: string) {
	const db = await getDatabase();
	return db.collection<T>(collectionName);
}
