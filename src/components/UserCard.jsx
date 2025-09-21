// src/components/UserCard.jsx
import { useEffect, useRef, useState } from 'react'
import { FaStar, FaRegStar, FaGithub } from 'react-icons/fa'
import { useFavoritesStore } from '../store/useFavoritesStore'
import { ghFetch } from '../utils/ghFetch'

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

/** ========== Fly-to-Favorites helper (Inline) ========== */
function flyTo(targetSelector, sourceEl, {
    duration = 1000,
    easing = 'cubic-bezier(.22,.61,.36,1)',
    shrink = 0.35
} = {}) {
    const target = document.querySelector(targetSelector)
    if (!target || !sourceEl) return

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return

    const sRect = sourceEl.getBoundingClientRect()
    const tRect = target.getBoundingClientRect()

    const ghost = document.createElement('div')
    ghost.className = 'fly-clone'
    ghost.style.position = 'fixed'
    ghost.style.left = `${sRect.left}px`
    ghost.style.top = `${sRect.top}px`
    ghost.style.width = `${sRect.width}px`
    ghost.style.height = `${sRect.height}px`
    ghost.style.borderRadius = '16px'
    const root = getComputedStyle(document.documentElement)
    ghost.style.background = root.getPropertyValue('--card') || '#f3f4f6'
    ghost.style.border = `1px solid ${root.getPropertyValue('--border') || 'rgba(0,0,0,.06)'}`
    ghost.style.boxShadow = '0 10px 30px rgba(0,0,0,.12)'
    ghost.style.zIndex = 9999
    ghost.style.willChange = 'transform, opacity'
    ghost.style.transform = 'translate3d(0,0,0) scale(1)'
    ghost.style.opacity = '0.95'

    document.body.appendChild(ghost)

    const dx = (tRect.left + tRect.width / 2) - (sRect.left + sRect.width / 2)
    const dy = (tRect.top + tRect.height / 2) - (sRect.top + sRect.height / 2)

    // force reflow
    // eslint-disable-next-line no-unused-expressions
    ghost.offsetHeight

    ghost.style.transition = `transform ${duration}ms ${easing}, opacity ${duration}ms ${easing}`
    ghost.style.transform = `translate3d(${dx}px, ${dy}px, 0) scale(${shrink})`
    ghost.style.opacity = '0.2'

    const cleanup = () => {
        ghost.remove()
        const badge = document.querySelector(`${targetSelector} .fav-badge`)
        if (badge) {
            badge.classList.remove('pop')
            void badge.offsetWidth // restart animation
            badge.classList.add('pop')
            setTimeout(() => badge.classList.remove('pop'), 350)
        }
    }
    ghost.addEventListener('transitionend', cleanup, { once: true })
    setTimeout(() => ghost.isConnected && cleanup(), duration + 80)
}
/** ====================================================== */

export default function UserCard({ user }) {
    const add = useFavoritesStore((s) => s.add)
    const remove = useFavoritesStore((s) => s.remove)
    const isFav = useFavoritesStore((s) => s.isFav(user.id))

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
                        <button
                            type="button"
                            className="icon-btn"
                            onClick={() => {
                                if (isFav) {
                                    remove(user.id)
                                } else {
                                    add(user)
                                    // نحرك صورة الأفاتار كمصدر للطيران (شكل ألطف من الكارد كاملة)
                                    const src = cardRef.current?.querySelector('.avatar') || cardRef.current
                                    flyTo('#nav-favorites-anchor', src)
                                }
                            }}
                            aria-pressed={isFav}
                            aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
                            title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                        >
                            {isFav ? <FaStar size={18} /> : <FaRegStar size={18} />}
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
