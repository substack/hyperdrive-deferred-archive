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
  self.metadata = new EventEmitter
  self.metadata.head = function (block, cb) {
    self._getArchive(function (archive) {
      archive.metadata.head(block, cb)
    })
  }
}

Defer.prototype.setArchive = function (archive) {
  var self = this
  if (self._archive) {
    self._archive.metadata.removeListener('download-finished',
      self._metadata_ondownloadfinished)
    self._archive.metadata.removeListener('open', self._metadata_onopen)
    self._archive.metadata.removeListener('close', self._metadata_onclose)
    self._archive.metadata.removeListener('update', self._metadata_onupdate)
    self._archive.metadata.removeListener('have', self._metadata_onhave)
  }
  self._metadata_ondownloadfinished = function () {
    self.metadata.emit('download-finished')
  }
  self._metadata_onopen = function () { self.metadata.emit('open') }
  self._metadata_onclose = function () { self.metadata.emit('close') }
  self._metadata_onupdate = function () { self.metadata.emit('update') }
  self._metadata_onhave = function (block, data) {
    self.metadata.emit('have', block, data)
  }
  archive.metadata.on('download-finished', self._metadata_ondownloadfinished)
  archive.metadata.on('open', self._metadata_onopen)
  archive.metadata.on('close', self._metadata_onclose)
  archive.metadata.on('update', self._metadata_onupdate)
  archive.metadata.on('have', self._metadata_onhave)
  self._archive = archive
  self.key = archive.key
  self.emit('_archive', archive)
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
