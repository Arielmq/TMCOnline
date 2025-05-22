
import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const [isChecked, setIsChecked] = useState(false);
  const location = useLocation();
  
  useEffect(() => {
    if (!loading) {
      setIsChecked(true);
    }
  }, [loading]);

  // Mientras está cargando, mostramos el spinner
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-tmcdark">
        <div className="animate-spin w-10 h-10 border-4 border-bitcoin border-t-transparent rounded-full" />
      </div>
    );
  }
  
  // Si ya se verificó y no hay usuario, redirigimos a /auth
  if (isChecked && !user) {
    return <Navigate to="/auth" replace />;
  }
  
  // Si hay usuario y ya se ha comprobado, renderizamos el contenido protegido
  return <>{children}</>;
};

export default ProtectedRoute;
