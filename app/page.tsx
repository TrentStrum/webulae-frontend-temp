import Image from 'next/image';
import Link from 'next/link';
import { NewsletterForm } from '@/app/components/newsletter/NewsletterForm';
import { Button } from '@/components/ui/button';

export default function Home(): React.ReactElement {
	return (
		<main className="flex flex-col items-center justify-center min-h-screen px-4 space-y-20">
			{/* Hero Section */}
			<section className="flex flex-col items-center text-center space-y-8 max-w-4xl">
				<Image src="/next.svg" alt="Webulae" width={96} height={96} />
				<div className="space-y-4">
					<h1 className="text-5xl font-bold tracking-tight">Welcome to Webulae</h1>
					<p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
						Your Personalized AI Assistant, Powered by Your Own Data
					</p>
					<p className="text-lg text-muted-foreground max-w-3xl leading-relaxed">
						Webulae creates a secure portal where your team accesses AI agents trained on your business SOPs, 
						reports, and processes. Build workflows, manage projects and collaborate effortlessly.
					</p>
				</div>
				<div className="space-x-4">
					<Button asChild size="lg">
						<Link href="/sign-up">Request Access</Link>
					</Button>
					<Button variant="outline" asChild size="lg">
						<Link href="/sign-in">Sign In</Link>
					</Button>
				</div>
			</section>

			{/* Core Features */}
			<section className="grid md:grid-cols-3 gap-8 w-full max-w-5xl">
				<div className="bg-card text-card-foreground rounded-lg p-8 shadow-sm border">
					<h3 className="text-xl font-semibold mb-3">Workflows</h3>
					<p className="text-muted-foreground leading-relaxed">
						Automate your tasks with powerful workflow tools designed for your business processes.
					</p>
				</div>
				<div className="bg-card text-card-foreground rounded-lg p-8 shadow-sm border">
					<h3 className="text-xl font-semibold mb-3">Collaboration</h3>
					<p className="text-muted-foreground leading-relaxed">
						Invite your team and work together in real time with AI-powered insights and support.
					</p>
				</div>
				<div className="bg-card text-card-foreground rounded-lg p-8 shadow-sm border">
					<h3 className="text-xl font-semibold mb-3">Analytics</h3>
					<p className="text-muted-foreground leading-relaxed">
						Gain insights with built-in analytics and reporting tailored to your business metrics.
					</p>
				</div>
			</section>

			{/* How It Works */}
			<section className="w-full max-w-6xl">
				<div className="text-center mb-12">
					<h2 className="text-4xl font-bold mb-4">How It Works</h2>
					<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
						Get your AI-powered team up and running in three simple steps
					</p>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
					<div className="text-center space-y-4">
						<div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto text-xl font-bold">
							1
						</div>
						<h3 className="text-xl font-semibold">We onboard your team</h3>
						<p className="text-muted-foreground leading-relaxed">
							You send us your docs and goals, we handle the complete setup process.
						</p>
					</div>
					<div className="text-center space-y-4">
						<div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto text-xl font-bold">
							2
						</div>
						<h3 className="text-xl font-semibold">Embed your data</h3>
						<p className="text-muted-foreground leading-relaxed">
							Your internal SOPs and assets get embedded securely for AI retrieval and analysis.
						</p>
					</div>
					<div className="text-center space-y-4">
						<div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto text-xl font-bold">
							3
						</div>
						<h3 className="text-xl font-semibold">Deploy your AI team</h3>
						<p className="text-muted-foreground leading-relaxed">
							Your organization logs in and starts asking questions, getting insights, and executing workflows.
						</p>
					</div>
				</div>
			</section>

			{/* Use Cases */}
			<section className="w-full max-w-7xl">
				<div className="text-center mb-12">
					<h2 className="text-4xl font-bold mb-4">Trusted by Industry Leaders</h2>
					<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
						See how different industries leverage Webulae to transform their operations
					</p>
				</div>
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
					<div className="bg-card text-card-foreground rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow">
						<h3 className="text-xl font-semibold mb-3">📦 Logistics</h3>
						<p className="text-muted-foreground leading-relaxed">
							Fleet SOPs, safety protocols, and operations support for seamless logistics management.
						</p>
					</div>
					<div className="bg-card text-card-foreground rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow">
						<h3 className="text-xl font-semibold mb-3">🧴 MedSpas</h3>
						<p className="text-muted-foreground leading-relaxed">
							Client workflows, KPI dashboards, and AI marketing assistants for growth.
						</p>
					</div>
					<div className="bg-card text-card-foreground rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow">
						<h3 className="text-xl font-semibold mb-3">🌲 Retail</h3>
						<p className="text-muted-foreground leading-relaxed">
							Order fulfillment, campaign planning, and automation strategy optimization.
						</p>
					</div>
					<div className="bg-card text-card-foreground rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow">
						<h3 className="text-xl font-semibold mb-3">🎯 Coaches</h3>
						<p className="text-muted-foreground leading-relaxed">
							Give clients tailored resources and document-driven AI support for better outcomes.
						</p>
					</div>
					<div className="bg-card text-card-foreground rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow">
						<h3 className="text-xl font-semibold mb-3">🧃 Vending</h3>
						<p className="text-muted-foreground leading-relaxed">
							Profit dashboards, placement workflows, and lead tracking for business growth.
						</p>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="w-full max-w-4xl text-center space-y-6">
				<div className="space-y-4">
					<h2 className="text-4xl font-bold">Ready to build your AI-powered team?</h2>
					<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
						Join industry leaders who are already transforming their operations with Webulae
					</p>
				</div>
				<Button asChild size="lg">
					<Link href="/sign-up">Request Access</Link>
				</Button>
			</section>

			{/* Newsletter */}
			<section className="w-full max-w-md">
				<h2 className="text-2xl font-bold text-center mb-4">Stay Updated</h2>
				<NewsletterForm />
			</section>
		</main>
	);
}
