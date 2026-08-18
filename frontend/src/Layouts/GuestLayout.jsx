import ApplicationLogo from '@/Components/ApplicationLogo'
import ThemeToggle from '@/Components/ThemeToggle'
import { Link } from 'react-router-dom'

export default function GuestLayout({ children }) {
    return (
        <div className="relative flex min-h-screen flex-col items-center bg-gray-100 pt-6 dark:bg-gray-900 sm:justify-center sm:pt-0">
            <div className="absolute right-4 top-4">
                <ThemeToggle />
            </div>
            <div>
                <Link to="/">
                    <ApplicationLogo className="h-20 w-20 fill-current text-gray-500 dark:text-gray-400" />
                </Link>
            </div>
            <div className="mt-6 w-full overflow-hidden bg-white px-6 py-4 shadow-md dark:bg-gray-800 sm:max-w-md sm:rounded-lg">
                {children}
            </div>
        </div>
    )
}
