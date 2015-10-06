var user = prompt("What's your name?"); 
var topic = prompt("What would you like to talk about?");
// Create a client instance
// 127.0.0.1 is your localhost, but you would set this to the public DNS or IP
// Remember your broker (Mosquitto) has to be configured for websockets!
// the last argument is the client id which should (with almost certain probability) be unique for each client that connects
var client = new Paho.MQTT.Client('54.148.135.146', Number('1883'), (Math.random().toString(36)+'00000000000000000').slice(2, 7));

// set callback handlers
client.onConnectionLost = onConnectionLost;
client.onMessageArrived = onMessageArrived;

// connect the client
client.connect({onSuccess:onConnect});

// called when the client connects
function onConnect() {
  // Once a connection has been made, make a subscription and send a message.
  console.log("onConnect");
  client.subscribe(topic);
}

// called when the client loses its connection
function onConnectionLost(responseObject) {
  client.connect({onSuccess:onConnect}); 
  if (responseObject.errorCode !== 0) {
    console.log("onConnectionLost:"+responseObject.errorMessage);
  }
}

String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
}

// called when a message arrives
// here you can render an image 
function onMessageArrived(message) {
    var recv_msgs = document.getElementById("received_messages");
    var payload = String(message.payloadString);
    
    // tokenize the payload 
    var tokens = payload.split(" ");
    var tokensLength = tokens.length;
    
    // iterate through and check to see if an image exists
    var img_exists = false;
    for (var i = 1; i < tokensLength; i++) {
        console.log(tokens[i]);
        if (String(tokens[i]).endsWith(".jpeg") || String(tokens[i]).endsWith(".jpg")) {
            img_exists = true;
            img = tokens[i];
            break;
        }
    }                

    var new_content = document.createElement("div");

    new_content.innerHTML = "<br>" + message.payloadString;

    if (img_exists) {
        var new_img = document.createElement("img");
        new_img.setAttribute("src", img);
        new_content.innerHTML += "<br>"
    }

    while (new_content.firstChild) {
        recv_msgs.appendChild(new_content.firstChild); 
    }
    if (img_exists) {
        recv_msgs.appendChild(new_img);
    }
}

var button = document.getElementById("send_button");
var msg_text = document.getElementById("message_text"); 
button.onclick = function() {
  message = new Paho.MQTT.Message(user + ": " + msg_text.value);
  message.destinationName = topic;  // publish to a specific topic
  client.send(message);
}
