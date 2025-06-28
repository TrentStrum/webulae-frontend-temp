import { NextRequest, NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';
import { SubscriptionTier } from '@/app/types';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

export async function POST(req: NextRequest): Promise<Response> {
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing Stripe-Signature header' }, { status: 400 });
  }

  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET || '');
  } catch (err) {
    console.error('Stripe webhook verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    if (event.type === 'checkout.session.completed' || event.type === 'invoice.payment_succeeded') {
      const data = event.data.object as { metadata?: { userId?: string; tier?: SubscriptionTier }; client_reference_id?: string };
      const userId = data.metadata?.userId || data.client_reference_id;
      const tier = data.metadata?.tier as SubscriptionTier | undefined;
      if (userId) {
        const clerk = await clerkClient();
        await clerk.users.updateUserMetadata(userId, {
          privateMetadata: { isPaid: true },
          publicMetadata: { subscriptionTier: tier || 'pro' },
        });
      }
    }
  } catch (err) {
    console.error('Failed to handle webhook event:', err);
  }

  return NextResponse.json({ received: true });
}
