import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";

interface ProcessingResultsProps {
  results: any;
  toolType: string;
  onReset: () => void;
}

export default function ProcessingResults({ results, toolType, onReset }: ProcessingResultsProps) {
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  const handleDownload = async (job: any) => {
    if (!job.downloadUrl) return;
    
    setDownloadingId(job.id);
    
    try {
      const response = await fetch(job.downloadUrl);
      if (!response.ok) throw new Error('Download failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = job.fileName.replace(/\.[^/.]+$/, `_${toolType}${job.fileName.match(/\.[^/.]+$/)?.[0] || '.jpg'}`);
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download error:', error);
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDownloadAll = async () => {
    for (const job of results.jobs) {
      if (job.downloadUrl) {
        await handleDownload(job);
        // Small delay between downloads
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
  };

  const getTotalSavings = () => {
    const totalOriginal = results.jobs.reduce((sum: number, job: any) => sum + (job.originalSize || 0), 0);
    const totalProcessed = results.jobs.reduce((sum: number, job: any) => sum + (job.processedSize || 0), 0);
    
    if (totalOriginal === 0) return 0;
    return ((totalOriginal - totalProcessed) / totalOriginal * 100);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 KB';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getToolIcon = (type: string) => {
    switch (type) {
      case 'compress': return 'fas fa-compress-alt';
      case 'resize': return 'fas fa-expand-arrows-alt';
      case 'crop': return 'fas fa-crop-alt';
      case 'convert': return 'fas fa-exchange-alt';
      default: return 'fas fa-image';
    }
  };

  const getToolColor = (type: string) => {
    switch (type) {
      case 'compress': return 'text-blue-600';
      case 'resize': return 'text-green-600';
      case 'crop': return 'text-purple-600';
      case 'convert': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  const totalSavings = getTotalSavings();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <i className="fas fa-check text-green-600 text-3xl"></i>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Your images have been processed!
        </h1>
        
        {toolType === 'compress' && totalSavings > 0 && (
          <div className="bg-gray-50 rounded-xl p-6 mb-6 max-w-md mx-auto">
            <div className="flex items-center justify-center mb-4">
              <div className="relative w-24 h-24">
                <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 84 84">
                  <circle 
                    cx="42" 
                    cy="42" 
                    r="38" 
                    stroke="#e5e7eb" 
                    strokeWidth="6" 
                    fill="none"
                  />
                  <circle 
                    cx="42" 
                    cy="42" 
                    r="38" 
                    stroke="#10B981" 
                    strokeWidth="6" 
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 38}`}
                    strokeDashoffset={`${2 * Math.PI * 38 * (1 - totalSavings / 100)}`}
                    className="transition-all duration-1000 ease-in-out"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{Math.round(totalSavings)}%</div>
                    <div className="text-xs text-gray-500">smaller</div>
                  </div>
                </div>
              </div>
            </div>
            
            <p className="text-gray-700 font-medium">
              Your images are now {Math.round(totalSavings)}% smaller!
            </p>
            <p className="text-sm text-gray-600 mt-1">
              {formatFileSize(results.jobs.reduce((sum: number, job: any) => sum + (job.originalSize || 0), 0))} → {' '}
              {formatFileSize(results.jobs.reduce((sum: number, job: any) => sum + (job.processedSize || 0), 0))}
            </p>
          </div>
        )}
      </div>

      {/* Results */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Processed Images ({results.jobs.length})</span>
            <div className="flex space-x-2">
              <Button
                onClick={handleDownloadAll}
                className="bg-primary hover:bg-primary/90"
              >
                <i className="fas fa-download mr-2"></i>
                Download All
              </Button>
              <Button
                variant="outline"
                onClick={onReset}
              >
                <i className="fas fa-plus mr-2"></i>
                Process More
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {results.jobs.map((job: any) => (
              <div key={job.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center`}>
                    <i className={`${getToolIcon(toolType)} ${getToolColor(toolType)} text-xl`}></i>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{job.fileName}</h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>
                        {formatFileSize(job.originalSize || 0)}
                        {job.processedSize && (
                          <> → {formatFileSize(job.processedSize)}</>
                        )}
                      </span>
                      {job.compressionRatio && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          {Math.round(job.compressionRatio)}% smaller
                        </Badge>
                      )}
                      <Badge 
                        variant={job.status === 'completed' ? 'default' : 'destructive'}
                        className={job.status === 'completed' ? 'bg-green-100 text-green-800' : ''}
                      >
                        {job.status}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {job.status === 'completed' && job.downloadUrl && (
                    <Button
                      onClick={() => handleDownload(job)}
                      disabled={downloadingId === job.id}
                      size="sm"
                      className="bg-primary hover:bg-primary/90"
                    >
                      {downloadingId === job.id ? (
                        <i className="fas fa-spinner fa-spin mr-2"></i>
                      ) : (
                        <i className="fas fa-download mr-2"></i>
                      )}
                      Download
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Continue to other tools */}
      <Card>
        <CardHeader>
          <CardTitle>Continue to...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/resize-image">
              <div className="flex items-center space-x-3 bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all cursor-pointer">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-expand-arrows-alt text-green-600"></i>
                </div>
                <div>
                  <div className="font-medium text-gray-900 text-sm">Resize IMAGE</div>
                </div>
                <i className="fas fa-chevron-right text-gray-400 text-sm ml-auto"></i>
              </div>
            </Link>

            <Link href="/crop-image">
              <div className="flex items-center space-x-3 bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all cursor-pointer">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-crop-alt text-purple-600"></i>
                </div>
                <div>
                  <div className="font-medium text-gray-900 text-sm">Crop IMAGE</div>
                </div>
                <i className="fas fa-chevron-right text-gray-400 text-sm ml-auto"></i>
              </div>
            </Link>

            <Link href="/rotate-image">
              <div className="flex items-center space-x-3 bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all cursor-pointer">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-redo text-yellow-600"></i>
                </div>
                <div>
                  <div className="font-medium text-gray-900 text-sm">Rotate IMAGE</div>
                </div>
                <i className="fas fa-chevron-right text-gray-400 text-sm ml-auto"></i>
              </div>
            </Link>

            <Link href="/convert-to-jpg">
              <div className="flex items-center space-x-3 bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all cursor-pointer">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-exchange-alt text-orange-600"></i>
                </div>
                <div>
                  <div className="font-medium text-gray-900 text-sm">Convert to JPG</div>
                </div>
                <i className="fas fa-chevron-right text-gray-400 text-sm ml-auto"></i>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
