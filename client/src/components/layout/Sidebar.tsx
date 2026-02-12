import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import {
  LayoutDashboard,
  Building2,
  Users,
  Settings,
  ChevronDown,
  ChevronRight,
  Menu,
  Shield,
  Sliders,
} from "lucide-react";
import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  roles?: string[];
}

interface NavGroup {
  name: string;
  icon: React.ElementType;
  items: NavItem[];
  roles?: string[];
}

// =============================================================================
// NAVIGATION CONFIGURATION
// Customize these arrays to add/remove navigation items for your app
// =============================================================================

const mainNavigation: NavItem[] = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Organizations", href: "/organizations", icon: Building2 },
  { name: "Users", href: "/users", icon: Users },
];

const adminNavigation: NavGroup = {
  name: "Administration",
  icon: Shield,
  roles: ["admin"],
  items: [
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Configuration", href: "/admin/config", icon: Sliders },
  ],
};

export function Sidebar() {
  const [location] = useLocation();
  const { user } = useAuth();
  const [adminOpen, setAdminOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const userRole = user?.role || "user";

  const hasAccess = (roles?: string[]) => {
    if (!roles || roles.length === 0) return true;
    return roles.includes(userRole);
  };

  const isActive = (href: string) => {
    return location === href || (href !== "/" && location.startsWith(href));
  };

  const NavLink = ({ item }: { item: NavItem }) => {
    if (!hasAccess(item.roles)) return null;

    const active = isActive(item.href);

    const linkContent = (
      <Link
        href={item.href}
        className={cn(
          "flex items-center gap-3 py-2 rounded-lg text-sm font-medium transition-colors",
          isCollapsed ? "justify-center px-3" : "",
          active
            ? "bg-sidebar-accent text-sidebar-accent-foreground"
            : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
        )}
      >
        <item.icon className={cn("w-5 h-5 flex-shrink-0", !isCollapsed && "ml-1.5")} />
        {!isCollapsed && <span>{item.name}</span>}
      </Link>
    );

    if (isCollapsed) {
      return (
        <HoverCard openDelay={0} closeDelay={0}>
          <HoverCardTrigger asChild>{linkContent}</HoverCardTrigger>
          <HoverCardContent side="right" className="w-auto p-2">
            <p className="text-sm font-medium">{item.name}</p>
          </HoverCardContent>
        </HoverCard>
      );
    }

    return linkContent;
  };

  return (
    <aside
      className={cn(
        "bg-sidebar text-sidebar-foreground flex flex-col transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo and Toggle */}
      <div className="border-b border-sidebar-border">
        <div
          className={cn(
            "flex items-center",
            isCollapsed ? "justify-center px-2 py-4" : "px-6 py-4"
          )}
        >
          {!isCollapsed ? (
            <Link href="/" className="flex items-center gap-2 flex-1">
              <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
                <span className="text-sidebar-primary-foreground font-bold text-lg">A</span>
              </div>
              <span className="font-heading font-bold text-lg">App</span>
            </Link>
          ) : (
            <Link href="/" className="flex items-center justify-center">
              <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
                <span className="text-sidebar-primary-foreground font-bold text-lg">A</span>
              </div>
            </Link>
          )}
        </div>
        <div
          className={cn("flex pb-3", isCollapsed ? "justify-center px-2" : "justify-start px-6")}
        >
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-md hover:bg-sidebar-accent/50 transition-colors"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className={cn("flex-1 py-4 space-y-6 overflow-y-auto", isCollapsed ? "px-2" : "")}>
        {/* Main Navigation */}
        <div className={cn("space-y-1", !isCollapsed && "px-6")}>
          {mainNavigation.map((item) => (
            <NavLink key={item.name} item={item} />
          ))}
        </div>

        {/* Admin Section */}
        {hasAccess(adminNavigation.roles) && (
          <>
            {isCollapsed ? (
              <div className="space-y-1">
                {adminNavigation.items.map((item) => (
                  <NavLink key={item.name} item={item} />
                ))}
              </div>
            ) : (
              <div className="px-6">
                <Collapsible open={adminOpen} onOpenChange={setAdminOpen}>
                  <CollapsibleTrigger asChild>
                    <button
                      className={cn(
                        "flex items-center justify-between w-full px-0 py-2 rounded-lg text-sm font-medium transition-colors",
                        adminOpen || adminNavigation.items.some((i) => isActive(i.href))
                          ? "bg-sidebar-accent/30 text-sidebar-accent-foreground"
                          : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <adminNavigation.icon className="w-5 h-5" />
                        {adminNavigation.name}
                      </div>
                      {adminOpen ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-1 ml-4 space-y-1">
                    {adminNavigation.items.map((item) => (
                      <NavLink key={item.name} item={item} />
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              </div>
            )}
          </>
        )}
      </nav>

      {/* Settings */}
      <div className={cn("py-4 border-t border-sidebar-border", isCollapsed ? "px-2" : "px-6")}>
        {isCollapsed ? (
          <HoverCard openDelay={0} closeDelay={0}>
            <HoverCardTrigger asChild>
              <Link
                href="/settings"
                className={cn(
                  "flex items-center justify-center px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive("/settings")
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                )}
              >
                <Settings className="w-5 h-5" />
              </Link>
            </HoverCardTrigger>
            <HoverCardContent side="right" className="w-auto p-2">
              <p className="text-sm font-medium">Settings</p>
            </HoverCardContent>
          </HoverCard>
        ) : (
          <Link
            href="/settings"
            className={cn(
              "flex items-center gap-3 px-0 py-2 rounded-lg text-sm font-medium transition-colors",
              isActive("/settings")
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
            )}
          >
            <Settings className="w-5 h-5 ml-1.5" />
            Settings
          </Link>
        )}
      </div>
    </aside>
  );
}
