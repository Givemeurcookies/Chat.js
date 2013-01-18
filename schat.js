// Getting modules
var tls = require('tls'), fs = require('fs'), sys = require('sys');

// This array is used to show who is online
var clients = [];

// Read the server key and cert (you need to generate those in the same dir as you place the script)
var options = {key: fs.readFileSync('server-key.pem'),cert: fs.readFileSync('server-cert.pem')};

var server = tls.createServer(options, function (socket) {
	
	// Constructor
	sys.puts("TLS connection established");
	socket.setTimeout(0);
	socket.setEncoding("utf8");

	// Saving the client socket to our clients array so we can use it (i.e our broadcast function and 'users' command)
	var client = new Client(socket);
	clients.push(client);

    // Listeners
    // Listens for users that connect to our server
    socket.addListener("connect", function () { socket.write("Welcome, enter your username: ");});

    // Listening for data (messages) from our active chat users
    socket.addListener("data", function(data){

    	// Checking if this user's username has been set
    	if (client.name == null) {
    		setName(data);
    		return;
    	}

    	// Checking if the messages starts with "/"" (identified as a command) also splits up the command.
    	var command = data.match(/^\/(.*)/);

    	// Checking if the message is a command.
    	if (command) {
    		// If it's a command we won't pass the "/" (command[0]) in our command function but just the command.
    		commandfunc(command[1]); 
    		return; 
    	}

    	// If it's not a command and the username has been set, we broadcast the message to all connected clients.
    	broadcast(msg);
    });

    // This function broadcasts a message to all users
	function broadcast(msg){

		// Depending on the client, removes the newline on the end of a message (i.e Terminal SSH on OS X adds a newline this before sending)
		msg = rmvlastWhitespace(msg);

		// In case the user somehow manages to unset or not set his/her username 
		if (client.name == null) {
			socket.write("Your name is not set, can't broadcast messages!\nType '/username <your name>' to set it!"); 
			return;
		}

		// Added hardcoded colours, should consider to replace those with a better alternative.
		sys.puts("\033[32m"+client.name + "\033[39m > " + msg);

		// Loops through the clients array and sends the message to each active user
		clients.forEach(function(c) {
			// If it's not the client (user that sent the message), send message (c.socket.write)
			if (c != client) c.socket.write("\033[32m"+client.name + "\033[39m > " + msg+"\n");
		});
	}

	// This function handles commands
	function commandfunc(command){
		// Splits up parameters 
		var commandParameters = command.split(/[\s,]+/);
		// Logs to 
		sys.puts(client.name+" used the command: /"+command);
		switch (commandParameters[0]) {
			// Improvement; need to create OOP style list for commands
			
			case 'help':
				// Nothing yet, you can easily add the commands by using 
				// socket.write("/commandname - description");
				// Improvement; Create a class with all the commands, their functions and descriptions
			break;

			case 'users':
				// Lists all users
				clients.forEach(function(c) {
					socket.write("- " + c.name + "\n");
				});
				return;
			break;

			case 'quit': 
			case 'optout':
				// Ends socket (logs the user out)
				socket.end();
			break;

			case 'pm':
				//Unfinished(?)
				var reciever = commandParameters[1];
				// Workaround until I find the right regex expression
				var msg = command.split(/\s(.+)?/)[1].split(/\s(.+)?/)[1];
				//clients.forEach(function(c) {
				//	if()
				//});
			break;

			case 'username':
				// Changes the users username (supports whitespaces i.e "Foo bar")
				client.name = command.split(/\s(.+)?/)[1];
			break;
			default:
				// If it's not a valid command
				socket.write("You so silly, that not a command.\n");
		}
	}

	// Sets/Changes the username of this user/client (socket)
	function setName(name){
		// Forgot what I made this for again, fuck.
		name = name.match(/\S+/);

		// Sets/Changes username
		client.name = name;

		// Confirms the user that the username has been changed
		socket.write("Username set to " + name + "\n");
	}

// You'll know what this is if you managed to install node.js (hint: it's something about ports)
}).listen(8000);

function Client(socket) {
	this.name = null;
	this.socket = socket;
}

// Removes last newline of a string
function rmvlastWhitespace(str) {
	return str.replace(/\s+$/, '');
}

//Logs to the console that the server has started
sys.puts("TLS server started");