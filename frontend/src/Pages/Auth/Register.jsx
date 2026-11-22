import InputError from '@/Components/InputError'
import InputLabel from '@/Components/InputLabel'
import PrimaryButton from '@/Components/PrimaryButton'
import TextInput from '@/Components/TextInput'
import GuestLayout from '@/Layouts/GuestLayout'
import { useAuth } from '@/hooks/useAuth'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function Register() {
    const { register } = useAuth()
    const navigate = useNavigate()
    const [data, setData] = useState({ name: '', email: '', password: '', password_confirmation: '' })
    const [errors, setErrors] = useState({})
    const [processing, setProcessing] = useState(false)

    const setValue = (key, value) => setData(prev => ({ ...prev, [key]: value }))

    const submit = async (e) => {
        e.preventDefault()
        setProcessing(true)
        setErrors({})
        try {
            await register(data)
            navigate('/dashboard')
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
                    <InputLabel htmlFor="name" value="Name" />
                    <TextInput id="name" name="name" value={data.name} className="mt-1 block w-full" autoComplete="name" isFocused={true} onChange={e => setValue('name', e.target.value)} required />
                    <InputError message={errors.name} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="email" value="Email" />
                    <TextInput id="email" type="email" name="email" value={data.email} className="mt-1 block w-full" autoComplete="username" onChange={e => setValue('email', e.target.value)} required />
                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="password" value="Password" />
                    <TextInput id="password" type="password" name="password" value={data.password} className="mt-1 block w-full" autoComplete="new-password" onChange={e => setValue('password', e.target.value)} required />
                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="password_confirmation" value="Confirm Password" />
                    <TextInput id="password_confirmation" type="password" name="password_confirmation" value={data.password_confirmation} className="mt-1 block w-full" autoComplete="new-password" onChange={e => setValue('password_confirmation', e.target.value)} required />
                    <InputError message={errors.password_confirmation} className="mt-2" />
                </div>

                <div className="mt-4 flex items-center justify-end">
                    <Link to="/login" className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2">
                        Already registered?
                    </Link>
                    <PrimaryButton className="ms-4" disabled={processing}>Register</PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    )
}
