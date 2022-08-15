// PNG => JPG => PDF
// BMP => JPG => PDF
// TIFF => JPG => PDF

// JPG => PDF

// PDF => Compress


// PNG => imagemagick => jpg
// jpg => jpegoptim => jpg
// jpg => imagemagick => pdf


const { spawn } = require('child_process')

// Common distiller parameters
// The default distiller parameter is 'ebook'

// screen => lower quality, smaller size. (72 dpi)
// ebook => for better quality, but slightly larger pdfs. (150 dpi)
// prepress => output similar to Acrobat Distiller "Prepress Optimized" setting (300 dpi)
// printer => selects output similar to the Acrobat Distiller "Print Optimized" setting (300 dpi)
// default => selects output intended to be useful across a wide variety of uses, possibly at the expense of a larger output file

function reducePdfSize(pdfPath, destination, distiller = 'ebook') {
  return new Promise((resolve, reject) => {

    const gs = spawn('gs', [
      '-sDEVICE=pdfwrite',
      '-dCompatibilityLevel=1.4',
      `-dPDFSETTINGS=/${distiller}`,
      '-dNOPAUSE',
      '-dQUIET',
      '-dBATCH',
      '-dDetectDuplicateImages=true',
      '-dConvertCMYKImagesToRGB=true',
      `-sOutputFile=${destination}`,
      `${pdfPath}`
    ])

    let outData = []
    let errData = []

    gs.stdout.on('data', (data) => {
      outData.push(data.toString('utf-8'))
    })

    gs.stderr.on('data', (data) => {
      errData.push(data.toString('utf-8'))
    })

    gs.on('error', (error) => {
      reject(error)
    })

    gs.on('exit', (code, signal) => {
      resolve({
        code,
        signal,
        status: code === 0 ? 'success' : 'error',
        outData: outData.join(''),
        errData: errData.join('')
      })
    })
  })
}


function identifyResolution(filePath) {
  return new Promise((resolve, reject) => {

    const convert = spawn('identify', [
      '-ping',
      '-format',
      '%wx%h|',
      `${filePath}`,
    ])

    let outData = []
    let errData = []

    convert.stdout.on('data', (data) => {
      outData.push(data.toString('utf-8'))
    })

    convert.stderr.on('data', (data) => {
      errData.push(data.toString('utf-8'))
    })

    convert.on('error', (error) => {
      reject(error)
    })

    convert.on('exit', (code, signal) => {
      resolve({
        code,
        signal,
        status: code === 0 ? 'success' : 'error',
        outData: outData.join(''),
        errData: errData.join('')
      })
    })
  })
}


function convertAndResize(
  filePath,
  destination,
  resolution='1920x1080',
  quality='85'
) {
  return new Promise(async (resolve, reject) => {
    const [width, height] = resolution.split('x')

    if (height) {
      const fileResolution = await identifyResolution(filePath)

      const [fileWidth, fileHeight] = fileResolution.outData.split('|')[0].split('x')
      
      if (parseInt(fileHeight) > parseInt(fileWidth)) {
        resolution = `${height}x${width}`
      } else if (parseInt(fileHeight) === parseInt(fileWidth)) {
        resolution = `${height}x${height}`
      }   
    }

    const convert = spawn('convert', [
      `-resize`,
      `${resolution}\>`,
      `-strip`,
      `-interlace`,
      `Plane`,
      `-quality`,
      `${quality}%`,
      `${filePath}`,
      `${destination}`,
    ])

    let outData = []
    let errData = []

    convert.stdout.on('data', (data) => {
      outData.push(data.toString('utf-8'))
    })

    convert.stderr.on('data', (data) => {
      errData.push(data.toString('utf-8'))
    })

    convert.on('error', (error) => {
      reject(error)
    })

    convert.on('exit', (code, signal) => {
      resolve({
        code,
        signal,
        status: code === 0 ? 'success' : 'error',
        outData: outData.join(''),
        errData: errData.join('')
      })
    })
  })
}

console.time('convert')
convertAndResize('./samples/c.jpg', './samples/c_converted.jpg')
  .then(r => {
    console.timeEnd('convert')
    console.log(r)
  })
  .catch(e => console.log(e))


// convertAndResize('./samples/b.jpg', './samples/b_reduced.jpg')
//     .then(r => console.log(r))
//     .catch(e => console.log(e))

function convert(filePath, destination) {
  return new Promise(async (resolve, reject) => {

    const convert = spawn('convert', [
      `${filePath}`,
      `${destination}`,
    ])

    let outData = []
    let errData = []

    convert.stdout.on('data', (data) => {
      outData.push(data.toString('utf-8'))
    })

    convert.stderr.on('data', (data) => {
      errData.push(data.toString('utf-8'))
    })

    convert.on('error', (error) => {
      reject(error)
    })

    convert.on('exit', (code, signal) => {
      resolve({
        code,
        signal,
        status: code === 0 ? 'success' : 'error',
        outData: outData.join(''),
        errData: errData.join('')
      })
    })
  })
}

// identifyResolution('./sample.tiff')
//   .then(r => {
//     const { outData } = r
//     const [width, height] = outData.split('|')[0].split('x')
//     console.log(width)
//     console.log(height)
//   })
//   .catch(e => console.log(e))
// convert('./sample.png', './sample.jpg')
//   .then(r => console.log(r))
//   .catch(e => console.log(e))

// convertAndResize('./sample.jpg', './sample.pdf')
//   .then(r => console.log(r))
//   .catch(e => console.log(e))


// tif
// bmp
// jpg
// png



// const pdfunite = spawn('pdfunite', [
//   './chicken.pdf',
//   './test.pdf',
//   './outx.pdf'
// ])

// pdfunite.stdout.on('data', (data) => {
//   console.log(`stdout: ${data}`);
// })

// pdfunite.stderr.on('data', (data) => {
//   console.error(`stderr: ${data}`);
// })

// pdfunite.on('close', (code) => {
//   console.log(`child process exited with code ${code}`);
// })