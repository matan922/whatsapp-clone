import { useState } from 'react'
import SSOComponent from '../../components/authentication/SSOComponent'
import { useSignIn } from '@clerk/react'
import { useNavigate } from 'react-router'

const LoginPage = () => {
    const { signIn } = useSignIn()
    const [email, setEmail] = useState<string>("")
    const [password, setPassword] = useState<string>("")
    const [error, setError] = useState<string>("")
    const navigate = useNavigate()

    const handleSubmit = async (e: React.ChangeEvent) => {
        e.preventDefault()

        try {
            const { error } = await signIn.password({
                emailAddress: email,
                password: password
            })

            if (error) {
                console.error(JSON.stringify(error, null, 2))
                return
            }

            if (signIn.status === 'complete') {
                await signIn.finalize({
                    navigate: ({ decorateUrl }) => {
                        const url = decorateUrl('/main')
                        navigate(url)
                    }
                })
            }

        } catch (err) {
            console.error(JSON.stringify(err, null, 2))
        }
    }

    return (

        <div>
            LOGIN
            <SSOComponent />
            <form onSubmit={handleSubmit}>
                <label>
                    Email: <input onChange={(e) => setEmail(e.target.value)} name='email' type="text" required />
                </label>
                <br />
                <label>
                    Password: <input onChange={(e) => setPassword(e.target.value)} name='password' type="password" required />
                </label>
                <br />
                <button type='submit'>Submit</button>
            </form>
        </div>
    )
}

export default LoginPage