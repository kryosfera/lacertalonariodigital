import jsPDF from "jspdf";
import QRCode from "qrcode";
import { generateBarcodeDataURL } from "@/components/BarcodeDisplay";
import { supabase } from "@/integrations/supabase/client";

interface Product {
  id: string;
  name: string;
  reference: string;
  ean?: string | null;
  thumbnail_url: string | null;
  quantity?: number;
  video_urls?: string[] | null;
}

interface ProfileInfo {
  logo_url?: string | null;
  clinic_name?: string | null;
  clinic_address?: string | null;
  professional_name?: string | null;
  registration_number?: string | null;
  signature_url?: string | null;
}

interface RecipeData {
  patientName: string;
  date: string;
  products: Product[];
  notes: string;
  doctorName?: string;
  profile?: ProfileInfo | null;
}

// Create a short URL and return the code
export const createShortUrl = async (data: RecipeData): Promise<string | null> => {
  try {
    // Direct fetch to avoid type issues with new table
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/short_urls`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({ data })
      }
    );
    
    if (!response.ok) {
      console.error('Error creating short URL:', await response.text());
      return null;
    }
    
    const result = await response.json();
    return result[0]?.code || null;
  } catch (err) {
    console.error('Error creating short URL:', err);
    return null;
  }
};

// Get recipe data from short URL code
export const getShortUrlData = async (code: string): Promise<RecipeData | null> => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/short_urls?code=eq.${code}&select=data`,
      {
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`
        }
      }
    );
    
    if (!response.ok) return null;
    
    const result = await response.json();
    if (!result[0]?.data) return null;
    
    const recipeData = result[0].data as {
      patientName?: string;
      date?: string;
      products?: Product[];
      notes?: string;
    };
    
    return {
      patientName: recipeData.patientName || '',
      date: recipeData.date || new Date().toLocaleDateString('es-ES'),
      products: recipeData.products || [],
      notes: recipeData.notes || ''
    };
  } catch {
    return null;
  }
};

// Generate shareable recipe URL (for DB-stored recipes)
export const generateRecipeUrl = (recipeCode: string): string => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/receta?n=${recipeCode}`;
};

// Generate short URL for temporary recipes
export const generateShortRecipeUrl = (shortCode: string): string => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/r/${shortCode}`;
};

// Legacy: Encode recipe data for temporary URL (fallback)
export const encodeRecipeData = (data: RecipeData): string => {
  const minimalData = {
    p: data.patientName,
    d: data.date,
    n: data.notes,
    pr: data.products.map(p => ({
      i: p.id,
      n: p.name,
      r: p.reference,
      e: p.ean || null,
      q: p.quantity || 1,
      t: p.thumbnail_url,
      v: p.video_urls && p.video_urls.length > 0 ? p.video_urls : undefined
    }))
  };
  return btoa(encodeURIComponent(JSON.stringify(minimalData)));
};

// Legacy: Decode recipe data from temporary URL
export const decodeRecipeData = (encoded: string): RecipeData | null => {
  try {
    const decoded = JSON.parse(decodeURIComponent(atob(encoded)));
    return {
      patientName: decoded.p || "",
      date: decoded.d || new Date().toLocaleDateString("es-ES"),
      notes: decoded.n || "",
      products: (decoded.pr || []).map((p: Record<string, unknown>) => ({
        id: String(p.i || ""),
        name: String(p.n || ""),
        reference: String(p.r || ""),
        ean: p.e ? String(p.e) : null,
        quantity: Number(p.q || 1),
        thumbnail_url: p.t ? String(p.t) : null,
        video_urls: Array.isArray(p.v) ? p.v.map(String) : null
      }))
    };
  } catch {
    return null;
  }
};

// Legacy: Generate temporary shareable URL (fallback if short URL fails)
export const generateTemporaryRecipeUrl = (data: RecipeData): string => {
  const baseUrl = window.location.origin;
  const encoded = encodeRecipeData(data);
  return `${baseUrl}/receta?d=${encoded}`;
};

// Generate QR code as data URL
const generateQRCode = async (url: string): Promise<string> => {
  try {
    return await QRCode.toDataURL(url, {
      width: 100,
      margin: 1,
      color: {
        dark: "#000000",
        light: "#ffffff"
      }
    });
  } catch {
    return "";
  }
};

// Genera un PDF de la receta con QR code
export const generateRecipePDF = async (data: RecipeData, recipeUrl?: string): Promise<Blob> => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header con logo
  // Fondo blanco para la cabecera
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageWidth, 45, "F");
  // Línea roja inferior del header
  doc.setFillColor(220, 38, 38);
  doc.rect(0, 42, pageWidth, 3, "F");

  // Cargar logo como base64
  try {
    const logoResponse = await fetch(window.location.origin + '/lacer-logo-bocas_sanas.jpg');
    if (logoResponse.ok) {
      const logoBlob = await logoResponse.blob();
      const logoDataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(logoBlob);
      });
      doc.addImage(logoDataUrl, 'JPEG', 8, 5, 90, 33);
    }
  } catch {
    // Fallback: texto si no carga el logo
    doc.setTextColor(220, 38, 38);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("LACER", 20, 28);
  }

  // QR Code in header if URL is provided
  if (recipeUrl) {
    const qrDataUrl = await generateQRCode(recipeUrl);
    if (qrDataUrl) {
      // Add light background for QR
      doc.setFillColor(248, 248, 248);
      doc.roundedRect(pageWidth - 45, 4, 32, 32, 2, 2, "F");
      doc.addImage(qrDataUrl, "PNG", pageWidth - 43, 6, 28, 28);
    }
  }

  // Reset color
  doc.setTextColor(0, 0, 0);
  
  // Info del paciente
  let yPos = 60;
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text("INFORMACIÓN DEL PACIENTE", 20, yPos);
  
  yPos += 10;
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.text(data.patientName || "Paciente no especificado", 20, yPos);
  
  yPos += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Fecha: ${data.date}`, 20, yPos);
  
  // Línea separadora
  yPos += 10;
  doc.setDrawColor(220, 220, 220);
  doc.line(20, yPos, pageWidth - 20, yPos);
  
  // Productos
  yPos += 15;
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text("PRODUCTOS RECOMENDADOS", 20, yPos);
  
  yPos += 10;
  doc.setTextColor(0, 0, 0);
  
  for (let index = 0; index < data.products.length; index++) {
    const product = data.products[index];
    const hasBarcode = product.ean && product.ean.length >= 8;
    const productHeight = hasBarcode ? 55 : 25;
    
    if (yPos + productHeight > 260) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFillColor(248, 248, 248);
    doc.roundedRect(20, yPos - 5, pageWidth - 40, productHeight, 3, 3, "F");
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    const qty = product.quantity && product.quantity > 1 ? ` (x${product.quantity})` : "";
    doc.text(`${index + 1}. ${product.name}${qty}`, 25, yPos + 5);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(`C.N. ${product.reference?.replace(".", "") || "N/A"}`, pageWidth - 25, yPos + 5, { align: "right" });
    
    // Add EAN barcode if available
    if (hasBarcode && product.ean) {
      doc.setFontSize(8);
      doc.text(`EAN: ${product.ean}`, 25, yPos + 14);
      
      // Generate barcode image
      const barcodeDataUrl = generateBarcodeDataURL(product.ean, {
        width: 1.5,
        height: 25,
        displayValue: true,
        fontSize: 10
      });
      
      if (barcodeDataUrl) {
        // Add barcode image centered
        doc.addImage(barcodeDataUrl, 'PNG', 25, yPos + 18, 80, 30);
      }
    }
    
    doc.setTextColor(0, 0, 0);
    yPos += productHeight + 5;
  }
  
  // Notas
  if (data.notes) {
    yPos += 5;
    doc.setDrawColor(220, 220, 220);
    doc.line(20, yPos, pageWidth - 20, yPos);
    
    yPos += 15;
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text("NOTAS ADICIONALES", 20, yPos);
    
    yPos += 10;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    
    const splitNotes = doc.splitTextToSize(data.notes, pageWidth - 40);
    doc.text(splitNotes, 20, yPos);
    yPos += splitNotes.length * 6;
  }
  
  // QR Code at bottom if URL is provided
  if (recipeUrl) {
    const pageHeight = doc.internal.pageSize.getHeight();
    const qrSize = 35;
    const qrY = Math.min(yPos + 15, pageHeight - 55);
    
    doc.setFillColor(248, 248, 248);
    doc.roundedRect(20, qrY, pageWidth - 40, 45, 3, 3, "F");
    
    const qrDataUrl = await generateQRCode(recipeUrl);
    if (qrDataUrl) {
      doc.addImage(qrDataUrl, "PNG", 25, qrY + 5, qrSize, qrSize);
    }
    
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text("Escanea el código QR para ver", 65, qrY + 15);
    doc.text("la receta en tu farmacia", 65, qrY + 22);
    
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    const shortUrl = recipeUrl.length > 50 ? recipeUrl.substring(0, 50) + "..." : recipeUrl;
    doc.text(shortUrl, 65, qrY + 32);
  }
  
  // Footer
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text("Generado con Talonario Digital Lacer", pageWidth / 2, pageHeight - 10, { align: "center" });
  
  return doc.output("blob");
};

// Genera texto para WhatsApp con URL
export const generateWhatsAppMessage = (data: RecipeData, recipeUrl?: string): string => {
  let message = `Consulta la receta en:\n`;
  
  if (recipeUrl) {
    message += `${recipeUrl}\n`;
  }
  
  message += `¡Gracias!`;
  
  return message;
};

// Genera texto para Email
export const generateEmailContent = (data: RecipeData, recipeUrl?: string): { subject: string; body: string } => {
  const subject = `Receta Digital - ${data.patientName || "Paciente"} - ${data.date}`;
  
  let body = `Estimado/a ${data.patientName || "Paciente"},\n\n`;
  
  if (recipeUrl) {
    body += `Puede ver su receta digital en el siguiente enlace:\n${recipeUrl}\n\n`;
    body += `Muestre este enlace en su farmacia para facilitar la dispensación de los productos.\n\n`;
  }
  
  body += `A continuación le detallo los productos recomendados:\n\n`;
  
  data.products.forEach((product, index) => {
    const qty = product.quantity && product.quantity > 1 ? ` (x${product.quantity})` : "";
    body += `${index + 1}. ${product.name}${qty}\n`;
    body += `   Código Nacional: ${product.reference?.replace(".", "") || "N/A"}\n\n`;
  });
  
  if (data.notes) {
    body += `Notas adicionales:\n${data.notes}\n\n`;
  }
  
  body += `Un saludo cordial.\n\n`;
  body += `---\nGenerado con Talonario Digital Lacer`;
  
  return { subject, body };
};

// Abre WhatsApp con el mensaje y URL de receta
// targetWindow: ventana pre-abierta sincrónicamente (necesario en iOS Safari para evitar popup blocker)
export const sendViaWhatsApp = (
  data: RecipeData,
  phoneNumber?: string,
  recipeUrl?: string,
  targetWindow?: Window | null
): void => {
  const message = generateWhatsAppMessage(data, recipeUrl);
  const encodedMessage = encodeURIComponent(message);
  
  let url = `https://wa.me/`;
  if (phoneNumber) {
    const cleanPhone = phoneNumber.replace(/\D/g, "");
    url += cleanPhone;
  }
  url += `?text=${encodedMessage}`;
  
  if (targetWindow) {
    // Redirigir la ventana ya abierta (funciona en iOS Safari sin activar el popup blocker)
    targetWindow.location.href = url;
  } else {
    window.open(url, "_blank");
  }
};

// Abre cliente de email
export const sendViaEmail = (data: RecipeData, email?: string, recipeUrl?: string): void => {
  const { subject, body } = generateEmailContent(data, recipeUrl);
  const encodedSubject = encodeURIComponent(subject);
  const encodedBody = encodeURIComponent(body);
  
  const url = `mailto:${email || ""}?subject=${encodedSubject}&body=${encodedBody}`;
  
  // Use a temporary <a> with target="_blank" to avoid navigating the SPA away
  const link = document.createElement("a");
  link.href = url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Descarga el PDF
export const downloadPDF = async (data: RecipeData, recipeUrl?: string): Promise<void> => {
  const blob = await generateRecipePDF(data, recipeUrl);
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.href = url;
  link.download = `receta-${data.patientName?.replace(/\s+/g, "-").toLowerCase() || "paciente"}-${data.date}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
