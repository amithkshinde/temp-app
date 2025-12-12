
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// 2026 Holidays + Dec 2025
const PUBLIC_HOLIDAYS_SEED = [
    { id: 'h-1', date: '2026-01-01', name: "New Year's Day", type: 'public' },
    { id: 'h-2', date: '2026-01-14', name: "Pongal / Makar Sankranti", type: 'public' },
    { id: 'h-3', date: '2026-03-04', name: "Holi", type: 'public' },
    { id: 'h-4', date: '2026-03-20', name: "Eid ul-Fitr", type: 'public' }, // Approx date
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

    // 2025
    { id: 'h-16', date: '2025-12-25', name: "Christmas", type: 'public' }
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
    },
    {
        id: 'emp-005',
        name: 'Amith Employee',
        email: 'amith@twistopen.in',
        role: 'employee',
        password: 'password123',
        department: 'Product',
        employeeId: 'E-005'
    }
];

async function main() {
    console.log(`Start seeding ...`)

    // Seed Users
    for (const u of MOCK_USERS) {
        await prisma.user.upsert({
            where: { email: u.email },
            update: {},
            create: u,
        })
        console.log(`Created user with id: ${u.id}`)
    }

    // --- Leaves for Alice (Existing) ---
    await prisma.leave.create({
        data: {
            userId: 'emp-001',
            startDate: '2025-12-08',
            endDate: '2025-12-08',
            reason: 'Sick Leave',
            type: 'sick',
            status: 'approved'
        }
    });

    await prisma.leave.create({
        data: {
            userId: 'emp-001',
            startDate: '2025-12-15',
            endDate: '2025-12-17',
            reason: 'Planned Vacation',
            type: 'planned',
            status: 'pending'
        }
    });

    await prisma.leave.create({
        data: {
            userId: 'emp-001',
            startDate: '2025-12-22',
            endDate: '2025-12-22',
            reason: 'Urgent Work',
            type: 'planned',
            status: 'rejected'
        }
    });
    console.log("Seeded Alice's leaves");

    // --- Leaves for Amith (New Requirement) ---
    const amithId = 'emp-005';

    // 1. Dec 5, 2025: Approved (Completed)
    await prisma.leave.create({
        data: {
            userId: amithId,
            startDate: '2025-12-05',
            endDate: '2025-12-05',
            reason: 'Sick Leave (Completed)',
            type: 'sick',
            status: 'approved'
        }
    });

    // 2. Dec 10, 2025: Rejected
    await prisma.leave.create({
        data: {
            userId: amithId,
            startDate: '2025-12-10',
            endDate: '2025-12-10',
            reason: 'Personal Leave',
            type: 'planned',
            status: 'rejected'
        }
    });

    // 3. Dec 22, 2025: Pending
    await prisma.leave.create({
        data: {
            userId: amithId,
            startDate: '2025-12-22',
            endDate: '2025-12-22',
            reason: 'Personal Leave',
            type: 'planned',
            status: 'pending'
        }
    });

    // 4. Dec 23, 2025: Approved (Upcoming)
    await prisma.leave.create({
        data: {
            userId: amithId,
            startDate: '2025-12-23',
            endDate: '2025-12-23',
            reason: 'Planned Leave',
            type: 'planned',
            status: 'approved'
        }
    });
    console.log("Seeded Amith's leaves");

    // Seed Holidays
    for (const h of PUBLIC_HOLIDAYS_SEED) {
        await prisma.holiday.upsert({
            where: { id: h.id },
            update: { date: h.date, name: h.name },
            create: h
        });
    }
    console.log(`Seeded ${PUBLIC_HOLIDAYS_SEED.length} holidays.`);
    console.log(`Seeding finished.`)
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
