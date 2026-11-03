/**
 * Utility helper untuk kompresi dan resolusi URL gambar avatar guru dan siswa
 */

/**
 * Kompresi gambar client-side menggunakan HTML5 Canvas
 * Mengecilkan ukuran file foto HP (hingga 90%) sebelum dikirim ke server.
 */
export function compressImageFile(
  file: File,
  maxWidth = 600,
  maxHeight = 600,
  quality = 0.85
): Promise<string> {
  return new Promise((resolve, reject) => {
    // Validasi tipe file
    if (!file.type.startsWith('image/')) {
      return reject(new Error('File yang dipilih bukan merupakan format gambar yang valid.'))
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        let width = img.width
        let height = img.height

        // Skala proporsional jika resolusi melebihi batas
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          width = Math.round(width * ratio)
          height = Math.round(height * ratio)
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')

        if (!ctx) {
          return resolve(e.target?.result as string)
        }

        // Gambar ulang di canvas
        ctx.drawImage(img, 0, 0, width, height)

        // Konversi ke JPEG/PNG terkompresi
        const mime = file.type === 'image/png' ? 'image/png' : 'image/jpeg'
        const dataUrl = canvas.toDataURL(mime, quality)
        resolve(dataUrl)
      }
      img.onerror = () => reject(new Error('Gagal memuat file gambar ke memori.'))
      img.src = e.target?.result as string
    }
    reader.onerror = () => reject(new Error('Gagal membaca file gambar.'))
    reader.readAsDataURL(file)
  })
}

/**
 * Menghasilkan URL gambar yang siap ditampilkan (handle relative path, storage API, data URI, dan fallback)
 */
export function resolveAvatarUrl(pathOrUrl?: string | null, fallback = ''): string {
  if (!pathOrUrl) return fallback
  const str = String(pathOrUrl).trim()
  if (!str) return fallback
  if (str.startsWith('http://') || str.startsWith('https://') || str.startsWith('data:')) {
    return str
  }
  // Jika path diawali slash relatif seperti /api/v1/storage/avatars/...
  return str
}

