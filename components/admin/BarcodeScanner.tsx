"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Camera, X } from "lucide-react";

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  onClose?: () => void;
}

export function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualBarcode, setManualBarcode] = useState("");
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const isCleaningUpRef = useRef(false);
  const scannerContainerIdRef = useRef(`scanner-${Date.now()}`);

  const startScanning = async () => {
    try {
      setError(null);
      
      // Check if camera is available
      const devices = await Html5Qrcode.getCameras();
      if (devices.length === 0) {
        setError("No camera found. Please connect a camera device.");
        return;
      }

      // Create a fresh container for the scanner outside React's control
      if (wrapperRef.current) {
        // Clear any existing content (including placeholder)
        wrapperRef.current.innerHTML = "";
        
        // Create a new div for the scanner
        const scannerDiv = document.createElement("div");
        scannerDiv.id = scannerContainerIdRef.current;
        scannerDiv.style.width = "100%";
        scannerDiv.style.height = "100%";
        wrapperRef.current.appendChild(scannerDiv);
      } else {
        setError("Scanner container not ready. Please try again.");
        return;
      }

      const scanner = new Html5Qrcode(scannerContainerIdRef.current);
      scannerRef.current = scanner;

      // Try back camera first, then front camera, then any available
      let cameraId: string | { facingMode: string } = { facingMode: "environment" };
      
      // Find back camera if available
      const backCamera = devices.find(device => 
        device.label.toLowerCase().includes("back") || 
        device.label.toLowerCase().includes("rear")
      );
      if (backCamera) {
        cameraId = backCamera.id;
      } else if (devices.length > 0) {
        // Use first available camera
        cameraId = devices[0].id;
      }

      await scanner.start(
        cameraId,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        async (decodedText) => {
          // Stop scanning first
          if (!isCleaningUpRef.current) {
            isCleaningUpRef.current = true;
            scannerRef.current = null;
            setScanning(false);
            
            try {
              await scanner.stop();
            } catch (err: any) {
              // Silently ignore stop errors
            }
            
            // Clean up and call the callback
            setTimeout(() => {
              if (wrapperRef.current) {
                wrapperRef.current.innerHTML = "";
              }
              scannerContainerIdRef.current = `scanner-${Date.now()}`;
              isCleaningUpRef.current = false;
              onScan(decodedText);
            }, 300);
          }
        },
        (errorMessage) => {
          // Ignore scanning errors - they're normal during scanning
          // Only log if it's not a common scanning error
          if (!errorMessage.includes("NotFoundException") && 
              !errorMessage.includes("No MultiFormat Readers")) {
            console.debug("Scanning:", errorMessage);
          }
        }
      );

      setScanning(true);
    } catch (err: any) {
      console.error("Error starting scanner:", err);
      
      // Provide more helpful error messages
      let errorMessage = "Failed to start camera.";
      
      if (err.name === "NotAllowedError" || err.message?.includes("permission")) {
        errorMessage = "Camera permission denied. Please allow camera access in your browser settings and try again.";
      } else if (err.name === "NotFoundError" || err.message?.includes("not found")) {
        errorMessage = "No camera found. Please connect a camera device.";
      } else if (err.name === "NotReadableError" || err.message?.includes("not readable")) {
        errorMessage = "Camera is already in use by another application. Please close other apps using the camera.";
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setScanning(false);
      
      // Clean up on error
      if (scannerRef.current && !isCleaningUpRef.current) {
        isCleaningUpRef.current = true;
        const scanner = scannerRef.current;
        scannerRef.current = null;
        
        try {
          await scanner.stop();
        } catch (cleanupErr: any) {
          // Silently ignore all cleanup errors
        }
        
        // Clean up container
        setTimeout(() => {
          if (wrapperRef.current) {
            wrapperRef.current.innerHTML = "";
          }
          scannerContainerIdRef.current = `scanner-${Date.now()}`;
          isCleaningUpRef.current = false;
        }, 300);
      }
    }
  };

  const stopScanning = async () => {
    if (isCleaningUpRef.current || !scannerRef.current) {
      return;
    }
    
    isCleaningUpRef.current = true;
    const scanner = scannerRef.current;
    scannerRef.current = null;
    setScanning(false);
    
    try {
      // Stop the scanner
      await scanner.stop();
    } catch (err: any) {
      // Silently ignore all stop errors
    }
    
    // Clean up the container manually after stopping
    setTimeout(() => {
      if (wrapperRef.current) {
        wrapperRef.current.innerHTML = "";
      }
      // Generate new container ID for next scan
      scannerContainerIdRef.current = `scanner-${Date.now()}`;
      isCleaningUpRef.current = false;
    }, 300);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualBarcode.trim()) {
      onScan(manualBarcode.trim());
      setManualBarcode("");
    }
  };

  useEffect(() => {
    // Global error handler to catch media/removeChild errors from html5-qrcode
    const handleError = (event: ErrorEvent) => {
      const errorMsg = event.error?.message || event.message || "";
      if (errorMsg.includes("removeChild") || 
          errorMsg.includes("not a child") ||
          errorMsg.includes("play() request was interrupted") ||
          errorMsg.includes("media was removed")) {
        event.preventDefault();
        event.stopPropagation();
        return true;
      }
      return false;
    };

    // Also handle unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason?.message || event.reason?.toString() || "";
      if (reason.includes("play() request was interrupted") ||
          reason.includes("media was removed") ||
          reason.includes("AbortError")) {
        event.preventDefault();
        return true;
      }
      return false;
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);
    
    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
      
      // Cleanup on unmount
      if (scannerRef.current && !isCleaningUpRef.current) {
        isCleaningUpRef.current = true;
        const scanner = scannerRef.current;
        scannerRef.current = null;
        
        // Only stop, don't clear - React will handle DOM cleanup
        scanner.stop().catch(() => {
          // Silently ignore unmount cleanup errors
        });
      }
    };
  }, []);

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Scan Barcode</CardTitle>
            <CardDescription>Use camera or enter barcode manually</CardDescription>
          </div>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Camera Scanner */}
        <div className="space-y-2">
          <div className="w-full aspect-square bg-black rounded-lg overflow-hidden relative">
            <div
              ref={wrapperRef}
              className="w-full h-full flex items-center justify-center"
            >
              {!scanning && (
                <div className="text-white text-center p-8">
                  <Camera className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm">Camera scanner will appear here</p>
                  <p className="text-xs mt-2 opacity-75">Click &quot;Start Camera Scanner&quot; to begin</p>
                </div>
              )}
            </div>
            {scanning && (
              <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded z-10">
                Scanning...
              </div>
            )}
          </div>

          <div className="flex gap-2">
            {!scanning ? (
              <Button 
                onClick={startScanning} 
                className="w-full" 
                type="button"
                disabled={scanning}
              >
                <Camera className="h-4 w-4 mr-2" />
                Start Camera Scanner
              </Button>
            ) : (
              <Button 
                onClick={stopScanning} 
                variant="destructive" 
                className="w-full" 
                type="button"
              >
                Stop Scanner
              </Button>
            )}
          </div>
          
          {error && (
            <Alert variant="destructive" className="mt-2">
              <AlertDescription className="text-sm">
                {error}
                <br />
                <span className="text-xs mt-1 block">
                  Tip: Make sure you&apos;ve granted camera permissions in your browser settings.
                </span>
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or</span>
          </div>
        </div>

        {/* Manual Entry */}
        <form onSubmit={handleManualSubmit} className="space-y-2">
          <Input
            type="text"
            placeholder="Enter barcode manually"
            value={manualBarcode}
            onChange={(e) => setManualBarcode(e.target.value)}
            className="w-full"
          />
          <Button type="submit" className="w-full" disabled={!manualBarcode.trim()}>
            Add Product
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

