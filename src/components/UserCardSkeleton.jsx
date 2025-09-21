
export default function UserCardSkeleton() {
    return (
        <article className="card usercard animate-pulse">
            {/* left side avatar */}
            <div className="ucard-left">
                <div className="avatar bg-gray-300 rounded-full w-[64px] h-[64px]" />
            </div>

            {/* body */}
            <div className="ucard-body flex-1">
                <div className="ucard-header flex justify-between items-start">
                    <div className="title-wrap space-y-2">
                        <div className="h-4 w-24 bg-gray-300 rounded"></div>
                        <div className="h-3 w-16 bg-gray-200 rounded"></div>
                    </div>

                    <div className="ucard-actions flex gap-2">
                        <div className="icon-btn w-6 h-6 bg-gray-300 rounded"></div>
                        <div className="icon-btn w-6 h-6 bg-gray-300 rounded"></div>
                    </div>
                </div>
            </div>

            {/* meta */}
            <ul className="ucard-meta grid grid-cols-3 gap-2 mt-4">
                <li className="flex flex-col items-center">
                    <span className="h-3 w-10 bg-gray-200 rounded mb-1"></span>
                    <span className="h-4 w-12 bg-gray-300 rounded"></span>
                </li>
                <li className="flex flex-col items-center">
                    <span className="h-3 w-14 bg-gray-200 rounded mb-1"></span>
                    <span className="h-4 w-12 bg-gray-300 rounded"></span>
                </li>
                <li className="flex flex-col items-center">
                    <span className="h-3 w-12 bg-gray-200 rounded mb-1"></span>
                    <span className="h-4 w-12 bg-gray-300 rounded"></span>
                </li>
            </ul>
        </article>
    )
}
