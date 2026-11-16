import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI || "";
const dbName = process.env.MONGODB_DB || "textra_nlp";

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (!uri) {
  console.warn("[MongoDB] MONGODB_URI is not set. Database operations will be skipped or simulated.");
}

if (process.env.NODE_ENV === "development") {
  // In development, preserve client across hot-reloads
  if (!global._mongoClientPromise && uri) {
    client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise || (uri ? new MongoClient(uri).connect() : Promise.reject("MONGODB_URI missing"));
} else {
  // In production, instantiate client directly
  client = uri ? new MongoClient(uri) : (null as unknown as MongoClient);
  clientPromise = uri ? client.connect() : Promise.reject("MONGODB_URI missing");
}

/**
 * Returns the connected MongoDB database instance.
 */
export async function getDatabase(): Promise<Db | null> {
  if (!uri) return null;
  try {
    const client = await clientPromise;
    return client.db(dbName);
  } catch (error) {
    console.error("[MongoDB Connection Error]", error);
    return null;
  }
}

export default clientPromise;
