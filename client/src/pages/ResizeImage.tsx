import { useState } from "react";
import { useLocation } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ImageUploadZone from "@/components/ImageUploadZone";
import ProcessingResults from "@/components/ProcessingResults";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import AdBanner from "@/components/AdBanner";

export default function ResizeImage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [location, setLocation] = useLocation();
  const [files, setFiles] = useState<File[]>([]);
  const [resizeMode, setResizeMode] = useState<"pixels" | "percentage">("pixels");
  const [width, setWidth] = useState("800");
  const [height, setHeight] = useState("600");
  const [percentage, setPercentage] = useState("100");
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
  const [doNotEnlarge, setDoNotEnlarge] = useState(false);
  const [preserveQuality, setPreserveQuality] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [results, setResults] = useState(null);

  const resizeMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await apiRequest("POST", "/api/resize-image", formData);
      const data = await response.json();
      return data;
    },
    onSuccess: (data) => {
      console.log('Resize success, received data:', data);

      // Get the first completed job
      const completedJob = data.jobs && data.jobs.length > 0 ? data.jobs[0] : null;

      if (completedJob && completedJob.status === 'completed' && completedJob.downloadToken && completedJob.id) {
        // Show success message
        toast({
          title: "Resize Complete!",
          description: "Redirecting to download page...",
        });

        console.log('Redirecting to:', `/download/${completedJob.downloadToken}/${completedJob.id}`);

        // Use wouter's setLocation for navigation
        setTimeout(() => {
          setLocation(`/download/${completedJob.downloadToken}/${completedJob.id}`);
        }, 1000);
      } else {
        console.log('No completed job with download token found, showing results instead');
        // Fallback for any edge cases
        setResults(data);
        toast({
          title: "Resize Complete!",
          description: `Successfully resized ${data.jobs.length} image(s).`,
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Resize Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleResize = () => {
    if (files.length === 0) return;

    const formData = new FormData();
    files.forEach((file) => {
      formData.append('images', file);
    });

    formData.append('resizeMode', resizeMode);
    if (resizeMode === 'pixels') {
      formData.append('width', width);
      formData.append('height', height);
    } else {
      formData.append('percentage', percentage);
    }
    formData.append('maintainAspectRatio', maintainAspectRatio.toString());
    formData.append('doNotEnlarge', doNotEnlarge.toString());
    formData.append('preserveQuality', preserveQuality.toString());

    resizeMutation.mutate(formData);
  };

  const handleFilesSelected = (selectedFiles: File[]) => {
    setFiles(selectedFiles);
    setResults(null);
  };

  const presetSizes = [
    { name: "Social Media", width: "1080", height: "1080" },
    { name: "Facebook Cover", width: "1200", height: "630" },
    { name: "Instagram Story", width: "1080", height: "1920" },
    { name: "YouTube Thumbnail", width: "1280", height: "720" },
    { name: "Website Header", width: "1920", height: "600" },
    { name: "Profile Picture", width: "400", height: "400" },
  ];

  if (results) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <ProcessingResults 
          results={results} 
          toolType="resize"
          onReset={() => {
            setResults(null);
            setFiles([]);
          }}
        />
        <Footer />
        {!user?.isPremium && <AdBanner />}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tool Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Resize IMAGE</h1>
          <p className="text-lg text-gray-600">
            Resize <span className="text-blue-600 font-semibold">JPG</span>, 
            <span className="text-blue-600 font-semibold"> PNG</span>, 
            <span className="text-blue-600 font-semibold"> GIF</span> images to exact dimensions or scale percentage.
            <br />Perfect for social media, web, or print.
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
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                          <i className="fas fa-expand-arrows-alt text-green-600"></i>
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

            {/* Resize Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Resize Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Resize Mode Toggle */}
                <div>
                  <Label className="text-base font-medium">Resize options</Label>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <Button
                      variant={resizeMode === "pixels" ? "default" : "outline"}
                      onClick={() => {
                        setResizeMode("pixels");
                        setSelectedPreset(null);
                      }}
                      className="flex items-center justify-center h-16"
                    >
                      <div className="text-center">
                        <i className="fas fa-expand-arrows-alt text-lg mb-1"></i>
                        <div className="text-sm font-medium">By pixels</div>
                      </div>
                    </Button>
                    <Button
                      variant={resizeMode === "percentage" ? "default" : "outline"}
                      onClick={() => {
                        setResizeMode("percentage");
                        setSelectedPreset(null);
                      }}
                      className="flex items-center justify-center h-16"
                    >
                      <div className="text-center">
                        <i className="fas fa-percentage text-lg mb-1"></i>
                        <div className="text-sm font-medium">By percentage</div>
                      </div>
                    </Button>
                  </div>
                </div>

                {resizeMode === "pixels" ? (
                  <>
                    {/* Preset Sizes - Only show for pixels mode */}
                    <div>
                      <Label className="text-base font-medium">Popular Sizes</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                        {presetSizes.map((preset) => (
                          <Button
                            key={preset.name}
                            variant={selectedPreset === preset.name ? "default" : "outline"}
                            onClick={() => {
                              setWidth(preset.width);
                              setHeight(preset.height);
                              setSelectedPreset(preset.name);
                            }}
                            className={`flex flex-col items-center h-auto p-3 ${
                              selectedPreset === preset.name 
                                ? "bg-blue-600 text-white border-blue-600" 
                                : "hover:bg-blue-50 hover:border-blue-300"
                            }`}
                          >
                            <div className="font-medium text-sm">{preset.name}</div>
                            <div className={`text-xs ${
                              selectedPreset === preset.name ? "text-blue-100" : "text-gray-600"
                            }`}>
                              {preset.width} × {preset.height}
                            </div>
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Custom Dimensions */}
                    <div>
                      <p className="text-sm text-gray-600 mb-3">
                        Resize all images to a <strong>exact size</strong> of
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="width">Width (px):</Label>
                          <Input
                            id="width"
                            type="number"
                            value={width}
                            onChange={(e) => {
                              setWidth(e.target.value);
                              setSelectedPreset(null);
                            }}
                            placeholder="Width"
                          />
                        </div>
                        <div>
                          <Label htmlFor="height">Height (px):</Label>
                          <Input
                            id="height"
                            type="number"
                            value={height}
                            onChange={(e) => {
                              setHeight(e.target.value);
                              setSelectedPreset(null);
                            }}
                            placeholder="Height"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  /* Percentage Mode */
                  <div>
                    <p className="text-sm text-gray-600 mb-3">
                      Resize all images by <strong>percentage</strong>
                    </p>
                    <div>
                      <Label htmlFor="percentage">Percentage (%):</Label>
                      <Input
                        id="percentage"
                        type="number"
                        value={percentage}
                        onChange={(e) => setPercentage(e.target.value)}
                        placeholder="100"
                        min="1"
                        max="500"
                      />
                    </div>
                  </div>
                )}

                {/* Advanced Options */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="maintain-aspect-ratio"
                      checked={maintainAspectRatio}
                      onCheckedChange={setMaintainAspectRatio}
                    />
                    <Label htmlFor="maintain-aspect-ratio">
                      Maintain aspect ratio
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="do-not-enlarge"
                      checked={doNotEnlarge}
                      onCheckedChange={setDoNotEnlarge}
                    />
                    <Label htmlFor="do-not-enlarge">
                      Do not enlarge if smaller
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="preserveQuality"
                      checked={preserveQuality}
                      onCheckedChange={setPreserveQuality}
                    />
                    <Label htmlFor="preserveQuality">Preserve image quality (larger file size)</Label>
                  </div>
                </div>

                {!user?.isPremium && files.length > 1 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <i className="fas fa-crown text-yellow-500 mr-2"></i>
                      <span className="text-yellow-800">
                        Batch processing requires Premium subscription. 
                        <Button variant="link" className="text-yellow-600 p-0 h-auto">
                          Upgrade now
                        </Button>
                      </span>
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleResize}
                  disabled={resizeMutation.isPending || (!user?.isPremium && files.length > 1)}
                  className="w-full bg-green-600 hover:bg-green-700"
                  size="lg"
                >
                  {resizeMutation.isPending ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Resizing...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-expand-arrows-alt mr-2"></i>
                      Resize Images
                    </>
                  )}
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