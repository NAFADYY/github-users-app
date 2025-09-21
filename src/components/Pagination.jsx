
export default function Pagination({ page, pages, onChange }) {
    if (pages <= 1) return null
    const first = () => onChange(1)
    const prev = () => onChange(Math.max(1, page - 1))
    const next = () => onChange(Math.min(pages, page + 1))
    const last = () => onChange(pages)

    return (
        <div className="pagination" role="navigation" aria-label="Pagination">
            <button className="page-btn" onClick={first} disabled={page === 1} aria-label="First page">
                <span className="only-icon">⏮</span>
                <span className="label"> First</span>
            </button>
            <button className="page-btn" onClick={prev} disabled={page === 1} aria-label="Previous page">
                <span className="only-icon">◀</span>
                <span className="label"> Prev</span>
            </button>

            <span className="page-btn" aria-current="page">
                Page {page} / {pages}
            </span>

            <button className="page-btn" onClick={next} disabled={page === pages} aria-label="Next page">
                <span className="label">Next </span>
                <span className="only-icon">▶</span>
            </button>
            <button className="page-btn" onClick={last} disabled={page === pages} aria-label="Last page">
                <span className="label">Last </span>
                <span className="only-icon">⏭</span>
            </button>
        </div>
    )
}
