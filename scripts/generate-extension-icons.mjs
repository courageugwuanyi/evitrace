import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const projectRoot = process.cwd()
const iconDir = join(projectRoot, 'public', 'icons')
const sizes = [16, 32, 48, 128]

if (!existsSync(iconDir)) {
  mkdirSync(iconDir, { recursive: true })
}

function buildIconSvg(size) {
  const strokeWidth = Math.max(1.2, size * 0.08).toFixed(2)
  const corner = Math.max(2, size * 0.22).toFixed(2)
  const badgeSize = (size * 0.44).toFixed(2)
  const badgeInset = (size * 0.1).toFixed(2)
  const badgeX = (size - Number(badgeSize) - Number(badgeInset)).toFixed(2)
  const badgeY = badgeInset
  const textSize = Math.max(6, size * 0.34).toFixed(2)

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none">
  <rect width="${size}" height="${size}" rx="${corner}" fill="#0052CC"/>
  <path d="M${size * 0.26} ${size * 0.33}L${size * 0.5} ${size * 0.58}L${size * 0.74} ${size * 0.33}" stroke="white" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"/>
  <rect x="${badgeX}" y="${badgeY}" width="${badgeSize}" height="${badgeSize}" rx="${(Number(badgeSize) * 0.24).toFixed(2)}" fill="white"/>
  <text x="${(Number(badgeX) + Number(badgeSize) / 2).toFixed(2)}" y="${(Number(badgeY) + Number(badgeSize) * 0.67).toFixed(2)}" text-anchor="middle" font-size="${textSize}" font-family="Arial, sans-serif" fill="#0052CC" font-weight="700">E</text>
</svg>
`
}

for (const size of sizes) {
  const filePath = join(iconDir, `icon${size}.svg`)
  if (!existsSync(filePath)) {
    writeFileSync(filePath, buildIconSvg(size), 'utf8')
    console.log(`[icons] created ${filePath}`)
  }
}
