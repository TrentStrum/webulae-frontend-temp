'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { IconBolt, IconMessage, IconRobot } from '@tabler/icons-react';
import { WorkflowSuggestions } from './WorkflowSuggestions';

export const WorkflowDemo: React.FC = () => {
  const [showDemo, setShowDemo] = useState(false);
  const [demoMessages, setDemoMessages] = useState<string[]>([
    "I need to generate a monthly report",
    "Can you send an email notification?",
    "Run the backup workflow",
    "Execute the data sync process"
  ]);

  const handleWorkflowExecution = (workflowId: string) => {
    console.log('Demo workflow executed:', workflowId);
    // In a real scenario, this would execute the actual workflow
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconBolt className="h-5 w-5 text-primary" />
            Interactive Workflow Selection Demo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            This demo shows how users can interact with workflows through the chat interface. 
            The system automatically detects workflow-related queries and presents relevant options.
          </p>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowDemo(!showDemo)}
              variant="outline"
              size="sm"
            >
              <IconMessage className="h-4 w-4 mr-2" />
              {showDemo ? 'Hide' : 'Show'} Workflow Suggestions
            </Button>
            
            <Badge variant="secondary">
              Demo Mode
            </Badge>
          </div>

          {showDemo && (
            <div className="border rounded-lg p-4 bg-muted/50">
              <div className="flex items-center gap-2 mb-3">
                <IconRobot className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Available Workflows</span>
              </div>
              
              <WorkflowSuggestions
                organizationId="demo-org-id"
                userRole="org_member"
                onExecuteWorkflow={handleWorkflowExecution}
                onClose={() => setShowDemo(false)}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Example Workflow Queries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {demoMessages.map((message, index) => (
              <div
                key={index}
                className="p-3 border rounded-lg bg-background hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => {
                  // Simulate typing the message
                  console.log('Demo message:', message);
                }}
              >
                <p className="text-sm">{message}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Would trigger workflow suggestions
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
              <div>
                <p className="text-sm font-medium">Smart Detection</p>
                <p className="text-xs text-muted-foreground">
                  Automatically detects workflow-related keywords and shows relevant options
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
              <div>
                <p className="text-sm font-medium">Role-Based Access</p>
                <p className="text-xs text-muted-foreground">
                  Only shows workflows that the user has permission to execute
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
              <div>
                <p className="text-sm font-medium">Confirmation Support</p>
                <p className="text-xs text-muted-foreground">
                  Supports workflows that require user confirmation before execution
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
              <div>
                <p className="text-sm font-medium">Categorized Display</p>
                <p className="text-xs text-muted-foreground">
                  Groups workflows by category (Reports, Communication, System, etc.)
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
              <div>
                <p className="text-sm font-medium">Real-time Execution</p>
                <p className="text-xs text-muted-foreground">
                  Executes workflows directly from the chat interface with live status updates
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 