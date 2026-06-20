import { useSignUp } from '@clerk/react'
import type { OAuthStrategy } from '@clerk/react/types'

const SSOComponent = () => {
    const { signUp } = useSignUp()

    const handleSSO = async (strategy: OAuthStrategy) => {
        const { error } = await signUp.sso({
            strategy,
            redirectCallbackUrl: '/sso-callback',
            redirectUrl: '/main',

        })
        if (error) {
            console.error(JSON.stringify(error, null, 2))
            return
        }
    }

    return (
        <div>
            <button onClick={() => handleSSO('oauth_google')}>SIGN IN WITH GOOGLE</button>
        </div>
    )
}

export default SSOComponent