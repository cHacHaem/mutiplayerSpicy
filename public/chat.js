let chatInput = document.getElementById("chat-input")
let chatContent = document.getElementById("chat-content")
let overlay;
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
document.addEventListener("keydown", (event)=>{
  if(event.key == "c") {
    
  }
})
chatInput.addEventListener('keydown', function(event) {
    if(event.keyCode == 13) {
      sendMessage();
    }
    event.stopPropagation();  // Prevent the spacebar event from reaching the game
});
function sendMessage() {
 socket.emit("chat message", {message: chatInput.value, time: Date.now(), id: playerId, name: name}) 
  showMessage({message: chatInput.value, time: Date.now(), id: playerId})
  chatInput.value = "";
}
socket.on("chat message", (message)=>{
  showMessage(message)
  })
function showMessage(message) {
    let newMes = document.createElement("div");
    let newMesText = document.createElement("h2");
    let newMesPerson = document.createElement("h3");
    if(message.id == playerId) {
      newMesText.setAttribute("class", "messageme")
      newMesPerson.innerHTML = "me"
      newMesText.setAttribute("align", "right")
    } else {
      newMesText.setAttribute("class", "message")
      newMesPerson.innerHTML = message.name;
    }
    newMesText.innerHTML = message.message;
    newMes.appendChild(newMesPerson);
    newMes.appendChild(newMesText);
    chatContent.appendChild(newMes)
}