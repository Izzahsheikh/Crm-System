import { MongoClient, type Db, type Collection } from "mongodb"
import type { UserDoc, LeadDoc, ActivityLogDoc } from "@/lib/types"

const uri = process.env.MONGODB_URI
const dbName = process.env.MONGODB_DB || "property_crm"

let clientPromise: Promise<MongoClient> | null = null

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined
}

function getClientPromise(): Promise<MongoClient> {
  if (!uri) throw new Error("MONGODB_URI is not set.")

  if (process.env.NODE_ENV === "development") {
    if (!global._mongoClientPromise) {
      const client = new MongoClient(uri)
      global._mongoClientPromise = client.connect()
    }
    return global._mongoClientPromise
  }

  if (!clientPromise) {
    const client = new MongoClient(uri)
    clientPromise = client.connect()
  }
  return clientPromise
}

export async function getDb(): Promise<Db> {
  const client = await getClientPromise()
  return client.db(dbName)
}

export interface DbCollections {
  users:        Collection<UserDoc>
  leads:        Collection<LeadDoc>
  activitylogs: Collection<ActivityLogDoc>
}

export async function getCollections(): Promise<DbCollections> {
  const db = await getDb()
  return {
    users:        db.collection<UserDoc>("users"),
    leads:        db.collection<LeadDoc>("leads"),
    activitylogs: db.collection<ActivityLogDoc>("activitylogs"),
  }
}