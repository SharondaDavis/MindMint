export function cn(...inputs: Array<string | undefined | null | false>) {
  return inputs.filter(Boolean).join(" ")
}

export function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

export function isImageFile(file: File) {
  return file.type.startsWith('image/')
}

export function getFileIcon(type: string) {
  if (type.startsWith('image/')) {
    return 'image'
  }
  if (type.includes('pdf')) {
    return 'file-text'
  }
  if (type.includes('video')) {
    return 'video'
  }
  if (type.includes('audio')) {
    return 'music'
  }
  return 'file'
}

export function generatePreview(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      resolve('')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) {
        resolve(e.target.result as string)
      } else {
        reject(new Error('Failed to read file'))
      }
    }
    reader.onerror = () => reject(new Error('Error reading file'))
    reader.readAsDataURL(file)
  })
}
