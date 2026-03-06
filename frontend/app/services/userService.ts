import { fetchApi } from '../../services/api';

export interface User {
    id: string;
    email: string;
    fullName: string;
    phone: string;
    role: 'customer' | 'pharmacist' | 'admin';
    createdAt?: string;
}

export interface CreateUserDto {
    email: string;
    fullName: string;
    phone: string;
    password: string;
    role?: 'pharmacist';
}

export const userService = {
    getUsers: async (): Promise<User[]> => {
        return fetchApi<User[]>('/users');
    },

    createUser: async (data: CreateUserDto): Promise<User> => {
        return fetchApi<User>('/users', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    deleteUser: async (id: string): Promise<void> => {
        return fetchApi<void>(`/users/${id}`, {
            method: 'DELETE',
        });
    },
};
