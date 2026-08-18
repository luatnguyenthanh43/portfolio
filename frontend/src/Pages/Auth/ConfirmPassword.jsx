import InputError from '@/Components/InputError'
import InputLabel from '@/Components/InputLabel'
import PrimaryButton from '@/Components/PrimaryButton'
import TextInput from '@/Components/TextInput'
import GuestLayout from '@/Layouts/GuestLayout'
import api from '@/lib/api'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function ConfirmPassword() {
    const navigate = useNavigate()
    const [password, setPassword] = useState('')
    const [errors, setErrors] = useState({})
    const [processing, setProcessing] = useState(false)

    const submit = async (e) => {
        e.preventDefault()
        setProcessing(true)
        setErrors({})
        try {
            await api.post('/confirm-password', { password })
            navigate(-1)
        } catch (err) {
            setErrors(err?.response?.data?.errors ?? {})
        } finally {
            setProcessing(false)
            setPassword('')
        }
    }

    return (
        <GuestLayout>
            <div className="mb-4 text-sm text-gray-600">
                This is a secure area of the application. Please confirm your password before continuing.
            </div>

            <form onSubmit={submit}>
                <div className="mt-4">
                    <InputLabel htmlFor="password" value="Password" />
                    <TextInput id="password" type="password" name="password" value={password} className="mt-1 block w-full" isFocused={true} onChange={e => setPassword(e.target.value)} />
                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="mt-4 flex items-center justify-end">
                    <PrimaryButton className="ms-4" disabled={processing}>Confirm</PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    )
}
