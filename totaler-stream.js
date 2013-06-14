var stream = require('stream');
var util = require('util');


function TotalerStream() {
	stream.Duplex.call(this, { objectMode: true });

	this._sum = 0;
	this._minDate = null;
	this._maxDate = null;

	var self = this;
	this.on('finish', function() {
		self.push({
			value: self._sum,
			startDate: self._minDate,
			endDate: self._maxDate
		});
		self.emit('end');
	});
}

util.inherits(TotalerStream, stream.Duplex);

TotalerStream.prototype._write = function (chunk, encoding, done) {
	this._sum += chunk.value;
	if (this._maxDate == null || this._maxDate < chunk.date) {
		this._maxDate = chunk.date;
	}
	if (this._minDate == null || this._minDate > chunk.date) {
		this._minDate = chunk.date;
	}
	done();
};
TotalerStream.prototype._read = function(n) {
	return null;
};

module.exports = function() {
	return new TotalerStream();
}

module.exports.TotalerStream = TotalerStream;
