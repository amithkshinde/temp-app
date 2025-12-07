
import type { Meta, StoryObj } from '@storybook/react';
import { Calendar } from '@/components/calendar/Calendar'; // Path might need adjustment depending on where storybook looks
import { addDays, startOfMonth } from 'date-fns';

const meta: Meta<typeof Calendar> = {
    component: Calendar,
    title: 'Dashboard/Calendar',
    tags: ['autodocs'],
    argTypes: {
        onDateClick: { action: 'date-clicked' },
        onRangeSelect: { action: 'range-selected' },
    },
};

export default meta;
type Story = StoryObj<typeof Calendar>;

const today = new Date();
const startOfCurrentMonth = startOfMonth(today);

export const Default: Story = {
    args: {
        currentDate: startOfCurrentMonth,
        events: [],
    },
};

export const WithLeaves: Story = {
    args: {
        currentDate: startOfCurrentMonth,
        events: [
            { id: '1', date: addDays(startOfCurrentMonth, 5).toISOString().split('T')[0], type: 'leave', status: 'approved' },
            { id: '2', date: addDays(startOfCurrentMonth, 12).toISOString().split('T')[0], type: 'leave', status: 'pending' },
            { id: '3', date: addDays(startOfCurrentMonth, 18).toISOString().split('T')[0], type: 'leave', status: 'rejected' },
        ],
    },
};

export const WithRangeSelection: Story = {
    args: {
        currentDate: startOfCurrentMonth,
        startDate: addDays(startOfCurrentMonth, 10),
        endDate: addDays(startOfCurrentMonth, 14),
        events: [],
    },
};

export const PublicHolidays: Story = {
    args: {
        currentDate: startOfCurrentMonth,
        events: [
            { id: 'h1', date: addDays(startOfCurrentMonth, 26).toISOString().split('T')[0], type: 'holiday', title: 'Republic Day' },
            { id: 'h2', date: addDays(startOfCurrentMonth, 15).toISOString().split('T')[0], type: 'holiday', title: 'Pongal' },
        ],
    },
};

export const InteractiveManagerView: Story = {
    args: {
        currentDate: startOfCurrentMonth,
        events: [
            { id: '1', date: addDays(startOfCurrentMonth, 5).toISOString().split('T')[0], type: 'leave', status: 'pending', meta: { user: 'Alice' } },
            { id: '2', date: addDays(startOfCurrentMonth, 5).toISOString().split('T')[0], type: 'leave', status: 'approved', meta: { user: 'Bob' } },
        ],
        // Note: Calendar component currently dedupes events per day, 
        // ensuring complex Manager views (multiple avatars) might need a custom 'cell render' prop 
        // or specialized event type. The current implementation renders the *first* event prioritized.
    },
};
