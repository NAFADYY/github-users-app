import emptySVG from '../assets/empty.svg'
export default function EmptyState({ title = 'Nothing here', subtitle = 'Try changing filters or search.' }) {
    return (
        <div className="empty">
            <img className='emptySVG' src={emptySVG} alt="emptySVG" />
            <h3>{title}</h3>
            <p>{subtitle}</p>
        </div>
    )
}