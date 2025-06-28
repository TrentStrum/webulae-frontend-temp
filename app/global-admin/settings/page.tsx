'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Settings, Shield, Database, Bell, Globe } from 'lucide-react';

export default function GlobalAdminSettingsPage() {
	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
					<p className="text-muted-foreground">
						Manage global system configuration and preferences
					</p>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Security Settings */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Shield className="h-5 w-5" />
							Security Settings
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium">Two-Factor Authentication</p>
								<p className="text-xs text-muted-foreground">
									Require 2FA for all users
								</p>
							</div>
							<input type="checkbox" className="rounded border-gray-300" />
						</div>
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium">Session Timeout</p>
								<p className="text-xs text-muted-foreground">
									Auto-logout after inactivity
								</p>
							</div>
							<input type="checkbox" className="rounded border-gray-300" defaultChecked />
						</div>
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium">IP Whitelist</p>
								<p className="text-xs text-muted-foreground">
									Restrict access to specific IPs
								</p>
							</div>
							<input type="checkbox" className="rounded border-gray-300" />
						</div>
					</CardContent>
				</Card>

				{/* Database Settings */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Database className="h-5 w-5" />
							Database Settings
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium">Auto Backup</p>
								<p className="text-xs text-muted-foreground">
									Daily automated backups
								</p>
							</div>
							<input type="checkbox" className="rounded border-gray-300" defaultChecked />
						</div>
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium">Data Retention</p>
								<p className="text-xs text-muted-foreground">
									Keep logs for 90 days
								</p>
							</div>
							<input type="checkbox" className="rounded border-gray-300" defaultChecked />
						</div>
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium">Performance Monitoring</p>
								<p className="text-xs text-muted-foreground">
									Track database performance
								</p>
							</div>
							<input type="checkbox" className="rounded border-gray-300" defaultChecked />
						</div>
					</CardContent>
				</Card>

				{/* Notification Settings */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Bell className="h-5 w-5" />
							Notification Settings
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium">Email Notifications</p>
								<p className="text-xs text-muted-foreground">
									Send system alerts via email
								</p>
							</div>
							<input type="checkbox" className="rounded border-gray-300" defaultChecked />
						</div>
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium">Slack Integration</p>
								<p className="text-xs text-muted-foreground">
									Send alerts to Slack
								</p>
							</div>
							<input type="checkbox" className="rounded border-gray-300" />
						</div>
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium">Critical Alerts</p>
								<p className="text-xs text-muted-foreground">
									Immediate notifications for issues
								</p>
							</div>
							<input type="checkbox" className="rounded border-gray-300" defaultChecked />
						</div>
					</CardContent>
				</Card>

				{/* System Settings */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Globe className="h-5 w-5" />
							System Settings
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium">Maintenance Mode</p>
								<p className="text-xs text-muted-foreground">
									Temporarily disable user access
								</p>
							</div>
							<input type="checkbox" className="rounded border-gray-300" />
						</div>
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium">Debug Mode</p>
								<p className="text-xs text-muted-foreground">
									Enable detailed error logging
								</p>
							</div>
							<input type="checkbox" className="rounded border-gray-300" />
						</div>
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium">Auto Updates</p>
								<p className="text-xs text-muted-foreground">
									Automatically update system
								</p>
							</div>
							<input type="checkbox" className="rounded border-gray-300" defaultChecked />
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Action Buttons */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Settings className="h-5 w-5" />
						Actions
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex flex-wrap gap-4">
						<Button variant="outline">
							Export Configuration
						</Button>
						<Button variant="outline">
							Import Configuration
						</Button>
						<Button variant="outline">
							Reset to Defaults
						</Button>
						<Button>
							Save Changes
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
} 