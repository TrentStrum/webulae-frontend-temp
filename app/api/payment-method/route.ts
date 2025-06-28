import { NextRequest, NextResponse } from 'next/server';
import { getPaymentMethodDataAccess } from '@/app/config/backend';
import { paymentMethodSchema } from '@/app/schemas/paymentMethodSchema';

export async function GET(): Promise<Response> {
    try {
        const dataAccess = getPaymentMethodDataAccess();
        const methods = await dataAccess.getAll();
        return NextResponse.json(methods, { status: 200 });
    } catch (error) {
        console.error('Failed to fetch payment methods:', error);
        return NextResponse.json({ error: 'Failed to fetch payment methods' }, { status: 500 });
    }
}

export async function POST(req: NextRequest): Promise<Response> {
    try {
        const body = await req.json();
        const parsed = paymentMethodSchema.parse(body);
        const dataAccess = getPaymentMethodDataAccess();
        const created = await dataAccess.create(parsed);
        return NextResponse.json(created, { status: 201 });
    } catch (error) {
        console.error('Failed to create payment method:', error);
        return NextResponse.json({ error: 'Failed to create payment method' }, { status: 500 });
    }
}
