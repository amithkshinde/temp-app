import { NextResponse } from 'next/server';
import { MOCK_HOLIDAYS, addHoliday, PublicHoliday } from '@/data/holiday-data';

export async function GET() {
    return NextResponse.json(MOCK_HOLIDAYS);
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, date } = body;

        if (!name || !date) {
            return NextResponse.json({ error: 'Name and Date are required' }, { status: 400 });
        }

        const newHoliday: PublicHoliday = {
            id: crypto.randomUUID(),
            name,
            date
        };

        addHoliday(newHoliday);
        return NextResponse.json(newHoliday);

    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
