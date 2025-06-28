import { NewsletterForm } from '@/app/components/newsletter/NewsletterForm';

export default function NewsletterPage(): React.ReactElement {
  return (
    <main className="max-w-md mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">Newsletter</h1>
      <p>Subscribe to get notified about new articles.</p>
      <NewsletterForm />
    </main>
  );
}
