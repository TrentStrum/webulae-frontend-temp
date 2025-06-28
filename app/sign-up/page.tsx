'use client'

import { AccessRequestForm } from '@/app/components/forms/accessRequestForm'
import { Card, CardContent } from '@/components/ui/card'

export default function SignUpPage(): React.ReactElement {
  return (
    <div className="flex justify-center items-center min-h-screen p-4 bg-gradient-to-br from-primary-100/30 via-background to-secondary-100/30 dark:from-primary-900/10 dark:via-background dark:to-secondary-900/10">
      <div className="w-full max-w-2xl">
        <Card className="border-border/50 shadow-lg">
          <CardContent className="pt-6">
            <AccessRequestForm />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}