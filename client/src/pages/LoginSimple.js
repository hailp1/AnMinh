import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginSimple = () => {
    const [employeeCode, setEmployeeCode] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    employeeCode: employeeCode.trim(),
                    password
                }),
            });

            const data = await response.json();

            if (response.ok) {
                // Lưu token và user
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));

                // Redirect TRỰC TIẾP - không qua hook phức tạp
                if (data.user.role === 'ADMIN') {
                    window.location.href = '/admin/dashboard';
                } else {
                    window.location.href = '/home';
                }
            } else {
                setError(data.message || 'Đăng nhập thất bại');
                setLoading(false);
            }
        } catch (err) {
            console.error('Login error:', err);
            setError('Không thể kết nối đến server');
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #1E4A8B 0%, #F29E2E 100%)',
            padding: '20px'
        }}>
            <div style={{
                background: 'white',
                borderRadius: '20px',
                padding: '40px',
                maxWidth: '400px',
                width: '100%',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
            }}>
                <h1 style={{
                    fontSize: '28px',
                    fontWeight: '700',
                    color: '#1E4A8B',
                    marginBottom: '10px',
                    textAlign: 'center'
                }}>
                    An Minh Business
                </h1>
                <p style={{
                    color: '#666',
                    textAlign: 'center',
                    marginBottom: '30px'
                }}>
                    Đăng nhập hệ thống
                </p>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '8px',
                            fontWeight: '600',
                            color: '#333'
                        }}>
                            Mã nhân viên
                        </label>
                        <input
                            type="text"
                            value={employeeCode}
                            onChange={(e) => setEmployeeCode(e.target.value.toUpperCase())}
                            placeholder="TDV001"
                            style={{
                                width: '100%',
                                padding: '12px',
                                border: '2px solid #e0e0e0',
                                borderRadius: '10px',
                                fontSize: '16px',
                                boxSizing: 'border-box'
                            }}
                            required
                        />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '8px',
                            fontWeight: '600',
                            color: '#333'
                        }}>
                            Mật khẩu
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••"
                            style={{
                                width: '100%',
                                padding: '12px',
                                border: '2px solid #e0e0e0',
                                borderRadius: '10px',
                                fontSize: '16px',
                                boxSizing: 'border-box'
                            }}
                            required
                        />
                    </div>

                    {error && (
                        <div style={{
                            padding: '12px',
                            background: '#fee',
                            border: '1px solid #fcc',
                            borderRadius: '8px',
                            color: '#c00',
                            marginBottom: '20px',
                            fontSize: '14px'
                        }}>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '14px',
                            background: loading ? '#ccc' : '#F29E2E',
                            color: 'white',
                            border: 'none',
                            borderRadius: '10px',
                            fontSize: '16px',
                            fontWeight: '600',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            transition: 'all 0.3s'
                        }}
                    >
                        {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                    </button>
                </form>

                <div style={{
                    marginTop: '20px',
                    textAlign: 'center',
                    fontSize: '12px',
                    color: '#999'
                }}>
                    <p>Test accounts:</p>
                    <p>TDV: TDV001 / 123456</p>
                    <p>Admin: ADMIN001 / 123456</p>
                </div>
            </div>
        </div>
    );
};

export default LoginSimple;
