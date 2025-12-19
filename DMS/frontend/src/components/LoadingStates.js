import React from 'react';

export const LoadingSpinner = ({ message = 'Đang tải...' }) => (
    <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 20px',
        minHeight: '200px'
    }}>
        <div style={{
            width: 48,
            height: 48,
            border: '4px solid #E5E7EB',
            borderTop: '4px solid #1E4A8B',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            marginBottom: 16
        }} />
        <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
        <div style={{
            fontSize: 14,
            color: '#64748B',
            fontWeight: '500'
        }}>
            {message}
        </div>
    </div>
);

export const EmptyState = ({
    icon = '📦',
    title = 'Không có dữ liệu',
    subtitle = 'Dữ liệu sẽ hiển thị ở đây khi có',
    action = null
}) => (
    <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 20px',
        textAlign: 'center'
    }}>
        <div style={{
            fontSize: 64,
            marginBottom: 16,
            opacity: 0.8
        }}>
            {icon}
        </div>
        <h3 style={{
            margin: '0 0 8px 0',
            fontSize: 18,
            fontWeight: 'bold',
            color: '#1E293B'
        }}>
            {title}
        </h3>
        <p style={{
            margin: '0 0 20px 0',
            fontSize: 14,
            color: '#64748B',
            maxWidth: 280
        }}>
            {subtitle}
        </p>
        {action && action}
    </div>
);

export const ErrorState = ({
    message = 'Đã có lỗi xảy ra',
    onRetry = null
}) => (
    <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 20px',
        textAlign: 'center'
    }}>
        <div style={{
            fontSize: 64,
            marginBottom: 16
        }}>
            ⚠️
        </div>
        <h3 style={{
            margin: '0 0 8px 0',
            fontSize: 18,
            fontWeight: 'bold',
            color: '#DC2626'
        }}>
            Oops!
        </h3>
        <p style={{
            margin: '0 0 20px 0',
            fontSize: 14,
            color: '#64748B',
            maxWidth: 280
        }}>
            {message}
        </p>
        {onRetry && (
            <button
                onClick={onRetry}
                style={{
                    padding: '12px 24px',
                    background: '#1E4A8B',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 12,
                    fontSize: 14,
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(30,74,139,0.2)'
                }}
            >
                🔄 Thử lại
            </button>
        )}
    </div>
);

export const SkeletonCard = () => (
    <div style={{
        background: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
    }}>
        <div style={{
            height: 16,
            background: 'linear-gradient(90deg, #F1F5F9 0%, #E2E8F0 50%, #F1F5F9 100%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite',
            borderRadius: 4,
            marginBottom: 8,
            width: '70%'
        }} />
        <div style={{
            height: 12,
            background: 'linear-gradient(90deg, #F1F5F9 0%, #E2E8F0 50%, #F1F5F9 100%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite',
            borderRadius: 4,
            width: '90%'
        }} />
        <style>{`
      @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }
    `}</style>
    </div>
);
