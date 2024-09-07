let message = prompt("message")
socket.emit("chat message", {message: message, time: Date.now()})