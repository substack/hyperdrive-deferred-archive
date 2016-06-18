var test = require('tape')
var defer = require('../')
var memdb = require('memdb')
var hyperdrive = require('hyperdrive')
var concat = require('concat-stream')

test('defer', function (t) {
  t.plan(6)
  var archive = defer()
  var w = archive.createFileWriteStream('hello.txt')
  w.end('whatever')
  w.once('finish', function () {
    archive.createFileReadStream('hello.txt')
      .pipe(concat({ encoding: 'string' }, function (body) {
        t.equal(body, 'whatever')
      }))
    archive.list(function (err, entries) {
      t.error(err)
      t.deepEqual(entries.map(ename), ['hello.txt'])
    })
    archive.get(0, function (err, entry) {
      t.error(err)
      t.equal(entry.name, 'hello.txt')
      t.equal(entry.length, 8)
    })
  })

  var drive = hyperdrive(memdb())
  archive.setArchive(drive.createArchive({ live: true }))
})

function ename (entry) { return entry.name }
