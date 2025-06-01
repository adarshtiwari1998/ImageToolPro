import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

export default function AdBanner() {
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(true);

  // Hide ads for premium users
  useEffect(() => {
    if (user?.isPremium) {
      setIsVisible(false);
    }
  }, [user?.isPremium]);

  if (!isVisible || user?.isPremium) {
    return null;
  }

  return (
    <>
      {/* Bottom right ad banner */}
      <div className="fixed bottom-4 right-4 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-40 p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center mb-2">
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                Advertisement
              </span>
            </div>
            
            {/* Ad Content */}
            <div className="text-center py-8 bg-gray-50 rounded border-2 border-dashed border-gray-300">
              <div className="text-gray-400">
                <i className="fas fa-ad text-2xl mb-2 block"></i>
                <p className="text-sm">Your ad could be here</p>
                <p className="text-xs mt-1">Google AdSense Integration</p>
              </div>
            </div>
            
            <div className="mt-2 text-center">
              <Button 
                variant="link" 
                size="sm" 
                className="text-xs text-blue-600 p-0"
                onClick={() => window.location.href = '/premium'}
              >
                Remove ads with Premium
              </Button>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-gray-600 p-1 ml-2"
            onClick={() => setIsVisible(false)}
          >
            <i className="fas fa-times text-xs"></i>
          </Button>
        </div>
      </div>

      {/* Top banner ad for larger screens */}
      <div className="hidden lg:block bg-gray-100 border-b border-gray-200 py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-xs text-gray-500">Advertisement</span>
              <div className="flex-1 text-center py-4 bg-white border rounded text-gray-400">
                <span className="text-sm">728x90 Banner Ad Space - Google AdSense</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="link" 
                size="sm" 
                className="text-xs text-blue-600"
                onClick={() => window.location.href = '/premium'}
              >
                <i className="fas fa-crown mr-1"></i>
                Remove ads
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-gray-600"
                onClick={() => setIsVisible(false)}
              >
                <i className="fas fa-times text-xs"></i>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
