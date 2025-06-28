import { NextRequest, NextResponse } from 'next/server';
import { getPaymentMethodDataAccess } from '@/app/config/backend';
import { paymentMethodSchema } from '@/app/schemas/paymentMethodSchema';

type Params = { params: { paymentMethodId: string } };

export async function GET(_: NextRequest, { params }: Params): Promise<Response> {
    try {
        const method = await getPaymentMethodDataAccess().getById(params.paymentMethodId);
        return NextResponse.json(method);
    } catch (error) {
        console.error('Failed to fetch payment method:', error);
        return NextResponse.json({ error: 'Failed to fetch payment method' }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: Params): Promise<Response> {
    try {
        const body = await req.json();
        const validated = paymentMethodSchema.partial().parse(body);
        const updated = await getPaymentMethodDataAccess().update(params.paymentMethodId, validated);
        return NextResponse.json(updated);
    } catch (error) {
        console.error('Failed to update payment method:', error);
        return NextResponse.json({ error: 'Failed to update payment method' }, { status: 500 });
    }
}

export async function DELETE(_: NextRequest, { params }: Params): Promise<Response> {
    try {
        await getPaymentMethodDataAccess().delete(params.paymentMethodId);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to delete payment method:', error);
        return NextResponse.json({ error: 'Failed to delete payment method' }, { status: 500 });
    }
}
