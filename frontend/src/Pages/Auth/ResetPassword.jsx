import InputError from '@/Components/InputError'
import InputLabel from '@/Components/InputLabel'
import PrimaryButton from '@/Components/PrimaryButton'
import TextInput from '@/Components/TextInput'
import GuestLayout from '@/Layouts/GuestLayout'
import api, { getCsrfCookie } from '@/lib/api'
import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

export default function ResetPassword() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const [data, setData] = useState({
        token: searchParams.get('token') ?? '',
        email: searchParams.get('email') ?? '',
        password: '',
        password_confirmation: '',
    })
    const [errors, setErrors] = useState({})
    const [processing, setProcessing] = useState(false)

    const setValue = (key, value) => setData(prev => ({ ...prev, [key]: value }))

    const submit = async (e) => {
        e.preventDefault()
        setProcessing(true)
        setErrors({})
        try {
            await getCsrfCookie()
            await api.post('/reset-password', data)
            navigate('/login?status=password-reset')
        } catch (err) {
            setErrors(err?.response?.data?.errors ?? {})
        } finally {
            setProcessing(false)
            setData(prev => ({ ...prev, password: '', password_confirmation: '' }))
        }
    }

    return (
        <GuestLayout>
            <form onSubmit={submit}>
                <div>
                    <InputLabel htmlFor="email" value="Email" />
                    <TextInput id="email" type="email" name="email" value={data.email} className="mt-1 block w-full" autoComplete="username" onChange={e => setValue('email', e.target.value)} />
                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="password" value="Password" />
                    <TextInput id="password" type="password" name="password" value={data.password} className="mt-1 block w-full" autoComplete="new-password" isFocused={true} onChange={e => setValue('password', e.target.value)} />
                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="password_confirmation" value="Confirm Password" />
                    <TextInput type="password" id="password_confirmation" name="password_confirmation" value={data.password_confirmation} className="mt-1 block w-full" autoComplete="new-password" onChange={e => setValue('password_confirmation', e.target.value)} />
                    <InputError message={errors.password_confirmation} className="mt-2" />
                </div>

                <div className="mt-4 flex items-center justify-end">
                    <PrimaryButton className="ms-4" disabled={processing}>Reset Password</PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    )
}
