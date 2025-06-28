export type Database = {
	public: {
		Tables: {
			user_profiles: {
				Row: {
					id: string;
					name: string;
					email: string;
					organizationName: string;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					name: string;
					email: string;
					organizationName: string;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					name?: string;
					email?: string;
					organizationName?: string;
					created_at?: string;
					updated_at?: string;
				};
			};
			projects: {
				Row: {
					id: string;
					user_id: string;
					organization_id: string | null;
					title: string;
					description: string | null;
					status: string;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					user_id: string;
					organization_id?: string | null;
					title: string;
					description?: string | null;
					status?: string;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					user_id?: string;
					organization_id?: string | null;
					title?: string;
					description?: string | null;
					status?: string;
					created_at?: string;
					updated_at?: string;
				};
			};
			project_requests: {
				Row: {
					id: string;
					user_id: string;
					title: string;
					description: string | null;
					status: string;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					user_id: string;
					title: string;
					description?: string | null;
					status?: string;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					user_id?: string;
					title?: string;
					description?: string | null;
					status?: string;
					created_at?: string;
					updated_at?: string;
				};
			};
			access_requests: {
				Row: {
					id: string;
					email: string;
					name: string;
					organization: string | null;
					reason: string | null;
					status: string;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					email: string;
					name: string;
					organization?: string | null;
					reason?: string | null;
					status?: string;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					email?: string;
					name?: string;
					organization?: string | null;
					reason?: string | null;
					status?: string;
					created_at?: string;
					updated_at?: string;
				};
			};
			posts: {
				Row: {
					id: string;
					slug: string;
					title: string;
					content: string;
					tags: string[] | null;
					is_premium: boolean;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					slug: string;
					title: string;
					content: string;
					tags?: string[] | null;
					is_premium?: boolean;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					slug?: string;
					title?: string;
					content?: string;
					tags?: string[] | null;
					is_premium?: boolean;
					created_at?: string;
					updated_at?: string;
				};
			};
			payment_methods: {
				Row: {
					id: string;
					user_id: string;
					stripe_payment_method_id: string;
					card_brand: string | null;
					card_last4: string | null;
					card_exp_month: number | null;
					card_exp_year: number | null;
					is_default: boolean;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					user_id: string;
					stripe_payment_method_id: string;
					card_brand?: string | null;
					card_last4?: string | null;
					card_exp_month?: number | null;
					card_exp_year?: number | null;
					is_default?: boolean;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					user_id?: string;
					stripe_payment_method_id?: string;
					card_brand?: string | null;
					card_last4?: string | null;
					card_exp_month?: number | null;
					card_exp_year?: number | null;
					is_default?: boolean;
					created_at?: string;
					updated_at?: string;
				};
			};
			documents: {
				Row: {
					id: string;
					user_id: string;
					organization_id: string | null;
					title: string;
					content: string | null;
					document_type: string | null;
					file_path: string | null;
					file_size: number | null;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					user_id: string;
					organization_id?: string | null;
					title: string;
					content?: string | null;
					document_type?: string | null;
					file_path?: string | null;
					file_size?: number | null;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					user_id?: string;
					organization_id?: string | null;
					title?: string;
					content?: string | null;
					document_type?: string | null;
					file_path?: string | null;
					file_size?: number | null;
					created_at?: string;
					updated_at?: string;
				};
			};
			company_knowledge: {
				Row: {
					id: string;
					category: string;
					title: string;
					content: string;
					service_name: string | null;
					service_description: string | null;
					pricing_info: string | null;
					use_cases: string | null;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					category: string;
					title: string;
					content: string;
					service_name?: string | null;
					service_description?: string | null;
					pricing_info?: string | null;
					use_cases?: string | null;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					category?: string;
					title?: string;
					content?: string;
					service_name?: string | null;
					service_description?: string | null;
					pricing_info?: string | null;
					use_cases?: string | null;
					created_at?: string;
					updated_at?: string;
				};
			};
			organization_knowledge: {
				Row: {
					id: string;
					organization_id: string;
					category: string;
					title: string;
					content: string;
					service_name: string | null;
					service_description: string | null;
					pricing_info: string | null;
					use_cases: string | null;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					organization_id: string;
					category: string;
					title: string;
					content: string;
					service_name?: string | null;
					service_description?: string | null;
					pricing_info?: string | null;
					use_cases?: string | null;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					organization_id?: string;
					category?: string;
					title?: string;
					content?: string;
					service_name?: string | null;
					service_description?: string | null;
					pricing_info?: string | null;
					use_cases?: string | null;
					created_at?: string;
					updated_at?: string;
				};
			};
			organization_chatbot_settings: {
				Row: {
					organization_id: string;
					bot_name: string;
					bot_personality: string | null;
					allowed_services: string | null;
					upselling_enabled: boolean;
					company_knowledge_enabled: boolean;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					organization_id: string;
					bot_name: string;
					bot_personality?: string | null;
					allowed_services?: string | null;
					upselling_enabled?: boolean;
					company_knowledge_enabled?: boolean;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					organization_id?: string;
					bot_name?: string;
					bot_personality?: string | null;
					allowed_services?: string | null;
					upselling_enabled?: boolean;
					company_knowledge_enabled?: boolean;
					created_at?: string;
					updated_at?: string;
				};
			};
			chatbot_settings: {
				Row: {
					organization_id: string;
					bot_name: string;
					bot_personality: string | null;
					allowed_services: string[];
					upselling_enabled: boolean;
					company_knowledge_enabled: boolean;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					organization_id: string;
					bot_name?: string;
					bot_personality?: string | null;
					allowed_services?: string[];
					upselling_enabled?: boolean;
					company_knowledge_enabled?: boolean;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					organization_id?: string;
					bot_name?: string;
					bot_personality?: string | null;
					allowed_services?: string[];
					upselling_enabled?: boolean;
					company_knowledge_enabled?: boolean;
					created_at?: string;
					updated_at?: string;
				};
			};
		};
		Views: {
			[_ in never]: never;
		};
		Functions: {
			[_ in never]: never;
		};
		Enums: {
			[_ in never]: never;
		};
	};
};
