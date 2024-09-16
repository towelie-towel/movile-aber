export type Profile = {
    id?: string | null;
    username?: string | null;
    full_name?: string | null;
    role?: UserRole;
    email?: string | null;
    phone?: string | null;
    avatar_url?: string | null;
    cover_img_url?: string | null;
}

export type UserRole = 'client' | 'taxi' | 'admin'
