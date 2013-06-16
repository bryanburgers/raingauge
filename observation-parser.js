var htmlparser = require('htmlparser2');
var stream = require('stream');
var util = require('util');

var dateCount = 0;
var timeCount = 1;
var valueCount = 15;

var START = "start";
var INTABLE = "intable";
var PROCESSINGROW = "processingrow";
var ENDROW = "endrow";
var DONE = "done";

function getDate(date, time) {
	var now = new Date();
	var day = parseInt(date, 10);
	var hour = parseInt(time.split(':')[0], 10);
	var minute = parseInt(time.split(':')[1], 10);

	var date = new Date();
	date.setSeconds(0);
	date.setMilliseconds(0);
	if (day > now.getDate()) {
		now.setMonth(now.getMonth() - 1);
	}

	date.setFullYear(now.getFullYear());
	date.setMonth(now.getMonth());
	date.setDate(day);
	date.setHours(hour);
	date.setMinutes(minute);
	return date;
}

function getValue(value) {
	var v = parseFloat(value, 10);
	if (isNaN(v)) {
		return 0;
	}
	return v;
}

function ObservationParser() {
	stream.Writable.call(this, { objectMode: true });

	this._state = START;
	this._currentcol = -1;
	this._currentitem = {};
	this._parser = new htmlparser.Parser({
		onopentag: this._onopentag.bind(this),
		ontext: this._ontext.bind(this),
		onclosetag: this._onclosetag.bind(this)
	});

	var self = this;
	this.on('finish', function() {
		self._parser.end();
	});
}

util.inherits(ObservationParser, stream.Writable);

ObservationParser.prototype._onopentag = function(tagname, attribs) {
	switch (this._state) {
		case START:
			if (tagname == "table" && attribs.cellspacing == '3' && attribs.cellpadding == '2' && attribs.width == '670') {
				this._state = INTABLE;
			}
			break;
		case INTABLE:
			if (tagname == "tr") {
				this._state = PROCESSINGROW;
				this._currentcol = -1;
				this._currentitem = {};
			}
			break;
		case PROCESSINGROW:
			if (tagname == "td") {
				this._currentcol++;
			}
			break;
		case DONE:
			break;
		default:
			break;
	}
};

ObservationParser.prototype._ontext = function(text) {
	switch (this._state) {
		case START:
			break;
		case INTABLE:
			break;
		case PROCESSINGROW:
			if (this._currentcol == dateCount) {
				this._currentitem.date = text;
			}
			if (this._currentcol == timeCount) {
				this._currentitem.time = text;
			}
			if (this._currentcol == valueCount) {
				this._currentitem.value = text;
			}
			break;
		case DONE:
			break;
		default:
			break;
	}
};

ObservationParser.prototype._onclosetag = function(tagname) {
	switch (this._state) {
		case START:
			break;
		case INTABLE:
			if (tagname == 'table') {
				this._state = DONE;
			}
			break;
		case PROCESSINGROW:
			if (tagname == 'tr') {
				this._state = INTABLE;
				if (this._currentcol > -1) {
					var date = getDate(this._currentitem.date, this._currentitem.time);
					var value = getValue(this._currentitem.value);
					this.emit('value', { date: date, value: value });
				}
			}
			break;
		case DONE:
			this.emit('end');
			break;
		default:
			break;
	}
};

ObservationParser.prototype._write = function(chunk, encoding, callback) {
	this._parser.write(chunk);
	callback();
};

module.exports = function() {
	return new ObservationParser();
};

module.exports.ObservationParser = ObservationParser;
