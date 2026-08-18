import InputError from '@/Components/InputError'
import PrimaryButton from '@/Components/PrimaryButton'
import TextInput from '@/Components/TextInput'
import GuestLayout from '@/Layouts/GuestLayout'
import api, { getCsrfCookie } from '@/lib/api'
import { useState } from 'react'

export default function ForgotPassword() {
    const [email, setEmail] = useState('')
    const [errors, setErrors] = useState({})
    const [processing, setProcessing] = useState(false)
    const [status, setStatus] = useState(null)

    const submit = async (e) => {
        e.preventDefault()
        setProcessing(true)
        setErrors({})
        try {
            await getCsrfCookie()
            const { data } = await api.post('/forgot-password', { email })
            setStatus(data.message)
        } catch (err) {
            setErrors(err?.response?.data?.errors ?? {})
        } finally {
            setProcessing(false)
        }
    }

    return (
        <GuestLayout>
            <div className="mb-4 text-sm text-gray-600">
                Forgot your password? No problem. Just let us know your email address and we will email you a password reset link.
            </div>

            {status && <div className="mb-4 text-sm font-medium text-green-600">{status}</div>}

            <form onSubmit={submit}>
                <TextInput id="email" type="email" name="email" value={email} className="mt-1 block w-full" isFocused={true} onChange={e => setEmail(e.target.value)} />
                <InputError message={errors.email} className="mt-2" />
                <div className="mt-4 flex items-center justify-end">
                    <PrimaryButton className="ms-4" disabled={processing}>Email Password Reset Link</PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    )
}
