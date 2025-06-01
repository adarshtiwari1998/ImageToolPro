import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const toolLinks = [
    { name: "Compress IMAGE", href: "/compress-image" },
    { name: "Resize IMAGE", href: "/resize-image" },
    { name: "Crop IMAGE", href: "/crop-image" },
    { name: "Convert to JPG", href: "/convert-to-jpg" },
    { name: "Photo Editor", href: "/photo-editor" },
  ];

  const premiumTools = [
    { name: "Remove Background", href: "/remove-background" },
    { name: "Photo Editor", href: "/photo-editor" },
    { name: "Upscale Image", href: "/upscale-image" },
    { name: "HTML to Image", href: "/html-to-image" },
    { name: "Blur Face", href: "/blur-face" },
  ];

  const companyLinks = [
    { name: "About Us", href: "/about" },
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
    { name: "Contact", href: "/contact" },
  ];

  const supportLinks = [
    { name: "Help Center", href: "/help" },
    { name: "API Documentation", href: "/docs" },
    { name: "Premium Support", href: "/support" },
    { name: "Bug Reports", href: "/bugs" },
  ];

  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Social Sharing Section */}
        <div className="text-center mb-12">
          <h3 className="text-xl font-semibold mb-4">How can you thank us? Spread the word!</h3>
          <p className="text-gray-400 mb-6">Please share the tool to inspire more productive people!</p>
          
          <div className="flex flex-wrap justify-center gap-3">
            <Button 
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={() => window.open('https://www.trustpilot.com/', '_blank')}
            >
              <i className="fas fa-star mr-2"></i>
              Trustpilot
            </Button>
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => window.open('https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(window.location.origin), '_blank')}
            >
              <i className="fab fa-facebook-f mr-2"></i>
              Facebook
            </Button>
            <Button 
              className="bg-gray-900 hover:bg-gray-800 text-white border border-gray-700"
              onClick={() => window.open('https://twitter.com/intent/tweet?text=Check out this amazing image processing tool!&url=' + encodeURIComponent(window.location.origin), '_blank')}
            >
              <i className="fab fa-twitter mr-2"></i>
              Twitter
            </Button>
            <Button 
              className="bg-blue-700 hover:bg-blue-800 text-white"
              onClick={() => window.open('https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(window.location.origin), '_blank')}
            >
              <i className="fab fa-linkedin-in mr-2"></i>
              LinkedIn
            </Button>
          </div>
        </div>

        {/* Footer Links */}
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <h4 className="text-lg font-semibold mb-4">
              <i className="fas fa-heart text-red-500 mr-2"></i>
              iLoveImageTool
            </h4>
            <p className="text-gray-400 mb-4 text-sm">
              Professional image processing tools made simple and accessible for everyone.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <i className="fab fa-twitter"></i>
              </a>
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <i className="fab fa-facebook-f"></i>
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <i className="fab fa-instagram"></i>
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <i className="fab fa-linkedin-in"></i>
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Tools</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              {toolLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Premium Tools</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              {premiumTools.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              {companyLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Security Badges & Copyright */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-6 mb-4 md:mb-0">
              <span className="text-gray-400 text-sm">Secure. Private. In your control</span>
              <div className="flex items-center space-x-4 text-gray-400 text-sm">
                <div className="flex items-center space-x-2">
                  <i className="fas fa-shield-alt"></i>
                  <span>Secure</span>
                </div>
                <div className="flex items-center space-x-2">
                  <i className="fas fa-user-secret"></i>
                  <span>Private</span>
                </div>
                <div className="flex items-center space-x-2">
                  <i className="fas fa-cogs"></i>
                  <span>In your control</span>
                </div>
              </div>
            </div>
            
            <div className="text-gray-400 text-sm">
              © {currentYear} iLoveImageTool.com. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
