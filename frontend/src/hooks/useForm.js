import { useState } from 'react'

export default function useForm(initialData) {
    const [data, setDataState] = useState(initialData)
    const [errors, setErrors] = useState({})
    const [processing, setProcessing] = useState(false)

    const setData = (key, value) => {
        setDataState(prev => ({ ...prev, [key]: value }))
    }

    const reset = (...keys) => {
        if (keys.length === 0) {
            setDataState(initialData)
        } else {
            setDataState(prev => {
                const next = { ...prev }
                keys.forEach(k => { next[k] = initialData[k] })
                return next
            })
        }
        setErrors({})
    }

    const submit = async (requestFn, { onSuccess, onError, onFinish } = {}) => {
        setProcessing(true)
        setErrors({})
        try {
            const response = await requestFn(data)
            onSuccess?.(response)
        } catch (err) {
            const validationErrors = err?.response?.data?.errors ?? {}
            setErrors(validationErrors)
            onError?.(err)
        } finally {
            setProcessing(false)
            onFinish?.()
        }
    }

    return { data, setData, errors, processing, reset, submit }
}
