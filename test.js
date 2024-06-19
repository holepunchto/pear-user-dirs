const test = require('brittle')
const getUserDirs = require('./')
const { isWindows, isMac } = require('which-runtime')
const os = require('os')
const path = require('path')
const { spawnSync } = require('child_process')

const HOME_DIR = os.homedir()
const DEFAULT_PATH = path.join(HOME_DIR, 'Downloads')

test('getUserDirs should return a string path', function (t) {
  t.plan(2)
  const { downloads: dir } = getUserDirs({ sync: true })
  t.is(typeof dir, 'string')
  t.ok(dir.length > 0)
})

test('getUserDirs should return a file URL if requested', function (t) {
  t.plan(2)
  const { downloads: link } = getUserDirs({ sync: true, asFileLinks: true })
  t.is(typeof link, 'string')
  t.ok(link.startsWith('file://'))
})

test('getUserDirs should return a string path asynchronously', async function (t) {
  t.plan(2)
  const { downloads: dir } = await getUserDirs()
  t.is(typeof dir, 'string')
  t.ok(dir.length > 0)
})

test('getUserDirs should return a file URL asynchronously if requested', async function (t) {
  t.plan(2)
  const { downloads: link } = await getUserDirs({ asFileLinks: true })
  t.is(typeof link, 'string')
  t.ok(link.startsWith('file://'))
})

test('getUserDirs should return the correct path for each OS', function (t) {
  t.plan(1)

  const expected = isWindows
    ? dir => dir.includes('Downloads')
    : isMac
      ? dir => dir.includes('Downloads')
      : dir => {
        const xdgPath = () => {
          try {
            const result = spawnSync('xdg-user-dir', ['DOWNLOAD'], { stdio: 'pipe' })
            return result.stdout.toString().trim()
          } catch (e) {
            return null
          }
        }
        return dir === DEFAULT_PATH || dir === xdgPath() || dir === '/tmp'
      }

  const { downloads: dir } = getUserDirs({ sync: true })
  t.ok(expected(dir))
})

test('getUserDirs should return the correct path for each OS asynchronously', async function (t) {
  t.plan(1)

  const expected = isWindows
    ? dir => dir.includes('Downloads')
    : isMac
      ? dir => dir.includes('Downloads')
      : dir => {
        const xdgPath = () => {
          try {
            const result = spawnSync('xdg-user-dir', ['DOWNLOAD'], { stdio: 'pipe' })
            return result.stdout.toString().trim()
          } catch (e) {
            return null
          }
        }
        return dir === DEFAULT_PATH || dir === xdgPath() || dir === '/tmp'
      }

  const { downloads: dir } = await getUserDirs()
  t.ok(expected(dir))
})
