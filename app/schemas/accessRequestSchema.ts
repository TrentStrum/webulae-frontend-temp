import { z } from 'zod'

export const accessRequestSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
  email: z.string().email('Invalid email address'),
  companyName: z.string().min(1, 'Company name is required').max(100, 'Company name too long'),
  jobTitle: z.string().min(1, 'Job title is required').max(100, 'Job title too long'),
  useCase: z.string().min(10, 'Please provide a detailed use case (minimum 10 characters)').max(1000, 'Use case too long'),
  teamSize: z.enum(['1-5', '6-25', '26-100', '100+'], {
    required_error: 'Please select your team size',
  }),
  industry: z.string().min(1, 'Industry is required').max(100, 'Industry too long'),
  expectedStartDate: z.string().min(1, 'Expected start date is required'),
  additionalInfo: z.string().max(500, 'Additional information too long').optional(),
})

export type AccessRequestSchema = z.infer<typeof accessRequestSchema>

// Schema for admin approval/rejection
export const accessRequestActionSchema = z.object({
  requestId: z.string().min(1, 'Request ID is required'),
  action: z.enum(['approve', 'reject'], {
    required_error: 'Action must be either approve or reject',
  }),
  notes: z.string().max(500, 'Notes too long').optional(),
})

export type AccessRequestActionSchema = z.infer<typeof accessRequestActionSchema> 