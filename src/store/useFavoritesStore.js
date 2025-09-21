import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useFavoritesStore = create(
  persist(
    (set, get) => ({
      favorites: [],
      add(user) {
        const exists = get().favorites.some(u => u.id === user.id)
        if (!exists) set({ favorites: [...get().favorites, user] })
      },
      remove(id) { set({ favorites: get().favorites.filter(u => u.id !== id) }) },
      clear() { set({ favorites: [] }) },
      isFav(id) { return get().favorites.some(u => u.id === id) }
    }),
    { name: 'github-favorites' }
  )
)