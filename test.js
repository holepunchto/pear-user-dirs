const test = require('brittle')
const fs = require('fs')
const getUserDirs = require('./')

test('getUserDirs should return an existing string path', function (t) {
  t.plan(3)
  const { downloads: dir } = getUserDirs({ sync: true })
  t.is(typeof dir, 'string')
  t.ok(dir.length > 0)
  t.ok(fs.existsSync(dir), `Path should exist: ${dir}`)
})

test('getUserDirs should return a file URL if requested', function (t) {
  t.plan(2)
  const { downloads: link } = getUserDirs({ sync: true, asFileLinks: true })
  t.is(typeof link, 'string')
  t.ok(link.startsWith('file://'))
})

test('getUserDirs should return a string path asynchronously', async function (t) {
  t.plan(3)
  const { downloads: dir } = await getUserDirs()
  t.is(typeof dir, 'string')
  t.ok(dir.length > 0)
  t.execution(fs.promises.access(dir), `Path should exist: ${dir}`)
})

test('getUserDirs should return a file URL asynchronously if requested', async function (t) {
  t.plan(2)
  const { downloads: link } = await getUserDirs({ asFileLinks: true })
  t.is(typeof link, 'string')
  t.ok(link.startsWith('file://'))
})
