import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    const userId = params.id;
    try {
        const body = await request.json();
        const { holidayId } = body;

        // Toggle logic: Check if exists
        const existing = await prisma.holidaySelection.findUnique({
            where: {
                userId_holidayId: {
                    userId,
                    holidayId
                }
            }
        });

        if (existing) {
            // Remove
            await prisma.holidaySelection.delete({
                where: {
                    userId_holidayId: {
                        userId,
                        holidayId
                    }
                }
            });
        } else {
            // Add
            await prisma.holidaySelection.create({
                data: {
                    userId,
                    holidayId
                }
            });
        }

        // Return updated count/list
        const selections = await prisma.holidaySelection.findMany({
            where: { userId }
        });

        return NextResponse.json({
            success: true,
            selectedCount: selections.length,
            selections: selections.map((s: { holidayId: string }) => s.holidayId) // Frontend expects list of IDs probably or list of selection objects?
            // Mock returned object: { success, selectedCount, selections: string[] } based on previous code usage interpretation?
            // Previous code: `selections: currentSelections` which was array of strings (holiday IDs) in data/holiday-data.ts likely.
            // Let's check data/holiday-data.ts usage to be sure.
            // Actually, let's look at GET below. GET returns `selections`.
            // If previous matched `USER_HOLIDAY_SELECTIONS[userId]` which was string[], then yes.
        });

    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}

export async function GET(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    const userId = params.id;

    // Fetch user's selections
    const selections = await prisma.holidaySelection.findMany({
        where: { userId },
        select: { holidayId: true }
    });

    // Return array of IDs to match what frontend likely expects
    return NextResponse.json(selections.map((s: { holidayId: string }) => s.holidayId));
}
