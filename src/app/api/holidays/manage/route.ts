import { NextResponse } from 'next/server';
import { addHoliday, removeHoliday, PublicHoliday } from '@/data/holiday-data';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, date, type } = body;

        if (!name || !date) {
            return NextResponse.json({ error: 'Name and date are required' }, { status: 400 });
        }

        const newHoliday: PublicHoliday = {
            id: `h-${Date.now()}`,
            name,
            date,
            type: type || 'public'
        };

        addHoliday(newHoliday);
        return NextResponse.json(newHoliday);
    } catch (_error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        removeHoliday(id);
        return NextResponse.json({ success: true });
    } catch (_error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
