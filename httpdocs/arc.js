(function(ns) {

function Arc(ctx, x,y,radius) {
	this.ctx = ctx;
	this.x = x;
	this.y = y;
	this.radius = radius;
}

Arc.prototype.strokeCircle = function() {
	var ctx = this.ctx;
	ctx.beginPath();

	var startAngle = 0;
	var endAngle = Math.PI * 2;
	var clockwise = 0;

	ctx.arc(this.x, this.y, this.radius, startAngle, endAngle, clockwise);
	ctx.closePath();
	ctx.stroke();
}

Arc.prototype.strokePercent = function strokePercent(percent) {
	var ctx = this.ctx;
	ctx.beginPath();

	var totalAngle = 2 * Math.PI * percent;
	var bottomAngle = 2 * Math.PI / 4;
	var halfAngle = totalAngle / 2;

	var startAngle = bottomAngle - halfAngle;
	var endAngle = bottomAngle + halfAngle;
	var clockwise = 0;

	ctx.arc(this.x, this.y, this.radius, startAngle, endAngle, clockwise);
	ctx.stroke();
};

ns.Arc = Arc;

}(window));
