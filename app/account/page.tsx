'use client';

import { useOrganization } from '@clerk/nextjs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Building2, Users, Calendar, Mail, User, Settings, CreditCard, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { RevealOnScroll } from '@/components/ui/reveal-on-scroll';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AccountPage(): React.ReactElement {
	const { organization } = useOrganization();

	// Animation variants
	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.1,
				delayChildren: 0.2
			}
		}
	};

	const itemVariants = {
		hidden: { opacity: 0, y: 20 },
		visible: {
			opacity: 1,
			y: 0,
			transition: {
				duration: 0.5,
				ease: [0.22, 1, 0.36, 1]
			}
		}
	};

	return (
		<motion.main 
			className="max-w-5xl mx-auto py-12 px-4 space-y-8"
			initial="hidden"
			animate="visible"
			variants={containerVariants}
		>
			<motion.div variants={itemVariants}>
				<h1 className="text-3xl font-bold">Account Settings</h1>
				<p className="text-muted-foreground mt-2">
					Manage your personal information and preferences
				</p>
			</motion.div>

			<Tabs defaultValue="profile" className="space-y-6">
				<TabsList className="grid grid-cols-3 w-full max-w-md">
					<TabsTrigger value="profile" className="flex items-center gap-2">
						<User className="h-4 w-4" />
						Profile
					</TabsTrigger>
					<TabsTrigger value="organization" className="flex items-center gap-2">
						<Building2 className="h-4 w-4" />
						Organization
					</TabsTrigger>
					<TabsTrigger value="billing" className="flex items-center gap-2">
						<CreditCard className="h-4 w-4" />
						Billing
					</TabsTrigger>
				</TabsList>

				<TabsContent value="profile" className="space-y-6">
					<RevealOnScroll>
						<Card className="border-border/50 hover:border-primary/30 transition-all duration-300">
							<CardHeader className="flex flex-row items-center gap-4 pb-4">
								<Avatar className="h-16 w-16 border-2 border-primary/20" animated>
									<AvatarImage src="https://assets.aceternity.com/manu.png" alt="Avatar" />
									<AvatarFallback className="text-lg">US</AvatarFallback>
								</Avatar>
								<div>
									<CardTitle className="text-xl">User Profile</CardTitle>
									<CardDescription>
										Your personal information and settings
									</CardDescription>
								</div>
							</CardHeader>
							<CardContent className="space-y-6">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									<div className="space-y-4">
										<div className="space-y-2">
											<label className="text-sm font-medium">Full Name</label>
											<div className="flex items-center gap-2 p-2 border rounded-md bg-muted/30">
												<User className="h-4 w-4 text-muted-foreground" />
												<span>John Doe</span>
											</div>
										</div>
										
										<div className="space-y-2">
											<label className="text-sm font-medium">Email Address</label>
											<div className="flex items-center gap-2 p-2 border rounded-md bg-muted/30">
												<Mail className="h-4 w-4 text-muted-foreground" />
												<span>john.doe@example.com</span>
											</div>
										</div>
									</div>
									
									<div className="space-y-4">
										<div className="space-y-2">
											<label className="text-sm font-medium">Member Since</label>
											<div className="flex items-center gap-2 p-2 border rounded-md bg-muted/30">
												<Calendar className="h-4 w-4 text-muted-foreground" />
												<span>January 15, 2023</span>
											</div>
										</div>
										
										<div className="space-y-2">
											<label className="text-sm font-medium">Role</label>
											<div className="flex items-center gap-2 p-2 border rounded-md bg-muted/30">
												<Shield className="h-4 w-4 text-muted-foreground" />
												<span>Organization Member</span>
											</div>
										</div>
									</div>
								</div>
								
								<div className="pt-4 border-t">
									<Button className="gap-2">
										<Settings className="h-4 w-4" />
										Edit Profile
									</Button>
								</div>
							</CardContent>
						</Card>
					</RevealOnScroll>
					
					<RevealOnScroll delay={0.2}>
						<Card className="border-border/50 hover:border-primary/30 transition-all duration-300">
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Settings className="h-5 w-5 text-primary" />
									Account Preferences
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="flex items-center justify-between">
									<div>
										<p className="font-medium">Email Notifications</p>
										<p className="text-sm text-muted-foreground">
											Receive email updates about your account
										</p>
									</div>
									<div className="flex h-6 items-center">
										<input
											id="email-notifications"
											type="checkbox"
											className="rounded border-gray-300"
											defaultChecked
										/>
									</div>
								</div>
								
								<div className="flex items-center justify-between">
									<div>
										<p className="font-medium">Two-Factor Authentication</p>
										<p className="text-sm text-muted-foreground">
											Add an extra layer of security to your account
										</p>
									</div>
									<div className="flex h-6 items-center">
										<input
											id="two-factor"
											type="checkbox"
											className="rounded border-gray-300"
										/>
									</div>
								</div>
								
								<div className="flex items-center justify-between">
									<div>
										<p className="font-medium">Dark Mode</p>
										<p className="text-sm text-muted-foreground">
											Toggle between light and dark mode
										</p>
									</div>
									<div className="flex h-6 items-center">
										<input
											id="dark-mode"
											type="checkbox"
											className="rounded border-gray-300"
										/>
									</div>
								</div>
							</CardContent>
						</Card>
					</RevealOnScroll>
				</TabsContent>

				<TabsContent value="organization" className="space-y-6">
					<RevealOnScroll>
						<Card className="border-border/50 hover:border-primary/30 transition-all duration-300">
							<CardHeader>
								<div className="flex items-center gap-4">
									{organization?.imageUrl ? (
										<Avatar className="h-16 w-16 border-2 border-primary/20" animated>
											<AvatarImage src={organization.imageUrl} alt={organization.name} />
											<AvatarFallback className="text-lg">
												{organization.name.charAt(0).toUpperCase()}
											</AvatarFallback>
										</Avatar>
									) : (
										<div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center">
											<Building2 className="h-8 w-8 text-primary" />
										</div>
									)}
									<div>
										<CardTitle className="text-xl">{organization?.name || 'Your Organization'}</CardTitle>
										<CardDescription>
											Organization details and membership
										</CardDescription>
									</div>
								</div>
							</CardHeader>
							<CardContent className="space-y-6">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									<div className="space-y-4">
										<div className="space-y-2">
											<label className="text-sm font-medium">Organization ID</label>
											<div className="flex items-center gap-2 p-2 border rounded-md bg-muted/30">
												<Building2 className="h-4 w-4 text-muted-foreground" />
												<span className="text-sm font-mono">{organization?.id || 'org_123456789'}</span>
											</div>
										</div>
										
										<div className="space-y-2">
											<label className="text-sm font-medium">Your Role</label>
											<div className="flex items-center gap-2">
												<Badge variant="secondary">
													{organization?.membership?.role.replace('org:', '') || 'Member'}
												</Badge>
											</div>
										</div>
									</div>
									
									<div className="space-y-4">
										<div className="space-y-2">
											<label className="text-sm font-medium">Members</label>
											<div className="flex items-center gap-2 p-2 border rounded-md bg-muted/30">
												<Users className="h-4 w-4 text-muted-foreground" />
												<span>{organization?.membersCount || '5'} members</span>
											</div>
										</div>
										
										<div className="space-y-2">
											<label className="text-sm font-medium">Created</label>
											<div className="flex items-center gap-2 p-2 border rounded-md bg-muted/30">
												<Calendar className="h-4 w-4 text-muted-foreground" />
												<span>{new Date(organization?.createdAt || Date.now()).toLocaleDateString()}</span>
											</div>
										</div>
									</div>
								</div>
								
								<div className="pt-4 border-t">
									<Button className="gap-2">
										<Building2 className="h-4 w-4" />
										Manage Organization
									</Button>
								</div>
							</CardContent>
						</Card>
					</RevealOnScroll>
					
					<RevealOnScroll delay={0.2}>
						<Card className="border-border/50 hover:border-primary/30 transition-all duration-300">
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Users className="h-5 w-5 text-primary" />
									Organization Members
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									<div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
										<div className="flex items-center gap-3">
											<Avatar className="h-8 w-8">
												<AvatarFallback>JD</AvatarFallback>
											</Avatar>
											<div>
												<p className="font-medium">John Doe</p>
												<p className="text-sm text-muted-foreground">john.doe@example.com</p>
											</div>
										</div>
										<Badge>Admin</Badge>
									</div>
									
									<div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
										<div className="flex items-center gap-3">
											<Avatar className="h-8 w-8">
												<AvatarFallback>JS</AvatarFallback>
											</Avatar>
											<div>
												<p className="font-medium">Jane Smith</p>
												<p className="text-sm text-muted-foreground">jane.smith@example.com</p>
											</div>
										</div>
										<Badge variant="secondary">Member</Badge>
									</div>
									
									<div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
										<div className="flex items-center gap-3">
											<Avatar className="h-8 w-8">
												<AvatarFallback>RJ</AvatarFallback>
											</Avatar>
											<div>
												<p className="font-medium">Robert Johnson</p>
												<p className="text-sm text-muted-foreground">robert.johnson@example.com</p>
											</div>
										</div>
										<Badge variant="secondary">Member</Badge>
									</div>
								</div>
							</CardContent>
						</Card>
					</RevealOnScroll>
				</TabsContent>

				<TabsContent value="billing" className="space-y-6">
					<RevealOnScroll>
						<Card className="border-border/50 hover:border-primary/30 transition-all duration-300">
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<CreditCard className="h-5 w-5 text-primary" />
									Subscription Plan
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-6">
								<div className="flex items-center justify-between p-4 bg-primary/5 border border-primary/20 rounded-lg">
									<div>
										<h3 className="font-semibold text-lg">Pro Plan</h3>
										<p className="text-muted-foreground">$29/month, billed monthly</p>
									</div>
									<Badge className="bg-primary/80">Current Plan</Badge>
								</div>
								
								<div className="space-y-2">
									<h4 className="font-medium">Plan Features:</h4>
									<ul className="space-y-2">
										<li className="flex items-center gap-2">
											<div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center">
												<svg className="h-3 w-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
												</svg>
											</div>
											<span>Unlimited document uploads</span>
										</li>
										<li className="flex items-center gap-2">
											<div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center">
												<svg className="h-3 w-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
												</svg>
											</div>
											<span>Advanced chat with context</span>
										</li>
										<li className="flex items-center gap-2">
											<div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center">
												<svg className="h-3 w-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
												</svg>
											</div>
											<span>Priority support</span>
										</li>
									</ul>
								</div>
								
								<div className="flex gap-4">
									<Button variant="outline">Change Plan</Button>
									<Button variant="destructive">Cancel Subscription</Button>
								</div>
							</CardContent>
						</Card>
					</RevealOnScroll>
					
					<RevealOnScroll delay={0.2}>
						<Card className="border-border/50 hover:border-primary/30 transition-all duration-300">
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<CreditCard className="h-5 w-5 text-primary" />
									Payment Method
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
									<div className="flex items-center gap-3">
										<div className="h-10 w-10 bg-blue-100 rounded-md flex items-center justify-center">
											<svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
											</svg>
										</div>
										<div>
											<p className="font-medium">Visa ending in 4242</p>
											<p className="text-sm text-muted-foreground">Expires 12/2025</p>
										</div>
									</div>
									<Badge variant="outline">Default</Badge>
								</div>
								
								<Button variant="outline" className="gap-2">
									<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
									</svg>
									Add Payment Method
								</Button>
							</CardContent>
						</Card>
					</RevealOnScroll>
					
					<RevealOnScroll delay={0.3}>
						<Card className="border-border/50 hover:border-primary/30 transition-all duration-300">
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
									</svg>
									Billing History
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									<div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
										<div>
											<p className="font-medium">Pro Plan - Monthly</p>
											<p className="text-sm text-muted-foreground">May 1, 2023</p>
										</div>
										<div className="text-right">
											<p className="font-medium">$29.00</p>
											<p className="text-sm text-green-600">Paid</p>
										</div>
									</div>
									
									<div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
										<div>
											<p className="font-medium">Pro Plan - Monthly</p>
											<p className="text-sm text-muted-foreground">April 1, 2023</p>
										</div>
										<div className="text-right">
											<p className="font-medium">$29.00</p>
											<p className="text-sm text-green-600">Paid</p>
										</div>
									</div>
									
									<div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
										<div>
											<p className="font-medium">Pro Plan - Monthly</p>
											<p className="text-sm text-muted-foreground">March 1, 2023</p>
										</div>
										<div className="text-right">
											<p className="font-medium">$29.00</p>
											<p className="text-sm text-green-600">Paid</p>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					</RevealOnScroll>
				</TabsContent>
			</Tabs>
		</motion.main>
	);
}