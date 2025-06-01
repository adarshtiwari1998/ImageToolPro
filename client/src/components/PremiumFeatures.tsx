import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function PremiumFeatures() {
  const premiumFeatures = [
    "Compress IMAGE",
    "Resize IMAGE", 
    "Crop IMAGE",
    "Convert to JPG",
    "Convert from JPG",
    "Convert IMAGE",
    "Rotate IMAGE",
    "Watermark IMAGE",
    "IMAGE Editor",
    "Meme generator",
    "HTML to image",
    "Upscale image",
    "Blur face",
    "Remove background",
  ];

  const benefits = [
    {
      icon: "fas fa-infinity",
      title: "Unlimited document processing",
      description: "Process as many images as you need"
    },
    {
      icon: "fas fa-ad",
      title: "No Ads",
      description: "Clean, distraction-free experience"
    },
    {
      icon: "fas fa-headset",
      title: "Customer support", 
      description: "Priority email support"
    },
    {
      icon: "fas fa-layer-group",
      title: "Batch processing",
      description: "Upload up to 40 images at once"
    },
    {
      icon: "fas fa-hd-video",
      title: "High resolution output",
      description: "Export in highest quality"
    },
    {
      icon: "fas fa-robot",
      title: "Advanced AI features",
      description: "Access cutting-edge AI tools"
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center bg-accent text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
              <i className="fas fa-crown mr-2"></i>
              Upgrade to Premium
            </div>
            <h2 className="text-4xl font-bold mb-6">Get more with Premium</h2>
            <p className="text-xl text-blue-100 mb-8">
              Edit multiple images faster with batch file processing, convert to several image formats 
              in high resolution and enjoy a web experience free of ads.
            </p>
            
            {/* Premium Benefits */}
            <div className="space-y-4 mb-8">
              {benefits.map((benefit) => (
                <div key={benefit.title} className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <i className="fas fa-check text-white text-xs"></i>
                  </div>
                  <span className="font-medium">{benefit.title}</span>
                </div>
              ))}
            </div>

            <Link href="/premium">
              <Button className="bg-accent hover:bg-accent/90 text-white px-8 py-4 rounded-xl text-lg font-semibold">
                <i className="fas fa-crown mr-2"></i>
                Upgrade to Premium
              </Button>
            </Link>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
            <h3 className="text-2xl font-bold mb-6">All Premium Tools</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {premiumFeatures.map((feature, index) => (
                <div key={feature} className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-blue-100">{feature}</span>
                </div>
              ))}
            </div>
            
            <div className="mt-8 p-4 bg-white/10 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <span className="font-semibold">Premium Plan</span>
                <div className="text-right">
                  <div className="text-2xl font-bold">$9.99</div>
                  <div className="text-sm text-blue-200">per month</div>
                </div>
              </div>
              
              <div className="space-y-2 text-sm text-blue-100">
                <div className="flex items-center justify-between">
                  <span>Batch Processing</span>
                  <i className="fas fa-check text-green-400"></i>
                </div>
                <div className="flex items-center justify-between">
                  <span>All Premium Tools</span>
                  <i className="fas fa-check text-green-400"></i>
                </div>
                <div className="flex items-center justify-between">
                  <span>No Ads</span>
                  <i className="fas fa-check text-green-400"></i>
                </div>
                <div className="flex items-center justify-between">
                  <span>Priority Support</span>
                  <i className="fas fa-check text-green-400"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
