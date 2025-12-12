
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

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
