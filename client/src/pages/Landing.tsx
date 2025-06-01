import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ToolGrid from "@/components/ToolGrid";
import PremiumFeatures from "@/components/PremiumFeatures";
import AdBanner from "@/components/AdBanner";
import { Button } from "@/components/ui/button";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Professional Image Tools
            <span className="block text-blue-600">Made Simple</span>
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Compress, resize, crop, convert and edit your images with our powerful online tools. 
            No software installation required.
          </p>
          
          <ToolGrid />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">All the image tools you need</h2>
            <p className="text-lg text-gray-600">Professional image processing tools organized by category</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Optimize Tools */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <i className="fas fa-tachometer-alt text-xl text-blue-600"></i>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Optimize</h3>
              <ul className="space-y-3">
                <li className="flex items-center text-gray-600">
                  <i className="fas fa-compress-alt w-4 mr-3"></i>
                  <span>Compress IMAGE</span>
                </li>
                <li className="flex items-center text-gray-600">
                  <i className="fas fa-expand-arrows-alt w-4 mr-3"></i>
                  <span>Upscale</span>
                  <span className="ml-auto bg-orange-500 text-white text-xs px-2 py-1 rounded">Premium</span>
                </li>
                <li className="flex items-center text-gray-600">
                  <i className="fas fa-magic w-4 mr-3"></i>
                  <span>Remove Background</span>
                  <span className="ml-auto bg-orange-500 text-white text-xs px-2 py-1 rounded">Premium</span>
                </li>
              </ul>
            </div>

            {/* Create Tools */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <i className="fas fa-plus-circle text-xl text-green-600"></i>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Create</h3>
              <ul className="space-y-3">
                <li className="flex items-center text-gray-600">
                  <i className="fas fa-laugh w-4 mr-3"></i>
                  <span>Meme Generator</span>
                </li>
                <li className="flex items-center text-gray-600">
                  <i className="fas fa-palette w-4 mr-3"></i>
                  <span>Photo Editor</span>
                  <span className="ml-auto bg-orange-500 text-white text-xs px-2 py-1 rounded">Premium</span>
                </li>
              </ul>
            </div>

            {/* Modify Tools */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <i className="fas fa-edit text-xl text-purple-600"></i>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Modify</h3>
              <ul className="space-y-3">
                <li className="flex items-center text-gray-600">
                  <i className="fas fa-expand w-4 mr-3"></i>
                  <span>Resize IMAGE</span>
                </li>
                <li className="flex items-center text-gray-600">
                  <i className="fas fa-crop w-4 mr-3"></i>
                  <span>Crop IMAGE</span>
                </li>
                <li className="flex items-center text-gray-600">
                  <i className="fas fa-redo w-4 mr-3"></i>
                  <span>Rotate IMAGE</span>
                </li>
              </ul>
            </div>

            {/* Convert & Security Tools */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <i className="fas fa-shield-alt text-xl text-orange-600"></i>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Convert & Security</h3>
              <ul className="space-y-3">
                <li className="flex items-center text-gray-600">
                  <i className="fas fa-file-image w-4 mr-3"></i>
                  <span>Convert to JPG</span>
                </li>
                <li className="flex items-center text-gray-600">
                  <i className="fas fa-code w-4 mr-3"></i>
                  <span>HTML to Image</span>
                  <span className="ml-auto bg-orange-500 text-white text-xs px-2 py-1 rounded">Premium</span>
                </li>
                <li className="flex items-center text-gray-600">
                  <i className="fas fa-copyright w-4 mr-3"></i>
                  <span>Watermark IMAGE</span>
                </li>
                <li className="flex items-center text-gray-600">
                  <i className="fas fa-user-secret w-4 mr-3"></i>
                  <span>Blur Face</span>
                  <span className="ml-auto bg-orange-500 text-white text-xs px-2 py-1 rounded">Premium</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <PremiumFeatures />

      {/* Social Sharing */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">How can you thank us? Spread the word!</h2>
          <p className="text-gray-600 mb-8">Please share the tool to inspire more productive people!</p>
          
          <div className="flex justify-center space-x-4">
            <Button className="bg-green-600 hover:bg-green-700">
              <i className="fas fa-star mr-2"></i>
              Trustpilot
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <i className="fab fa-facebook-f mr-2"></i>
              Facebook
            </Button>
            <Button className="bg-gray-900 hover:bg-gray-800">
              <i className="fab fa-twitter mr-2"></i>
              Twitter
            </Button>
            <Button className="bg-blue-700 hover:bg-blue-800">
              <i className="fab fa-linkedin-in mr-2"></i>
              LinkedIn
            </Button>
          </div>
        </div>
      </section>

      <Footer />
      <AdBanner />
    </div>
  );
}
