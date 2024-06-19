const test = require('brittle')
const getUserDirs = require('./')
const getUserDirsSync = require('./').sync
const { isWindows, isLinux, isMac } = require('which-runtime')
const path = require('path')
const { spawnSync } = require('child_process')

test('downloads should return a string path', function (t) {
  t.plan(2)
  const { downloads: dir } = getUserDirsSync()
  t.is(typeof dir, 'string')
  t.ok(dir.length > 0)
})

test('downloads should return a file URL if requested', function (t) {
  t.plan(2)
  const { downloads: downloadsURL } = getUserDirsSync({ asFileURL: true })
  t.is(typeof downloadsURL, 'string')
  t.ok(downloadsURL.startsWith('file://'))
})

test('downloads should return a string path asynchronously', async function (t) {
  t.plan(2)
  const { downloads: dir } = await getUserDirs()
  t.is(typeof dir, 'string')
  t.ok(dir.length > 0)
})

test('downloads should return a file URL asynchronously if requested', async function (t) {
  t.plan(2)
  const { downloads: downloadsURL } = await getUserDirs({ asFileURL: true })
  t.is(typeof downloadsURL, 'string')
  t.ok(downloadsURL.startsWith('file://'))
})

test('downloads should return the correct path for each OS', function (t) {
  t.plan(1)
  const { downloads: dir } = getUserDirsSync()
  const homeDir = require('os').homedir()

  console.log('dir:', dir)
  if (isWindows) {
    t.ok(dir.includes('Downloads'))
  } else if (isMac) {
    t.is(dir, path.join(homeDir, 'Downloads'))
  } else if (isLinux) {
    const defaultPath = path.join(homeDir, 'Downloads')
    const xdgPath = () => {
      try {
        const result = spawnSync('xdg-user-dir', ['DOWNLOAD'], { stdio: 'pipe' })
        return result.stdout.toString().trim()
      } catch (e) {
        return defaultPath
      }
    }
    console.log('defaultPath:', defaultPath)
    const xdg = xdgPath()
    console.log('xdgPath:', xdg)
    t.ok(dir === defaultPath || dir === xdg)
  } else {
    t.fail('Unknown OS')
  }
})

test('downloads should return the correct path for each OS asynchronously', async function (t) {
  t.plan(1)
  const { downloads: dir } = await getUserDirs()
  const homeDir = require('os').homedir()

  if (isWindows) {
    t.ok(dir.includes('Downloads'))
  } else if (isMac) {
    t.is(dir, path.join(homeDir, 'Downloads'))
  } else if (isLinux) {
    const defaultPath = path.join(homeDir, 'Downloads')
    const xdgPath = () => {
      try {
        const result = spawnSync('xdg-user-dir', ['DOWNLOAD'], { stdio: 'pipe' })
        return result.stdout.toString().trim()
      } catch (e) {
        return defaultPath
      }
    }
    console.log('defaultPath:', defaultPath)
    const xdg = xdgPath()
    console.log('xdgPath:', xdg)
    t.ok(dir === defaultPath || dir === xdg)
  } else {
    t.fail('Unknown OS')
  }
})
