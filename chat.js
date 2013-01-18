// This code is based a bit upon different chat servers I found on the interwebz. 
// Thanks for the ones that uploaded examples that I could base this upon.
// NOTE: Not totally commented yet, but schat.js is a bit similar so you could take a look at that to see if it helps

// Includes neccecary modules
var net = require("net");

Array.prototype.remove = function(e) {
	for (var i = 0; i < this.length; i++) {
		if (e == this[i]) { return this.splice(i, 1); }
	}
};

function Client(stream) {
	this.name = null;
	this.stream = stream;
}

var clients = [];

var server = net.createServer(function (stream) {

	var client = new Client(stream);

	stream.setTimeout(0);
	stream.setEncoding("utf8");
	clients.push(client);

	stream.addListener("connect", function () {
		stream.write("Welcome, enter your username: ");
	});

	stream.addListener("data", function (data) {
		if (client.name == null) {
			client.name = data.match(/\S+/);
			stream.write("===========\n");
			clients.forEach(function(c) {
				if (c != client) {
					c.stream.write(client.name + " has joined.\n");
				}
			});
			return;
		}

		var command = data.match(/^\/(.*)/);
		if (command) {
			var commandParameters = command[1].split(/[\s,]+/);
			if (command[1] == 'users') {
				clients.forEach(function(c) {
					stream.write("- " + c.name + "\n");
				});
			}
			else if (command[1] == 'quit') {
				stream.end();
			} else if (commandParameters[0] == 'username'){
				client.name = commandParameters[1].match(/\S+/);
				stream.write("Changed to "+commandParameters[1]+"\n");
			}
			return;
		}

		clients.forEach(function(c) {
			if (c != client) {
				c.stream.write("\033[32m"+client.name + "\033[39m > " + data);
			}
		});
	});


	stream.addListener("end", function() {
		clients.remove(client);

		clients.forEach(function(c) {
			c.stream.write(client.name + " has left.\n");
		});

		stream.end();
	});
});
server.listen(7000);