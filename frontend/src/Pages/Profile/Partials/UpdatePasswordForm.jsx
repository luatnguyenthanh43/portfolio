import InputError from '@/Components/InputError'
import InputLabel from '@/Components/InputLabel'
import PrimaryButton from '@/Components/PrimaryButton'
import TextInput from '@/Components/TextInput'
import api from '@/lib/api'
import { Transition } from '@headlessui/react'
import { useRef, useState } from 'react'

export default function UpdatePasswordForm({ className = '' }) {
    const passwordInput = useRef()
    const currentPasswordInput = useRef()
    const initial = { current_password: '', password: '', password_confirmation: '' }
    const [data, setData] = useState(initial)
    const [errors, setErrors] = useState({})
    const [processing, setProcessing] = useState(false)
    const [recentlySuccessful, setRecentlySuccessful] = useState(false)

    const setValue = (key, value) => setData(prev => ({ ...prev, [key]: value }))

    const submit = async (e) => {
        e.preventDefault()
        setProcessing(true)
        setErrors({})
        try {
            await api.put('/password', data)
            setData(initial)
            setRecentlySuccessful(true)
            setTimeout(() => setRecentlySuccessful(false), 2000)
        } catch (err) {
            const errs = err?.response?.data?.errors ?? {}
            setErrors(errs)
            if (errs.password) {
                setData(prev => ({ ...prev, password: '', password_confirmation: '' }))
                passwordInput.current?.focus()
            }
            if (errs.current_password) {
                setData(prev => ({ ...prev, current_password: '' }))
                currentPasswordInput.current?.focus()
            }
        } finally {
            setProcessing(false)
        }
    }

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Update Password</h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Ensure your account is using a long, random password to stay secure.</p>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-6">
                <div>
                    <InputLabel htmlFor="current_password" value="Current Password" />
                    <TextInput id="current_password" ref={currentPasswordInput} value={data.current_password} onChange={e => setValue('current_password', e.target.value)} type="password" className="mt-1 block w-full" autoComplete="current-password" />
                    <InputError message={errors.current_password} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="password" value="New Password" />
                    <TextInput id="password" ref={passwordInput} value={data.password} onChange={e => setValue('password', e.target.value)} type="password" className="mt-1 block w-full" autoComplete="new-password" />
                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="password_confirmation" value="Confirm Password" />
                    <TextInput id="password_confirmation" value={data.password_confirmation} onChange={e => setValue('password_confirmation', e.target.value)} type="password" className="mt-1 block w-full" autoComplete="new-password" />
                    <InputError message={errors.password_confirmation} className="mt-2" />
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
