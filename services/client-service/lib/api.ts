const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
    const url = `${API_URL}${endpoint}`;

    const response = await fetch(url, {
        ...options,
        credentials: 'include',
        headers: {
            ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
            ...options.headers,
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || data.message || 'Something went wrong');
    }

    return data;
}
