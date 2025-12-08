import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
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
