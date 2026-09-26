import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { spawn } from 'node:child_process'

const DIST_DIR = 'C:/Bakas/dist'
const CAPTURES_DIR = 'C:/Bakas/bakas-showcase/public/captures'
const PORT = 5178

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

const DEBUG_PORT = 9244
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
await new Promise((resolve) => ws.onopen = resolve)

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

try {
  await setViewport(1920, 1080, 1)

  // 1. Radar Overview (Wait for tiles & markers to render)
  console.log('Capturing capture-1-radar-overview.png...')
  await sendCDP('Page.navigate', { url: `http://localhost:${PORT}/` })
  await new Promise((r) => setTimeout(r, 3500))
  await captureScreen('capture-1-radar-overview.png')

  // 2. Report Drawer (+ Report Hazard clicked)
  console.log('Capturing capture-2-report-drawer.png...')
  await sendCDP('Runtime.evaluate', {
    expression: `
      const reportBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Report Hazard'));
      if (reportBtn) reportBtn.click();
    `,
  })
  await new Promise((r) => setTimeout(r, 1200))
  await captureScreen('capture-2-report-drawer.png')

  // Close report drawer
  await sendCDP('Runtime.evaluate', {
    expression: `
      const closeBtn = document.querySelector('button[aria-label="Close"]') || document.querySelector('button');
      const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
      window.dispatchEvent(escapeEvent);
    `,
  })
  await new Promise((r) => setTimeout(r, 800))

  // 3. Flood Hazard Detail (Click flood pin or trigger select)
  console.log('Capturing capture-3-flood-passability.png...')
  await sendCDP('Runtime.evaluate', {
    expression: `
      const pins = Array.from(document.querySelectorAll('.leaflet-marker-icon'));
      if (pins.length > 1) {
        pins[1].click();
      } else if (pins.length > 0) {
        pins[0].click();
      }
    `,
  })
  await new Promise((r) => setTimeout(r, 1500))
  await captureScreen('capture-3-flood-passability.png')

  // Close detail drawer
  await sendCDP('Runtime.evaluate', {
    expression: `
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    `,
  })
  await new Promise((r) => setTimeout(r, 800))

  // 4. Search Modal (Ctrl+K or Search button clicked)
  console.log('Capturing capture-4-search-modal.png...')
  await sendCDP('Runtime.evaluate', {
    expression: `
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }));
    `,
  })
  await new Promise((r) => setTimeout(r, 1000))
  await captureScreen('capture-4-search-modal.png')

  // Close search modal
  await sendCDP('Runtime.evaluate', {
    expression: `
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    `,
  })
  await new Promise((r) => setTimeout(r, 800))

  // 5. About / Telemetry modal
  console.log('Capturing capture-5-about-modal.png...')
  await sendCDP('Runtime.evaluate', {
    expression: `
      const brandBtn = document.querySelector('button[title*="About Bakas"]');
      if (brandBtn) brandBtn.click();
    `,
  })
  await new Promise((r) => setTimeout(r, 1200))
  await captureScreen('capture-5-about-modal.png')

} catch (err) {
  console.error('Error during screen capture:', err)
} finally {
  ws.close()
  browserProcess.kill()
  server.close()
  console.log('Screen capture pipeline finished.')
}
