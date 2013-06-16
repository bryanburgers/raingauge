var request = require('request');
var observationParser = require('./observation-parser');
var totaler = require('./totaler');
var stream = require('stream');
var http = require('http');
var static = require('node-static');


var file = new static.Server('./httpdocs', { cache: 300 });

var server = http.createServer(function(req, response) {

	if (/^\/data\/([A-Z]{4})/.test(req.url)) {
		var code = req.url.match(/^\/data\/([A-Z]{4})/)[1];

		var r = request('http://w1.weather.gov/data/obhistory/' + code + '.html');
		r.on('response', function(resp) {

			if (resp.statusCode === 200) {

				var lastModified = new Date(resp.headers['last-modified']);

				var expires = new Date(lastModified.valueOf());
				expires.setHours(expires.getHours() + 1);
				var secondsTilExpires = Math.floor((expires.valueOf() - (new Date()).valueOf()) / 1000);

				response.writeHead(200, {
					'Content-Type': 'application/json',
					'Last-Modified': resp.headers['last-modified'],
					'Cache-Control': 'public, max-age=' + secondsTilExpires,
					'Expires': expires.toUTCString()
				});
				var parser = observationParser();
				totaler(parser, function(err, data) {
					response.end(JSON.stringify(data));
				})
				r.pipe(parser);
			}
			else {
				response.writeHead(404, {
					'Content-Type': 'application/json'
				});
				response.end('{ "error": "Not Found" }');
			}
		});
	}
	else if (req.url == '/') {
		// Home page
		req.on('end', function() {
			file.serveFile('index.html', 200, {}, req, response);
		}).resume();
	}
	else {
		// Any other page.
		req.on('end', function() {
			file.serve(req, response);
		}).resume();
	}
});
var port = process.env.PORT || 2000;
server.listen(port);
