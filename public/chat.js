let chatInput = document.getElementById("chat-input")
let chatContent = document.getElementById("chat-content")
chatInput.addEventListener('keydown', function(event) {
    event.stopPropagation();  // Prevent the spacebar event from reaching the game
});
function sendMessage() {
 socket.emit("chat message", {message: chatInput.value, time: Date.now(), id: playerId}) 
}
socket.on("chat message", (message)=>{
    let newMes = document.createElement("div");
    let newMesText = document.createElement("h3");
    let newMesPerson = document.createElement("h2");
    newMesText.innerHtml = message.message;
    newMesText.class = "message"
    newMesPerson.innerHtml = message.id;
    newMes.appendChild(newMesPerson);
    newMes.appendChild(newMesText);
    chatContent.appendChild(newMes)
  })