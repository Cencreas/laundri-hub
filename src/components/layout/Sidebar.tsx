import { useState } from "react";
import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  ShirtIcon, 
  CreditCard, 
  Menu,
  X,
  Droplets
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Clientes", href: "/clientes", icon: Users },
  { name: "Ordens de Serviço", href: "/ordens", icon: ShirtIcon },
  { name: "Pagamentos", href: "/pagamentos", icon: CreditCard },
];

export const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <>
      {/* Mobile backdrop */}
      {!isCollapsed && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsCollapsed(true)}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "fixed top-0 left-0 z-50 h-full bg-card border-r border-border transition-all duration-300 lg:relative lg:translate-x-0",
        isCollapsed ? "-translate-x-full lg:w-16" : "w-64 translate-x-0"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className={cn(
            "flex items-center gap-2 transition-opacity duration-300",
            isCollapsed ? "lg:opacity-0" : "opacity-100"
          )}>
            <Droplets className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-foreground">AquaClean</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-8 w-8"
          >
            {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-accent",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-soft" 
                  : "text-muted-foreground hover:text-foreground",
                isCollapsed && "lg:justify-center lg:px-2"
              )}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              <span className={cn(
                "transition-opacity duration-300",
                isCollapsed ? "lg:opacity-0 lg:w-0" : "opacity-100"
              )}>
                {item.name}
              </span>
            </NavLink>
          ))}
        </nav>

        {/* Collapsed indicator */}
        {isCollapsed && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 hidden lg:block">
            <div className="w-8 h-1 bg-primary rounded-full" />
          </div>
        )}
      </div>

      {/* Mobile toggle button */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="fixed top-4 left-4 z-40 lg:hidden"
      >
        <Menu className="h-4 w-4" />
      </Button>
    </>
  );
};