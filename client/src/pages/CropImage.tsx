import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ImageUploadZone from "@/components/ImageUploadZone";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AdBanner from "@/components/AdBanner";

export default function CropImage() {
  const { user } = useAuth();
  const [files, setFiles] = useState<File[]>([]);

  const handleFilesSelected = (selectedFiles: File[]) => {
    setFiles(selectedFiles);
  };

  const aspectRatios = [
    { name: "Square", ratio: "1:1", icon: "fas fa-square" },
    { name: "Portrait", ratio: "3:4", icon: "fas fa-mobile-alt" },
    { name: "Landscape", ratio: "4:3", icon: "fas fa-laptop" },
    { name: "Widescreen", ratio: "16:9", icon: "fas fa-tv" },
    { name: "Instagram Post", ratio: "1:1", icon: "fab fa-instagram" },
    { name: "Facebook Cover", ratio: "16:9", icon: "fab fa-facebook" },
    { name: "Custom", ratio: "Custom", icon: "fas fa-crop-alt" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tool Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Crop IMAGE</h1>
          <p className="text-lg text-gray-600">
            Crop <span className="text-blue-600 font-semibold">JPG</span>, 
            <span className="text-blue-600 font-semibold"> PNG</span> or 
            <span className="text-blue-600 font-semibold"> GIF</span> images online.
            <br />Remove unwanted areas from your images with precision cropping tools.
          </p>
        </div>

        {files.length === 0 ? (
          <ImageUploadZone onFilesSelected={handleFilesSelected} />
        ) : (
          <div className="space-y-6">
            {/* File List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Selected Images ({files.length})</span>
                  <Button
                    variant="outline"
                    onClick={() => setFiles([])}
                  >
                    Clear All
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                          <i className="fas fa-crop-alt text-purple-600"></i>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{file.name}</p>
                          <p className="text-sm text-gray-600">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setFiles(files.filter((_, i) => i !== index))}
                      >
                        <i className="fas fa-times text-gray-400"></i>
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Crop Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Crop Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Aspect Ratios */}
                <div>
                  <h3 className="text-base font-medium mb-4">Select Aspect Ratio</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {aspectRatios.map((ratio) => (
                      <Button
                        key={ratio.name}
                        variant="outline"
                        className="flex flex-col items-center h-auto p-4 hover:bg-purple-50 hover:border-purple-300"
                      >
                        <i className={`${ratio.icon} text-purple-600 mb-2`}></i>
                        <div className="font-medium text-sm">{ratio.name}</div>
                        <div className="text-xs text-gray-600">{ratio.ratio}</div>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Preview Area */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <div className="w-64 h-48 bg-gray-100 rounded-lg mx-auto flex items-center justify-center">
                    <div className="text-gray-500">
                      <i className="fas fa-image text-4xl mb-2 block"></i>
                      <p>Interactive crop preview will appear here</p>
                      <p className="text-sm mt-2">This feature requires Premium subscription</p>
                    </div>
                  </div>
                </div>

                {!user?.isPremium && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <i className="fas fa-crown text-yellow-500 mr-2"></i>
                      <span className="text-yellow-800">
                        Advanced cropping tools require Premium subscription. 
                        <Button variant="link" className="text-yellow-600 p-0 h-auto">
                          Upgrade now
                        </Button>
                      </span>
                    </div>
                  </div>
                )}

                <Button
                  disabled={!user?.isPremium}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  size="lg"
                >
                  <i className="fas fa-crop-alt mr-2"></i>
                  Crop Images
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <Footer />
      {!user?.isPremium && <AdBanner />}
    </div>
  );
}
