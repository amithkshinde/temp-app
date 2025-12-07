import { NextResponse } from 'next/server';
import { USER_HOLIDAY_SELECTIONS, toggleUserSelection } from '@/data/holiday-data';


export async function POST(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    const userId = params.id;
    try {
        const body = await request.json();
        const { holidayId } = body;

        toggleUserSelection(userId, holidayId);

        const currentSelections = USER_HOLIDAY_SELECTIONS[userId] || [];

        return NextResponse.json({
            success: true,
            selectedCount: currentSelections.length,
            selections: currentSelections
        });

    } catch (error) {
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}

export async function GET(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    const userId = params.id;
    const selections = USER_HOLIDAY_SELECTIONS[userId] || [];
    return NextResponse.json(selections);
}
