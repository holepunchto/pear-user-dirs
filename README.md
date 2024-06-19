# pear-user-dirs

Get the path of user-specific directories on all major platforms

```
npm install pear-user-dirs
```

## Usage

Use `pear-user-dirs` to get the Downloads directory:

```js
const getUserDirs = require('pear-user-dirs')

getUserDirs().then(dirs => {
  console.log('Downloads folder path:', dirs.downloads)
})

getUserDirs({ asFileURL: true }).then(dirs => {
  console.log('Downloads folder path as URL:', dirs.downloads)
})
```

```js
const getUserDirsSync = require('pear-user-dirs').sync

const dirs = getUserDirsSync()
console.log('Downloads folder path:', dirs.downloads)

const dirsURL = getUserDirsSync({ asFileURL: true })
console.log('Downloads folder path as URL:', dirsURL.downloads)
```

## API

### `getUserDirs(opts = { asFileURL: false })`

- **Asynchronous Version (`getUserDirs`)**:
  - Returns a Promise that resolves to an object with the paths of the user directories.
  - If the `asFileURL` option is set to `true`, it returns the path as a file URL.

- **Synchronous Version (`getUserDirsSync`)**:
  - Directly returns an object with the paths of the user directories.
  - If the `asFileURL` option is set to `true`, it returns the path as a file URL.

- `opts`:
  - `asFileURL` (boolean): If `true`, returns the path as a file URL. Default is `false`.

## License

Apache-2.0
