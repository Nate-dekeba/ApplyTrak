import { useState } from "react"
import { API_URL } from '../config.js'

export default function Signup({onSignup, onSwitchToLogin}) {

    const [username, setUsername] = useState('')
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const response = await fetch (`${API_URL}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username : username.trim(),
                    name: name.trim(),
                    email : email.trim(),
                    password : password
                })
            })
            const data = await response.json()

            if (!response.ok){
                throw new Error(data.error || 'signup failed')
            }
            onSignup(data.user)

        }catch(err){
            setError(err.message)
        }finally {
            setLoading (false)
        }
    }

    return (
        <div className="auth-container">
            <form onSubmit={handleSubmit} className="auth-form">
                <h2>Sign Up for ApplyTrack</h2>
                {error && <p className="error">Error: {error}</p>}
                <input type="text" placeholder="Username" value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                <input type="text" placeholder="Name" value={name} 
                    onChange= {(e) => setName (e.target.value)}
                    required
                />

                <input type="text" placeholder="Email"  value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input type="password" placeholder="Password" value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit" disabled={loading}>
                    {loading ? "Signing up..." : "Sign up"}
                </button>
                <p className="auth-switch">
                    Already have an account? {' '}
                    <button type="button" onClick={onSwitchToLogin} className="link-button"> 
                        Login
                    </button>
                </p>
            </form>
        </div>
    )
}
