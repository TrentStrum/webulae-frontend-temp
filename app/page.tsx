import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { NewsletterForm } from '@/app/components/newsletter/NewsletterForm';
import { 
  ArrowRight, 
  Zap, 
  Users, 
  BarChart3, 
  FileText, 
  MessageSquare, 
  Workflow, 
  Brain,
  Rocket
} from 'lucide-react';

export default function Home(): React.ReactElement {
  return (
    <main className="flex flex-col items-center">
      {/* Hero Section with Gradient Background */}
      <section className="w-full bg-gradient-to-br from-primary-100/80 via-background to-secondary-100/50 dark:from-primary-900/20 dark:via-background dark:to-secondary-900/20 py-24 px-4">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <div className="inline-block animate-bounce-slow">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg mb-6 mx-auto">
              <Brain className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-secondary-600 dark:from-primary-400 dark:to-secondary-400">
            Welcome to Webulae
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
            Your Personalized AI Assistant, Powered by Your Own Data
          </p>
          
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Webulae creates a secure portal where your team accesses AI agents trained on your business SOPs, 
            reports, and processes. Build workflows, manage projects and collaborate effortlessly.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Button asChild size="lg" className="rounded-full px-8 font-medium">
              <Link href="/sign-up">
                Request Access
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            
            <Button variant="outline" asChild size="lg" className="rounded-full px-8">
              <Link href="/sign-in">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-24 px-4 bg-background">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Powerful Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-background border border-border/50 hover:border-primary/50 hover:shadow-md transition-all duration-300">
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Workflow className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Workflows</h3>
                <p className="text-muted-foreground">
                  Automate your tasks with powerful workflow tools designed for your business processes.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-background border border-border/50 hover:border-primary/50 hover:shadow-md transition-all duration-300">
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-secondary" />
                </div>
                <h3 className="text-xl font-semibold">Collaboration</h3>
                <p className="text-muted-foreground">
                  Invite your team and work together in real time with AI-powered insights and support.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-background border border-border/50 hover:border-primary/50 hover:shadow-md transition-all duration-300">
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-accent" />
                </div>
                <h3 className="text-xl font-semibold">Analytics</h3>
                <p className="text-muted-foreground">
                  Gain insights with built-in analytics and reporting tailored to your business metrics.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="w-full py-24 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get your AI-powered team up and running in three simple steps
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold shadow-lg">
                1
              </div>
              <h3 className="text-xl font-semibold">We onboard your team</h3>
              <p className="text-muted-foreground">
                You send us your docs and goals, we handle the complete setup process.
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-secondary text-secondary-foreground rounded-full flex items-center justify-center text-xl font-bold shadow-lg">
                2
              </div>
              <h3 className="text-xl font-semibold">Embed your data</h3>
              <p className="text-muted-foreground">
                Your internal SOPs and assets get embedded securely for AI retrieval and analysis.
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-accent text-accent-foreground rounded-full flex items-center justify-center text-xl font-bold shadow-lg">
                3
              </div>
              <h3 className="text-xl font-semibold">Deploy your AI team</h3>
              <p className="text-muted-foreground">
                Your organization logs in and starts asking questions, getting insights, and executing workflows.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="w-full py-24 px-4 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Trusted by Industry Leaders</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              See how different industries leverage Webulae to transform their operations
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-background border border-border/50 hover:shadow-md transition-all duration-300">
              <CardContent className="p-6 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold">Logistics</h3>
                </div>
                <p className="text-muted-foreground">
                  Fleet SOPs, safety protocols, and operations support for seamless logistics management.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-background border border-border/50 hover:shadow-md transition-all duration-300">
              <CardContent className="p-6 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center">
                    <MessageSquare className="h-5 w-5 text-pink-600 dark:text-pink-400" />
                  </div>
                  <h3 className="text-xl font-semibold">MedSpas</h3>
                </div>
                <p className="text-muted-foreground">
                  Client workflows, KPI dashboards, and AI marketing assistants for growth.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-background border border-border/50 hover:shadow-md transition-all duration-300">
              <CardContent className="p-6 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <Zap className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-xl font-semibold">Retail</h3>
                </div>
                <p className="text-muted-foreground">
                  Order fulfillment, campaign planning, and automation strategy optimization.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-background border border-border/50 hover:shadow-md transition-all duration-300">
              <CardContent className="p-6 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                    <Users className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <h3 className="text-xl font-semibold">Coaches</h3>
                </div>
                <p className="text-muted-foreground">
                  Give clients tailored resources and document-driven AI support for better outcomes.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-background border border-border/50 hover:shadow-md transition-all duration-300">
              <CardContent className="p-6 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <BarChart3 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-xl font-semibold">Vending</h3>
                </div>
                <p className="text-muted-foreground">
                  Profit dashboards, placement workflows, and lead tracking for business growth.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-background border border-border/50 hover:shadow-md transition-all duration-300">
              <CardContent className="p-6 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <Rocket className="h-5 w-5 text-red-600 dark:text-red-400" />
                  </div>
                  <h3 className="text-xl font-semibold">Startups</h3>
                </div>
                <p className="text-muted-foreground">
                  Streamline operations, automate routine tasks, and scale efficiently with limited resources.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-24 px-4 bg-gradient-to-br from-primary-100/50 to-secondary-100/50 dark:from-primary-900/20 dark:to-secondary-900/20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-3xl md:text-4xl font-bold">Ready to build your AI-powered team?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join industry leaders who are already transforming their operations with Webulae
          </p>
          
          <Button asChild size="lg" className="rounded-full px-8 font-medium">
            <Link href="/sign-up">
              Request Access
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="w-full py-24 px-4 bg-background">
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Stay Updated</h2>
          <p className="text-muted-foreground mb-6">
            Subscribe to our newsletter for the latest updates and insights
          </p>
          <NewsletterForm />
        </div>
      </section>
    </main>
  );
}