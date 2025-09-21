
import { useEffect, useRef, useState } from 'react'
import { FaGithub, FaBan } from 'react-icons/fa'
import { useFavoritesStore } from '../store/useFavoritesStore'
import { ghFetch } from '../utils/ghFetch'
import { LuStarOff } from 'react-icons/lu'

// كاش بسيط لمنع تكرار جلب التفاصيل
const detailsCache = new Map()

function formatCompact(num) {
    if (num == null || isNaN(num)) return '0'
    try {
        return new Intl.NumberFormat(undefined, {
            notation: 'compact',
            maximumFractionDigits: 1
        }).format(num)
    } catch {
        if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B'
        if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M'
        if (num >= 1_000) return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K'
        return String(num)
    }
}

export default function FavoriteCard({ user }) {
    const remove = useFavoritesStore((s) => s.remove)

    const [details, setDetails] = useState(() => detailsCache.get(user.login) || null)
    const [loading, setLoading] = useState(!details)
    const [err, setErr] = useState('')
    const cardRef = useRef(null)
    const observerRef = useRef(null)
    const abortRef = useRef(null)

    const token = import.meta.env.VITE_GH_TOKEN

    useEffect(() => {
        if (detailsCache.has(user.login)) {
            setLoading(false)
            return
        }

        const el = cardRef.current
        if (!el) return

        const onIntersect = (entries) => {
            for (const entry of entries) {
                if (entry.isIntersecting) {
                    observerRef.current?.disconnect()
                    const ctl = new AbortController()
                    abortRef.current = ctl

                    setLoading(true)
                    setErr('')
                    ghFetch(`https://api.github.com/users/${user.login}`, { token, signal: ctl.signal })
                        .then((data) => {
                            detailsCache.set(user.login, data)
                            setDetails(data)
                        })
                        .catch((e) => {
                            if (e.name !== 'AbortError') setErr(e.message || 'Failed to load user details')
                        })
                        .finally(() => setLoading(false))
                    break
                }
            }
        }

        observerRef.current = new IntersectionObserver(onIntersect, {
            root: null,
            rootMargin: '120px',
            threshold: 0.01
        })
        observerRef.current.observe(el)

        return () => {
            observerRef.current?.disconnect()
            abortRef.current?.abort()
        }
    }, [user.login, token])

    const followers = details?.followers ?? null
    const publicRepos = details?.public_repos ?? null
    const siteAdmin = user.site_admin === true

    const followersText = loading ? '—' : err ? 'N/A' : formatCompact(followers)
    const reposText = loading ? '—' : err ? 'N/A' : formatCompact(publicRepos)

    return (
        <article ref={cardRef} className="card usercard">
            <div className="ucard-left">
                <img className="avatar" src={user.avatar_url} alt={`${user.login} avatar`} loading="lazy" />
            </div>

            <div className="ucard-body">
                <div className="ucard-header">
                    <div className="title-wrap">
                        <h3 className="ucard-title" title={user.login}>{user.login}</h3>
                        <span className="ucard-sub">ID: {user.id}</span>
                        {siteAdmin && <span className="badge admin">Admin</span>}
                    </div>

                    <div className="ucard-actions">
                        {/* زر إزالة من المفضلة */}
                        <button
                            type="button"
                            className="icon-btn"
                            onClick={() => remove(user.id)}
                            aria-label="Remove from favorites"
                            title="Remove from favorites"
                        >
                            <LuStarOff size={18} />
                        </button>

                        <a
                            className="icon-btn"
                            href={user.html_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Open GitHub profile"
                            title="Open GitHub profile"
                        >
                            <FaGithub size={18} />
                        </a>
                    </div>
                </div>

                {err && <div className="ucard-error" role="alert">{err}</div>}
            </div>

            {/* نفس الشبكة السفلية للميتا */}
            <ul className="ucard-meta" aria-label="User stats">
                <li>
                    <span className="meta-label">Type</span>
                    <span className="meta-value">{user.type}</span>
                </li>
                <li>
                    <span className="meta-label">Followers</span>
                    <span className="meta-value">{followersText}</span>
                </li>
                <li>
                    <span className="meta-label">Repos</span>
                    <span className="meta-value">{reposText}</span>
                </li>
            </ul>
        </article>
    )
}
