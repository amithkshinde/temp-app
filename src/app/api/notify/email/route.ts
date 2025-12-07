
import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/notifications';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { to, subject, html } = body;

        if (!to || !subject || !html) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        await sendEmail({ to, subject, html });

        return NextResponse.json({ success: true, message: 'Email queued' });
    } catch (err) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
