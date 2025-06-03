import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ImageUploadZone from "@/components/ImageUploadZone";
import ProcessingResults from "@/components/ProcessingResults";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import AdBanner from "@/components/AdBanner";

export default function CompressImage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [quality, setQuality] = useState([80]);
  const [results, setResults] = useState(null);

  const compressMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await apiRequest("POST", "/api/compress-image", formData);
      const data = await response.json();
      return data;
    },
    onSuccess: (data) => {
      // Get the first completed job
      const completedJob = data.jobs.find((job: any) => job.status === 'completed');
      if (completedJob && completedJob.downloadToken) {
        // Show success message and navigate after a short delay to show the loader effect
        toast({
          title: "Compression Complete!",
          description: "Redirecting to download...",
        });
        
        // Navigate to download page after showing the success state briefly
        setTimeout(() => {
          window.location.href = `/download/${completedJob.downloadToken}/${completedJob.id}`;
        }, 1500);
      } else {
        setResults(data);
        toast({
          title: "Compression Complete!",
          description: `Successfully compressed ${data.jobs.length} image(s).`,
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Compression Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCompress = () => {
    if (files.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select at least one image to compress",
        variant: "destructive",
      });
      return;
    }

    console.log('Starting compression with files:', files);

    const formData = new FormData();
    files.forEach((file, index) => {
      console.log(`Appending file ${index}:`, file.name, file.type, file.size);
      formData.append('images', file);
    });
    formData.append('quality', quality[0].toString());

    // Log FormData contents
    for (let pair of formData.entries()) {
      console.log('FormData entry:', pair[0], pair[1]);
    }

    compressMutation.mutate(formData);
  };

  const handleFilesSelected = (selectedFiles: File[]) => {
    setFiles(selectedFiles);
    setResults(null);
  };

  if (results) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <ProcessingResults 
          results={results} 
          toolType="compress"
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
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Compress IMAGE</h1>
          <p className="text-lg text-gray-600">
            Compress <span className="text-blue-600 font-semibold">JPG</span>, 
            <span className="text-blue-600 font-semibold"> PNG</span>, 
            <span className="text-blue-600 font-semibold"> SVG</span> or 
            <span className="text-blue-600 font-semibold"> GIF</span> with the best quality and compression.
            <br />Reduce the filesize of your images at once.
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
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <i className="fas fa-image text-blue-600"></i>
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

            {/* Compression Settings */}
            <Card className="relative">
              {compressMutation.isPending && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
                  <div className="text-center">
                    <i className="fas fa-spinner fa-spin text-3xl text-blue-600 mb-4"></i>
                    <p className="text-lg font-semibold text-gray-900">Compressing your images...</p>
                    <p className="text-sm text-gray-600">This may take a few moments</p>
                  </div>
                </div>
              )}
              <CardHeader>
                <CardTitle>Compression Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Quality: {quality[0]}%
                  </label>
                  <Slider
                    value={quality}
                    onValueChange={setQuality}
                    max={100}
                    min={10}
                    step={10}
                    className="w-full"
                    disabled={compressMutation.isPending}
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Smaller file</span>
                    <span>Better quality</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    variant={quality[0] <= 50 ? "default" : "outline"}
                    onClick={() => setQuality([30])}
                    className="flex flex-col items-center p-4 h-auto"
                    disabled={compressMutation.isPending}
                  >
                    <div className="font-semibold">High Compression</div>
                    <div className="text-sm text-gray-600">Smaller files</div>
                  </Button>
                  <Button
                    variant={quality[0] > 50 && quality[0] <= 85 ? "default" : "outline"}
                    onClick={() => setQuality([80])}
                    className="flex flex-col items-center p-4 h-auto"
                    disabled={compressMutation.isPending}
                  >
                    <div className="font-semibold">Recommended</div>
                    <div className="text-sm text-gray-600">Best balance</div>
                  </Button>
                  <Button
                    variant={quality[0] > 85 ? "default" : "outline"}
                    onClick={() => setQuality([95])}
                    className="flex flex-col items-center p-4 h-auto"
                    disabled={compressMutation.isPending}
                  >
                    <div className="font-semibold">Low Compression</div>
                    <div className="text-sm text-gray-600">High quality</div>
                  </Button>
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
                  onClick={handleCompress}
                  disabled={compressMutation.isPending || (!user?.isPremium && files.length > 1)}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  size="lg"
                >
                  {compressMutation.isPending ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Compressing & Preparing Download...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-compress-alt mr-2"></i>
                      Compress Images
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