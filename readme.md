# hyperdrive-deferred-archive

buffer API calls for a hyperdrive archive for when an instance is available

# example

This program saves and loads the archive link from leveldb, but provides the
hyperdrive archive API immediately for use.

``` js
var hyperdrive = require('hyperdrive')
var deferred = require('hyperdrive-deferred-archive')
var level = require('level')
var sub = require('subleveldown')

var db = level('/tmp/drive.db', { valueEncoding: 'binary' })
var drive = hyperdrive(sub(db, 'drive'))

var archive = deferred()
if (process.argv[2] === 'read') {
  var file = process.argv[3]
  archive.createFileReadStream(file).pipe(process.stdout)
} else if (process.argv[2] === 'write') {
  var file = process.argv[3]
  process.stdin.pipe(archive.createFileWriteStream(file))
}

db.get('link', function (err, link) {
  var xarchive = drive.createArchive(link, { live: true })
  if (!link) db.put('link', xarchive.key, setArchive)
  else setArchive()

  function setArchive () {
    archive.setArchive(xarchive)
  }
})
```

```
$ echo hello whatever | node defer.js write hello.txt
$ node defer.js read hello.txt
hello whatever
```

# api

```
var defer = require('hyperdrive-deferred-archive')
```

## var archive = defer()

Create a new hyperdrive `archive` instance that will buffer API calls for when a
real archive instance can be provided in the future.

## archive.setArchive(realArchive)

Set a real archive. All buffered and future API methods are written to the real
archive.

## archive.get()
## archive.append()
## archive.download()
## archive.createFileWriteStream()
## archive.createFileReadStream()

Any hyperdrive archive methods are buffered until a real instance is provided
later.

## archive.metadata.head()

Some hypercore methods are also buffered.

# install

```
npm install hyperdrive-deferred-archive
```

# license

BSD
