import React from 'react'
import { useClerk } from '@clerk/react'

const SignOutComponent = () => {
    const { signOut } = useClerk()


    return (
        <div>
            <button onClick={() => signOut({ redirectUrl: '/' })}>Sign out</button>
        </div>
    )
}

export default SignOutComponent