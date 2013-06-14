var dpr = window.devicePixelRatio || 1;

var GRAY = "#111";
var BLUE = "#48f";

function easeOutQuadratic(x) {
	x -= 1;
	return 1 - (x * x);
}

var value = document.getElementById('value');
var canvas = document.getElementById('canvas');
canvas.width = 320 * dpr;
canvas.height = 320 * dpr;
var ctx = canvas.getContext('2d');
ctx.lineWidth = 16 * dpr;
//var outerarc = new Arc(ctx, 160, 160, 152);
var arc = new Arc(ctx, 160 * dpr, 160 * dpr, 130 * dpr);
ctx.strokeStyle = GRAY;
arc.strokeCircle();


var lastUpdate = 0;
function requestData() {
	lastUpdate = new Date().valueOf();
	var xhr = new XMLHttpRequest();
	console.log(xhr);
	xhr.onreadystatechange = function() {
		if (xhr.readyState === 4) {
			console.log(xhr.responseText);
			var response = JSON.parse(xhr.responseText);
			setValue(response.value);
		}
	}
	xhr.open('GET', '/data/KFSD', true);
	xhr.send(null);
}

requestData();
setTimeout(function() {
	var now = new Date().valueOf();
	if (now > lastUpdate + 10000) {
		requestData();
	}
}, 1000 * 10); // Refresh every 10 seconds minutes.

var lastValue = -1;
function setValue(val) {
	value.setAttribute('class', 'value');

	if (val === lastValue) {
		return;
	}

	lastValue = val;

	if (val === 0) {
		value.textContent = "zero";
		return;
	}

	var target = val;
	var startTime = new Date().valueOf();
	var duration = 1500;
	var endTime = startTime + duration;
	var raf = window.requestAnimationFrame || window.webkitRequestAnimationFrame;
	var formatNumber = function(p) {
		var v = (Math.round(p * 100) / 100).toString();
		if (v === '0') {
			v = '0.00';
		}
		if (v.length < 4) {
			v = v + '0';
		}
		return v + "\u201d";
	};
	var draw = function() {
		var now = new Date().valueOf();
		if (now > endTime) {
			arc.strokePercent(target);
			value.textContent = formatNumber(target);
			return;
		}

		var t = (now - startTime) / duration;
		var t2 = easeOutQuadratic(t);
		var p = target * t2;
		var v = formatNumber(p);
		if (v === '0') {
			v = '0.00';
		}
		if (v.length < 4) {
			v = v + '0';
		}
		ctx.clearRect(0, 0, 320 * dpr, 320 * dpr);
		ctx.strokeStyle = GRAY;
		arc.strokeCircle();
		ctx.strokeStyle = BLUE;
		arc.strokePercent(p);
		value.textContent = v.toString();
		raf(draw);
	};
	draw();
}
