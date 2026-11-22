import InputError from '@/Components/InputError'
import InputLabel from '@/Components/InputLabel'
import PrimaryButton from '@/Components/PrimaryButton'
import TextInput from '@/Components/TextInput'
import { useAuth } from '@/hooks/useAuth'
import api from '@/lib/api'
import { Transition } from '@headlessui/react'
import { useState } from 'react'

export default function UpdateProfileInformation({ className = '' }) {
    const { user, setUser } = useAuth()
    const [data, setData] = useState({ name: user?.name ?? '', email: user?.email ?? '' })
    const [errors, setErrors] = useState({})
    const [processing, setProcessing] = useState(false)
    const [recentlySuccessful, setRecentlySuccessful] = useState(false)

    const setValue = (key, value) => setData(prev => ({ ...prev, [key]: value }))

    const submit = async (e) => {
        e.preventDefault()
        setProcessing(true)
        setErrors({})
        try {
            const { data: res } = await api.patch('/profile', data)
            setUser(res.user)
            setRecentlySuccessful(true)
            setTimeout(() => setRecentlySuccessful(false), 2000)
        } catch (err) {
            setErrors(err?.response?.data?.errors ?? {})
        } finally {
            setProcessing(false)
        }
    }

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Profile Information</h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Update your account's profile information and email address.</p>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-6">
                <div>
                    <InputLabel htmlFor="name" value="Name" />
                    <TextInput id="name" className="mt-1 block w-full" value={data.name} onChange={e => setValue('name', e.target.value)} required isFocused autoComplete="name" />
                    <InputError className="mt-2" message={errors.name} />
                </div>

                <div>
                    <InputLabel htmlFor="email" value="Email" />
                    <TextInput id="email" type="email" className="mt-1 block w-full" value={data.email} onChange={e => setValue('email', e.target.value)} required autoComplete="username" />
                    <InputError className="mt-2" message={errors.email} />
                </div>

                <div className="flex items-center gap-4">
                    <PrimaryButton disabled={processing}>Save</PrimaryButton>
                    <Transition show={recentlySuccessful} enter="transition ease-in-out" enterFrom="opacity-0" leave="transition ease-in-out" leaveTo="opacity-0">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Saved.</p>
                    </Transition>
                </div>
            </form>
        </section>
    )
}
