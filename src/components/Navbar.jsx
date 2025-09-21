import { FaGithub, FaHome } from 'react-icons/fa'
import { NavLink } from 'react-router-dom'
import { useFavoritesStore } from '../store/useFavoritesStore'
import { CgDarkMode } from 'react-icons/cg'

export default function Navbar() {
    // عدّاد المفضلة
    const favCount = useFavoritesStore((s) => s.favorites?.length ?? 0)

    function toggleTheme() {
        const current =
            document.documentElement.getAttribute('data-theme') ||
            localStorage.getItem('theme') ||
            'light'
        const next = current === 'light' ? 'dark' : 'light'
        document.documentElement.setAttribute('data-theme', next)
        localStorage.setItem('theme', next)
    }

    if (!document.documentElement.getAttribute('data-theme')) {
        document.documentElement.setAttribute(
            'data-theme',
            localStorage.getItem('theme') || 'light'
        )
    }

    return (
        <nav className="navbar">
            <div className="navbar-inner">
                <div className="brand">
                    <span><FaGithub size={30} /></span>
                    <span className='SiteName'>GitHub Users</span>
                </div>
                <div className="navlinks">
                    <NavLink
                        to="/"
                        className={({ isActive }) =>
                            `link flex items-center gap-2 ${isActive ? 'active' : ''}`
                        }
                    >
                        <FaHome size={18} />
                        <span>Home</span>
                    </NavLink>

                    {/* الهدف الذي سنطير له */}
                    <NavLink
                        to="/favorites"
                        className={({ isActive }) =>
                            `link flex items-center gap-2 ${isActive ? 'active' : ''} fav-link`
                        }
                        id="nav-favorites-anchor"
                        data-fav-anchor="true"
                    >
                        <span>Favorites</span>
                        <span className="fav-badge" aria-label={`${favCount} in favorites`}>
                            {favCount}
                        </span>
                    </NavLink>

                    <button
                        className="link flex items-center justify-center"
                        onClick={toggleTheme}
                        aria-label="Toggle dark mode"
                        title="Toggle theme"
                    >
                        <CgDarkMode size={18} />
                    </button>
                </div>
            </div>
        </nav>
    )
}
