import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import type { AgreementDocument } from '../types/document';

function hexToRgb(hex: string) {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return { r: 0.09, g: 0.11, b: 0.13 };
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  return { r, g, b };
}

async function embedFont(pdfDoc: PDFDocument, weight: number, italic: boolean) {
  if (italic && weight >= 600) return pdfDoc.embedFont(StandardFonts.HelveticaBoldOblique);
  if (italic) return pdfDoc.embedFont(StandardFonts.HelveticaOblique);
  if (weight >= 600) return pdfDoc.embedFont(StandardFonts.HelveticaBold);
  return pdfDoc.embedFont(StandardFonts.Helvetica);
}

/**
 * Flattens an AgreementDocument's fields onto the original PDF bytes and
 * returns the exported PDF as a Blob. Text, checkboxes/radios, images, and
 * signature images are drawn directly into the page content — this is a real
 * PDF export, not a screenshot.
 */
export async function exportAgreementPdf(
  originalPdfBytes: ArrayBuffer,
  doc: AgreementDocument,
): Promise<Blob> {
  const pdfDoc = await PDFDocument.load(originalPdfBytes);
  const pages = pdfDoc.getPages();

  for (const field of doc.fields) {
    const page = pages[field.page];
    if (!page) continue;
    const { width: pw, height: ph } = page.getSize();

    const xPt = field.xPct * pw;
    // PDF origin is bottom-left; our stored y is from the top.
    const yTopPt = field.yPct * ph;
    const wPt = field.widthPct * pw;
    const hPt = field.heightPct * ph;
    const yBottomPt = ph - yTopPt - hPt;

    if (field.style.borderWidth > 0 && field.type !== 'text' && field.type !== 'signature' && field.type !== 'initials') {
      const color = hexToRgb(field.style.borderColor);
      page.drawRectangle({
        x: xPt,
        y: yBottomPt,
        width: wPt,
        height: hPt,
        borderColor: rgb(color.r, color.g, color.b),
        borderWidth: field.style.borderWidth * 0.75,
        color: undefined,
      });
    }

    switch (field.type) {
      case 'text':
      case 'date': {
        const text = field.value || '';
        if (!text) break;
        const font = await embedFont(pdfDoc, field.style.fontWeight, field.style.fontStyle === 'italic');
        const color = hexToRgb(field.style.color);
        const fontSize = field.style.fontSize;
        let textX = xPt + 2;
        if (field.style.textAlign !== 'left') {
          const textWidth = font.widthOfTextAtSize(text, fontSize);
          textX = field.style.textAlign === 'center' ? xPt + wPt / 2 - textWidth / 2 : xPt + wPt - textWidth - 2;
        }
        page.drawText(text, {
          x: textX,
          y: yBottomPt + hPt / 2 - fontSize / 2.8,
          size: fontSize,
          font,
          color: rgb(color.r, color.g, color.b),
        });
        break;
      }
      case 'dropdown': {
        const text = field.value || '';
        if (!text) break;
        const font = await embedFont(pdfDoc, field.style.fontWeight, false);
        const color = hexToRgb(field.style.color);
        page.drawText(text, {
          x: xPt + 2,
          y: yBottomPt + hPt / 2 - field.style.fontSize / 2.8,
          size: field.style.fontSize,
          font,
          color: rgb(color.r, color.g, color.b),
        });
        break;
      }
      case 'checkbox': {
        if (!field.checked) break;
        const color = hexToRgb(field.style.borderColor);
        page.drawLine({
          start: { x: xPt + wPt * 0.15, y: yBottomPt + hPt * 0.5 },
          end: { x: xPt + wPt * 0.42, y: yBottomPt + hPt * 0.18 },
          thickness: Math.max(1.4, hPt * 0.12),
          color: rgb(color.r, color.g, color.b),
        });
        page.drawLine({
          start: { x: xPt + wPt * 0.42, y: yBottomPt + hPt * 0.18 },
          end: { x: xPt + wPt * 0.85, y: yBottomPt + hPt * 0.82 },
          thickness: Math.max(1.4, hPt * 0.12),
          color: rgb(color.r, color.g, color.b),
        });
        break;
      }
      case 'radio': {
        if (!field.checked) break;
        const color = hexToRgb(field.style.borderColor);
        page.drawEllipse({
          x: xPt + wPt / 2,
          y: yBottomPt + hPt / 2,
          xScale: wPt * 0.28,
          yScale: hPt * 0.28,
          color: rgb(color.r, color.g, color.b),
        });
        break;
      }
      case 'signature':
      case 'initials': {
        const dataUrl = field.signature?.imageDataUrl;
        if (!dataUrl) break;
        const bytes = dataUrlToBytes(dataUrl);
        const image = dataUrl.includes('image/jpeg') ? await pdfDoc.embedJpg(bytes) : await pdfDoc.embedPng(bytes);
        const scaled = fitContain(image.width, image.height, wPt, hPt);
        page.drawImage(image, {
          x: xPt + (wPt - scaled.width) / 2,
          y: yBottomPt + (hPt - scaled.height) / 2,
          width: scaled.width,
          height: scaled.height,
        });
        break;
      }
      case 'image': {
        if (!field.value) break;
        const bytes = dataUrlToBytes(field.value);
        const image = field.value.includes('image/jpeg') ? await pdfDoc.embedJpg(bytes) : await pdfDoc.embedPng(bytes);
        const scaled = fitContain(image.width, image.height, wPt, hPt);
        page.drawImage(image, {
          x: xPt + (wPt - scaled.width) / 2,
          y: yBottomPt + (hPt - scaled.height) / 2,
          width: scaled.width,
          height: scaled.height,
        });
        break;
      }
    }
  }

  const bytes = await pdfDoc.save();
  return new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' });
}

function dataUrlToBytes(dataUrl: string): Uint8Array {
  const base64 = dataUrl.split(',')[1] ?? '';
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function fitContain(srcW: number, srcH: number, boxW: number, boxH: number) {
  const scale = Math.min(boxW / srcW, boxH / srcH);
  return { width: srcW * scale, height: srcH * scale };
}
