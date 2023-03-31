// Access the form element...
const form = document.querySelector("#chatform");
const messages = document.querySelector("#messages");
const feedback = document.querySelector("#feedback");

messages.scrollTo({
  behavior: "smooth",
  top: document.body.offsetTop,
});

// ...and take over its submit event.
form.addEventListener("submit", function (event) {
  event.preventDefault();
  feedback.innerText = "";
  newMessage("Reb");
  form.reset();
});

const newMessage = user => {
  let message = form["chat-text"].value;
  if (message.toString().trim() === "") return false;

  let div = document.createElement("div");
  div.classList.add("w-75", "my-1", "mr-auto");
  // div.id = user[("sent", "received")];
  div.id = "sent";
  div.innerHTML = `
      <div class="card d-flex flex-row bg-transparent border-0 w-100 p-2 h-100">
        <div class="message-body card-body rounded py-2 w-100 overflow-hidden">
          <span class="font-weight-bold card-title">${user}</span><br />
          <span class="card-text"
            >${message}</span
          >
        </div>
      </div>
      `;

  messages.appendChild(div);

  messages.scrollTo({
    behavior: "smooth",
    top: document.body.offsetHeight,
  });
};

document.querySelector("#chat-text").addEventListener("keypress", e => {
  feedback.innerText = "You are typing";
});

const handleStatus = el => {
  let profImg = document.querySelector("#profile-img");
  profImg.classList = "";
  document.querySelector("#status-online").classList.remove("active");
  document.querySelector("#status-offline").classList.remove("active");
  document.querySelector("#status-away").classList.remove("active");
  document.querySelector("#status-busy").classList.remove("active");
  el.classList.add("active");

  if (document.querySelector("#status-online").classList.contains("active")) {
    profImg.classList.add("online");
  } else if (document.querySelector("#status-away").classList.contains("active")) {
    profImg.classList.add("away");
  } else if (document.querySelector("#status-busy").classList.contains("active")) {
    profImg.classList.add("busy");
  } else if (document.querySelector("#status-offline").classList.contains("active")) {
    profImg.classList.add("offline");
  } else {
    profImg.classList.remove();
  }
  document.querySelector("#status-options").classList.remove("active");
};

/** code by webdevtrick ( https://webdevtrick.com ) **/
let r, g, b, cstring;
const colapply = () => {
  color();
  r = newcolor.slice(1, 3);
  g = newcolor.slice(3, 5);
  b = newcolor.slice(5, 7);
  r = parseInt(r, 16);
  g = parseInt(g, 16);
  b = parseInt(b, 16);

  cstring = `rgba(${r},${g},${b}, 0.2)`;

  // $(".message-body").css({
  //   color: newcolor,
  // });

  $(".message-body").css({
    background: cstring,
  });
};
let newcolor;
const color = () => {
  newcolor = "#" + ((Math.random() * 0xffffff) << 0).toString(16);
  if (newcolor.length < 7) {
    color();
  }
};
$(".message-sender").click(colapply);
colapply();
