'use client'

import { LoginForm } from '@/app/components/forms/loginForm'
import { Card, CardContent } from '@/components/ui/card'

export default function SignInPage(): React.ReactElement {
  return (
    <div className="flex justify-center items-center min-h-screen p-4 bg-gradient-to-br from-primary-100/30 via-background to-secondary-100/30 dark:from-primary-900/10 dark:via-background dark:to-secondary-900/10">
      <div className="w-full max-w-md">
        <Card className="border-border/50 shadow-lg">
          <CardContent className="pt-6">
            <LoginForm />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}