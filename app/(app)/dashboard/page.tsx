import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import React from 'react';
import Metrics from './Metrics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageSquare, 
  FolderKanban, 
  FileText, 
  Shield, 
  BarChart2,
  Users,
  Clock,
  Zap
} from 'lucide-react';
import Link from 'next/link';

export default async function DashboardPage(): Promise<React.ReactElement> {
	const { userId, sessionClaims, orgRole } = await auth();

	if (!userId) {
		redirect('/sign-in');
	}

	// Check if user is a global admin and redirect them to global admin dashboard
	const userRole = sessionClaims?.metadata?.role;
	const isGlobalAdmin = userRole === 'global_admin' || userRole === 'admin';
	if (isGlobalAdmin) {
		redirect('/global-admin');
	}

	// Check if user is an org admin and redirect them to org admin dashboard
	const isOrgAdmin = orgRole === 'org:admin' || sessionClaims?.org_role === 'org:admin';
	if (isOrgAdmin) {
		redirect('/org-admin');
	}

	return (
		<main className="space-y-8">
			<div className="flex flex-col space-y-2">
				<h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
				<p className="text-muted-foreground text-lg">Welcome to your Webulae workspace. Here&apos;s an overview of your activities.</p>
			</div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart2 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="projects" className="flex items-center gap-2">
            <FolderKanban className="h-4 w-4" />
            Projects
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Documents
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Chat Activity</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24</div>
                <p className="text-xs text-muted-foreground">
                  +5% from last week
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
                <FolderKanban className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
                <p className="text-xs text-muted-foreground">
                  2 due this month
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Documents</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">
                  3 added this week
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Team Members</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8</div>
                <p className="text-xs text-muted-foreground">
                  In your organization
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Metrics Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Usage Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <Metrics />
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">Document uploaded</p>
                    <p className="text-xs text-muted-foreground">You uploaded "Q1 Report.pdf"</p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <Clock className="h-3 w-3 inline mr-1" />
                    2h ago
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="h-5 w-5 text-secondary" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">Chat conversation</p>
                    <p className="text-xs text-muted-foreground">You had a conversation with the AI assistant</p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <Clock className="h-3 w-3 inline mr-1" />
                    5h ago
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center flex-shrink-0">
                    <Zap className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">Workflow executed</p>
                    <p className="text-xs text-muted-foreground">Automated data sync workflow completed</p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <Clock className="h-3 w-3 inline mr-1" />
                    1d ago
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="projects" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Your Projects</CardTitle>
                <Button size="sm" asChild>
                  <Link href="/projects">View All</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                      <FolderKanban className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-medium">Website Redesign</h3>
                      <p className="text-sm text-muted-foreground">Due in 2 weeks</p>
                    </div>
                  </div>
                  <Badge>In Progress</Badge>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                      <FolderKanban className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h3 className="font-medium">Marketing Campaign</h3>
                      <p className="text-sm text-muted-foreground">Due in 1 month</p>
                    </div>
                  </div>
                  <Badge variant="outline">Planning</Badge>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                      <FolderKanban className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h3 className="font-medium">Product Launch</h3>
                      <p className="text-sm text-muted-foreground">Due in 3 months</p>
                    </div>
                  </div>
                  <Badge variant="outline">Planning</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Documents</CardTitle>
                <Button size="sm" asChild>
                  <Link href="/documents">View All</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-medium">Q1 Report.pdf</h3>
                      <p className="text-sm text-muted-foreground">Uploaded 2 days ago</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/documents/1">View</Link>
                  </Button>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h3 className="font-medium">Marketing Strategy.docx</h3>
                      <p className="text-sm text-muted-foreground">Uploaded 1 week ago</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/documents/2">View</Link>
                  </Button>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <h3 className="font-medium">Product Roadmap.xlsx</h3>
                      <p className="text-sm text-muted-foreground">Uploaded 2 weeks ago</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/documents/3">View</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
		</main>
	);
}