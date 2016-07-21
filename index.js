var inherits = require('inherits')
var EventEmitter = require('events').EventEmitter
var duplexify = require('duplexify')
var path = require('path')

inherits(Defer, EventEmitter)
module.exports = Defer

function Defer (archive) {
  if (!(this instanceof Defer)) return new Defer(archive)
  EventEmitter.call(this)
  this.setMaxListeners(Infinity)
  if (archive) this.setArchive(archive)
  var self = this
  self.metadata = {
    head: function (block, cb) {
      self._getArchive(function (archive) {
        archive.metadata.head(block, cb)
      })
    }
  }
}

Defer.prototype.setArchive = function (archive) {
  this._archive = archive
  this.key = archive.key
  this.emit('_archive', archive)
}

Defer.prototype._getArchive = function (fn) {
  if (this._archive) fn(this._archive)
  else this.once('_archive', fn)
}

Defer.prototype.append = function (entry, cb) {
  this._getArchive(function (archive) {
    archive.append(entry, cb)
  })
}

Defer.prototype.get = function (index, cb) {
  this._getArchive(function (archive) {
    archive.get(index, cb)
  })
}

Defer.prototype.download = function (index, cb) {
  this._getArchive(function (archive) {
    archive.download(index, cb)
  })
}

Defer.prototype.lookup = function (name, cb) {
  this._getArchive(function (archive) {
    archive.lookup(name, cb)
  })
}

Defer.prototype.list = function (opts, cb) {
  var d = duplexify.obj()
  this._getArchive(function (archive) {
    d.setReadable(archive.list(opts, cb))
  })
  return d
}

Defer.prototype.createFileReadStream = function (entry) {
  var d = duplexify()
  this._getArchive(function (archive) {
    d.setReadable(archive.createFileReadStream(entry))
  })
  return d
}

Defer.prototype.createFileWriteStream = function (entry) {
  var d = duplexify()
  this._getArchive(function (archive) {
    d.setWritable(archive.createFileWriteStream(entry))
  })
  return d
}

Defer.prototype.checkout = function (hashOrBlock) {
  var d = new Defer()
  this._getArchive(function (archive) {
    d.setArchive(archive.checkout(hashOrBlock))
  })
  return d
}

Defer.prototype.replicate = function (opts, cb) {
  var d = duplexify()
  this._getArchive(function (archive) {
    var r = archive.replicate(opts, cb)
    d.setReadable(r)
    d.setWritable(r)
  })
  return d
}
