/**
 * JobFormPopUp
 * Generic modal wrapper used for both Add and Update job forms.
 * Renders nothing when `trigger` is falsy, so it can be controlled
 * with a boolean or an object reference. Thin wrapper around the shared
 * Modal primitive — kept as its own component so callers don't need to
 * know about the trigger/open naming difference.
 */
import Modal from './ui/Modal.jsx'

export default function JobFormPopUp({ trigger, onClose, children }) {
    return (
        <Modal open={!!trigger} onClose={onClose}>
            {children}
        </Modal>
    )
}
