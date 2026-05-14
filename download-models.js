const https = require('https')
const fs = require('fs')
const path = require('path')

const models = [
  'tiny_face_detector_model-weights_manifest.json',
  'tiny_face_detector_model.shard',
  'face_landmark_68_model-weights_manifest.json',
  'face_landmark_68_model.shard',
  'face_recognition_model-weights_manifest.json',
  'face_recognition_model.shard'
]

const baseUrl = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/'

console.log('Downloading face-api.js models...')

models.forEach(model => {
  const url = baseUrl + model
  const filePath = path.join(__dirname, '..', 'public', 'models', model)

  console.log(`Downloading ${model}...`)

  https.get(url, (response) => {
    if (response.statusCode !== 200) {
      console.error(`Failed to download ${model}: ${response.statusCode}`)
      return
    }

    const fileStream = fs.createWriteStream(filePath)
    response.pipe(fileStream)

    fileStream.on('finish', () => {
      console.log(`✅ Downloaded ${model}`)
      fileStream.close()
    })

    fileStream.on('error', (err) => {
      console.error(`Error writing ${model}:`, err)
      fs.unlink(filePath, () => {}) // Delete the file on error
    })
  }).on('error', (err) => {
    console.error(`Error downloading ${model}:`, err)
  })
})

console.log('Model download initiated. This may take a few minutes...')