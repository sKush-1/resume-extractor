import { getDeviceId, getFingerprint } from './fingerprint';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
    const url = `${API_URL}${endpoint}`;

    const deviceId = getDeviceId();
    const fingerprint = getFingerprint();

    let response = await fetch(url, {
        ...options,
        credentials: 'include',
        headers: {
            ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
            'x-device-id': deviceId,
            'x-fingerprint': fingerprint,
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
                        'x-device-id': deviceId,
                        'x-fingerprint': fingerprint,
                        ...options.headers,
                    },
                });
            } else {
                // Refresh failed, redirect to login unless already on auth page
                if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/auth')) {
                    window.location.href = '/auth/login?expired=true';
                }
            }
        } catch (error) {
            console.error('Refresh token error:', error);
            if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/auth')) {
                window.location.href = '/auth/login?expired=true';
            }
        }
    }

    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
        data = await response.json().catch(() => ({ error: 'Failed to parse JSON' }));
    } else {
        const text = await response.text();
        data = { error: text.slice(0, 100) || `Server error ${response.status}` };
    }

    if (!response.ok) {
        let errorMessage = `Request failed (${response.status})`;
        if (typeof data.error === 'string') {
            errorMessage = data.error;
        } else if (data.message && typeof data.message === 'string') {
            errorMessage = data.message;
        } else if (data.error && typeof data.error !== 'boolean') {
            errorMessage = String(data.error);
        }
        throw new Error(errorMessage);
    }

    return data;
}
