import { useClerk, useSignIn, useSignUp } from '@clerk/react'
import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router'


const SSOCallbackPage = () => {
    const clerk = useClerk()
    const { signIn } = useSignIn()
    const { signUp } = useSignUp()
    const navigate = useNavigate()
    const hasRun = useRef(false)

    const finalizeSignIn = async () => {
        await signIn.finalize({
            navigate: async ({ decorateUrl }) => {
                const url = decorateUrl('/main')
                navigate(url)
            }
        })
    }

    const finalizeSignUp = async () => {
        await signUp.finalize({
            navigate: async ({ decorateUrl }) => {
                const url = decorateUrl('/main')
                navigate(url)
            }
        })
    }

    useEffect(() => {
        (async () => {
            if (!clerk.loaded || hasRun.current) {
                return
            }

            hasRun.current = true

            if (signIn.status === 'complete') {
                await finalizeSignIn()
                return
            }

            if (signUp.isTransferable) {
                await signIn.create({ transfer: true })
                const signInStatus = signIn.status as typeof signIn.status | 'complete'
                if (signInStatus === 'complete') {
                    await finalizeSignIn()
                    return
                }

                navigate('/')
                return
            }

            if (signIn.isTransferable) {
                await signUp.create({ transfer: true })
                if (signUp.status === 'complete') {
                    await finalizeSignUp()
                    return
                }

                navigate('/')
                return
            }

            if (signUp.status === 'complete') {
                await finalizeSignUp()
                return
            }

        })()
    }, [signUp, clerk, signIn])

    return (
        <div>Processing your sign-in...</div>
    )
}

export default SSOCallbackPage