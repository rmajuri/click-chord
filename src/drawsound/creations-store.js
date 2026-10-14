// Saved creations live only in this browser. Nothing is sent anywhere.
const STORAGE_KEY = 'drawsound.creations.v1'
export const MAX_CREATIONS = 20

export function loadCreations() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    return Array.isArray(saved) ? saved : []
  } catch {
    return []
  }
}

const write = (creations) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(creations))
    return true
  } catch {
    return false
  }
}

// Returns the new list, or null if the browser wouldn't store it
export function saveCreation(creation, creations) {
  const next = [creation, ...creations.filter(({ id }) => id !== creation.id)]
  return write(next.slice(0, MAX_CREATIONS))
    ? next.slice(0, MAX_CREATIONS)
    : null
}

export function deleteCreation(id, creations) {
  const next = creations.filter((creation) => creation.id !== id)
  write(next)
  return next
}
