'use strict'

const path = require('path')
const { spawn, spawnSync } = require('child_process')
const { isWindows, isLinux, isMac } = require('which-runtime')
const { pathToFileURL } = require('url-file-url')

const REG_KEY = 'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\User Shell Folders'
const GUID_DOWNLOADS = '{374DE290-123F-4565-9164-39C4925E467B}'

function getDownloadsPathSync (homeDir, opts) {
  if (isWindows) {
    try {
      const regQuery = ['QUERY', REG_KEY, '/v', GUID_DOWNLOADS]
      const result = spawnSync('C:\\Windows\\System32\\reg.exe', regQuery, { stdio: 'pipe' })
      const output = result.stdout.toString()
      const match = output.match(/REG_\w+\s+(.*)/)
      if (match && match[1]) {
        const resolved = path.resolve(match[1].trim().replace(/%USERPROFILE%/g, homeDir))
        return opts.asFileURL ? pathToFileURL(resolved).href : resolved
      }
    } catch (e) { /* fallback to default */ }
    const defaultPath = path.join(homeDir, 'Downloads')
    return opts.asFileURL ? pathToFileURL(defaultPath).href : defaultPath
  }

  if (isMac) {
    const defaultPath = path.join(homeDir, 'Downloads')
    return opts.asFileURL ? pathToFileURL(defaultPath).href : defaultPath
  }

  if (isLinux) {
    try {
      const result = spawnSync('xdg-user-dir', ['DOWNLOAD'], { stdio: 'pipe' })
      const downloadPath = result.stdout.toString().trim()
      if (downloadPath) {
        return opts.asFileURL ? pathToFileURL(downloadPath).href : downloadPath
      }
    } catch (e) { /* fallback to default */ }
    const defaultPath = path.join(homeDir, 'Downloads')
    return opts.asFileURL ? pathToFileURL(defaultPath).href : defaultPath
  }

  const defaultPath = path.join(homeDir, 'Downloads')
  return opts.asFileURL ? pathToFileURL(defaultPath).href : defaultPath
}

async function getDownloadsPathAsync (homeDir, opts) {
  if (isWindows) {
    return new Promise((resolve, reject) => {
      const regQuery = ['QUERY', REG_KEY, '/v', GUID_DOWNLOADS]
      const subprocess = spawn('C:\\Windows\\System32\\reg.exe', regQuery, { stdio: 'pipe' })

      let stdout = ''
      subprocess.stdout.on('data', data => { stdout += data.toString() })

      subprocess.on('exit', code => {
        if (code !== 0) return reject(new Error(`Child process exited with code ${code}`))
        const match = stdout.match(/REG_\w+\s+(.*)/)
        if (match && match[1]) {
          const resolved = path.resolve(match[1].trim().replace(/%USERPROFILE%/g, homeDir))
          resolve(opts.asFileURL ? pathToFileURL(resolved).href : resolved)
        } else {
          const defaultPath = path.join(homeDir, 'Downloads')
          resolve(opts.asFileURL ? pathToFileURL(defaultPath).href : defaultPath)
        }
      })

      subprocess.on('error', () => {
        const defaultPath = path.join(homeDir, 'Downloads')
        resolve(opts.asFileURL ? pathToFileURL(defaultPath).href : defaultPath)
      })
    })
  }

  if (isMac) {
    const defaultPath = path.join(homeDir, 'Downloads')
    return opts.asFileURL ? pathToFileURL(defaultPath).href : defaultPath
  }

  if (isLinux) {
    return new Promise((resolve, reject) => {
      const subprocess = spawn('xdg-user-dir', ['DOWNLOAD'], { stdio: 'pipe' })

      let stdout = ''
      subprocess.stdout.on('data', data => { stdout += data.toString() })

      subprocess.on('exit', code => {
        if (code !== 0) return reject(new Error(`Child process exited with code ${code}`))
        const downloadPath = stdout.trim()
        if (downloadPath) {
          resolve(opts.asFileURL ? pathToFileURL(downloadPath).href : downloadPath)
        } else {
          const defaultPath = path.join(homeDir, 'Downloads')
          resolve(opts.asFileURL ? pathToFileURL(defaultPath).href : defaultPath)
        }
      })

      subprocess.on('error', () => {
        const defaultPath = path.join(homeDir, 'Downloads')
        resolve(opts.asFileURL ? pathToFileURL(defaultPath).href : defaultPath)
      })
    })
  }

  const defaultPath = path.join(homeDir, 'Downloads')
  return opts.asFileURL ? pathToFileURL(defaultPath).href : defaultPath
}

function getUserDirsSync (opts = { asFileURL: false }) {
  const homeDir = require('os').homedir()
  return {
    downloads: getDownloadsPathSync(homeDir, opts)
  }
}

async function getUserDirs (opts = { asFileURL: false }) {
  const homeDir = require('os').homedir()
  return {
    downloads: await getDownloadsPathAsync(homeDir, opts)
  }
}

module.exports = getUserDirs
module.exports.sync = getUserDirsSync
