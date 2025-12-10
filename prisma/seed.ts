
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
