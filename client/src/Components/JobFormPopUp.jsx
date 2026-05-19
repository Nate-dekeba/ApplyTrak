/**
 * JobFormPopUp
 * Generic modal wrapper used for both Add and Update job forms.
 * Renders nothing when `trigger` is falsy, so it can be controlled
 * with a boolean or an object reference.
 * Clicking the backdrop (outside the card) also closes the modal.
 */

export default function JobFormPopUp({ trigger, onClose, children }) {
    if (!trigger) return null

    return (
        <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-[2px] flex justify-center items-center z-[1000] p-5"
            // Close when clicking directly on the backdrop, not on the modal card
            onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
        >
            <div className="relative bg-white dark:bg-gray-900 p-8 rounded-2xl max-w-[560px] w-full max-h-[90vh] overflow-y-auto shadow-[0_20px_60px_rgba(0,0,0,0.2)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.5)] border border-transparent dark:border-gray-800 animate-slideIn">
                {/* Close button */}
                <button
                    className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-none cursor-pointer text-sm font-bold flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-500 transition-colors duration-150"
                    onClick={onClose}
                >
                    &#10005;
                </button>
                {children}
            </div>
        </div>
    )
}
