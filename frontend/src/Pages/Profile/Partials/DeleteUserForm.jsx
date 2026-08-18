import DangerButton from '@/Components/DangerButton'
import InputError from '@/Components/InputError'
import InputLabel from '@/Components/InputLabel'
import Modal from '@/Components/Modal'
import SecondaryButton from '@/Components/SecondaryButton'
import TextInput from '@/Components/TextInput'
import { useAuth } from '@/contexts/AuthContext'
import api from '@/lib/api'
import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function DeleteUserForm({ className = '' }) {
    const { logout } = useAuth()
    const navigate = useNavigate()
    const [confirming, setConfirming] = useState(false)
    const [password, setPassword] = useState('')
    const [errors, setErrors] = useState({})
    const [processing, setProcessing] = useState(false)
    const passwordInput = useRef()

    const deleteUser = async (e) => {
        e.preventDefault()
        setProcessing(true)
        setErrors({})
        try {
            await api.delete('/profile', { data: { password } })
            await logout()
            navigate('/')
        } catch (err) {
            setErrors(err?.response?.data?.errors ?? {})
            passwordInput.current?.focus()
        } finally {
            setProcessing(false)
        }
    }

    const closeModal = () => {
        setConfirming(false)
        setPassword('')
        setErrors({})
    }

    return (
        <section className={`space-y-6 ${className}`}>
            <header>
                <h2 className="text-lg font-medium text-gray-900">Delete Account</h2>
                <p className="mt-1 text-sm text-gray-600">Once your account is deleted, all of its resources and data will be permanently deleted.</p>
            </header>

            <DangerButton onClick={() => setConfirming(true)}>Delete Account</DangerButton>

            <Modal show={confirming} onClose={closeModal}>
                <form onSubmit={deleteUser} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900">Are you sure you want to delete your account?</h2>
                    <p className="mt-1 text-sm text-gray-600">Please enter your password to confirm.</p>

                    <div className="mt-6">
                        <InputLabel htmlFor="password" value="Password" className="sr-only" />
                        <TextInput id="password" type="password" name="password" ref={passwordInput} value={password} onChange={e => setPassword(e.target.value)} className="mt-1 block w-3/4" isFocused placeholder="Password" />
                        <InputError message={errors.password} className="mt-2" />
                    </div>

                    <div className="mt-6 flex justify-end">
                        <SecondaryButton onClick={closeModal}>Cancel</SecondaryButton>
                        <DangerButton className="ms-3" disabled={processing}>Delete Account</DangerButton>
                    </div>
                </form>
            </Modal>
        </section>
    )
}
