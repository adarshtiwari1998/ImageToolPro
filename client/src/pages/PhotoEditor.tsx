import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ImageUploadZone from "@/components/ImageUploadZone";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdBanner from "@/components/AdBanner";

export default function PhotoEditor() {
  const { user } = useAuth();
  const [files, setFiles] = useState<File[]>([]);
  const [brightness, setBrightness] = useState([0]);
  const [contrast, setContrast] = useState([0]);
  const [saturation, setSaturation] = useState([0]);

  const handleFilesSelected = (selectedFiles: File[]) => {
    if (!user?.isPremium) {
      // Limit to 1 file for free users
      setFiles(selectedFiles.slice(0, 1));
    } else {
      setFiles(selectedFiles);
    }
  };

  const filters = [
    { name: "Original", preview: "No filter" },
    { name: "Vintage", preview: "Warm, aged look" },
    { name: "Black & White", preview: "Classic monochrome" },
    { name: "Sepia", preview: "Vintage brown tone" },
    { name: "Vivid", preview: "Enhanced colors" },
    { name: "Cool", preview: "Blue tinted" },
    { name: "Warm", preview: "Orange tinted" },
    { name: "Drama", preview: "High contrast" },
  ];

  if (!user?.isPremium) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Photo Editor</h1>
            <p className="text-lg text-gray-600">
              Professional photo editing tools with filters, effects, and adjustments.
            </p>
          </div>

          <Card className="text-center">
            <CardContent className="py-16">
              <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-crown text-yellow-500 text-3xl"></i>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Premium Feature</h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                The Photo Editor with advanced filters and effects is available for Premium subscribers only.
              </p>
              <Button className="bg-yellow-500 hover:bg-yellow-600" size="lg">
                <i className="fas fa-crown mr-2"></i>
                Upgrade to Premium
              </Button>
            </CardContent>
          </Card>
        </div>

        <Footer />
        <AdBanner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tool Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Photo Editor</h1>
          <p className="text-lg text-gray-600">
            Edit your images with <span className="text-blue-600 font-semibold">filters</span>, 
            <span className="text-blue-600 font-semibold"> effects</span>, 
            <span className="text-blue-600 font-semibold"> adjustments</span> and more.
            <br />Professional photo editing tools in your browser.
          </p>
        </div>

        {files.length === 0 ? (
          <ImageUploadZone onFilesSelected={handleFilesSelected} />
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Editor Canvas */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Editor Canvas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-100 rounded-lg p-8 text-center">
                    <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                      <div className="text-gray-500">
                        <i className="fas fa-image text-6xl mb-4 block"></i>
                        <p className="text-lg">Interactive photo editor canvas</p>
                        <p className="text-sm mt-2">Your image will appear here for editing</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Editor Controls */}
            <div className="space-y-6">
              {/* File Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Current Image</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                        <i className="fas fa-paint-brush text-pink-600"></i>
                      </div>
                      <div>
                        <p className="font-medium text-sm">{files[0]?.name}</p>
                        <p className="text-xs text-gray-600">
                          {files[0] && (files[0].size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Editing Tools */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Editing Tools</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="adjustments" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="adjustments">Adjust</TabsTrigger>
                      <TabsTrigger value="filters">Filters</TabsTrigger>
                      <TabsTrigger value="effects">Effects</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="adjustments" className="space-y-4 mt-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Brightness: {brightness[0]}
                        </label>
                        <Slider
                          value={brightness}
                          onValueChange={setBrightness}
                          max={100}
                          min={-100}
                          step={1}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Contrast: {contrast[0]}
                        </label>
                        <Slider
                          value={contrast}
                          onValueChange={setContrast}
                          max={100}
                          min={-100}
                          step={1}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Saturation: {saturation[0]}
                        </label>
                        <Slider
                          value={saturation}
                          onValueChange={setSaturation}
                          max={100}
                          min={-100}
                          step={1}
                        />
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="filters" className="space-y-3 mt-4">
                      {filters.map((filter) => (
                        <Button
                          key={filter.name}
                          variant="outline"
                          className="w-full justify-start"
                        >
                          <div className="text-left">
                            <div className="font-medium">{filter.name}</div>
                            <div className="text-xs text-gray-600">{filter.preview}</div>
                          </div>
                        </Button>
                      ))}
                    </TabsContent>
                    
                    <TabsContent value="effects" className="space-y-3 mt-4">
                      <Button variant="outline" className="w-full justify-start">
                        <i className="fas fa-adjust mr-2"></i>
                        Vignette
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <i className="fas fa-sun mr-2"></i>
                        Glow
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <i className="fas fa-eye mr-2"></i>
                        Blur
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <i className="fas fa-search mr-2"></i>
                        Sharpen
                      </Button>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button className="w-full bg-pink-600 hover:bg-pink-700" size="lg">
                  <i className="fas fa-save mr-2"></i>
                  Save Edited Image
                </Button>
                <Button variant="outline" className="w-full">
                  <i className="fas fa-undo mr-2"></i>
                  Reset All Changes
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
