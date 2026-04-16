import { Client, Databases, ID } from 'appwrite';

const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);

export const databases = new Databases(client);

export const APPWRITE_DB_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
export const CAMPAIGNS_COLLECTION_ID = 'YOUR_CAMPAIGNS_COLLECTION_ID';
export const CHARACTERS_COLLECTION_ID = 'YOUR_CHARACTERS_COLLECTION_ID';
export const CHAT_HISTORY_COLLECTION_ID = 'YOUR_CHAT_HISTORY_COLLECTION_ID';
