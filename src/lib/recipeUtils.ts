import jsPDF from "jspdf";

interface Product {
  id: string;
  name: string;
  reference: string;
  thumbnail_url: string | null;
}

interface RecipeData {
  patientName: string;
  date: string;
  products: Product[];
  notes: string;
  doctorName?: string;
}

// Genera un PDF de la receta
export const generateRecipePDF = async (data: RecipeData): Promise<Blob> => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header con logo
  doc.setFillColor(220, 38, 38); // Color rojo Lacer
  doc.rect(0, 0, pageWidth, 40, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("LACER", 20, 25);
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("Receta Digital", pageWidth - 20, 25, { align: "right" });
  
  // Reset color
  doc.setTextColor(0, 0, 0);
  
  // Info del paciente
  let yPos = 55;
  
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
  
  data.products.forEach((product, index) => {
    if (yPos > 260) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFillColor(248, 248, 248);
    doc.roundedRect(20, yPos - 5, pageWidth - 40, 18, 3, 3, "F");
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(`${index + 1}. ${product.name}`, 25, yPos + 5);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(`C.N. ${product.reference?.replace(".", "") || "N/A"}`, pageWidth - 25, yPos + 5, { align: "right" });
    doc.setTextColor(0, 0, 0);
    
    yPos += 22;
  });
  
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
  }
  
  // Footer
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text("Generado con Talonario Digital Lacer", pageWidth / 2, pageHeight - 10, { align: "center" });
  
  return doc.output("blob");
};

// Genera texto para WhatsApp
export const generateWhatsAppMessage = (data: RecipeData): string => {
  let message = `🏥 *RECETA DIGITAL LACER*\n\n`;
  message += `👤 *Paciente:* ${data.patientName || "No especificado"}\n`;
  message += `📅 *Fecha:* ${data.date}\n\n`;
  message += `📋 *Productos recomendados:*\n`;
  
  data.products.forEach((product, index) => {
    message += `${index + 1}. ${product.name}\n`;
    message += `   _C.N. ${product.reference?.replace(".", "") || "N/A"}_\n`;
  });
  
  if (data.notes) {
    message += `\n📝 *Notas:*\n${data.notes}\n`;
  }
  
  message += `\n_Generado con Talonario Digital Lacer_`;
  
  return message;
};

// Genera texto para Email
export const generateEmailContent = (data: RecipeData): { subject: string; body: string } => {
  const subject = `Receta Digital - ${data.patientName || "Paciente"} - ${data.date}`;
  
  let body = `Estimado/a ${data.patientName || "Paciente"},\n\n`;
  body += `A continuación le detallo los productos recomendados:\n\n`;
  
  data.products.forEach((product, index) => {
    body += `${index + 1}. ${product.name}\n`;
    body += `   Código Nacional: ${product.reference?.replace(".", "") || "N/A"}\n\n`;
  });
  
  if (data.notes) {
    body += `Notas adicionales:\n${data.notes}\n\n`;
  }
  
  body += `Un saludo cordial.\n\n`;
  body += `---\nGenerado con Talonario Digital Lacer`;
  
  return { subject, body };
};

// Abre WhatsApp con el mensaje
export const sendViaWhatsApp = (data: RecipeData, phoneNumber?: string): void => {
  const message = generateWhatsAppMessage(data);
  const encodedMessage = encodeURIComponent(message);
  
  let url = `https://wa.me/`;
  if (phoneNumber) {
    const cleanPhone = phoneNumber.replace(/\D/g, "");
    url += cleanPhone;
  }
  url += `?text=${encodedMessage}`;
  
  window.open(url, "_blank");
};

// Abre cliente de email
export const sendViaEmail = (data: RecipeData, email?: string): void => {
  const { subject, body } = generateEmailContent(data);
  const encodedSubject = encodeURIComponent(subject);
  const encodedBody = encodeURIComponent(body);
  
  let url = `mailto:${email || ""}?subject=${encodedSubject}&body=${encodedBody}`;
  window.location.href = url;
};

// Descarga el PDF
export const downloadPDF = async (data: RecipeData): Promise<void> => {
  const blob = await generateRecipePDF(data);
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.href = url;
  link.download = `receta-${data.patientName?.replace(/\s+/g, "-").toLowerCase() || "paciente"}-${data.date}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
