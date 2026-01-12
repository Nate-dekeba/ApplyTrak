

export default function JobFormPopUp(props) {

    return (props.trigger) ? (
        <div className="popup">
            <div className="popup-inner">
                <button className="close-btn" onClick={props.onClose}>X</button>
                {props.children}
            </div>
        </div>
    ): "";



}