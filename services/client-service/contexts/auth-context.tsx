'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { fetchApi } from '@/lib/api';
import { User } from '@/lib/types';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const pathname = usePathname();

    const refreshUser = async () => {
        setIsLoading(true);
        try {
            const data = await fetchApi('/auth/me');
            if (data.userDetails) {
                setUser({
                    id: data.userDetails.id,
                    name: data.userDetails.name,
                    email: data.userDetails.email,
                    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.userDetails.name}`,
                });
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error('Failed to fetch user:', error);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // Skip auth check if we're on a public auth page
        if (pathname?.startsWith('/auth')) {
            if (isLoading) setIsLoading(false);
            return;
        }

        // If we move to a protected page and don't have a user, fetch them
        if (!user) {
            refreshUser();
        }
    }, [pathname]);

    return (
        <AuthContext.Provider value={{ user, isLoading, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
