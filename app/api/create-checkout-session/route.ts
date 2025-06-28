import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { SubscriptionTier } from '@/app/types';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

export async function POST(req: NextRequest): Promise<Response> {
  try {
    const body = await req.json().catch(() => ({}));
    const tier: SubscriptionTier = body.tier || 'pro';
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const priceId = tier === 'pro_plus'
      ? process.env.STRIPE_PRO_PLUS_PRICE_ID
      : process.env.STRIPE_PRO_PRICE_ID;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{ price: priceId || '', quantity: 1 }],
      success_url: process.env.STRIPE_SUCCESS_URL || '',
      cancel_url: process.env.STRIPE_CANCEL_URL || '',
      client_reference_id: userId,
      metadata: { userId, tier },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('Stripe session creation failed:', err);
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
  }
}
