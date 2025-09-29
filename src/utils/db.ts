// IndexedDB utilities for offline-first experience

import { openDB, DBSchema, IDBPDatabase } from 'idb'
import { Task, Project, JournalEntry } from '@/types'

interface NucleusDB extends DBSchema {
  tasks: {
    key: string
    value: Task & { _localId?: string; _pendingSync?: boolean }
  }
  projects: {
    key: string
    value: Project & { _localId?: string; _pendingSync?: boolean }
  }
  journal: {
    key: string
    value: JournalEntry & { _localId?: string; _pendingSync?: boolean }
  }
  mutations: {
    key: number
    value: {
      id?: number
      type: 'create' | 'update' | 'delete'
      table: 'tasks' | 'projects' | 'journal'
      data: any
      timestamp: number
      retryCount: number
    }
  }
}

let db: IDBPDatabase<NucleusDB> | null = null

export const initDB = async (): Promise<IDBPDatabase<NucleusDB>> => {
  if (db) return db

  db = await openDB<NucleusDB>('nucleus-db', 1, {
    upgrade(db) {
      // Tasks store
      if (!db.objectStoreNames.contains('tasks')) {
        db.createObjectStore('tasks', { keyPath: 'id' })
      }

      // Projects store
      if (!db.objectStoreNames.contains('projects')) {
        db.createObjectStore('projects', { keyPath: 'id' })
      }

      // Journal store
      if (!db.objectStoreNames.contains('journal')) {
        const journalStore = db.createObjectStore('journal', { keyPath: 'id' })
        journalStore.createIndex('date', 'date')
        journalStore.createIndex('type', 'type')
      }

      // Mutations queue store
      if (!db.objectStoreNames.contains('mutations')) {
        db.createObjectStore('mutations', { keyPath: 'id', autoIncrement: true })
      }
    },
  })

  return db
}

// Generic CRUD operations
export const dbOperations = {
  // Get all items from a store
  getAll: async <T extends keyof NucleusDB>(storeName: T): Promise<NucleusDB[T]['value'][]> => {
    const database = await initDB()
    return database.getAll(storeName)
  },

  // Get item by ID
  get: async <T extends keyof NucleusDB>(
    storeName: T,
    id: string
  ): Promise<NucleusDB[T]['value'] | undefined> => {
    const database = await initDB()
    return database.get(storeName, id)
  },

  // Add item
  add: async <T extends keyof NucleusDB>(
    storeName: T,
    item: NucleusDB[T]['value']
  ): Promise<void> => {
    const database = await initDB()
    await database.add(storeName, item)
  },

  // Update item
  put: async <T extends keyof NucleusDB>(
    storeName: T,
    item: NucleusDB[T]['value']
  ): Promise<void> => {
    const database = await initDB()
    await database.put(storeName, item)
  },

  // Delete item
  delete: async <T extends keyof NucleusDB>(storeName: T, id: string): Promise<void> => {
    const database = await initDB()
    await database.delete(storeName, id)
  },

  // Clear store
  clear: async <T extends keyof NucleusDB>(storeName: T): Promise<void> => {
    const database = await initDB()
    await database.clear(storeName)
  },
}

// Mutation queue operations
export const mutationQueue = {
  add: async (mutation: Omit<NucleusDB['mutations']['value'], 'id'>): Promise<void> => {
    const database = await initDB()
    await database.add('mutations', mutation)
  },

  getAll: async (): Promise<NucleusDB['mutations']['value'][]> => {
    const database = await initDB()
    return database.getAll('mutations')
  },

  delete: async (id: number): Promise<void> => {
    const database = await initDB()
    await database.delete('mutations', id)
  },

  clear: async (): Promise<void> => {
    const database = await initDB()
    await database.clear('mutations')
  },
}

// Sync utilities
export const markForSync = async <T extends keyof NucleusDB>(
  storeName: T,
  item: NucleusDB[T]['value']
): Promise<void> => {
  const database = await initDB()
  const updatedItem = { ...item, _pendingSync: true }
  await database.put(storeName, updatedItem)
}

export const clearSyncFlag = async <T extends keyof NucleusDB>(
  storeName: T,
  id: string
): Promise<void> => {
  const database = await initDB()
  const item = await database.get(storeName, id)
  if (item) {
    const { _pendingSync, ...cleanItem } = item as any
    await database.put(storeName, cleanItem)
  }
}