export interface ProcessingOptions {
  quality?: number;
  width?: number;
  height?: number;
  maintainAspectRatio?: boolean;
  format?: 'jpeg' | 'png' | 'webp' | 'gif';
}

export interface ProcessingResult {
  success: boolean;
  originalSize: number;
  processedSize: number;
  compressionRatio: number;
  blob: Blob;
  error?: string;
}

// Client-side image processing utilities
export class ImageProcessor {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor() {
    this.canvas = document.createElement('canvas');
    const context = this.canvas.getContext('2d');
    if (!context) {
      throw new Error('Canvas 2D context not supported');
    }
    this.ctx = context;
  }

  async loadImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(img);
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load image'));
      };
      
      img.src = url;
    });
  }

  async compressImage(file: File, options: ProcessingOptions = {}): Promise<ProcessingResult> {
    try {
      const img = await this.loadImage(file);
      const { quality = 0.8 } = options;

      this.canvas.width = img.width;
      this.canvas.height = img.height;
      
      this.ctx.drawImage(img, 0, 0);
      
      return new Promise((resolve) => {
        this.canvas.toBlob((blob) => {
          if (!blob) {
            resolve({
              success: false,
              originalSize: file.size,
              processedSize: 0,
              compressionRatio: 0,
              blob: new Blob(),
              error: 'Failed to compress image'
            });
            return;
          }

          const compressionRatio = ((file.size - blob.size) / file.size) * 100;
          
          resolve({
            success: true,
            originalSize: file.size,
            processedSize: blob.size,
            compressionRatio,
            blob
          });
        }, 'image/jpeg', quality);
      });
    } catch (error) {
      return {
        success: false,
        originalSize: file.size,
        processedSize: 0,
        compressionRatio: 0,
        blob: new Blob(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async resizeImage(file: File, options: ProcessingOptions = {}): Promise<ProcessingResult> {
    try {
      const img = await this.loadImage(file);
      const { width, height, maintainAspectRatio = true } = options;

      if (!width && !height) {
        throw new Error('Width or height must be specified');
      }

      let newWidth = width || img.width;
      let newHeight = height || img.height;

      if (maintainAspectRatio) {
        const aspectRatio = img.width / img.height;
        
        if (width && !height) {
          newWidth = width;
          newHeight = width / aspectRatio;
        } else if (!width && height) {
          newHeight = height;
          newWidth = height * aspectRatio;
        } else if (width && height) {
          // Fit within bounds
          const targetAspectRatio = width / height;
          if (aspectRatio > targetAspectRatio) {
            newWidth = width;
            newHeight = width / aspectRatio;
          } else {
            newHeight = height;
            newWidth = height * aspectRatio;
          }
        }
      }

      this.canvas.width = newWidth;
      this.canvas.height = newHeight;
      
      this.ctx.drawImage(img, 0, 0, newWidth, newHeight);
      
      return new Promise((resolve) => {
        this.canvas.toBlob((blob) => {
          if (!blob) {
            resolve({
              success: false,
              originalSize: file.size,
              processedSize: 0,
              compressionRatio: 0,
              blob: new Blob(),
              error: 'Failed to resize image'
            });
            return;
          }

          const sizeChange = ((file.size - blob.size) / file.size) * 100;
          
          resolve({
            success: true,
            originalSize: file.size,
            processedSize: blob.size,
            compressionRatio: sizeChange,
            blob
          });
        }, `image/${options.format || 'jpeg'}`, 0.9);
      });
    } catch (error) {
      return {
        success: false,
        originalSize: file.size,
        processedSize: 0,
        compressionRatio: 0,
        blob: new Blob(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async convertFormat(file: File, targetFormat: 'jpeg' | 'png' | 'webp'): Promise<ProcessingResult> {
    try {
      const img = await this.loadImage(file);

      this.canvas.width = img.width;
      this.canvas.height = img.height;
      
      // For PNG conversion, preserve transparency
      if (targetFormat === 'png') {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      } else {
        // For JPEG, fill with white background
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      }
      
      this.ctx.drawImage(img, 0, 0);
      
      return new Promise((resolve) => {
        this.canvas.toBlob((blob) => {
          if (!blob) {
            resolve({
              success: false,
              originalSize: file.size,
              processedSize: 0,
              compressionRatio: 0,
              blob: new Blob(),
              error: `Failed to convert to ${targetFormat}`
            });
            return;
          }

          const sizeChange = ((file.size - blob.size) / file.size) * 100;
          
          resolve({
            success: true,
            originalSize: file.size,
            processedSize: blob.size,
            compressionRatio: sizeChange,
            blob
          });
        }, `image/${targetFormat}`, targetFormat === 'jpeg' ? 0.9 : undefined);
      });
    } catch (error) {
      return {
        success: false,
        originalSize: file.size,
        processedSize: 0,
        compressionRatio: 0,
        blob: new Blob(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  getImageInfo(file: File): Promise<{ width: number; height: number; format: string }> {
    return this.loadImage(file).then(img => ({
      width: img.width,
      height: img.height,
      format: file.type
    }));
  }

  validateImageFile(file: File): { valid: boolean; error?: string } {
    const maxSize = 15 * 1024 * 1024; // 15MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Invalid file type. Only JPG, PNG, GIF, WebP, and SVG are supported.'
      };
    }

    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'File size exceeds 15MB limit.'
      };
    }

    return { valid: true };
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

// Export a singleton instance
export const imageProcessor = new ImageProcessor();
