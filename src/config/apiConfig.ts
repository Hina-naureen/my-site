const isProd = process.env.NODE_ENV === 'production';

export const BACKEND_URL = isProd
  ? 'https://physai-backend.onrender.com'
  : 'http://127.0.0.1:8000';

export const API_BASE = BACKEND_URL;
