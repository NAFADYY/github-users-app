// src/pages/Home.jsx
import { useEffect, useMemo, useRef, useState } from 'react'
import useDebounce from '../hooks/useDebounce'
import UserCard from '../components/UserCard'
import EmptyState from '../components/EmptyState'
import { ghFetch } from '../utils/ghFetch'
import PerPageSelect from '../components/PerPageSelect'
import UserCardSkeleton from '../components/UserCardSkeleton'
import { FiChevronUp } from 'react-icons/fi'

const PER_PAGE_OPTIONS = [5, 8, 10]

export default function Home() {
    // Data state
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    // Infinite scroll state
    const [isFetchingMore, setIsFetchingMore] = useState(false)
    const [hasMore, setHasMore] = useState(true)
    const [cursor, setCursor] = useState(null)

    // UI state
    const [perPage, setPerPage] = useState(PER_PAGE_OPTIONS[2])
    const [query, setQuery] = useState('')
    const debounced = useDebounce(query, 350)
    const [showTop, setShowTop] = useState(false)

    const token = import.meta.env.VITE_GH_TOKEN
    const sentinelRef = useRef(null)
    const observerRef = useRef(null)

    // ---------- Fetch helpers ----------
    async function fetchFirstPage(pageSize) {
        try {
            setLoading(true)
            setError('')
            setHasMore(true)
            setCursor(null)

            const url = `https://api.github.com/users?per_page=${pageSize}`
            const data = await ghFetch(url, { token })
            const arr = Array.isArray(data) ? data : []

            setUsers(arr)
            setCursor(arr.length ? arr[arr.length - 1].id : null)
            setHasMore(arr.length === pageSize)
        } catch (e) {
            setError(e.message || 'Failed to load users')
        } finally {
            setLoading(false)
        }
    }

    async function fetchNextPage() {
        if (!hasMore || isFetchingMore || loading) return
        if (debounced.trim()) return

        try {
            setIsFetchingMore(true)

            const url = `https://api.github.com/users?per_page=${perPage}${cursor ? `&since=${cursor}` : ''
                }`
            const data = await ghFetch(url, { token })
            const arr = Array.isArray(data) ? data : []

            setUsers(prev => {
                const seen = new Set(prev.map(u => u.id))
                const merged = [...prev]
                for (const u of arr) {
                    if (!seen.has(u.id)) merged.push(u)
                }
                return merged
            })

            setCursor(arr.length ? arr[arr.length - 1].id : cursor)
            setHasMore(arr.length === perPage)
        } catch (e) {
            console.error(e)
        } finally {
            setIsFetchingMore(false)
        }
    }

    // ---------- Effects ----------
    // Initial load
    useEffect(() => {
        fetchFirstPage(perPage)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // Reload when perPage changes
    useEffect(() => {
        fetchFirstPage(perPage)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [perPage])

    // Filter client-side
    const filtered = useMemo(() => {
        const q = debounced.trim().toLowerCase()
        if (!q) return users
        return users.filter(
            u =>
                String(u.login).toLowerCase().includes(q) ||
                String(u.id).includes(q)
        )
    }, [users, debounced])

    // Infinite scroll sentinel
    useEffect(() => {
        const el = sentinelRef.current
        if (!el) return
        if (debounced.trim()) return

        observerRef.current?.disconnect()
        observerRef.current = new IntersectionObserver(
            entries => {
                for (const entry of entries) {
                    if (entry.isIntersecting) fetchNextPage()
                }
            },
            { root: null, rootMargin: '200px', threshold: 0.01 }
        )
        observerRef.current.observe(el)
        return () => observerRef.current?.disconnect()
    }, [debounced, hasMore, isFetchingMore, loading, perPage, cursor])

    // Back-to-top visibility
    useEffect(() => {
        const onScroll = () => setShowTop(window.scrollY > 300)
        window.addEventListener('scroll', onScroll)
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

    // ---------- Render ----------
    return (
        <section className="container">
            <div className="controls">
                <input
                    className="search"
                    placeholder="Search in users..."
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    aria-label="Search"
                />
                <PerPageSelect
                    value={perPage}
                    onChange={n => setPerPage(n)}
                    options={PER_PAGE_OPTIONS}
                    labelSuffix=" / page"
                />
            </div>

            {loading && (
                <div className="grid">
                    {Array.from({ length: perPage }).map((_, i) => (
                        <UserCardSkeleton key={`sk-init-${i}`} />
                    ))}
                </div>
            )}

            {error && !loading && (
                <div className="status" role="alert" style={{ marginBottom: 12 }}>
                    {error}
                    <div style={{ marginTop: 8 }}>
                        <button className="btn" onClick={() => fetchFirstPage(perPage)}>
                            Retry
                        </button>
                    </div>
                </div>
            )}

            {!loading && !error && (
                filtered.length === 0 ? (
                    <EmptyState title="No users found" subtitle="Try a different search." />
                ) : (
                    <>
                        <div className="grid">
                            {filtered.map(user => (
                                <UserCard key={user.id} user={user} />
                            ))}

                            {!debounced &&
                                isFetchingMore &&
                                Array.from({ length: Math.min(perPage, 6) }).map((_, i) => (
                                    <UserCardSkeleton key={`sk-more-${i}`} />
                                ))}
                        </div>

                        {/* Sentinel (invisible) */}
                        <div ref={sentinelRef} style={{ height: 1 }} />

                        {!debounced && !isFetchingMore && !hasMore && (
                            <div className="status" style={{ marginTop: 12, textAlign: 'center' }}>
                                You reached the end.
                            </div>
                        )}
                    </>
                )
            )}

            {/* Back to Top */}
            {showTop && (
                <button
                    className="back-to-top"
                    onClick={scrollToTop}
                    aria-label="Back to top"
                    title="Back to top"
                >
                    <FiChevronUp size={22} />
                </button>
            )}
        </section>
    )
}
