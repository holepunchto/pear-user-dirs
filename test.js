const test = require('brittle')
const fs = require('fs')
const pearUserDirs = require('./')

test('pearUserDirs should return an existing string path', function (t) {
  t.plan(3)
  const { downloads: dir } = pearUserDirs({ sync: true })
  t.is(typeof dir, 'string')
  t.ok(dir.length > 0)
  t.ok(fs.existsSync(dir), `Path should exist: ${dir}`)
})

test('pearUserDirs should return a file URL if requested', function (t) {
  t.plan(2)
  const { downloads: link } = pearUserDirs({ sync: true, asFileLinks: true })
  t.is(typeof link, 'string')
  t.ok(link.startsWith('file://'))
})

test('pearUserDirs should return a string path asynchronously', async function (t) {
  t.plan(3)
  const { downloads: dir } = await pearUserDirs()
  t.is(typeof dir, 'string')
  t.ok(dir.length > 0)
  t.execution(fs.promises.access(dir), `Path should exist: ${dir}`)
})

test('pearUserDirs should return a file URL asynchronously if requested', async function (t) {
  t.plan(2)
  const { downloads: link } = await pearUserDirs({ asFileLinks: true })
  t.is(typeof link, 'string')
  t.ok(link.startsWith('file://'))
})
