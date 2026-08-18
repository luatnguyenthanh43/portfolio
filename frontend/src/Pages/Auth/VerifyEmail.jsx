import PrimaryButton from '@/Components/PrimaryButton'
import GuestLayout from '@/Layouts/GuestLayout'
import { useAuth } from '@/contexts/AuthContext'
import api from '@/lib/api'
import { useState } from 'react'

export default function VerifyEmail() {
    const { logout } = useAuth()
    const [processing, setProcessing] = useState(false)
    const [status, setStatus] = useState(null)

    const submit = async (e) => {
        e.preventDefault()
        setProcessing(true)
        try {
            await api.post('/email/verification-notification')
            setStatus('verification-link-sent')
        } finally {
            setProcessing(false)
        }
    }

    return (
        <GuestLayout>
            <div className="mb-4 text-sm text-gray-600">
                Thanks for signing up! Before getting started, could you verify your email address by clicking on the link we just emailed to you?
            </div>

            {status === 'verification-link-sent' && (
                <div className="mb-4 text-sm font-medium text-green-600">
                    A new verification link has been sent to your email address.
                </div>
            )}

            <form onSubmit={submit}>
                <div className="mt-4 flex items-center justify-between">
                    <PrimaryButton disabled={processing}>Resend Verification Email</PrimaryButton>
                    <button type="button" onClick={logout} className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2">
                        Log Out
                    </button>
                </div>
            </form>
        </GuestLayout>
    )
}
