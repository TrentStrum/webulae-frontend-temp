import type { AccessRequestDataAccessInterface } from '@/app/contracts/DataAccess';
import type { AccessRequest } from '@/app/types/accessRequest.types';

// Project
import { projectSupabaseDataAccess } from '@/app/dataAccess/project/supabase';

// PaymentMethod
import { paymentMethodSupabaseDataAccess } from '@/app/dataAccess/paymentMethod/supabase';

// Post
import { postSupabaseDataAccess } from '@/app/dataAccess/post/supabase';

// Access Request
import { accessRequestSupabaseDataAccess } from '@/app/dataAccess/accessRequest/supabase';

// Organization
import { organizationSupabaseDataAccess, organizationMemberSupabaseDataAccess, organizationInviteSupabaseDataAccess } from '@/app/dataAccess/organization/supabase';

// === Direct exports ===

export { projectSupabaseDataAccess as getProjectDataAccess };
export { paymentMethodSupabaseDataAccess as getPaymentMethodDataAccess };
export { postSupabaseDataAccess as getPostDataAccess };
export { accessRequestSupabaseDataAccess as getAccessRequestDataAccess };
export { organizationSupabaseDataAccess as getBusinessDataAccess };
export { organizationMemberSupabaseDataAccess as getBusinessMemberDataAccess };
export { organizationInviteSupabaseDataAccess as getBusinessInviteDataAccess };