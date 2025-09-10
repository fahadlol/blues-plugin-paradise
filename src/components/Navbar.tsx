import { Button } from "@/components/ui/button";
import { Menu, X, User, LogOut, Settings, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, userRole, signOut } = useAuth();
  const { itemCount } = useCart();
  const { getSetting } = useSiteSettings();
  const logoUrl = getSetting('site_logo_url', '');

  const navItems = [
    { label: "Home", href: "/" },
    { label: "Prebuilt Plugins", href: "#prebuilt" },
    { label: "Custom Plugins", href: "#custom" },
    { label: "Bundles", href: "#bundles" },
    { label: "Support", href: "/support" },
    { label: "Contact", href: "/contact" },
  ];

  const handleGetStarted = () => {
    const pluginsSection = document.getElementById('prebuilt');
    if (pluginsSection) {
      pluginsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => window.location.href = '/'}>
            {logoUrl ? (
              <img 
                src={logoUrl} 
                alt="Blues Marketplace" 
                className="w-8 h-8 object-contain rounded-lg"
              />
            ) : (
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-background rounded-sm"></div>
              </div>
            )}
            <span className="text-xl font-bold bg-gradient-hero bg-clip-text text-transparent">
              Blues Marketplace
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              if (item.href.startsWith('#')) {
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    className="text-muted-foreground hover:text-foreground transition-colors duration-300"
                  >
                    {item.label}
                  </a>
                );
              } else {
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    className="text-muted-foreground hover:text-foreground transition-colors duration-300"
                    onClick={(e) => {
                      if (item.href.startsWith('/')) {
                        e.preventDefault();
                        window.location.href = item.href;
                      }
                    }}
                  >
                    {item.label}
                  </a>
                );
              }
            })}
          </div>

          {/* Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={() => window.location.href = '/cart'} className="relative">
              <ShoppingCart className="w-4 h-4" />
              {itemCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                  {itemCount}
                </Badge>
              )}
            </Button>
            {user ? (
              <div className="flex items-center space-x-2">
                  {(userRole === 'admin' || userRole === 'staff') && (
                    <Button variant="outline" size="sm" onClick={() => window.location.href = '/admin'}>
                      <Settings className="w-4 h-4 mr-1" />
                      Admin
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={() => window.location.href = '/my-downloads'}>
                    My Downloads
                  </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <User className="w-4 h-4 mr-1" />
                      {user.email}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={signOut}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={() => window.location.href = '/auth'}>
                  Sign In
                </Button>
                <Button variant="hero" size="sm" onClick={handleGetStarted}>
                  Get Started
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-muted-foreground hover:text-foreground"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="text-muted-foreground hover:text-foreground transition-colors duration-300"
                  onClick={(e) => {
                    setIsOpen(false);
                    if (item.href.startsWith('/')) {
                      e.preventDefault();
                      window.location.href = item.href;
                    }
                  }}
                >
                  {item.label}
                </a>
              ))}
              
              {user ? (
                <div className="flex flex-col space-y-2 pt-4 border-t">
                  {(userRole === 'admin' || userRole === 'staff') && (
                    <Button variant="outline" size="sm" onClick={() => window.location.href = '/admin'}>
                      <Settings className="w-4 h-4 mr-1" />
                      Admin Dashboard
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={() => window.location.href = '/my-downloads'}>
                    My Downloads
                  </Button>
                  <Button variant="outline" size="sm" onClick={signOut}>
                    <LogOut className="w-4 h-4 mr-1" />
                    Sign Out
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col space-y-2 pt-4 border-t">
                  <Button variant="outline" size="sm" onClick={() => window.location.href = '/auth'}>
                    Sign In
                  </Button>
                  <Button variant="hero" size="sm" onClick={handleGetStarted}>
                    Get Started
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;