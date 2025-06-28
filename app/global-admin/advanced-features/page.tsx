import { Metadata } from 'next';
import { AdvancedSystemPromptForm } from '@/app/components/admin/system-prompts/AdvancedSystemPromptForm';
import { PerformanceDashboard } from '@/app/components/admin/PerformanceDashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { 
  Settings, 
  Zap, 
  Activity, 
  MessageSquare, 
  Code, 
  Variable,
  TrendingUp,
  Shield,
  Globe,
  Database
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Advanced Features | Webulae Admin',
  description: 'Explore and manage advanced platform features including dynamic prompts, performance optimization, and real-time capabilities',
};

export default function AdvancedFeaturesPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Settings className="h-8 w-8 text-primary" />
            Advanced Features
          </h1>
          <p className="text-muted-foreground mt-2">
            Next-generation capabilities for enhanced AI customization and system performance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            <TrendingUp className="h-3 w-3 mr-1" />
            Beta
          </Badge>
        </div>
      </div>

      {/* Feature Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Advanced System Prompts</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Dynamic & Conditional</div>
            <p className="text-xs text-muted-foreground">
              Variables, conditions, and template processing
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance Optimization</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Caching & Monitoring</div>
            <p className="text-xs text-muted-foreground">
              Intelligent caching and real-time metrics
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Real-time Features</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Live Updates</div>
            <p className="text-xs text-muted-foreground">
              WebSocket connections and live notifications
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="prompts" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="prompts" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Advanced Prompts
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="realtime" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Real-time
          </TabsTrigger>
          <TabsTrigger value="api" className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            API Examples
          </TabsTrigger>
        </TabsList>

        <TabsContent value="prompts" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Advanced Prompt Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Variable className="h-5 w-5" />
                  Dynamic Variables
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Variable Types</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">String</Badge>
                    <Badge variant="outline">Number</Badge>
                    <Badge variant="outline">Boolean</Badge>
                    <Badge variant="outline">Array</Badge>
                    <Badge variant="outline">Object</Badge>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Example Template</h4>
                  <div className="bg-muted p-3 rounded-md text-sm font-mono">
                    Hello {{user_name}}! Welcome to {{organization_name}}.
                    Your role is {{user_role}}.
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Features</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Type validation and constraints</li>
                    <li>• Required vs optional variables</li>
                    <li>• Default values and fallbacks</li>
                    <li>• Context-aware resolution</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Conditional Logic */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Conditional Logic
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Operators</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">equals</Badge>
                    <Badge variant="outline">contains</Badge>
                    <Badge variant="outline">greater_than</Badge>
                    <Badge variant="outline">exists</Badge>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Example Condition</h4>
                  <div className="bg-muted p-3 rounded-md text-sm font-mono">
                    user_role equals "admin" AND
                    organization_id exists
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Features</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Complex logical expressions</li>
                    <li>• Field-based conditions</li>
                    <li>• Dynamic evaluation</li>
                    <li>• Performance optimized</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Advanced Prompt Form Demo */}
          <Card>
            <CardHeader>
              <CardTitle>Advanced System Prompt Builder</CardTitle>
              <p className="text-sm text-muted-foreground">
                Create dynamic prompts with variables, conditions, and real-time preview
              </p>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  Advanced prompt builder with tabs for variables, conditions, and preview
                </p>
                <Button>
                  <Settings className="h-4 w-4 mr-2" />
                  Open Advanced Prompt Builder
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <PerformanceDashboard />
        </TabsContent>

        <TabsContent value="realtime" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* WebSocket Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Real-time Connections
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Connection Status</h4>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm">Connected</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Active Subscriptions</h4>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span>Chat Messages</span>
                      <Badge variant="secondary">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Workflow Updates</span>
                      <Badge variant="secondary">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>System Notifications</span>
                      <Badge variant="secondary">Active</Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Features</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Automatic reconnection</li>
                    <li>• Heartbeat monitoring</li>
                    <li>• Channel subscriptions</li>
                    <li>• Message queuing</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Real-time Events */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Live Events
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Event Types</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Badge variant="outline" className="text-xs">Chat Messages</Badge>
                    <Badge variant="outline" className="text-xs">Workflow Updates</Badge>
                    <Badge variant="outline" className="text-xs">User Status</Badge>
                    <Badge variant="outline" className="text-xs">System Alerts</Badge>
                    <Badge variant="outline" className="text-xs">Document Changes</Badge>
                    <Badge variant="outline" className="text-xs">Performance Metrics</Badge>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Live Activity Feed</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>User John joined chat</span>
                      <span className="text-muted-foreground text-xs">2s ago</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Workflow "Invoice Processing" completed</span>
                      <span className="text-muted-foreground text-xs">5s ago</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span>Document "Q4 Report" updated</span>
                      <span className="text-muted-foreground text-xs">12s ago</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="api" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* API Examples */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Advanced Prompts API
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">GET /api/admin/advanced-system-prompts</h4>
                  <div className="bg-muted p-3 rounded-md text-sm">
                    <pre className="text-xs">
{`{
  "success": true,
  "data": {
    "prompts": [...],
    "analytics": [...],
    "executionTime": 45.2,
    "totalCount": 2
  }
}`}
                    </pre>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">POST /api/admin/advanced-system-prompts</h4>
                  <div className="bg-muted p-3 rounded-md text-sm">
                    <pre className="text-xs">
{`{
  "prompt": {
    "prompt_name": "Dynamic Welcome",
    "content": "Hello {{user_name}}!",
    "variables": [...],
    "conditions": [...]
  },
  "testContext": {
    "user_name": "John",
    "user_role": "admin"
  }
}`}
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance API */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Performance API
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Cache Operations</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center justify-between">
                      <span>Set Cache</span>
                      <code className="bg-muted px-2 py-1 rounded">performanceService.set(key, data, ttl)</code>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Get Cache</span>
                      <code className="bg-muted px-2 py-1 rounded">performanceService.get(key)</code>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Clear Cache</span>
                      <code className="bg-muted px-2 py-1 rounded">performanceService.clear()</code>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Performance Monitoring</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center justify-between">
                      <span>Get Analytics</span>
                      <code className="bg-muted px-2 py-1 rounded">performanceService.getAnalytics()</code>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Measure Execution</span>
                      <code className="bg-muted px-2 py-1 rounded">PerformanceService.measureExecutionTime()</code>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Implementation Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Implementation Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Advanced System Prompts</h4>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span>Dynamic Variables</span>
                      <Badge className="bg-green-100 text-green-800">Complete</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Conditional Logic</span>
                      <Badge className="bg-green-100 text-green-800">Complete</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Template Processing</span>
                      <Badge className="bg-green-100 text-green-800">Complete</Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Performance Optimization</h4>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span>Intelligent Caching</span>
                      <Badge className="bg-green-100 text-green-800">Complete</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Memory Management</span>
                      <Badge className="bg-green-100 text-green-800">Complete</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Performance Monitoring</span>
                      <Badge className="bg-green-100 text-green-800">Complete</Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Real-time Features</h4>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span>WebSocket Service</span>
                      <Badge className="bg-green-100 text-green-800">Complete</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Event Handling</span>
                      <Badge className="bg-green-100 text-green-800">Complete</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Live Updates</span>
                      <Badge className="bg-yellow-100 text-yellow-800">In Progress</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 