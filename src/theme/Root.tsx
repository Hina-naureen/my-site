/**
 * Docusaurus Root wrapper.
 * Provides AuthProvider + UrduProvider globally and injects the floating ChatWidget.
 */
import React from 'react';
import { AuthProvider } from '@site/src/components/auth/AuthContext';
import { UrduProvider } from '@site/src/context/UrduContext';
import FloatingChatbot from '@site/src/chatbot/FloatingChatbot';

export default function Root({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <AuthProvider>
      <UrduProvider>
        {children}
        <FloatingChatbot />
      </UrduProvider>
    </AuthProvider>
  );
}
