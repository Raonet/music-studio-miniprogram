const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const ICONS_DIR = path.join(__dirname, '../miniprogram/assets/icons')
const TMP_DIR = path.join(__dirname, '../tmp-lucide')

// 需要的图标及颜色变体
const ICONS = [
  'home', 'calendar', 'clock', 'message-square', 'user',  // tab bar
  'arrow-left', 'chevron-left', 'chevron-right', 'chevron-down',
  'map-pin', 'file-text', 'trending-up', 'info',
  'music', 'music-2', 'x'
]

const COLORS = {
  gold: '#C9A84C',
  gray: '#5A5550',
  secondary: '#A89F8C',
  green: '#4CAF7D',
  dark: '#1A1A1F',
  white: '#F0EDE6'
}

// 每个图标需要的颜色变体
const VARIANTS = {
  'home':          ['gold', 'gray'],
  'calendar':      ['gold', 'gray'],
  'clock':         ['gold', 'gray', 'secondary'],
  'message-square':['gold', 'gray'],
  'user':          ['gold', 'gray'],
  'arrow-left':    ['gold'],
  'chevron-left':  ['gold'],
  'chevron-right': ['gold', 'secondary'],
  'chevron-down':  ['secondary'],
  'map-pin':       ['secondary'],
  'file-text':     ['gold'],
  'trending-up':   ['green'],
  'info':          ['gold'],
  'music':         ['dark', 'gold'],
  'music-2':       ['gold'],
  'x':             ['secondary']
}

function colorSvg(svgContent, color) {
  return svgContent
    .replace(/stroke="currentColor"/g, `stroke="${color}"`)
    .replace(/fill="currentColor"/g, `fill="${color}"`)
    // 确保有 width/height
    .replace(/<svg /, '<svg width="24" height="24" ')
    // 移除重复 width/height（如果原来有的话）
    .replace(/width="24" height="24" width=/, 'width=')
    .replace(/width="24" height="24" height=/, 'height=')
}

// 安装 lucide-static
console.log('Installing lucide-static...')
if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true })
execSync('npm init -y && npm install lucide-static --save', { cwd: TMP_DIR, stdio: 'inherit' })

const lucideIconsDir = path.join(TMP_DIR, 'node_modules/lucide-static/icons')

// 创建输出目录
if (!fs.existsSync(ICONS_DIR)) fs.mkdirSync(ICONS_DIR, { recursive: true })

let generated = 0

for (const icon of ICONS) {
  const srcPath = path.join(lucideIconsDir, `${icon}.svg`)
  if (!fs.existsSync(srcPath)) {
    console.warn(`⚠️  Icon not found: ${icon}.svg`)
    continue
  }

  const svgContent = fs.readFileSync(srcPath, 'utf-8')
  const variants = VARIANTS[icon] || ['gold']

  for (const variant of variants) {
    const color = COLORS[variant]
    const colored = colorSvg(svgContent, color)
    const outPath = path.join(ICONS_DIR, `${icon}-${variant}.svg`)
    fs.writeFileSync(outPath, colored, 'utf-8')
    generated++
    console.log(`✓ ${icon}-${variant}.svg`)
  }
}

// 清理临时目录
fs.rmSync(TMP_DIR, { recursive: true, force: true })

console.log(`\n✅ Done! Generated ${generated} icon files in miniprogram/assets/icons/`)
