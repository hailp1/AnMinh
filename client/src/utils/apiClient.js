// API Client với retry và error handling tốt hơn
const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

// Helper function để kiểm tra backend có sẵn sàng không
async function checkBackendHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}`, {
      method: 'GET',
      signal: AbortSignal.timeout(3000) // 3 seconds timeout
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}

// API call với retry logic
async function apiCall(endpoint, options = {}, retries = 2) {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = localStorage.getItem('token') || '';
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'x-auth-token': token }),
    },
    signal: AbortSignal.timeout(30000), // 30 seconds timeout
  };

  const config = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, config);
      
      // Kiểm tra content-type
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        
        // Nếu là HTML error page (proxy error)
        if (text.includes('<!DOCTYPE') || text.includes('html')) {
          throw new Error('Backend không phản hồi đúng định dạng. Vui lòng kiểm tra backend có đang chạy không.');
        }
        
        throw new Error(`Unexpected content-type: ${contentType}`);
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'API request failed');
      }

      return { success: true, data };
      
    } catch (error) {
      // Nếu là timeout hoặc network error và còn retries
      if (attempt < retries && (error.name === 'TimeoutError' || error.name === 'TypeError')) {
        console.warn(`API call failed, retrying... (${attempt + 1}/${retries})`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1))); // Exponential backoff
        continue;
      }

      // Kiểm tra xem có phải lỗi kết nối backend không
      if (error.message.includes('fetch') || error.message.includes('network')) {
        const backendHealth = await checkBackendHealth();
        if (!backendHealth) {
          return {
            success: false,
            error: 'Backend không khả dụng. Vui lòng kiểm tra backend có đang chạy trên port 5000 không.',
            backendDown: true
          };
        }
      }

      return {
        success: false,
        error: error.message || 'Có lỗi xảy ra',
        backendDown: false
      };
    }
  }
}

// Login với error handling tốt hơn
export async function login(employeeCode, password) {
  const result = await apiCall('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ employeeCode, password }),
  });

  if (!result.success) {
    return {
      success: false,
      message: result.error || 'Đăng nhập thất bại',
      backendDown: result.backendDown || false
    };
  }

  return {
    success: true,
    token: result.data.token,
    user: result.data.user
  };
}

export default apiCall;

