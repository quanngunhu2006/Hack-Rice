import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Returns a stable, persistent anonymous user ID stored in localStorage.
// Used to attribute votes when the user is not authenticated.
export function getAnonymousUserId(): string {
  const storageKey = 'anon_user_id'
  try {
    const existingId = window.localStorage.getItem(storageKey)
    if (existingId && existingId.length > 0) {
      return existingId
    }
    const newId = `anon-${crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)}`
    window.localStorage.setItem(storageKey, newId)
    return newId
  } catch {
    // Fallback if localStorage is unavailable
    return `anon-${Math.random().toString(36).slice(2)}`
  }
}