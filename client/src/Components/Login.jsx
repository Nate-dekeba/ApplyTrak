import { useState } from "react"; 


export default function Login({onLogin, onSwitchToSignUp}) {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)


    const handleSubmit = async (e) => { 
        e.preventDefault()
        setLoading(true)
        setError(null) 

        try {
            const response = await fetch('http://localhost:3000/api/auth/login',{
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({username, password})
            })
            const data = await response.json()
            if (!response.ok){
                throw new Error(data.error || 'Login failed')
            }
            onLogin (data.user)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-container">
            <form onSubmit={handleSubmit} className="auth-form">
                <h2>Login to ApplyTrack</h2>

                {error && <p className="error">Error: {error}</p>}

                <input type="text" placeholder="Username" value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                <input type="password" placeholder = "Password" value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit" disabled={loading}>
                    {loading ? "Logging in..." : "Login"}
                </button>
                <p className="auth-switch">
                    No account? {''}
                    <button type= "button" onClick={onSwitchToSignUp} className="link-button">
                        Sign Up
                    </button>
                </p>
            </form>
        </div>
    )
}
