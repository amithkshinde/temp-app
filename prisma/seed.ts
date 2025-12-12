
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// 2026 Holidays + Dec 2025
const PUBLIC_HOLIDAYS_SEED = [
    { id: 'h-1', date: '2026-01-01', name: "New Year's Day", type: 'public' },
    { id: 'h-2', date: '2026-01-14', name: "Pongal / Makar Sankranti", type: 'public' },
    { id: 'h-3', date: '2026-03-04', name: "Holi", type: 'public' },
    { id: 'h-4', date: '2026-03-20', name: "Eid ul-Fitr", type: 'public' },
    { id: 'h-5', date: '2026-04-03', name: "Good Friday", type: 'public' },
    { id: 'h-6', date: '2026-04-14', name: "Vishu", type: 'public' },
    { id: 'h-7', date: '2026-05-01', name: "Labour Day", type: 'public' },
    { id: 'h-8', date: '2026-08-15', name: "Independence Day", type: 'public' },
    { id: 'h-9', date: '2026-08-25', name: "Eid-e-Milad", type: 'public' },
    { id: 'h-10', date: '2026-08-26', name: "Onam", type: 'public' },
    { id: 'h-11', date: '2026-09-14', name: "Ganesh Chaturthi", type: 'public' },
    { id: 'h-12', date: '2026-10-02', name: "Gandhi Jayanti", type: 'public' },
    { id: 'h-13', date: '2026-10-20', name: "Dussehra / Vijayadashami", type: 'public' },
    { id: 'h-14', date: '2026-11-08', name: "Diwali / Deepavali", type: 'public' },
    { id: 'h-15', date: '2026-12-25', name: "Christmas", type: 'public' },
    { id: 'h-16', date: '2025-12-25', name: "Christmas", type: 'public' },
];

const MOCK_USERS = [
    {
        id: 'emp-001',
        name: 'Alice Employee',
        email: 'alice@twistopen.in',
        role: 'employee',
        password: 'password123',
        department: 'Engineering',
        employeeId: 'E-001',
    },
    {
        id: 'mgr-001',
        name: 'Bob Manager',
        email: 'bob@twistopen.in',
        role: 'management',
        password: 'password123',
    },
    {
        id: 'emp-002',
        name: 'Sarah Sales',
        email: 'sarah@twistopen.in',
        role: 'employee',
        password: 'password123',
        department: 'Sales',
        employeeId: 'E-002',
    },
    {
        id: 'emp-003',
        name: 'Mike Marketing',
        email: 'mike@twistopen.in',
        role: 'employee',
        password: 'password123',
        department: 'Marketing',
        employeeId: 'E-003',
    },
    {
        id: 'emp-004',
        name: 'Dave Designer',
        email: 'dave@twistopen.in',
        role: 'employee',
        password: 'password123',
        department: 'Design',
        employeeId: 'E-004',
    }
];

async function main() {
    console.log(`Start seeding ...`)
    for (const u of MOCK_USERS) {
        const user = await prisma.user.upsert({
            where: { email: u.email },
            update: {},
            create: {
                id: u.id,
                email: u.email,
                name: u.name,
                password: u.password,
                role: u.role,
                department: u.department,
                employeeId: u.employeeId,
            },
        })
        console.log(`Created user with id: ${user.id}`)
    }

    // Seed Leaves for Alice (emp-001) to test Calendar States
    const ALICE_LEAVES = [
        { id: 'l-seed-001', startDate: '2025-12-08', endDate: '2025-12-08', type: 'sick', status: 'approved', reason: 'Sick: Migraine', userId: 'emp-001' },
        { id: 'l-seed-002', startDate: '2025-12-15', endDate: '2025-12-17', type: 'planned', status: 'pending', reason: 'Personal: Vacation', userId: 'emp-001' },
        { id: 'l-seed-003', startDate: '2025-12-22', endDate: '2025-12-22', type: 'planned', status: 'rejected', reason: 'Other: Urgent work', userId: 'emp-001' }
    ];

    for (const l of ALICE_LEAVES) {
        await prisma.leave.upsert({
            where: { id: l.id },
            update: {
                status: l.status, // Ensure status is updated if re-run
                startDate: l.startDate
            },
            create: l
        });
        console.log(`Created leave ${l.status} for Alice`);
    }
    console.log(`Seeding finished.`)

    // Seed Holidays
    for (const h of PUBLIC_HOLIDAYS_SEED) {
        await prisma.holiday.upsert({
            where: { id: h.id },
            update: { date: h.date, name: h.name },
            create: h
        });
    }
    console.log(`Seeded ${PUBLIC_HOLIDAYS_SEED.length} holidays.`);
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
