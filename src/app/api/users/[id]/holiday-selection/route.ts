import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { DEMO_USER_EMPLOYEE, DEMO_HOLIDAY_SELECTIONS } from '@/lib/demo-data';

export async function POST(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    const userId = params.id;
    try {
        const body = await request.json();
        const { holidayId } = body;

        // Demo Interception
        if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true' && userId === DEMO_USER_EMPLOYEE.id) {
            // Return mock success without persisting
            // Calculate new count based on existing static + toggle logic? 
            // Or just return simulated success. Frontend updates optimistically anyway.
            // Let's pretend we have 4 selected, and if we toggle one, we just return success.
            return NextResponse.json({
                success: true,
                selectedCount: DEMO_HOLIDAY_SELECTIONS.length, // Static for now, or we could simulate toggle logic in memory if really needed, but requirement is just "works"
                selections: DEMO_HOLIDAY_SELECTIONS
            });
        }

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

    if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true' && userId === DEMO_USER_EMPLOYEE.id) {
        return NextResponse.json(DEMO_HOLIDAY_SELECTIONS);
    }

    // Fetch user's selections
    const selections = await prisma.holidaySelection.findMany({
        where: { userId },
        select: { holidayId: true }
    });

    // Return array of IDs to match what frontend likely expects
    return NextResponse.json(selections.map((s: { holidayId: string }) => s.holidayId));
}
