import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  Home, 
  Building2, 
  Key, 
  FileText, 
  HelpCircle, 
  User, 
  LogOut, 
  Moon, 
  Sun, 
  Menu, 
  MapPin,
  Heart,
  LayoutDashboard,
  ChevronDown
} from "lucide-react";

export default function Header() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: "/buy", label: "Buy", icon: Building2 },
    { href: "/rentals", label: "Rentals", icon: Key },
    { href: "/enquiry", label: "Submit Enquiry", icon: FileText },
    { href: "/request-listing", label: "Request Listing", icon: FileText },
    { href: "/contact", label: "Help / Support", icon: HelpCircle },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 glass-header">
      <div className="container-main">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 hover-lift" data-testid="logo-link">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <Home className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="hidden sm:block">
              <div className="font-bold text-lg leading-tight">TM Real Estate</div>
              <div className="text-xs text-muted-foreground">टीम रियल एस्टेट</div>
            </div>
          </Link>

          {/* Location Selector - Desktop */}
          <div className="hidden lg:flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">Airoli, Navi Mumbai</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                data-testid={`nav-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full"
              data-testid="theme-toggle"
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </Button>

            {/* Favorites - Only for authenticated users */}
            {isAuthenticated && !isAdmin && (
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full hidden sm:flex"
                onClick={() => navigate("/favorites")}
                data-testid="favorites-btn"
              >
                <Heart className="w-5 h-5" />
              </Button>
            )}

            {/* User Menu */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2 rounded-full" data-testid="user-menu">
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline">
                      {isAdmin ? "Admin" : user?.name || "Account"}
                    </span>
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {isAdmin && (
                    <>
                      <DropdownMenuItem onClick={() => navigate("/admin")} data-testid="admin-dashboard-link">
                        <LayoutDashboard className="w-4 h-4 mr-2" />
                        Dashboard
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  {!isAdmin && (
                    <>
                      <DropdownMenuItem onClick={() => navigate("/favorites")} data-testid="favorites-link">
                        <Heart className="w-4 h-4 mr-2" />
                        Favorites
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem onClick={handleLogout} data-testid="logout-btn">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                onClick={() => navigate("/login")}
                className="rounded-full"
                data-testid="login-btn"
              >
                <User className="w-4 h-4 mr-2" />
                Login
              </Button>
            )}

            {/* Mobile Menu */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden rounded-full" data-testid="mobile-menu">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col gap-4 mt-8">
                  {/* Location */}
                  <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="text-sm">Airoli, Navi Mumbai</span>
                  </div>

                  {/* Nav Links */}
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      to={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        isActive(link.href)
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      }`}
                    >
                      <link.icon className="w-5 h-5" />
                      {link.label}
                    </Link>
                  ))}

                  <hr className="border-border" />

                  {/* Auth Links */}
                  {isAuthenticated ? (
                    <>
                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted"
                        >
                          <LayoutDashboard className="w-5 h-5" />
                          Admin Dashboard
                        </Link>
                      )}
                      {!isAdmin && (
                        <Link
                          to="/favorites"
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted"
                        >
                          <Heart className="w-5 h-5" />
                          Favorites
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          handleLogout();
                          setMobileOpen(false);
                        }}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted text-destructive"
                      >
                        <LogOut className="w-5 h-5" />
                        Logout
                      </button>
                    </>
                  ) : (
                    <Link
                      to="/login"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary text-primary-foreground"
                    >
                      <User className="w-5 h-5" />
                      Login / Sign Up
                    </Link>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
