
import { Button } from "@/components/ui/button";
import { Menu, Bell, User, ChevronLeft, ChevronRight, LogOut, CreditCard } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Link } from "react-router-dom";

interface TopBarProps {
  toggleSidebar: () => void;
  isSidebarCollapsed: boolean;
}

const TopBar = ({ toggleSidebar, isSidebarCollapsed }: TopBarProps) => {
  const { signOut, user } = useAuth();

  return (
    <header className="h-16 border-b border-border flex items-center justify-between px-4 bg-tmcdark-card">
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleSidebar} 
          className="text-muted-foreground hover:text-foreground"
        >
          {isSidebarCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </Button>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="flex items-center px-3 py-1 rounded-full bg-bitcoin/10 text-bitcoin text-sm">
          <span className="mr-1">₿</span>
          <span>42,831.21</span>
        </div>
        
        <Link to="/subscription">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
            <CreditCard className="h-5 w-5" />
          </Button>
        </Link>
        
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <Bell className="h-5 w-5" />
        </Button>
        
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-tmcblue flex items-center justify-center mr-2">
            <User className="h-4 w-4 text-white" />
          </div>
          <span className="mr-2 text-sm hidden md:block">{user?.email}</span>
        </div>
        
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => signOut()} 
          className="text-muted-foreground hover:text-destructive"
          title="Cerrar sesión"
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
};

export default TopBar;
