var stream = require('stream');
var util = require('util');

function TransformStream() {
	stream.Transform.call(this, { objectMode: true });
}

util.inherits(TransformStream, stream.Transform);

TransformStream.prototype._transform = function(chunk, encoding, callback) {
	this.push(JSON.stringify(chunk) + "\n");
	callback();
}

module.exports = function() {
	return new TransformStream();
}

module.exports.TransformStream = TransformStream;
