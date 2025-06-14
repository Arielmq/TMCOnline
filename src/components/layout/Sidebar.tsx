// src/components/Sidebar.tsx
import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Cpu,
  Cloud,
  Activity,
  HelpCircle,
  FileText,
  MessageSquare,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isCollapsed: boolean;
}

interface NavItem {
  title: string;
  icon: React.ElementType;
  path: string;
}

const Sidebar = ({ isCollapsed }: SidebarProps) => {
  const [version] = useState("v1.0.0");

  const navItems: NavItem[] = [
    { title: "Dashboard",    icon: LayoutDashboard, path: "/app" },
    { title: "Workers",      icon: Cpu,             path: "/workers" },
     { title: "ASICs Check", icon: Cpu, path: "/asics-check" },
    { title: "Health Check", icon: Activity,        path: "/health-check" },
    { title: "How It Works", icon: HelpCircle,      path: "/how-it-works" },
    { title: "Contact",      icon: MessageSquare,   path: "/contact" },
   
   
  ];

  return (
    <aside
      className={cn(
        "bg-sidebar h-full transition-width duration-300 border-r border-sidebar-border flex flex-col",
        isCollapsed ? "w-[70px]" : "w-[250px]"
      )}
    >
      {/* Logo */}
      <div className="p-4 flex items-center justify-center">
        {isCollapsed ? (
          <div className="w-10 h-10 rounded-full bg-bitcoin flex items-center justify-center text-white font-bold text-xl">
            <img
              src="https://res.cloudinary.com/dd6eoxgul/image/upload/v1747948412/asssd-removebg-preview_qxxqm7.png"
              alt="Logo"
            />
          </div>
        ) : (
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-bitcoin flex items-center justify-center text-white font-bold text-xl mr-2">
              <img
                src="https://res.cloudinary.com/dd6eoxgul/image/upload/v1748027634/removed-removebg-preview_iosrkj.png"
                alt="Logo"
              />
            </div>
            <span className="text-xl font-bold text-white">Hashira AI</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="mt-4 flex-1 overflow-y-auto">
        <nav className="px-2">
          {navItems.map((item) => (
            <NavLink
              key={item.title}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                cn(
                  "flex items-center px-3 py-2 mt-1 rounded-md transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-primary"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                )
              }
            >
              <item.icon
                className={cn(
                  "h-5 w-5",
                  ({ isActive }: { isActive: boolean }) =>
                    isActive ? "text-bitcoin" : ""
                )}
              />
              {!isCollapsed && <span className="ml-3">{item.title}</span>}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <div
          className={cn(
            "flex items-center text-sidebar-foreground",
            isCollapsed ? "justify-center" : "justify-between"
          )}
        >
          {!isCollapsed && <span className="text-xs">{version}</span>}
          <div className="h-6 w-6 rounded-full bg-bitcoin/20 flex items-center justify-center">
            <span className="text-bitcoin text-xs">₿</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
