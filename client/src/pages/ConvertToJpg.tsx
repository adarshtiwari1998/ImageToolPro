import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ImageUploadZone from "@/components/ImageUploadZone";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import AdBanner from "@/components/AdBanner";

export default function ConvertToJpg() {
  const { user } = useAuth();
  const [files, setFiles] = useState<File[]>([]);
  const [quality, setQuality] = useState([90]);

  const handleFilesSelected = (selectedFiles: File[]) => {
    setFiles(selectedFiles);
  };

  const supportedFormats = [
    { name: "PNG", icon: "fas fa-file-image", color: "text-blue-600" },
    { name: "GIF", icon: "fas fa-film", color: "text-green-600" },
    { name: "WebP", icon: "fas fa-images", color: "text-purple-600" },
    { name: "SVG", icon: "fas fa-vector-square", color: "text-orange-600" },
    { name: "BMP", icon: "fas fa-image", color: "text-red-600" },
    { name: "TIFF", icon: "fas fa-file-alt", color: "text-indigo-600" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tool Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Convert to JPG</h1>
          <p className="text-lg text-gray-600">
            Convert <span className="text-blue-600 font-semibold">PNG</span>, 
            <span className="text-blue-600 font-semibold"> GIF</span>, 
            <span className="text-blue-600 font-semibold"> WebP</span> or 
            <span className="text-blue-600 font-semibold"> RAW</span> images to JPG format online.
            <br />High quality conversion with optimized compression.
          </p>
        </div>

        {/* Supported Formats */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Supported Input Formats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
              {supportedFormats.map((format) => (
                <div key={format.name} className="flex flex-col items-center p-3 border rounded-lg hover:bg-gray-50">
                  <i className={`${format.icon} ${format.color} text-2xl mb-2`}></i>
                  <span className="text-sm font-medium">{format.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

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
                        <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                          <i className="fas fa-exchange-alt text-orange-600"></i>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{file.name}</p>
                          <p className="text-sm text-gray-600">
                            {file.type} • {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                          <p className="text-xs text-green-600">
                            Will be converted to: {file.name.replace(/\.[^/.]+$/, ".jpg")}
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

            {/* Conversion Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Conversion Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="text-base font-medium">
                    JPG Quality: {quality[0]}%
                  </Label>
                  <Slider
                    value={quality}
                    onValueChange={setQuality}
                    max={100}
                    min={50}
                    step={10}
                    className="w-full mt-3"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Smaller file</span>
                    <span>Better quality</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <i className="fas fa-compress-alt text-blue-600 text-2xl mb-2 block"></i>
                    <h4 className="font-medium">Optimized Size</h4>
                    <p className="text-sm text-gray-600">Perfect balance of quality and file size</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <i className="fas fa-devices text-green-600 text-2xl mb-2 block"></i>
                    <h4 className="font-medium">Universal Support</h4>
                    <p className="text-sm text-gray-600">Works on all devices and browsers</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg text-center">
                    <i className="fas fa-rocket text-purple-600 text-2xl mb-2 block"></i>
                    <h4 className="font-medium">Fast Loading</h4>
                    <p className="text-sm text-gray-600">Optimized for web and mobile</p>
                  </div>
                </div>

                {!user?.isPremium && files.length > 1 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <i className="fas fa-crown text-yellow-500 mr-2"></i>
                      <span className="text-yellow-800">
                        Batch conversion requires Premium subscription. 
                        <Button variant="link" className="text-yellow-600 p-0 h-auto">
                          Upgrade now
                        </Button>
                      </span>
                    </div>
                  </div>
                )}

                <Button
                  disabled={!user?.isPremium && files.length > 1}
                  className="w-full bg-orange-600 hover:bg-orange-700"
                  size="lg"
                >
                  <i className="fas fa-exchange-alt mr-2"></i>
                  Convert to JPG
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
