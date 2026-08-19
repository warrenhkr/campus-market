import 'dotenv/config'

;(async () => {
  try {
    const originalCloudinaryUrl = process.env.CLOUDINARY_URL
    if (originalCloudinaryUrl && !originalCloudinaryUrl.startsWith('cloudinary://')) {
      delete process.env.CLOUDINARY_URL
    }
    const { v2: cloudinary } = await import('cloudinary')
    if (originalCloudinaryUrl && !originalCloudinaryUrl.startsWith('cloudinary://')) {
      process.env.CLOUDINARY_URL = originalCloudinaryUrl
    }
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    })

    const imageUrl = 'https://via.placeholder.com/150'
    console.log('Downloading image from', imageUrl)
    const resp = await fetch(imageUrl)
    const arrayBuffer = await resp.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    console.log('Uploading buffer to Cloudinary')
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream({ folder: 'products' }, (err, res) => {
        if (err) return reject(err)
        resolve(res)
      })
      uploadStream.end(buffer)
    })
    console.log('Result:', result)
  } catch (err) {
    console.error('Test upload error:', err)
  }
})()
