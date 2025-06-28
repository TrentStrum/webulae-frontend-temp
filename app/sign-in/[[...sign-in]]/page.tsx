'use client'

import { LoginForm } from '@/app/components/forms/loginForm'

export default function SignInPage(): React.ReactElement {
  return (
    <div className="flex justify-center items-center min-h-screen p-4">
      <LoginForm />
    </div>
  )
}
