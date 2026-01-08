// =====================
// API Configuration
// =====================

const API_CONFIG = {
    // Use localhost when developing, Render URL for production
    baseURL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
        ? 'http://localhost:3000/api' 
        : 'https://whizwizard-backend.onrender.com/api',
    timeout: 10000
};

// =====================
// API Client
// =====================

class ApiClient {
    constructor() {
        this.baseURL = API_CONFIG.baseURL;
        this.token = localStorage.getItem('authToken');
    }

    // Set token
    setToken(token) {
        this.token = token;
        if (token) {
            localStorage.setItem('authToken', token);
        } else {
            localStorage.removeItem('authToken');
        }
    }

    // Get token
    getToken() {
        return this.token || localStorage.getItem('authToken');
    }

    // Make request
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        // Add authorization token if available
        const token = this.getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const config = {
            ...options,
            headers
        };

        try {
            console.log('API Request:', { url, method: config.method || 'GET' });
            const response = await fetch(url, config);
            
            let data;
            try {
                data = await response.json();
            } catch (e) {
                console.error('Failed to parse response:', e);
                throw new Error('Server returned invalid response');
            }

            console.log('API Response:', { url, status: response.status, data });

            if (!response.ok) {
                throw new Error(data.message || data.error || 'Request failed');
            }

            return data;
        } catch (error) {
            console.error('API Request Error:', { url, error: error.message });
            throw error;
        }
    }

    // GET request
    async get(endpoint) {
        return this.request(endpoint, {
            method: 'GET'
        });
    }

    // POST request
    async post(endpoint, body) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(body)
        });
    }

    // PUT request
    async put(endpoint, body) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(body)
        });
    }

    // DELETE request
    async delete(endpoint) {
        return this.request(endpoint, {
            method: 'DELETE'
        });
    }
}

// Create global API instance
const API = new ApiClient();

// =====================
// Authentication API
// =====================
API.auth = {
    async login(email, password) {
        return API.post('/auth/login', { email, password });
    },
    
    async register(name, email, password) {
        return API.post('/auth/register', { name, email, password });
    },
    
    async googleSignIn(idToken, email, name, photoURL) {
        return API.post('/auth/google', { idToken, email, name, photoURL });
    }
};
