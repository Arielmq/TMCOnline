
import { Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useLocation } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-tmcdark p-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-full bitcoin-gradient mx-auto flex items-center justify-center mb-6">
          <span className="text-white text-xl font-bold">404</span>
        </div>
        
        <h1 className="text-3xl font-bold text-white mb-2">Page Not Found</h1>
        <p className="text-muted-foreground mb-6">
          The page you're looking for doesn't exist or has been moved.
        </p>
        
        <Button asChild className="bg-bitcoin hover:bg-bitcoin/90 text-white">
          <Link to="/">Return to Dashboard</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
