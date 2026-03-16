import { fetchApi } from '../../services/api';

export interface CreatePharmacistDto {
    email: string;
    fullName: string;
    phoneNumber: string;
    password: string;
}

export const userService = {
    createPharmacist: async (data: CreatePharmacistDto) => {
        return fetchApi('/users/admin/pharmacists', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },
};