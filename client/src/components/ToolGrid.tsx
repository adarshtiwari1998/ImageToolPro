import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function ToolGrid() {
  const { user } = useAuth();

  // Track tool usage
  const trackUsageMutation = useMutation({
    mutationFn: async (toolType: string) => {
      await apiRequest("POST", "/api/track-usage", {
        toolType,
        userId: user?.id || null,
      });
    },
  });

  const handleToolClick = (toolType: string) => {
    trackUsageMutation.mutate(toolType);
  };

  const tools = [
    {
      name: "Compress IMAGE",
      description: "Reduce file size while maintaining quality",
      href: "/compress-image",
      icon: "fas fa-compress-alt",
      color: "bg-blue-100 text-blue-600",
      toolType: "compress",
      free: true
    },
    {
      name: "Resize IMAGE", 
      description: "Change dimensions to fit your needs",
      href: "/resize-image",
      icon: "fas fa-expand-arrows-alt",
      color: "bg-green-100 text-green-600",
      toolType: "resize",
      free: true
    },
    {
      name: "Crop IMAGE",
      description: "Remove unwanted areas precisely", 
      href: "/crop-image",
      icon: "fas fa-crop-alt",
      color: "bg-purple-100 text-purple-600",
      toolType: "crop",
      free: true
    },
    {
      name: "Convert to JPG",
      description: "Change format to JPG instantly",
      href: "/convert-to-jpg", 
      icon: "fas fa-exchange-alt",
      color: "bg-orange-100 text-orange-600",
      toolType: "convert",
      free: true
    },
    {
      name: "Photo Editor",
      description: "Edit with filters and effects",
      href: "/photo-editor",
      icon: "fas fa-paint-brush", 
      color: "bg-pink-100 text-pink-600",
      toolType: "editor",
      premium: true
    },
    {
      name: "Remove Background",
      description: "AI-powered background removal",
      href: "/remove-background",
      icon: "fas fa-magic",
      color: "bg-indigo-100 text-indigo-600", 
      toolType: "remove-bg",
      premium: true
    },
    {
      name: "Upscale Image",
      description: "Enhance image resolution with AI",
      href: "/upscale-image",
      icon: "fas fa-expand-arrows-alt",
      color: "bg-red-100 text-red-600",
      toolType: "upscale", 
      premium: true
    },
    {
      name: "Meme Generator",
      description: "Create memes with text overlays",
      href: "/meme-generator",
      icon: "fas fa-laugh",
      color: "bg-yellow-100 text-yellow-600",
      toolType: "meme",
      free: true
    },
    {
      name: "Watermark IMAGE",
      description: "Add text or logo watermarks",
      href: "/watermark-image", 
      icon: "fas fa-copyright",
      color: "bg-teal-100 text-teal-600",
      toolType: "watermark",
      free: true
    },
    {
      name: "Blur Face",
      description: "Automatically detect and blur faces",
      href: "/blur-face",
      icon: "fas fa-user-secret",
      color: "bg-gray-100 text-gray-600",
      toolType: "blur-face",
      premium: true
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {tools.map((tool) => (
        <Link 
          key={tool.name} 
          href={tool.href}
          onClick={() => handleToolClick(tool.toolType)}
        >
          <div className="tool-card bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all cursor-pointer group relative">
            {tool.premium && (
              <div className="absolute -top-2 -right-2 bg-accent text-white text-xs px-2 py-1 rounded-full">
                <i className="fas fa-crown mr-1"></i>
                Premium
              </div>
            )}
            
            <div className={`w-12 h-12 ${tool.color} rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
              <i className={`${tool.icon} text-xl`}></i>
            </div>
            
            <h3 className="font-semibold text-gray-900 text-sm mb-2 text-center leading-tight">
              {tool.name}
            </h3>
            
            <p className="text-xs text-gray-600 text-center line-clamp-2">
              {tool.description}
            </p>

            {tool.premium && !user?.isPremium && (
              <div className="mt-2 text-center">
                <span className="text-xs text-accent font-medium">
                  Upgrade Required
                </span>
              </div>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}
