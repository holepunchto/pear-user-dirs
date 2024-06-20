'use strict'

const path = require('path')
const fs = require('fs')
const { spawn, spawnSync } = require('child_process')
const { isWindows, isMac, isBare } = require('which-runtime')
const { pathToFileURL } = require('url-file-url')

const HOME_DIR = require('os').homedir()
const DEFAULT_PATH = path.join(HOME_DIR, 'Downloads')

const WIN_DIR = isWindows ? isBare ? require('bare-env').windir : process.env.windir : null
const REG_EXE = isWindows ? path.join(WIN_DIR, 'System32', 'reg.exe') : null
const REG_KEY = 'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\User Shell Folders'
const GUID_DOWNLOADS = '{374DE290-123F-4565-9164-39C4925E467B}'

function getDownloadsPathSync () {
  if (isWindows) {
    try {
      const regQuery = ['QUERY', REG_KEY, '/v', GUID_DOWNLOADS]
      const result = spawnSync(REG_EXE, regQuery, { stdio: 'pipe' })
      const output = result.stdout.toString()
      const match = output.match(/REG_\w+\s+(.*)/)
      if (match && match[1]) {
        return path.resolve(match[1].trim().replace(/%USERPROFILE%/g, HOME_DIR))
      }
    } catch { return DEFAULT_PATH }
  }

  if (isMac) return DEFAULT_PATH

  try {
    const result = spawnSync('xdg-user-dir', ['DOWNLOAD'], { stdio: 'pipe' })
    const downloadsPath = result.stdout.toString().trim()
    if (downloadsPath && downloadsPath !== HOME_DIR) return downloadsPath
  } catch { /* ignore */ }

  try {
    fs.statSync(DEFAULT_PATH)
    return DEFAULT_PATH
  } catch { return '/tmp' }
}

function getDownloadsPathAsync () {
  if (isWindows) {
    return new Promise((resolve, reject) => {
      const regQuery = ['QUERY', REG_KEY, '/v', GUID_DOWNLOADS]
      const subprocess = spawn(REG_EXE, regQuery, { stdio: 'pipe' })

      let stdout = ''
      subprocess.stdout.on('data', data => { stdout += data.toString() })

      subprocess.on('exit', code => {
        if (code !== 0) return reject(new Error(`Subprocess exited with code ${code}`))
        const match = stdout.match(/REG_\w+\s+(.*)/)
        if (match && match[1]) {
          resolve(path.resolve(match[1].trim().replace(/%USERPROFILE%/g, HOME_DIR)))
        } else {
          resolve(DEFAULT_PATH)
        }
      })

      subprocess.on('error', () => resolve(DEFAULT_PATH))
    })
  }

  if (isMac) return Promise.resolve(DEFAULT_PATH)

  return new Promise((resolve, reject) => {
    const subprocess = spawn('xdg-user-dir', ['DOWNLOAD'], { stdio: 'pipe' })

    let stdout = ''
    subprocess.stdout.on('data', data => { stdout += data.toString() })

    const checkDefault = () => {
      try {
        fs.statSync(DEFAULT_PATH)
        resolve(DEFAULT_PATH)
      } catch { resolve('/tmp') }
    }

    subprocess.on('exit', code => {
      if (code !== 0) return reject(new Error(`Subprocess exited with code ${code}`))
      const downloadsPath = stdout.toString().trim()
      if (downloadsPath && downloadsPath !== HOME_DIR) resolve(downloadsPath)
      else checkDefault()
    })

    subprocess.on('error', () => checkDefault())
  })
}

function pearUserDirsSync (opts) {
  const downloadsPath = getDownloadsPathSync()
  return {
    downloads: opts.asFileLinks ? pathToFileURL(downloadsPath).href : downloadsPath
  }
}

async function pearUserDirsAsync (opts) {
  const downloadsPath = await getDownloadsPathAsync()
  return {
    downloads: opts.asFileLinks ? pathToFileURL(downloadsPath).href : downloadsPath
  }
}

module.exports = function pearUserDirs ({ sync = false, asFileLinks = false } = {}) {
  const opts = { sync, asFileLinks }
  if (opts.sync) return pearUserDirsSync(opts)
  return pearUserDirsAsync(opts)
}
