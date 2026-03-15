const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
    const url = `${API_URL}${endpoint}`;

    let response = await fetch(url, {
        ...options,
        credentials: 'include',
        headers: {
            ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
            ...options.headers,
        },
    });

    // Handle 403 Forbidden (likely expired access token)
    if (response.status === 403 && !endpoint.includes('/auth/get-refresh-token')) {
        try {
            // Attempt to refresh the token
            const refreshRes = await fetch(`${API_URL}/auth/get-refresh-token`, {
                method: 'GET',
                credentials: 'include'
            });

            if (refreshRes.ok) {
                // Retry the original request
                response = await fetch(url, {
                    ...options,
                    credentials: 'include',
                    headers: {
                        ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
                        ...options.headers,
                    },
                });
            } else {
                // Refresh failed, redirect to login
                if (typeof window !== 'undefined') {
                    window.location.href = '/auth/login?expired=true';
                }
            }
        } catch (error) {
            console.error('Refresh token error:', error);
            if (typeof window !== 'undefined') {
                window.location.href = '/auth/login?expired=true';
            }
        }
    }

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || data.message || 'Something went wrong');
    }

    return data;
}
