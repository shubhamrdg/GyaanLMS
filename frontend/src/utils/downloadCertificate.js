const wrapText = (context, text, maxWidth) => {
  const words = text.split(/\s+/)
  const lines = []
  let line = ''

  words.forEach((word) => {
    const candidate = line ? `${line} ${word}` : word
    if (line && context.measureText(candidate).width > maxWidth) {
      lines.push(line)
      line = word
    } else {
      line = candidate
    }
  })

  if (line) lines.push(line)
  return lines
}

const createPdfBlob = (jpegBytes) => {
  const encoder = new TextEncoder()
  const parts = []
  const offsets = new Array(6)
  let byteOffset = 0

  const appendText = (text) => {
    const bytes = encoder.encode(text)
    parts.push(bytes)
    byteOffset += bytes.length
  }

  appendText('%PDF-1.4\n')

  const appendObject = (index, body) => {
    offsets[index] = byteOffset
    appendText(`${index} 0 obj\n${body}\nendobj\n`)
  }

  appendObject(1, '<< /Type /Catalog /Pages 2 0 R >>')
  appendObject(2, '<< /Type /Pages /Kids [3 0 R] /Count 1 >>')
  appendObject(3, '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 842 595] /Resources << /XObject << /Certificate 4 0 R >> >> /Contents 5 0 R >>')

  offsets[4] = byteOffset
  appendText(`4 0 obj\n<< /Type /XObject /Subtype /Image /Width 1600 /Height 1131 /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegBytes.length} >>\nstream\n`)
  parts.push(jpegBytes)
  byteOffset += jpegBytes.length
  appendText('\nendstream\nendobj\n')

  const pageContent = 'q\n842 0 0 595 0 0 cm\n/Certificate Do\nQ'
  const pageContentLength = encoder.encode(pageContent).length
  appendObject(5, `<< /Length ${pageContentLength} >>\nstream\n${pageContent}\nendstream`)

  const xrefOffset = byteOffset
  const xrefEntries = offsets.slice(1)
    .map(offset => `${String(offset).padStart(10, '0')} 00000 n \n`)
    .join('')
  appendText(`xref\n0 6\n0000000000 65535 f \n${xrefEntries}trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`)

  return new Blob(parts, { type: 'application/pdf' })
}

const downloadCertificate = ({ studentName, courseName }) => new Promise((resolve, reject) => {
  const certificateTab = window.open('about:blank', '_blank')
  if (!certificateTab) {
    reject(new Error('Allow pop-ups to preview and download your certificate.'))
    return
  }

  const canvas = document.createElement('canvas')
  canvas.width = 1600
  canvas.height = 1131

  const context = canvas.getContext('2d')
  if (!context) {
    certificateTab.close()
    reject(new Error('Certificate canvas is unavailable'))
    return
  }

  const center = canvas.width / 2
  const name = studentName || 'Student'
  const course = courseName || 'Course'

  context.fillStyle = '#f8faff'
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.strokeStyle = '#1f4e79'
  context.lineWidth = 12
  context.strokeRect(44, 44, canvas.width - 88, canvas.height - 88)
  context.strokeStyle = '#adc1dd'
  context.lineWidth = 3
  context.strokeRect(64, 64, canvas.width - 128, canvas.height - 128)

  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.fillStyle = '#1f3a5f'
  context.font = 'bold 68px Georgia, serif'
  context.fillText('Certificate of Completion', center, 240)

  context.fillStyle = '#535b69'
  context.font = '32px Georgia, serif'
  context.fillText('This is to certify that', center, 350)

  context.fillStyle = '#2563eb'
  context.font = 'bold 58px Georgia, serif'
  const nameLines = wrapText(context, name, 1260)
  const nameStartY = 435 - ((nameLines.length - 1) * 35)
  nameLines.forEach((line, index) => {
    context.fillText(line, center, nameStartY + (index * 70))
  })

  const courseIntroY = nameStartY + (nameLines.length * 70) + 35
  context.fillStyle = '#535b69'
  context.font = '32px Georgia, serif'
  context.fillText('has successfully completed the course', center, courseIntroY)

  context.fillStyle = '#1f3a5f'
  context.font = course.length > 48 ? 'bold 44px Georgia, serif' : 'bold 54px Georgia, serif'
  const courseLines = wrapText(context, course, 1260)
  courseLines.forEach((line, index) => {
    context.fillText(line, center, courseIntroY + 95 + (index * 64))
  })

  context.fillStyle = '#535b69'
  context.font = '24px Georgia, serif'
  context.fillText(`Issued on ${new Date().toLocaleDateString()}`, center, 995)
  context.font = '20px Arial, sans-serif'
  context.fillText('GyaanLMS E-Learning Platform | Brainybeam Info-Tech Pvt Ltd', center, 1050)

  canvas.toBlob(async (blob) => {
    if (!blob) {
      reject(new Error('Certificate image could not be created'))
      return
    }

    try {
      const jpegBytes = new Uint8Array(await blob.arrayBuffer())
      const pdf = createPdfBlob(jpegBytes)
      const safeCourseName = course
        .replace(/[<>:"/\\|?*\x00-\x1F]/g, '')
        .trim()
        .replace(/\s+/g, '_')
        .slice(0, 60) || 'Course'
      const url = URL.createObjectURL(pdf)
      certificateTab.document.title = `GyaanLMS_Certificate_${safeCourseName}`
      certificateTab.location.href = url
      const cleanupInterval = window.setInterval(() => {
        if (certificateTab.closed) {
          window.clearInterval(cleanupInterval)
          URL.revokeObjectURL(url)
        }
      }, 1000)
      resolve()
    } catch (error) {
      certificateTab.close()
      reject(error)
    }
  }, 'image/jpeg', 0.95)
})

export default downloadCertificate
