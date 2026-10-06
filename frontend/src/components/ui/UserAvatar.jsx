import React from 'react';

const UserAvatar = ({ name, size = 40, fontSize = 16 }) => {
  const initial = name ? name.trim().charAt(0).toUpperCase() : 'U';

  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        backgroundColor: 'var(--primary-green)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 800,
        fontSize: `${fontSize}px`,
        boxShadow: '0 2px 6px rgba(22, 165, 122, 0.3)',
        flexShrink: 0,
        userSelect: 'none'
      }}
    >
      {initial}
    </div>
  );
};

export default UserAvatar;
