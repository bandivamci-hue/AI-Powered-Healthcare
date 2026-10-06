import React from 'react';

/**
 * Universal Reusable Loading Spinner Component.
 * Features smooth, continuous linear rotation with zero jitter or bouncing.
 * Only the circular indicator rotates, keeping surrounding UI stable.
 */
const LoadingSpinner = ({ 
  size = 20, 
  color = 'currentColor', 
  strokeWidth = 2.5,
  className = '',
  style = {},
  label = 'Loading...'
}) => {
  return (
    <span
      role="status"
      aria-label={label}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: `${size}px`,
        height: `${size}px`,
        lineHeight: 0,
        verticalAlign: 'middle',
        flexShrink: 0,
        ...style
      }}
      className={className}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          animation: 'medicare-spin 0.8s linear infinite',
          transformOrigin: 'center center'
        }}
      >
        {/* Background track circle */}
        <circle
          cx="12"
          cy="12"
          r="9.5"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeOpacity="0.2"
        />
        {/* Rotating foreground arc */}
        <path
          d="M12 2.5C17.2467 2.5 21.5 6.75329 21.5 12C21.5 14.3644 20.6384 16.5276 19.2078 18.1922"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
      </svg>
      <style>{`
        @keyframes medicare-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </span>
  );
};

export default LoadingSpinner;
