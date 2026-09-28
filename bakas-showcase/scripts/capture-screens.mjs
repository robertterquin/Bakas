import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { spawn } from 'node:child_process'

const DIST_DIR = 'C:/Bakas/dist'
const CAPTURES_DIR = 'C:/Bakas/bakas-showcase/public/captures'
const PORT = 5178
const DEBUG_PORT = 9244

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.json': 'application/json',
  '.woff2': 'font/woff2',
}

const server = http.createServer((req, res) => {
  let filePath = path.join(DIST_DIR, req.url.split('?')[0])
  if (req.url === '/' || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    if (!path.extname(filePath) || !fs.existsSync(filePath)) {
      filePath = path.join(DIST_DIR, 'index.html')
    }
  }

  const ext = path.extname(filePath)
  const contentType = mimeTypes[ext] || 'application/octet-stream'

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404)
      res.end('Not Found')
    } else {
      res.writeHead(200, { 'Content-Type': contentType })
      res.end(content)
    }
  })
})

await new Promise((resolve) => server.listen(PORT, resolve))
console.log(`Bakas preview server running on http://localhost:${PORT}`)

const browserPaths = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
]
const browserExe = browserPaths.find((p) => fs.existsSync(p))
if (!browserExe) {
  console.error('No browser executable found')
  process.exit(1)
}

const browserProcess = spawn(browserExe, [
  '--headless=new',
  `--remote-debugging-port=${DEBUG_PORT}`,
  '--window-size=1920,1080',
  '--hide-scrollbars',
  '--disable-gpu',
  '--no-first-run',
  '--no-default-browser-check',
  `http://localhost:${PORT}/`,
])

await new Promise((resolve) => setTimeout(resolve, 2500))

const listRes = await fetch(`http://localhost:${DEBUG_PORT}/json/list`)
const listData = await listRes.json()
const pageTarget = listData.find((t) => t.type === 'page') || listData[0]
if (!pageTarget || !pageTarget.webSocketDebuggerUrl) {
  console.error('No page target found in', listData)
  process.exit(1)
}

const ws = new WebSocket(pageTarget.webSocketDebuggerUrl)
await new Promise((resolve) => (ws.onopen = resolve))

let msgId = 1
const callbacks = new Map()

ws.onmessage = (event) => {
  const data = JSON.parse(event.data)
  if (data.id && callbacks.has(data.id)) {
    const cb = callbacks.get(data.id)
    callbacks.delete(data.id)
    cb(data)
  }
}

function sendCDP(method, params = {}) {
  return new Promise((resolve) => {
    const id = msgId++
    callbacks.set(id, resolve)
    ws.send(JSON.stringify({ id, method, params }))
  })
}

async function evalExpr(expr) {
  const res = await sendCDP('Runtime.evaluate', {
    expression: expr,
    awaitPromise: true,
    returnByValue: true,
  })
  return res.result?.result?.value
}

await sendCDP('Page.enable')
await sendCDP('DOM.enable')

fs.mkdirSync(CAPTURES_DIR, { recursive: true })

async function setViewport(width = 1920, height = 1080, scale = 1) {
  await sendCDP('Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: scale,
    mobile: false,
  })
  await new Promise((r) => setTimeout(r, 400))
}

async function captureScreen(filename) {
  const result = await sendCDP('Page.captureScreenshot', { format: 'png' })
  if (result.result && result.result.data) {
    const buffer = Buffer.from(result.result.data, 'base64')
    fs.writeFileSync(path.join(CAPTURES_DIR, filename), buffer)
    console.log(`Saved ${filename} (${buffer.length} bytes)`)
  } else {
    console.error(`Failed to capture ${filename}`, result)
  }
}

async function captureModalClipped(filename, scale = 2.0, pad = 0) {
  const box = await evalExpr(`
    (() => {
      const modal = document.querySelector('[role="dialog"] > div') || document.querySelector('[role="dialog"]');
      if (!modal) return null;
      const r = modal.getBoundingClientRect();
      return { x: Math.floor(r.x), y: Math.floor(r.y), width: Math.ceil(r.width), height: Math.ceil(r.height) };
    })()
  `)
  if (!box) {
    console.error(`Could not find modal bounding box for ${filename}`)
    return
  }
  console.log(`Clipping ${filename} to exact box:`, box)

  const clip = {
    x: Math.max(0, box.x - pad),
    y: Math.max(0, box.y - pad),
    width: Math.min(1920 - Math.max(0, box.x - pad), box.width + pad * 2),
    height: Math.min(1080 - Math.max(0, box.y - pad), box.height + pad * 2),
    scale,
  }

  const result = await sendCDP('Page.captureScreenshot', { format: 'png', clip })
  if (result.result && result.result.data) {
    const buffer = Buffer.from(result.result.data, 'base64')
    fs.writeFileSync(path.join(CAPTURES_DIR, filename), buffer)
    console.log(`Saved clipped ${filename} (${buffer.length} bytes)`)
  } else {
    console.error(`Failed to capture clipped ${filename}`, result)
  }
}

try {
  await setViewport(1920, 1080, 1)

  // 1. Radar Overview (Wait for tiles & markers to render)
  console.log('Capturing capture-1-radar-overview.png...')
  await sendCDP('Page.navigate', { url: `http://localhost:${PORT}/` })
  await new Promise((r) => setTimeout(r, 3500))
  await captureScreen('capture-1-radar-overview.png')

  // 2. Report Modal (Click on map to drop pin and open ReportBottomSheet)
  console.log('Capturing capture-2-report-drawer.png...')
  await sendCDP('Input.dispatchMouseEvent', {
    type: 'mousePressed',
    x: 960,
    y: 540,
    button: 'left',
    clickCount: 1,
  })
  await sendCDP('Input.dispatchMouseEvent', {
    type: 'mouseReleased',
    x: 960,
    y: 540,
    button: 'left',
    clickCount: 1,
  })
  await new Promise((r) => setTimeout(r, 1200))
  await captureModalClipped('capture-2-report-drawer.png', 2.0, 0)

  // Close report modal
  await evalExpr(`window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))`)
  await new Promise((r) => setTimeout(r, 800))

  // 3. Flood Hazard Detail (Click flood marker to open HazardDetailBottomSheet)
  console.log('Capturing capture-3-flood-passability.png...')
  await evalExpr(`
    const markers = document.querySelectorAll('.custom-hazard-marker');
    if (markers.length > 0) markers[0].click();
  `)
  await new Promise((r) => setTimeout(r, 1200))
  await captureModalClipped('capture-3-flood-passability.png', 2.0, 0)

  // Close detail sheet
  await evalExpr(`window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))`)
  await new Promise((r) => setTimeout(r, 800))

  // 4. Search Modal (Ctrl+K)
  console.log('Capturing capture-4-search-modal.png...')
  await evalExpr(`window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }))`)
  await new Promise((r) => setTimeout(r, 1200))
  await captureModalClipped('capture-4-search-modal.png', 2.0, 0)

  // Close search modal reliably
  await evalExpr(`
    const escBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.trim() === 'ESC');
    if (escBtn) escBtn.click();
    else {
      const dialog = document.querySelector('[role="dialog"]');
      if (dialog) dialog.click();
    }
  `)
  await new Promise((r) => setTimeout(r, 1000))

  // 5. About / Telemetry modal
  console.log('Capturing capture-5-about-modal.png...')
  await evalExpr(`
    const brandBtn = document.querySelector('button[title*="About Bakas"]');
    if (brandBtn) brandBtn.click();
  `)
  await new Promise((r) => setTimeout(r, 1200))
  await captureModalClipped('capture-5-about-modal.png', 2.0, 0)

} catch (err) {
  console.error('Error during screen capture:', err)
} finally {
  ws.close()
  browserProcess.kill()
  server.close()
  console.log('Screen capture pipeline finished.')
}
