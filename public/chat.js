let chatInput = document.getElementById("chat-input")
function sendMessage() {
 socket.emit("chat message", {message: chatInput.value, time: Date.now(), id: playerId}) 
}