import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Menu,
  Bell,
  User,
  ChevronLeft,
  ChevronRight,
  LogOut,
  CreditCard,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Link } from "react-router-dom";

interface TopBarProps {
  toggleSidebar: () => void;
  isSidebarCollapsed: boolean;
}

const TopBar = ({ toggleSidebar, isSidebarCollapsed }: TopBarProps) => {
  const { logOut, user } = useAuth();
  const [btcPrice, setBtcPrice] = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchBtcPrice = async () => {
      try {
        const res = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd"
        );
        const data = await res.json();
        if (isMounted && data.bitcoin?.usd) {
          setBtcPrice(data.bitcoin.usd);
        }
      } catch (error) {
        console.error("Error fetching BTC price:", error);
      }
    };

    // Primera carga
    fetchBtcPrice();
    // Actualizar cada 60 segundos
    const intervalId = setInterval(fetchBtcPrice, 10_000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  return (
    <header className="h-16 border-b border-border flex items-center justify-between px-4 bg-tmcdark-card">
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="text-muted-foreground hover:text-foreground"
        >
          {isSidebarCollapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center px-3 py-1 rounded-full bg-bitcoin/10 text-bitcoin text-sm">
          <span className="mr-1">₿</span>
          <span>
            {btcPrice !== null
              ? btcPrice.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })
              : "..."}
          </span>
        </div>

        <Link to="/subscription">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground"
          >
            <CreditCard className="h-5 w-5" />
          </Button>
        </Link>

        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground"
        >
          <Bell className="h-5 w-5" />
        </Button>

        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-tmcblue flex items-center justify-center mr-2">
            <User className="h-4 w-4 text-white" />
          </div>
          <span className="mr-2 text-sm hidden md:block">
            {user?.email}
          </span>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => logOut()}
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
