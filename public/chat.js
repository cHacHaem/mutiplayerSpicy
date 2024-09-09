let chatInput = document.getElementById("chat-input")
let chatContent = document.getElementById("chat-content")
var params = new URLSearchParams(window.location.search);
if (typeof params.get("devtools") == "string") {
  window.addEventListener("DOMContentLoaded", (event) => {
    var script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/eruda";
    document.body.appendChild(script);
    script.onload = function () {
      eruda.init();
    };
  });
}
chatInput.addEventListener('keydown', function(event) {
    if(event.keyCode == 13) {
      sendMessage();
    }
    event.stopPropagation();  // Prevent the spacebar event from reaching the game
});
function sendMessage() {
 socket.emit("chat message", {message: chatInput.value, time: Date.now(), id: playerId}) 
  showMessage({message: chatInput.value, time: Date.now(), id: playerId})
  chatInput.value = "";
}
socket.on("chat message", (message)=>{
  showMessage(message)
  })
function showMessage(message) {
  let newMes = document.createElement("div");
    let newMesText = document.createElement("h3");
    let newMesPerson = document.createElement("h2");
    newMesText.innerHTML = message.message;
    newMesText.setAttribute("class", "message")
    newMesPerson.innerHTML = message.id;
    newMes.appendChild(newMesPerson);
    newMes.appendChild(newMesText);
    chatContent.appendChild(newMes)
}