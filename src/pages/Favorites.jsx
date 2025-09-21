// src/pages/Favorites.jsx
import { useState, useEffect } from 'react'
import { useFavoritesStore } from '../store/useFavoritesStore'
import EmptyState from '../components/EmptyState'
import FavoriteCard from '../components/FavoriteCard'
import UserCardSkeleton from '../components/UserCardSkeleton'
import { FaTrash } from 'react-icons/fa' // ✅ أيقونة الحذف

export default function Favorites() {
    const { favorites, clear } = useFavoritesStore()
    const [showSkeleton, setShowSkeleton] = useState(true)

    useEffect(() => {
        const timer = setTimeout(() => setShowSkeleton(false), 800)
        return () => clearTimeout(timer)
    }, [favorites.length])

    return (
        <section className="container">
            <div className="controls">
                <div />
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                    {/* ✅ زرار بيظهر بس لو فيه عناصر */}
                    {favorites.length > 0 && (
                        <button className="btn danger" onClick={clear}>
                            <FaTrash style={{ marginRight: 6 }} />
                            Clear All
                        </button>
                    )}
                </div>
            </div>

            {favorites.length === 0 ? (
                <EmptyState
                    title="No favorites yet"
                    subtitle="Go to Home and add ⭐ to users you like."
                />
            ) : (
                <div className="grid">
                    {showSkeleton &&
                        Array.from({ length: favorites.length }).map((_, i) => (
                            <UserCardSkeleton key={`sk-${i}`} />
                        ))}

                    {/* الكروت الحقيقية */}
                    {!showSkeleton &&
                        favorites.map((u) => <FavoriteCard key={u.id} user={u} />)}
                </div>
            )}
        </section>
    )
}
