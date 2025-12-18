import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { DEMO_HOLIDAYS } from '@/lib/demo-data';

export async function GET() {
    try {
        if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
            // Return static demo list
            return NextResponse.json(DEMO_HOLIDAYS);
        }

        const holidays = await prisma.holiday.findMany();
        return NextResponse.json(holidays);
    } catch {
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, date } = body;

        if (!name || !date) {
            return NextResponse.json({ error: 'Name and Date are required' }, { status: 400 });
        }

        const newHoliday = await prisma.holiday.create({
            data: {
                name,
                date,
                type: 'public'
            }
        });

        return NextResponse.json(newHoliday);

    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
