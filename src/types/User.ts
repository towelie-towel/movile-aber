export type Profile = {
    id: string;
    role: UserRole;
    username?: string | null;
    full_name?: string | null;
    email?: string | null;
    phone?: string | null;
    avatar_url?: string | null;
    cover_img_url?: string | null;
}

export type PublicProfile = Profile & {
    fetch_time: number;
}

export type UserRole = 'client' | 'taxi' | 'admin'
