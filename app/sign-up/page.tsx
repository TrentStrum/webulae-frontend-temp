'use client'

import { AccessRequestForm } from '@/app/components/forms/accessRequestForm'

export default function SignUpPage(): React.ReactElement {
  return (
    <div className="flex justify-center items-center min-h-screen p-4 bg-gray-50">
      <AccessRequestForm />
    </div>
  )
}
