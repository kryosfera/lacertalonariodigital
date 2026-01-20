import { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";

interface BarcodeDisplayProps {
  ean: string;
  width?: number;
  height?: number;
  displayValue?: boolean;
  fontSize?: number;
  className?: string;
}

export const BarcodeDisplay = ({ 
  ean, 
  width = 2, 
  height = 50, 
  displayValue = true,
  fontSize = 12,
  className = ""
}: BarcodeDisplayProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current && ean && ean.length >= 8) {
      try {
        // Try EAN-13 first, fallback to CODE128 for non-standard codes
        const format = ean.length === 13 ? 'EAN13' : ean.length === 8 ? 'EAN8' : 'CODE128';
        
        JsBarcode(canvasRef.current, ean, {
          format,
          width,
          height,
          displayValue,
          fontSize,
          margin: 5,
          background: "#ffffff",
          lineColor: "#000000"
        });
      } catch {
        // If EAN format fails, try CODE128 as fallback
        try {
          JsBarcode(canvasRef.current, ean, {
            format: 'CODE128',
            width,
            height,
            displayValue,
            fontSize,
            margin: 5,
            background: "#ffffff",
            lineColor: "#000000"
          });
        } catch {
          console.error('Failed to generate barcode for:', ean);
        }
      }
    }
  }, [ean, width, height, displayValue, fontSize]);

  if (!ean || ean.length < 8) {
    return null;
  }

  return (
    <canvas 
      ref={canvasRef} 
      className={className}
    />
  );
};

// Utility function to generate barcode as data URL for PDF
export const generateBarcodeDataURL = (ean: string, options?: {
  width?: number;
  height?: number;
  displayValue?: boolean;
  fontSize?: number;
}): string | null => {
  if (!ean || ean.length < 8) return null;
  
  try {
    const canvas = document.createElement('canvas');
    const format = ean.length === 13 ? 'EAN13' : ean.length === 8 ? 'EAN8' : 'CODE128';
    
    JsBarcode(canvas, ean, {
      format,
      width: options?.width || 2,
      height: options?.height || 50,
      displayValue: options?.displayValue ?? true,
      fontSize: options?.fontSize || 12,
      margin: 5,
      background: "#ffffff",
      lineColor: "#000000"
    });
    
    return canvas.toDataURL('image/png');
  } catch {
    // Fallback to CODE128
    try {
      const canvas = document.createElement('canvas');
      JsBarcode(canvas, ean, {
        format: 'CODE128',
        width: options?.width || 2,
        height: options?.height || 50,
        displayValue: options?.displayValue ?? true,
        fontSize: options?.fontSize || 12,
        margin: 5,
        background: "#ffffff",
        lineColor: "#000000"
      });
      return canvas.toDataURL('image/png');
    } catch {
      console.error('Failed to generate barcode data URL for:', ean);
      return null;
    }
  }
};
