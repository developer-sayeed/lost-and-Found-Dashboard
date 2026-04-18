import type { User, LostItem, HotelSettings } from './types'
import { STORAGE_KEYS, DEFAULT_SUPER_ADMIN, DEFAULT_SETTINGS } from './constants'
import { format } from 'date-fns'

// Helper to check if we're in browser
const isBrowser = typeof window !== 'undefined'

// Initialize storage with defaults
export function initializeStorage(): void {
  if (!isBrowser) return

  // Initialize users with default super admin
  const users = getUsers()
  if (users.length === 0) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([DEFAULT_SUPER_ADMIN]))
  }

  // Initialize settings
  const settings = getSettings()
  if (!settings) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS))
  }

  // Initialize items array
  const items = localStorage.getItem(STORAGE_KEYS.ITEMS)
  if (!items) {
    localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify([]))
  }
}

// User operations
export function getUsers(): User[] {
  if (!isBrowser) return []
  const data = localStorage.getItem(STORAGE_KEYS.USERS)
  return data ? JSON.parse(data) : []
}

export function getUserById(id: string): User | undefined {
  return getUsers().find(user => user.id === id)
}

export function getUserByEmail(email: string): User | undefined {
  return getUsers().find(user => user.email.toLowerCase() === email.toLowerCase())
}

export function addUser(user: User): void {
  const users = getUsers()
  users.push(user)
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users))
}

export function updateUser(id: string, updates: Partial<User>): void {
  const users = getUsers()
  const index = users.findIndex(user => user.id === id)
  if (index !== -1) {
    users[index] = { ...users[index], ...updates }
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users))
  }
}

export function deleteUser(id: string): void {
  const users = getUsers().filter(user => user.id !== id)
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users))
}

// Item operations
export function getItems(): LostItem[] {
  if (!isBrowser) return []
  const data = localStorage.getItem(STORAGE_KEYS.ITEMS)
  return data ? JSON.parse(data) : []
}

export function getItemById(id: string): LostItem | undefined {
  return getItems().find(item => item.id === id)
}

export function generateItemCode(): string {
  const today = format(new Date(), 'yyyyMMdd')
  const items = getItems()
  const todayItems = items.filter(item => item.code.includes(today))
  const nextNumber = String(todayItems.length + 1).padStart(3, '0')
  return `LF-${today}-${nextNumber}`
}

export function addItem(item: LostItem): void {
  const items = getItems()
  items.push(item)
  localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items))
}

export function updateItem(id: string, updates: Partial<LostItem>): void {
  const items = getItems()
  const index = items.findIndex(item => item.id === id)
  if (index !== -1) {
    items[index] = { ...items[index], ...updates, updatedAt: new Date().toISOString() }
    localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items))
  }
}

export function deleteItem(id: string): void {
  const items = getItems().filter(item => item.id !== id)
  localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items))
}

// Settings operations
export function getSettings(): HotelSettings | null {
  if (!isBrowser) return null
  const data = localStorage.getItem(STORAGE_KEYS.SETTINGS)
  return data ? JSON.parse(data) : null
}

export function updateSettings(settings: HotelSettings): void {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings))
}

// Session operations
export function getSession(): { userId: string; expiresAt: string } | null {
  if (!isBrowser) return null
  const data = localStorage.getItem(STORAGE_KEYS.SESSION)
  if (!data) return null
  
  const session = JSON.parse(data)
  if (new Date(session.expiresAt) < new Date()) {
    localStorage.removeItem(STORAGE_KEYS.SESSION)
    return null
  }
  
  return session
}

export function createSession(userId: string): void {
  const expiresAt = new Date()
  expiresAt.setHours(expiresAt.getHours() + 24) // 24 hour session
  localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify({ userId, expiresAt: expiresAt.toISOString() }))
}

export function clearSession(): void {
  if (!isBrowser) return
  localStorage.removeItem(STORAGE_KEYS.SESSION)
}
