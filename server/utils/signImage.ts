import { execFile } from 'child_process'
import fs from 'fs'
import os from 'os'
import path from 'path'

import type { CropCoords } from '../schema.drizzle'

/** White point the brightest part of every sign is lifted to. */
const TARGET_WHITE = 0.96
/** Never darken an already bright photo, never lift more than this. */
const MAX_GAIN = 4
/**
 * Bounds for the white balance multipliers, so strongly coloured signs keep
 * their colour instead of being neutralized into white.
 */
const MAX_WHITE_BALANCE_RATIO = 1.35
const MIN_WHITE_BALANCE_RATIO = 0.74
/** Photos that had to be lifted also get a little contrast and saturation back. */
const LIFT_THRESHOLD = 1.03

function runMagick(args: string[]): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    execFile(
      'magick',
      args,
      { encoding: 'buffer', maxBuffer: 64 * 1024 * 1024 },
      (error, stdout) => {
        if (error) {
          reject(error)
        } else {
          resolve(stdout)
        }
      }
    )
  })
}

function dist(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2)
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

interface CropAnalysis {
  /** 99th percentile luminance of the crop, i.e. roughly where its white sits. */
  whitePoint: number
  /** Mean RGB (0-1) of the brightest 1% of pixels. */
  highlight: [number, number, number]
}

/** Measures how bright the crop's white is and what colour cast it carries. */
function analyseCrop(
  pixels: Buffer,
  width: number,
  height: number
): CropAnalysis {
  const total = width * height
  const lumas = new Float32Array(total)

  for (let i = 0; i < total; i++) {
    const offset = i * 3

    lumas[i] =
      (0.2126 * (pixels[offset] ?? 0) +
        0.7152 * (pixels[offset + 1] ?? 0) +
        0.0722 * (pixels[offset + 2] ?? 0)) /
      255
  }

  const sorted = Float32Array.from(lumas).sort()
  const whitePoint = sorted[Math.min(total - 1, Math.floor(total * 0.99))] ?? 1
  const threshold = whitePoint * 0.995

  let r = 0
  let g = 0
  let b = 0
  let count = 0

  for (let i = 0; i < total; i++) {
    if ((lumas[i] ?? 0) >= threshold) {
      const offset = i * 3

      r += pixels[offset] ?? 0
      g += pixels[offset + 1] ?? 0
      b += pixels[offset + 2] ?? 0
      count++
    }
  }

  const divisor = count || 1

  return {
    whitePoint,
    highlight: [r / divisor / 255, g / divisor / 255, b / divisor / 255]
  }
}

/**
 * Normalizes an already perspective-corrected crop so every sign reads the same
 * way: the brightest part of the sign is lifted to a common white, and the
 * colour cast picked up from that highlight is neutralized.
 */
async function normalizeCrop(
  cropPath: string,
  outputPath: string,
  width: number,
  height: number
): Promise<void> {
  const pixels = await runMagick([cropPath, '-depth', '8', 'rgb:-'])
  const { whitePoint, highlight } = analyseCrop(pixels, width, height)

  const gain = clamp(TARGET_WHITE / Math.max(0.03, whitePoint), 1, MAX_GAIN)
  const reference = (highlight[0] + highlight[1] + highlight[2]) / 3
  const multipliers = highlight.map(channel =>
    gain *
    clamp(
      reference / Math.max(0.03, channel),
      MIN_WHITE_BALANCE_RATIO,
      MAX_WHITE_BALANCE_RATIO
    )
  )

  const args = [
    cropPath,
    '-color-matrix',
    `${(multipliers[0] ?? gain).toFixed(4)} 0 0 0 ${(multipliers[1] ?? gain).toFixed(4)} 0 0 0 ${(multipliers[2] ?? gain).toFixed(4)}`
  ]

  if (gain > LIFT_THRESHOLD) {
    args.push('-sigmoidal-contrast', '2,50%', '-modulate', '100,110,100')
  }

  args.push('-strip', outputPath)

  await runMagick(args)
}

export async function applyPerspectiveCorrection(
  srcPath: string,
  coords: CropCoords
): Promise<{ croppedBuf: Buffer; imgW: number; imgH: number }> {
  const identify = await runMagick(['identify', '-format', '%w %h', srcPath])

  const [imgW, imgH] = identify.toString().trim().split(' ').map(Number) as [
    number,
    number
  ]

  const dstW = 512

  const srcWidth =
    (dist(coords.topLeft, coords.topRight) +
      dist(coords.bottomLeft, coords.bottomRight)) /
    2
  const srcHeight =
    (dist(coords.topLeft, coords.bottomLeft) +
      dist(coords.topRight, coords.bottomRight)) /
    2

  const dstH = Math.max(
    1,
    Math.round(dstW * (srcHeight / Math.max(1, srcWidth)))
  )

  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2)}`
  const cropPath = path.join(os.tmpdir(), `railway-sign-crop-${suffix}.png`)
  const normalizedPath = path.join(
    os.tmpdir(),
    `railway-sign-normalized-${suffix}.png`
  )

  const perspectiveArgs = [
    `${coords.topLeft.x},${coords.topLeft.y} 0,0`,
    `${coords.topRight.x},${coords.topRight.y} ${dstW - 1},0`,
    `${coords.bottomRight.x},${coords.bottomRight.y} ${dstW - 1},${dstH - 1}`,
    `${coords.bottomLeft.x},${coords.bottomLeft.y} 0,${dstH - 1}`
  ]

  await runMagick([
    srcPath,
    '-set',
    'option:distort:viewport',
    `${dstW}x${dstH}+0+0`,
    '-distort',
    'Perspective',
    perspectiveArgs.join(' '),
    '-strip',
    cropPath
  ])

  await normalizeCrop(cropPath, normalizedPath, dstW, dstH)

  const croppedBuf = fs.readFileSync(normalizedPath)

  fs.unlinkSync(cropPath)
  fs.unlinkSync(normalizedPath)

  return { croppedBuf, imgW, imgH }
}
