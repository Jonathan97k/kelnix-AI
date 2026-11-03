import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useCallback } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute, PublicOnlyRoute } from './components/auth/ProtectedRoute';
import { Login } from './pages/auth/Login';
import { Signup } from './pages/auth/Signup';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard';
import Editor from './pages/Editor';
import Media from './pages/Media';
import { CreateContent } from './pages/CreateContent';
import Businesses from './pages/Businesses';
import Content from './pages/Content';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import { CommandChat } from './components/CommandChat';
import { PhotoSlide, ReelConfig } from './types';

function App() {
  const [showChat, setShowChat] = useState(false);
  const [chatProps, setChatProps] = useState({
    slideCount: 0,
    theme: '',
    tone: '',
    aspectRatio: '9:16',
    title: '',
  });

  const toggleChat = useCallback(() => setShowChat((prev) => !prev), []);

  const updateChatProps = useCallback((props: Partial<typeof chatProps>) => {
    setChatProps((prev) => ({ ...prev, ...props }));
  }, []);

  const chatPanel = (
    <CommandChat
      slideCount={chatProps.slideCount}
      theme={chatProps.theme}
      tone={chatProps.tone}
      aspectRatio={chatProps.aspectRatio}
      title={chatProps.title}
      onApplyScript={(script) => {
        // Script applied - editor will pick this up via context
      }}
      onUpdateConfig={(config) => {
        // Config updated
      }}
      onUpdateSlide={(index, partial) => {
        // Slide updated
      }}
      onBulkEffect={(effect, value) => {
        // Bulk effect applied
      }}
    />
  );

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path='/login' element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
          <Route path='/signup' element={<PublicOnlyRoute><Signup /></PublicOnlyRoute>} />
          <Route path='/' element={
            <ProtectedRoute>
              <MainLayout
                rightPanel={chatPanel}
                showRightPanel={showChat}
                onToggleRightPanel={toggleChat}
              >
                <Dashboard />
              </MainLayout>
            </ProtectedRoute>
          } />
          <Route path='/dashboard' element={
            <ProtectedRoute>
              <MainLayout
                rightPanel={chatPanel}
                showRightPanel={showChat}
                onToggleRightPanel={toggleChat}
              >
                <Dashboard />
              </MainLayout>
            </ProtectedRoute>
          } />
          <Route path='/create' element={
            <ProtectedRoute>
              <MainLayout
                rightPanel={chatPanel}
                showRightPanel={showChat}
                onToggleRightPanel={toggleChat}
              >
                <CreateContent />
              </MainLayout>
            </ProtectedRoute>
          } />
          <Route path='/editor' element={
            <ProtectedRoute>
              <MainLayout
                rightPanel={chatPanel}
                showRightPanel={showChat}
                onToggleRightPanel={toggleChat}
              >
                <Editor />
              </MainLayout>
            </ProtectedRoute>
          } />
          <Route path='/media' element={
            <ProtectedRoute>
              <MainLayout
                rightPanel={chatPanel}
                showRightPanel={showChat}
                onToggleRightPanel={toggleChat}
              >
                <Media />
              </MainLayout>
            </ProtectedRoute>
          } />
          <Route path='/businesses' element={
            <ProtectedRoute>
              <MainLayout
                rightPanel={chatPanel}
                showRightPanel={showChat}
                onToggleRightPanel={toggleChat}
              >
                <Businesses />
              </MainLayout>
            </ProtectedRoute>
          } />
          <Route path='/content' element={
            <ProtectedRoute>
              <MainLayout
                rightPanel={chatPanel}
                showRightPanel={showChat}
                onToggleRightPanel={toggleChat}
              >
                <Content />
              </MainLayout>
            </ProtectedRoute>
          } />
          <Route path='/analytics' element={
            <ProtectedRoute>
              <MainLayout
                rightPanel={chatPanel}
                showRightPanel={showChat}
                onToggleRightPanel={toggleChat}
              >
                <Analytics />
              </MainLayout>
            </ProtectedRoute>
          } />
          <Route path='/settings' element={
            <ProtectedRoute>
              <MainLayout
                rightPanel={chatPanel}
                showRightPanel={showChat}
                onToggleRightPanel={toggleChat}
              >
                <Settings />
              </MainLayout>
            </ProtectedRoute>
          } />
          <Route path='*' element={<Navigate to='/dashboard' replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
export default App;
