import { Blob } from 'buffer'

const url = 'http://localhost:3000/api/cloudinary/upload'
const form = new FormData()
const gifData = Buffer.from('R0lGODlhAQABAIAAAAUEBAgKCwAAACwAAAAAAQABAAACAkQBADs=', 'base64')
form.append('file', new Blob([gifData], { type: 'image/gif' }), 'test.gif')
form.append('folder', 'products')

const res = await fetch(url, {
  method: 'POST',
  body: form,
})

console.log('status', res.status)
console.log('headers', Object.fromEntries(res.headers.entries()))
console.log('body', await res.text())
