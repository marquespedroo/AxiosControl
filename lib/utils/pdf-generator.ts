import { pdf } from '@react-pdf/renderer'
import { ReactElement } from 'react'

/**
 * Generate and download a PDF document
 * @param pdfDocument - React PDF Document component
 * @param filename - Name for the downloaded file
 */
export async function generateAndDownloadPdf(
  pdfDocument: ReactElement,
  filename: string
): Promise<void> {
  try {
    // Generate the PDF blob
    const blob = await pdf(pdfDocument).toBlob()

    // Create a download link
    const url = URL.createObjectURL(blob)
    const link = window.document.createElement('a')
    link.href = url
    link.download = filename
    link.click()

    // Clean up
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error generating PDF:', error)
    throw new Error('Falha ao gerar PDF')
  }
}

/**
 * Generate PDF blob for server-side operations
 * @param pdfDocument - React PDF Document component
 */
export async function generatePdfBlob(pdfDocument: ReactElement): Promise<Blob> {
  try {
    return await pdf(pdfDocument).toBlob()
  } catch (error) {
    console.error('Error generating PDF blob:', error)
    throw new Error('Falha ao gerar PDF')
  }
}
