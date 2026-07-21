import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/contexts/AuthContext';
import { SidebarProvider } from '@/contexts/SidebarContext';
import { PermissionsProvider } from '@/contexts/PermissionsContext';
import { AppRouter } from '@/routes/AppRouter';

function App() {
  return (
    <AuthProvider>
      <PermissionsProvider>
        <SidebarProvider>
          <AppRouter />
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#0a1628',
                color: '#fff',
                borderRadius: '12px',
                fontSize: '14px',
              },
            }}
          />
        </SidebarProvider>
      </PermissionsProvider>
    </AuthProvider>
  );
}

export default App;
