// Assembles a multi-size .ico from PNG files (PNG-compressed entries, Vista+).
// Usage: node build-config/make-ico.js out.ico a.png b.png ...

const fs = require('fs')

const [outPath, ...inputs] = process.argv.slice(2)
if (!outPath || !inputs.length) {
  console.error('usage: node make-ico.js out.ico in1.png [in2.png ...]')
  process.exit(1)
}

const images = inputs.map(file => {
  const data = fs.readFileSync(file)
  const width = data.readUInt32BE(16)
  const height = data.readUInt32BE(20)
  return { data, width, height }
})

const header = Buffer.alloc(6)
header.writeUInt16LE(0, 0)
header.writeUInt16LE(1, 2)
header.writeUInt16LE(images.length, 4)

let offset = 6 + images.length * 16
const entries = []
const blobs = []

for (const image of images) {
  const entry = Buffer.alloc(16)
  entry.writeUInt8(image.width >= 256 ? 0 : image.width, 0)
  entry.writeUInt8(image.height >= 256 ? 0 : image.height, 1)
  entry.writeUInt8(0, 2)
  entry.writeUInt8(0, 3)
  entry.writeUInt16LE(1, 4)
  entry.writeUInt16LE(32, 6)
  entry.writeUInt32LE(image.data.length, 8)
  entry.writeUInt32LE(offset, 12)
  entries.push(entry)
  blobs.push(image.data)
  offset += image.data.length
}

fs.writeFileSync(outPath, Buffer.concat([header, ...entries, ...blobs]))
console.log(`${outPath} <- ${inputs.length} images, ${offset} bytes`)
