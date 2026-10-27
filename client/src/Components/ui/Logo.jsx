/**
 * Logo
 * Shared brand mark — solid primary tile with the "A" wordmark letter.
 * Replaces the gradient-tile markup previously duplicated across 8+ files.
 */
const SIZES = {
    sm: { box: 'w-8 h-8 rounded-control', text: 'text-[15px]' },
    md: { box: 'w-10 h-10 rounded-control', text: 'text-lg' },
    lg: { box: 'w-16 h-16 rounded-card', text: 'text-2xl' },
}

export default function Logo({ size = 'md', className = '' }) {
    const { box, text } = SIZES[size] || SIZES.md

    return (
        <div
            className={`${box} ${text} bg-primary-600 flex items-center justify-center text-white font-extrabold shrink-0 ${className}`}
            aria-hidden="true"
        >
            A
        </div>
    )
}
