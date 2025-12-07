import { NextResponse } from 'next/server';
import { MOCK_HOLIDAYS, updateHoliday, removeHoliday } from '@/data/holiday-data';

export async function PUT(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    const id = params.id;
    try {
        const body = await request.json();
        const holiday = MOCK_HOLIDAYS.find(h => h.id === id);

        if (!holiday) {
            return NextResponse.json({ error: 'Holiday not found' }, { status: 404 });
        }

        updateHoliday(id, body);
        return NextResponse.json({ success: true });

    } catch {
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    const id = params.id;
    const holiday = MOCK_HOLIDAYS.find(h => h.id === id);

    if (!holiday) {
        return NextResponse.json({ error: 'Holiday not found' }, { status: 404 });
    }

    removeHoliday(id);
    return NextResponse.json({ success: true });
}
