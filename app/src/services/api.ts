export const API_BASE_URL = 'http://localhost:3001/api';

interface RequestOptions extends RequestInit {
    token?: string;
    skipAuthRefresh?: boolean;
}

class ApiService {
    private refreshPromise: Promise<string | null> | null = null;

    private getHeaders(token?: string): HeadersInit {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        const storedToken = token || localStorage.getItem('token');
        if (storedToken) {
            headers['Authorization'] = `Bearer ${storedToken}`;
        }

        return headers;
    }

    private async refreshAccessToken(): Promise<string | null> {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) return null;

        if (!this.refreshPromise) {
            this.refreshPromise = (async () => {
                try {
                    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ refreshToken }),
                    });

                    const data = await response.json().catch(() => null);
                    if (!response.ok) return null;

                    const newAccessToken = data?.data?.accessToken;
                    const newRefreshToken = data?.data?.refreshToken;

                    if (!newAccessToken) return null;

                    localStorage.setItem('token', newAccessToken);
                    if (newRefreshToken) {
                        localStorage.setItem('refreshToken', newRefreshToken);
                    }
                    return newAccessToken;
                } catch {
                    return null;
                } finally {
                    this.refreshPromise = null;
                }
            })();
        }

        return this.refreshPromise;
    }

    private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
        const url = `${API_BASE_URL}${endpoint}`;
        const headers = this.getHeaders(options.token);

        const response = await fetch(url, {
            ...options,
            headers: {
                ...headers,
                ...options.headers,
            },
        });

        const contentType = response.headers.get('content-type') || '';
        const isJson = contentType.includes('application/json');
        const data = isJson ? await response.json() : null;

        if (response.status === 401 && !options.skipAuthRefresh && endpoint !== '/auth/login' && endpoint !== '/auth/refresh') {
            const refreshedToken = await this.refreshAccessToken();
            if (refreshedToken) {
                return this.request<T>(endpoint, {
                    ...options,
                    token: refreshedToken,
                    skipAuthRefresh: true,
                });
            }

            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            window.dispatchEvent(new Event('storage'));
            throw new Error('Sesión expirada. Inicia sesión nuevamente.');
        }

        if (!response.ok) {
            const message =
                data?.message ||
                data?.error ||
                (typeof data === 'string' ? data : null) ||
                `Error ${response.status} en la petición`;
            throw new Error(message);
        }

        return data as T;
    }

    get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
        return this.request<T>(endpoint, { ...options, method: 'GET' });
    }

    post<T>(endpoint: string, body: any, options?: RequestOptions): Promise<T> {
        return this.request<T>(endpoint, {
            ...options,
            method: 'POST',
            body: JSON.stringify(body),
        });
    }

    put<T>(endpoint: string, body: any, options?: RequestOptions): Promise<T> {
        return this.request<T>(endpoint, {
            ...options,
            method: 'PUT',
            body: JSON.stringify(body),
        });
    }

    delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
        return this.request<T>(endpoint, { ...options, method: 'DELETE' });
    }
}

export const api = new ApiService();

