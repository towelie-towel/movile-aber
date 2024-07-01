export type Profile = {
    id?: string | null;
    username?: string | null;
    role?: UserRole;
    email?: string | null;
    phone?: string | null;
    slug?: string | null;
    avatar_url?: string | null;
}

export type UserRole = 'client' | 'taxi' | 'admin'

export enum UserRoles {
    CLIENT = 'client',
    TAXI = 'taxi',
    ADMIN = 'admin',
}
