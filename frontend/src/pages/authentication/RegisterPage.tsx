import { useSignUp } from '@clerk/react'
import React, { useState } from 'react'
import { useNavigate } from 'react-router'
import SSOComponent from '../../components/authentication/SSOComponent'

const RegisterPage = () => {
    const { signUp } = useSignUp()
    const [email, setEmail] = useState<string>("")
    const [password, setPassword] = useState<string>("")
    const [verifyCode, setVerifyCode] = useState<string>("")
    const [toggleVerify, setToggleVerify] = useState<boolean>(false)
    const [error, setError] = useState<string>("")
    const navigate = useNavigate()

    const handleOTPChange = (value: string, index: number) => {
        const newCode = [...verifyCode];
        newCode[index] = value
        const stringOfCode = newCode.join("")
        setVerifyCode(stringOfCode)
    }

    const handleSubmit = async (e: React.ChangeEvent) => {
        e.preventDefault()

        try {
            const { error } = await signUp.password({
                emailAddress: email,
                password: password
            })

            if (error) {
                console.error(JSON.stringify(error, null, 2))
                return
            }

            if (!error) await signUp.verifications.sendEmailCode();

            if (
                signUp.status === 'missing_requirements' &&
                signUp.unverifiedFields.includes('email_address') &&
                signUp.missingFields.length === 0
            ) {
                setToggleVerify(true)
                return
            }
        } catch (err) {
            console.error(JSON.stringify(err, null, 2))
        }
    }

    const handleVerify = async (e: React.ChangeEvent) => {
        e.preventDefault()

        if (toggleVerify) {
            const { error } = await signUp.verifications.verifyEmailCode({ code: verifyCode })

            if (error) {
                console.error(JSON.stringify(error, null, 2))
                return
            }
        }

        if (signUp.status === 'complete') {
            await signUp.finalize()
            navigate('/main')
        } else {
            console.error('Sign-up attempt not complete. Status:', signUp.status)
        }
    }

    // if signedIn
    return (
        <div>
            REGISTER
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
            {
                toggleVerify && <form onSubmit={handleVerify}>
                    <label>
                        Code:
                        <input onChange={(e) => handleOTPChange(e.target.value, 0)} name='1' type="text" />
                        <input onChange={(e) => handleOTPChange(e.target.value, 1)} name='2' type="text" />
                        <input onChange={(e) => handleOTPChange(e.target.value, 2)} name='3' type="text" />
                        <input onChange={(e) => handleOTPChange(e.target.value, 3)} name='4' type="text" />
                        <input onChange={(e) => handleOTPChange(e.target.value, 4)} name='5' type="text" />
                        <input onChange={(e) => handleOTPChange(e.target.value, 5)} name='6' type="text" />
                    </label>

                    <button>Submit</button>
                </form>
            }
        </div >
    )
}

export default RegisterPage