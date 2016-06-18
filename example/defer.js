var hyperdrive = require('hyperdrive')
var deferred = require('../')
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
