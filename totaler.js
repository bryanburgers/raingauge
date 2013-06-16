var util = require('util');

function Totaler(parser, callback) {
	this.parser = parser;
	this.callback = callback;

	this.parser.on('value', this._onvalue.bind(this));
	this.parser.on('end', this._onend.bind(this));

	this._sum = 0;
	this._minDate = null;
	this._maxDate = null;
}

Totaler.prototype._onvalue = function (chunk) {
	this._sum += chunk.value;
	if (this._maxDate == null || this._maxDate < chunk.date) {
		this._maxDate = chunk.date;
	}
	if (this._minDate == null || this._minDate > chunk.date) {
		this._minDate = chunk.date;
	}
};
Totaler.prototype._onend = function() {
	var self = this;
	this.callback(null, {
		value: self._sum,
		startDate: self._minDate,
		endDate: self._maxDate
	});
}

module.exports = function(parser, callback) {
	return new Totaler(parser, callback);
}

module.exports.Totaler = Totaler;
