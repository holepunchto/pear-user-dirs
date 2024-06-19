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

getUserDirs({ asFileLinks: true }).then(dirs => {
  console.log('Downloads folder path as URL:', dirs.downloads)
})
```

```js
const getUserDirs = require('pear-user-dirs')

const dirs = getUserDirs({ sync: true })
console.log('Downloads folder path:', dirs.downloads)

const dirsURL = getUserDirs({ sync: true, asFileLinks: true })
console.log('Downloads folder path as URL:', dirsURL.downloads)
```

## API

### `getUserDirs(opts = { sync: false, asFileLinks: false })`

- `opts`:
  - `sync` (boolean): If `true`, directly returns an object with the paths of the user directories, otherwise returns a Promise. Default is `false`.
  - `asFileLinks` (boolean): If `true`, returns the path as a file URL. Default is `false`.

## License

Apache-2.0
