import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";

interface ProcessingResultsProps {
  results: any;
  toolType: string;
  onReset: () => void;
}

export default function ProcessingResults({ results, toolType, onReset }: ProcessingResultsProps) {
  const { toast } = useToast();
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  const handleDownload = async (job: any) => {
    try {
      if (!job.downloadUrl) {
        toast({
          title: "Download Failed",
          description: "Download URL not available. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Use the dynamic download URL directly
      const a = document.createElement('a');
      a.href = job.downloadUrl;
      a.download = `compressed_${job.fileName}`;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      toast({
        title: "Download Started",
        description: `Downloading ${job.fileName}`,
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download Failed",
        description: "Could not download the file. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadAll = async () => {
    for (const job of results.jobs) {
      if (job.status === 'completed' && job.downloadUrl) {
        await handleDownload(job);
        // Add small delay between downloads
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const completedJobs = results.jobs.filter((job: any) => job.status === 'completed');

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="fas fa-check text-2xl text-green-600"></i>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Your images have been processed!
        </h1>
        <p className="text-gray-600">
          {completedJobs.length} image{completedJobs.length !== 1 ? 's' : ''} processed successfully
        </p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Processed Images ({completedJobs.length})</span>
            <div className="flex gap-2">
              {completedJobs.length > 1 && (
                <Button onClick={handleDownloadAll} className="bg-blue-600 hover:bg-blue-700">
                  <i className="fas fa-download mr-2"></i>
                  Download All
                </Button>
              )}
              <Button variant="outline" onClick={onReset}>
                <i className="fas fa-plus mr-2"></i>
                Process More
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {completedJobs.map((job: any) => (
              <div key={job.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <i className="fas fa-image text-blue-600"></i>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{job.fileName}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>{formatFileSize(job.originalSize)} → {formatFileSize(job.processedSize)}</span>
                      <span className={`font-medium ${job.compressionRatio > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {job.compressionRatio > 0 ? '-' : '+'}{Math.abs(job.compressionRatio).toFixed(1)}% 
                        {job.compressionRatio > 0 ? ' smaller' : ' larger'}
                      </span>
                      <span className="text-green-600 font-medium">completed</span>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => handleDownload(job)}
                  disabled={downloadingId === job.id}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {downloadingId === job.id ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Downloading...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-download mr-2"></i>
                      Download
                    </>
                  )}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Continue to section */}
      <Card>
        <CardHeader>
          <CardTitle>Continue to...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="flex flex-col items-center p-4 h-auto">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mb-2">
                <i className="fas fa-expand-alt text-green-600"></i>
              </div>
              <span className="font-medium">Resize</span>
              <span className="text-xs text-gray-600">IMAGE</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center p-4 h-auto">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mb-2">
                <i className="fas fa-crop-alt text-purple-600"></i>
              </div>
              <span className="font-medium">Crop</span>
              <span className="text-xs text-gray-600">IMAGE</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center p-4 h-auto">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
                <i className="fas fa-redo text-blue-600"></i>
              </div>
              <span className="font-medium">Rotate</span>
              <span className="text-xs text-gray-600">IMAGE</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center p-4 h-auto">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mb-2">
                <i className="fas fa-exchange-alt text-orange-600"></i>
              </div>
              <span className="font-medium">Convert to</span>
              <span className="text-xs text-gray-600">JPG</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}