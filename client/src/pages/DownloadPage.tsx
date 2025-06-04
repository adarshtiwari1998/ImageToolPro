
import { useEffect, useState } from "react";
import { useParams } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function DownloadPage() {
  const { toast } = useToast();
  const params = useParams<{ token: string; jobId: string }>();
  const [downloading, setDownloading] = useState(false);
  const [countdown, setCountdown] = useState(2);
  const [job, setJob] = useState<any>(null);

  useEffect(() => {
    if (!params.token || !params.jobId) {
      toast({
        title: "Invalid Download Link",
        description: "The download link is invalid or expired.",
        variant: "destructive",
      });
      return;
    }

    // Fetch job details (optional - for showing file info)
    const fetchJobDetails = async () => {
      try {
        const response = await fetch(`/api/job/${params.jobId}`);
        if (response.ok) {
          const jobData = await response.json();
          setJob(jobData);
        }
      } catch (error) {
        console.error('Failed to fetch job details:', error);
      }
    };

    fetchJobDetails();

    // Start countdown and auto-download after 2 seconds
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          handleDownload();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdownInterval);
  }, [params.token, params.jobId]);

  const handleDownload = async () => {
    if (!params.token || !params.jobId) return;

    setDownloading(true);
    try {
      const downloadUrl = `/download/${params.token}/${params.jobId}`;
      
      // Create invisible link and trigger download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = '';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      const getDownloadMessage = () => {
        switch (job?.toolType) {
          case 'compress': return "Your compressed image is downloading...";
          case 'resize': return "Your resized image is downloading...";
          case 'crop': return "Your cropped image is downloading...";
          case 'convert': return "Your converted image is downloading...";
          default: return "Your processed image is downloading...";
        }
      };

      toast({
        title: "Download Started",
        description: getDownloadMessage(),
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Could not download the file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDownloading(false);
    }
  };

  const handleProcessMore = () => {
    const getToolUrl = () => {
      switch (job?.toolType) {
        case 'compress': return '/compress-image';
        case 'resize': return '/resize-image';
        case 'crop': return '/crop-image';
        case 'convert': return '/convert-to-jpg';
        default: return '/compress-image';
      }
    };
    window.location.href = getToolUrl();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-check text-2xl text-green-600"></i>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {job?.toolType === 'compress' && 'Compression Complete!'}
            {job?.toolType === 'resize' && 'Resize Complete!'}
            {job?.toolType === 'crop' && 'Crop Complete!'}
            {job?.toolType === 'convert' && 'Conversion Complete!'}
            {!job?.toolType && 'Processing Complete!'}
          </h1>
          <p className="text-gray-600">
            {job?.toolType === 'compress' && 'Your image has been compressed successfully'}
            {job?.toolType === 'resize' && 'Your image has been resized successfully'}
            {job?.toolType === 'crop' && 'Your image has been cropped successfully'}
            {job?.toolType === 'convert' && 'Your image has been converted successfully'}
            {!job?.toolType && 'Your image has been processed successfully'}
          </p>
        </div>

        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-center">Download Ready</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {job && (
              <div className="text-center space-y-2">
                <p className="font-medium text-gray-900">{job.fileName}</p>
                <div className="text-sm text-gray-600">
                  <span className="block">
                    {((job.originalSize || 0) / 1024 / 1024).toFixed(2)} MB → {((job.processedSize || 0) / 1024 / 1024).toFixed(2)} MB
                  </span>
                  {job.compressionRatio && job.toolType === 'compress' && (
                    <span className="text-green-600 font-medium">
                      -{Math.abs(job.compressionRatio).toFixed(1)}% smaller
                    </span>
                  )}
                  {job.compressionRatio && job.toolType === 'resize' && job.compressionRatio > 0 && (
                    <span className="text-blue-600 font-medium">
                      {Math.abs(job.compressionRatio).toFixed(1)}% size reduction
                    </span>
                  )}
                  {job.compressionRatio && job.toolType === 'resize' && job.compressionRatio < 0 && (
                    <span className="text-orange-600 font-medium">
                      {Math.abs(job.compressionRatio).toFixed(1)}% size increase
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="text-center">
              {countdown > 0 ? (
                <div className="space-y-3">
                  <div className="text-lg font-semibold text-gray-900">
                    Downloading in {countdown}...
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${((2 - countdown) / 2) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ) : (
                <Button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  size="lg"
                >
                  {downloading ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Downloading...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-download mr-2"></i>
                      Download Now
                    </>
                  )}
                </Button>
              )}
            </div>

            <div className="text-center pt-4 border-t">
              <Button
                variant="outline"
                onClick={handleProcessMore}
                className="w-full"
              >
                <i className="fas fa-plus mr-2"></i>
                {job?.toolType === 'compress' && 'Compress More Images'}
                {job?.toolType === 'resize' && 'Resize More Images'}
                {job?.toolType === 'crop' && 'Crop More Images'}
                {job?.toolType === 'convert' && 'Convert More Images'}
                {!job?.toolType && 'Process More Images'}
              </Button>
            </div>

            <div className="text-xs text-gray-400 text-center">
              This file will be automatically deleted after 24 hours
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}
