import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

export default function Header() {
  const { user, isAuthenticated } = useAuth();
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const tools = [
    {
      category: "Optimize",
      items: [
        { name: "Compress IMAGE", href: "/compress-image", icon: "fas fa-compress-alt", free: true },
        { name: "Upscale", href: "/upscale-image", icon: "fas fa-expand-arrows-alt", premium: true },
        { name: "Remove Background", href: "/remove-background", icon: "fas fa-magic", premium: true },
      ]
    },
    {
      category: "Create", 
      items: [
        { name: "Meme Generator", href: "/meme-generator", icon: "fas fa-laugh", free: true },
        { name: "Photo Editor", href: "/photo-editor", icon: "fas fa-palette", premium: true },
      ]
    },
    {
      category: "Modify",
      items: [
        { name: "Resize IMAGE", href: "/resize-image", icon: "fas fa-expand-arrows-alt", free: true },
        { name: "Crop IMAGE", href: "/crop-image", icon: "fas fa-crop-alt", free: true },
        { name: "Rotate IMAGE", href: "/rotate-image", icon: "fas fa-redo", free: true },
      ]
    },
    {
      category: "Convert",
      items: [
        { name: "Convert to JPG", href: "/convert-to-jpg", icon: "fas fa-file-image", free: true },
        { name: "Convert from JPG", href: "/convert-from-jpg", icon: "fas fa-exchange-alt", free: true },
        { name: "HTML to IMAGE", href: "/html-to-image", icon: "fas fa-code", premium: true },
      ]
    },
    {
      category: "Security",
      items: [
        { name: "Watermark IMAGE", href: "/watermark-image", icon: "fas fa-copyright", free: true },
        { name: "Blur Face", href: "/blur-face", icon: "fas fa-user-secret", premium: true },
      ]
    }
  ];

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-primary flex items-center">
                <i className="fas fa-heart text-red-500 mr-2"></i>
                iLoveImageTool
              </h1>
            </Link>
          </div>

          {/* Main Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <Link 
              href="/compress-image" 
              className={`text-gray-700 hover:text-primary px-3 py-2 text-sm font-medium transition-colors ${
                location === '/compress-image' ? 'text-primary' : ''
              }`}
            >
              Compress
            </Link>
            <Link 
              href="/resize-image" 
              className={`text-gray-700 hover:text-primary px-3 py-2 text-sm font-medium transition-colors ${
                location === '/resize-image' ? 'text-primary' : ''
              }`}
            >
              Resize
            </Link>
            <Link 
              href="/crop-image" 
              className={`text-gray-700 hover:text-primary px-3 py-2 text-sm font-medium transition-colors ${
                location === '/crop-image' ? 'text-primary' : ''
              }`}
            >
              Crop
            </Link>
            <Link 
              href="/convert-to-jpg" 
              className={`text-gray-700 hover:text-primary px-3 py-2 text-sm font-medium transition-colors ${
                location === '/convert-to-jpg' ? 'text-primary' : ''
              }`}
            >
              Convert
            </Link>

            {/* More Tools Mega Menu */}
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-gray-700 hover:text-primary px-3 py-2 text-sm font-medium">
                    More tools
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="w-96 p-6">
                      <div className="grid grid-cols-2 gap-6">
                        {tools.map((category) => (
                          <div key={category.category}>
                            <h3 className="text-sm font-semibold text-gray-900 mb-3">
                              {category.category}
                            </h3>
                            <ul className="space-y-2">
                              {category.items.map((item) => (
                                <li key={item.name}>
                                  <Link 
                                    href={item.href}
                                    className="text-sm text-gray-600 hover:text-primary flex items-center transition-colors"
                                  >
                                    <i className={`${item.icon} w-4 mr-2`}></i>
                                    <span>{item.name}</span>
                                    {item.premium && (
                                      <span className="ml-auto bg-accent text-white text-xs px-2 py-0.5 rounded">
                                        Premium
                                      </span>
                                    )}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            <Link 
              href="/premium" 
              className={`text-gray-700 hover:text-primary px-3 py-2 text-sm font-medium transition-colors ${
                location === '/premium' ? 'text-primary' : ''
              }`}
            >
              Pricing
            </Link>
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                {user?.isPremium && (
                  <Link href="/admin">
                    <Button variant="ghost" size="sm">
                      <i className="fas fa-chart-line mr-2"></i>
                      Admin
                    </Button>
                  </Link>
                )}
                <div className="flex items-center space-x-2">
                  {user?.profileImageUrl && (
                    <img 
                      src={user.profileImageUrl} 
                      alt="Profile" 
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  )}
                  <span className="text-sm font-medium text-gray-700">
                    {user?.firstName || 'User'}
                  </span>
                  {user?.isPremium && (
                    <i className="fas fa-crown text-yellow-500"></i>
                  )}
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => window.location.href = '/api/logout'}
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/premium">
                  <Button className="bg-accent hover:bg-accent/90" size="sm">
                    <i className="fas fa-crown mr-2"></i>
                    Get Premium
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <i className="fas fa-bars text-xl"></i>
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden py-4 border-t">
            <div className="space-y-2">
              <Link 
                href="/compress-image" 
                className="block px-3 py-2 text-gray-700 hover:text-primary"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Compress Image
              </Link>
              <Link 
                href="/resize-image" 
                className="block px-3 py-2 text-gray-700 hover:text-primary"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Resize Image
              </Link>
              <Link 
                href="/crop-image" 
                className="block px-3 py-2 text-gray-700 hover:text-primary"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Crop Image
              </Link>
              <Link 
                href="/convert-to-jpg" 
                className="block px-3 py-2 text-gray-700 hover:text-primary"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Convert to JPG
              </Link>
              <Link 
                href="/premium" 
                className="block px-3 py-2 text-gray-700 hover:text-primary"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Pricing
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}