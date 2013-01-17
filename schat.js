var tls = require('tls'), fs = require('fs'), sys = require('sys');
var clients = [];
var options = {key: fs.readFileSync('server-key.pem'),cert: fs.readFileSync('server-cert.pem')};

var server = tls.createServer(options, function (socket) {
	sys.puts("TLS connection established");

	socket.setTimeout(0);
	socket.setEncoding("utf8");

	var client = new Client(socket);
	clients.push(client);

    // Listeners
    socket.addListener("connect", function () { socket.write("Welcome, enter your username: ");});
    socket.addListener("data", function(data){ msg = data; if (client.name == null) {setName(msg); return;}
    	var command = data.match(/^\/(.*)/);
    	if (command) { commandfunc(command[1]); return; }
    	broadcast(msg);
    });
	function broadcast(msg){
		msg = rmvlastWhitespace(msg);
		if (client.name == null) {socket.write("Your name is not set, can't broadcast messages!\nType '/help' for more info."); return;}
		sys.puts("\033[32m"+client.name + "\033[39m > " + msg);
		clients.forEach(function(c) {
			if (c != client) c.socket.write("\033[32m"+client.name + "\033[39m > " + msg+"\n");
		});
	}
	function commandfunc(command){
		var commandParameters = command.split(/[\s,]+/);
		sys.puts(client.name+" used the command: /"+command);
		switch (commandParameters[0]) {
			// Need to create OOP style list for commands
			case 'help':
				
			break;
			case 'users':
				clients.forEach(function(c) {
					socket.write("- " + c.name + "\n");
				});
				return;
			break;
			case 'quit': 
			case 'optout':
				socket.end();
			break;
			case 'pm':
				var reciever = commandParameters[1];
				// Workaround until I find the right regex expression
				var msg = command.split(/\s(.+)?/)[1].split(/\s(.+)?/)[1];
				//clients.forEach(function(c) {
				//	if()
				//});
			break;
			case 'username':
				client.name = command.split(/\s(.+)?/)[1];
			break;
			default:
				socket.write("You so silly, that not a command.\n");
		}
	}
	function setName(name){
		name = name.match(/\S+/);
		client.name = name;
		socket.write("Username set to " + name + "\n");
	}
}).listen(8000);

function Client(socket) {
	this.name = null;
	this.socket = socket;
}
function rmvlastWhitespace(str) {
	return str.replace(/\s+$/, '');
}
sys.puts("TLS server started");