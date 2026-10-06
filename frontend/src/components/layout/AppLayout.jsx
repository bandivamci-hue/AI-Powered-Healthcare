import React, { useState } from 'react';
import AppSidebar from './AppSidebar';
import AppHeader from './AppHeader';
import FloatingAiChatbot from '../chat/FloatingAiChatbot';
import FloatingSosButton from '../emergency/FloatingSosButton';

const AppLayout = ({ children }) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="app-shell">
      <AppSidebar 
        isOpen={mobileSidebarOpen} 
        onClose={() => setMobileSidebarOpen(false)} 
      />
      <div className="app-main dashboard-bg-wrapper">
        <AppHeader 
          onToggleSidebar={() => setMobileSidebarOpen(prev => !prev)} 
          isSidebarOpen={mobileSidebarOpen}
        />
        <main className="app-content">
          {children}
        </main>
      </div>

      {/* Global Persistent Emergency SOS & Floating AI Assistant */}
      <FloatingSosButton />
      <FloatingAiChatbot />
    </div>
  );
};

export default AppLayout;