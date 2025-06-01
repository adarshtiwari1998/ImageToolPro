import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface ImageUploadZoneProps {
  onFilesSelected: (files: File[]) => void;
  maxFiles?: number;
  acceptedFileTypes?: string[];
  maxFileSize?: number; // in MB
}

export default function ImageUploadZone({ 
  onFilesSelected, 
  maxFiles = 40,
  acceptedFileTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
  maxFileSize = 15 // 15MB
}: ImageUploadZoneProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    // Check file type
    if (!acceptedFileTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: `${file.name} is not a supported image format.`,
        variant: "destructive",
      });
      return false;
    }

    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxFileSize) {
      toast({
        title: "File too large",
        description: `${file.name} is larger than ${maxFileSize}MB limit.`,
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleFiles = useCallback((files: FileList) => {
    const fileArray = Array.from(files);
    const validFiles: File[] = [];

    // Validate each file
    for (const file of fileArray) {
      if (validateFile(file)) {
        validFiles.push(file);
      }
    }

    if (validFiles.length === 0) {
      return;
    }

    // Check batch processing limits for free users
    if (!user?.isPremium && validFiles.length > 1) {
      toast({
        title: "Premium required",
        description: "Batch processing requires a Premium subscription. Processing first image only.",
        variant: "destructive",
      });
      validFiles.splice(1); // Keep only first file
    }

    // Check max files limit
    if (validFiles.length > maxFiles) {
      toast({
        title: "Too many files",
        description: `Maximum ${maxFiles} files allowed. Processing first ${maxFiles} files.`,
        variant: "destructive",
      });
      validFiles.splice(maxFiles);
    }

    if (validFiles.length > 0) {
      onFilesSelected(validFiles);
      toast({
        title: "Files selected",
        description: `${validFiles.length} image(s) ready for processing.`,
      });
    }
  }, [user?.isPremium, maxFiles, onFilesSelected, toast]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFiles(files);
    }
  }, [handleFiles]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
    // Reset input value to allow selecting the same files again
    e.target.value = '';
  }, [handleFiles]);

  const handleSelectClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div
        className={`upload-zone border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer ${
          isDragOver 
            ? 'border-primary bg-blue-50 drag-over' 
            : 'border-gray-300 hover:border-primary hover:bg-gray-50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleSelectClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedFileTypes.join(',')}
          onChange={handleFileInputChange}
          className="hidden"
        />

        <div className="space-y-6">
          <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto">
            <i className="fas fa-cloud-upload-alt text-white text-3xl"></i>
          </div>

          <div>
            <Button 
              type="button"
              className="bg-primary text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-primary/90 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                handleSelectClick();
              }}
            >
              Select images
            </Button>
            <p className="text-gray-500 mt-3">or drop images here</p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-400">
            <div className="flex items-center space-x-1">
              <i className="fas fa-upload"></i>
              <span>Up to {user?.isPremium ? maxFiles : 1} image{user?.isPremium && maxFiles > 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center space-x-1">
              <i className="fas fa-file"></i>
              <span>{maxFileSize}MB per image</span>
            </div>
            <div className="flex items-center space-x-1">
              <i className="fas fa-shield-alt"></i>
              <span>Files deleted after 24h</span>
            </div>
          </div>

          {!user?.isPremium && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md mx-auto">
              <div className="flex items-center text-yellow-800 text-sm">
                <i className="fas fa-info-circle mr-2"></i>
                <span>
                  Free users can process 1 image at a time. 
                  <Button variant="link" className="text-yellow-600 p-0 h-auto ml-1">
                    Upgrade to Premium
                  </Button>
                  {" "}for batch processing.
                </span>
              </div>
            </div>
          )}

          <div className="text-xs text-gray-400">
            Supported formats: JPG, PNG, GIF, WebP, SVG
          </div>
        </div>
      </div>
    </div>
  );
}