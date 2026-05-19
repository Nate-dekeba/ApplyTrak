/**
 * CompanyAvatar
 * Renders a colored square avatar showing the first letter of the company name.
 * Color is deterministic — the same company always gets the same color,
 * derived by hashing the name string against a fixed palette.
 */

// Maps a company name to a consistent Tailwind bg color class
function getColorFromName(name) {
    const colors = [
        'bg-blue-600', 'bg-indigo-600', 'bg-purple-600', 'bg-pink-600',
        'bg-red-500',  'bg-orange-500', 'bg-amber-600', 'bg-emerald-600',
        'bg-teal-600', 'bg-cyan-600',   'bg-violet-600', 'bg-fuchsia-600',
    ]
    // Simple djb2-style hash to pick a color index
    let hash = 0
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash)
    }
    return colors[Math.abs(hash) % colors.length]
}

export default function CompanyAvatar({ company, size = 'md' }) {
    const bgColor = getColorFromName(company)

    const sizeClasses = {
        sm: 'w-[30px] h-[30px] text-[11px] rounded-lg',
        md: 'w-9 h-9 text-[14px] rounded-[10px]',
        lg: 'w-11 h-11 text-[16px] rounded-xl',
    }

    return (
        <div className={`${sizeClasses[size]} ${bgColor} flex items-center justify-center text-white font-bold shrink-0`}>
            {company.charAt(0).toUpperCase()}
        </div>
    )
}
