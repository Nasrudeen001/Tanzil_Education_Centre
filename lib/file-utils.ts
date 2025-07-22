/**
 * File utility functions for handling file uploads and downloads
 */

export interface FileInfo {
  name: string
  size: number
  type: string
  url?: string
}

/**
 * Convert a file to a data URL for storage
 */
export function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/**
 * Convert a data URL back to a file
 */
export function dataURLToFile(dataURL: string, filename: string): File {
  const arr = dataURL.split(',')
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'application/octet-stream'
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new File([u8arr], filename, { type: mime })
}

/**
 * Download a file from a data URL
 */
export function downloadFile(dataURL: string, filename: string) {
  const link = document.createElement('a')
  link.href = dataURL
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Format file size in human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Validate file type and size
 */
export function validateFile(file: File, maxSize: number = 10 * 1024 * 1024): { valid: boolean; error?: string } {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif'
  ]

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'File type not supported. Please upload PDF, Word, Text, or Image files.'
    }
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size too large. Maximum size is ${formatFileSize(maxSize)}.`
    }
  }

  return { valid: true }
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || ''
}

/**
 * Get file type icon based on file extension
 */
export function getFileTypeIcon(filename: string): string {
  const ext = getFileExtension(filename)
  
  switch (ext) {
    case 'pdf':
      return '📄'
    case 'doc':
    case 'docx':
      return '📝'
    case 'txt':
      return '📄'
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
      return '🖼️'
    default:
      return '📎'
  }
} 