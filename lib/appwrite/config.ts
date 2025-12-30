export const appwriteConfig = {
  endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!,
  projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!,
  nightCheckingTableId: process.env.NEXT_PUBLIC_APPWRITE_NIGHCHECKING_TABLE_ID!,
  databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
  secretKey: process.env.APPWRITE_KEY!,
};
