import { User } from '@/lib/types';

export const MOCK_USERS: (User & { password: string })[] = [
    {
        id: 'emp-001',
        name: 'Alice Employee',
        email: 'alice@example.com',
        role: 'employee',
        password: 'password123',
        department: 'Engineering',
        employeeId: 'E-001',
    },
    {
        id: 'mgr-001',
        name: 'Bob Manager',
        email: 'bob@example.com',
        role: 'management',
        password: 'password123',
    },
    {
        id: 'emp-002',
        name: 'Sarah Sales',
        email: 'sarah@example.com',
        role: 'employee',
        password: 'password123',
        department: 'Sales',
        employeeId: 'E-002',
    },
    {
        id: 'emp-003',
        name: 'Mike Marketing',
        email: 'mike@example.com',
        role: 'employee',
        password: 'password123',
        department: 'Marketing',
        employeeId: 'E-003',
    },
    {
        id: 'emp-004',
        name: 'Dave Designer',
        email: 'dave@example.com',
        role: 'employee',
        password: 'password123',
        department: 'Design',
        employeeId: 'E-004',
    }
];

export const addUser = (user: User & { password: string }) => {
    MOCK_USERS.push(user);
};

