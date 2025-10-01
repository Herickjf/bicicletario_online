import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/auth-context";
import { ThemeToggle } from "@/components/theme-toggle";
import { Bike, Building2, Calendar, CreditCard, Home, LogOut, Settings, Users, BarChart3, MapPin, Package } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}
const getMenuItems = (role: string) => {
  const baseItems = [
    {
      icon: Home,
      label: "Dashboard",
      href: "/dashboard"
    },
    {
      icon: Building2,
      label: "Bicicletários",
      href: "/bikeracks"
    }
  ];
  switch (role) {
    case 'owner':
      return [...baseItems, {
        icon: Bike,
        label: "Bicicletas",
        href: "/bikes"
      }, {
        icon: Calendar,
        label: "Aluguéis",
        href: "/rentals"
      }, {
        icon: Users,
        label: "Usuários",
        href: "/users"
      }, {
        icon: Package,
        label: "Planos",
        href: "/plans"
      }, {
        icon: BarChart3,
        label: "Relatórios",
        href: "/reports"
      },{
        icon: Settings,
        label: "Configurações",
        href: "/settings"
      }];
    case 'manager':
      return [...baseItems, {
        icon: Bike,
        label: "Bicicletas",
        href: "/bikes"
      }, {
        icon: Calendar,
        label: "Aluguéis",
        href: "/rentals"
      }, {
        icon: Users,
        label: "Usuários",
        href: "/users"
      }, {
        icon: Package,
        label: "Planos",
        href: "/plans"
      }, {
        icon: BarChart3,
        label: "Relatórios",
        href: "/reports"
      },{
        icon: Settings,
        label: "Configurações",
        href: "/settings"
      }];
    case 'attendant':
      return [...baseItems, {
        icon: Calendar,
        label: "Aluguéis",
        href: "/rentals"
      }, {
        icon: Users,
        label: "Usuários",
        href: "/users"
      }, {
        icon: Bike,
        label: "Bicicletas",
        href: "/bikes"
      },{
        icon: Settings,
        label: "Configurações",
        href: "/settings"
      }];
    case 'customer':
      return [...baseItems, {
        icon: Calendar,
        label: "Meus Aluguéis",
        href: "/rentals"
      }, {
        icon: CreditCard,
        label: "Planos",
        href: "/plans"
      }, {
        icon: Settings,
        label: "Configurações",
        href: "/settings"
      }];
    default:
      return baseItems;
  }
};
export function Sidebar({
  className
}: SidebarProps) {
  const {
    user,
    userRole,
    logout
  } = useAuth();
  const [menuItems, setMenuItems] = useState([]);
  
  const location = useLocation();
  
  if (!user) return null;

  useEffect(() => {
    setMenuItems(getMenuItems(userRole));
  }, [userRole]);

  return <div className={cn("pb-12 w-64", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="flex items-center gap-2 mb-6">
            <Bike className="h-12 w-12 text-primary" />
            <h2 className="text-lg font-semibold tracking-tight">
              BikeRack - Online
            </h2>
          </div>
          <div className="space-y-1">
            <ScrollArea className="h-[400px] w-full">
              {menuItems.map(item => <Button key={item.href} variant={location.pathname === item.href ? "secondary" : "ghost"} className="w-full justify-start" asChild>
                  <Link to={item.href} className="my-[3px]">
                    <item.icon className="mr-2 h-5 w-5" />
                    {item.label}
                  </Link>
                </Button>)}
            </ScrollArea>
          </div>
        </div>
        <div className="px-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Tema</span>
              <ThemeToggle />
            </div>
            <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive/80 hover:bg-destructive/10" onClick={logout}>
              <LogOut className="mr-2 h-5 w-5" />
              Sair
            </Button>
          </div>
        </div>
        <div className="px-3 pt-4 border-t">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-sm font-medium text-primary">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium leading-none">{user.name}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {userRole === 'owner' && 'Proprietário'}
                {userRole === 'manager' && 'Gerente'}
                {userRole === 'attendant' && 'Vendedor'}
                {userRole === 'customer' && 'Cliente'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>;
}