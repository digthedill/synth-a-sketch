const socket = io();

//Options
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

let strokeWidth = 4;
let osc, fft, reverb, env, freq;
let roomDisplay, usersDisplay, usernameDisplay, allUsers, userList;

let colorPicker, synthType;
let resetBtn, synthMute;

//Envelope Options :
let attack = 0.2;
let attackLevel = 0.7;
let decay = 0.3;
let decayLevel = 0.1;

function setup() {
  const canvasDiv = document.getElementById("mainSketch");
  const width = canvasDiv.offsetWidth;
  const cv = createCanvas(width, 500);

  fft = new p5.FFT();
  reverb = new p5.Reverb();
  env = new p5.Envelope(attack, attackLevel, decay, decayLevel);

  osc = new p5.Oscillator("triangle");
  osc.amp(0.4);
  osc.freq(constrain(map(mouseX, 0, width, 200, 400), 20, 400));

  reverb.process(osc, 3, 2);

  cv.parent("mainSketch");
  cv.mousePressed(() => {
    osc.start();
    // env.play(osc);
  });
  cv.mouseReleased(() => osc.stop());

  // env.play(osc);

  ///OPTIONS ****************
  colorPicker = createColorPicker("#3383FF");
  colorPicker.parent("options");
  colorPicker.addClass("options-element");

  resetBtn = createButton("Reset Canvas");
  resetBtn.mousePressed(() => clear());
  resetBtn.parent("options");
  resetBtn.addClass("options-element");

  synthType = createSelect();
  synthType.option("triangle");
  synthType.option("square");
  synthType.option("sine");
  synthType.option("sawtooth");
  synthType.changed(handleSynthChange);
  synthType.parent("options");
  synthType.addClass("options-element");

  synthMute = createCheckbox("Mute", false);
  synthMute.parent("options");
  synthMute.changed(handleMute);
  synthMute.addClass("options-element");

  displayUser();
  displayRoomName();
  displayAllCurrentUsers();

  socket.on("mouse", (data) => {
    stroke(data.color);
    strokeWeight(data.strokeWidth);
    line(data.x, data.y, data.px, data.py);
  });
  socket.on("audio", (data) => {
    console.log(data);
    osc.freq(data.freq);
  });
}

//DOM relation between client/server
function displayRoomName() {
  socket.on("roomName", (room) => {
    if (roomDisplay === undefined) {
      roomDisplay = createDiv(`room: ${room}`);
      roomDisplay.parent("roomInfo");
    }
  });
}

function displayUser() {
  socket.on("username-display", (user) => {
    if (user !== null) {
      usernameDisplay = createDiv(user.username);
      usernameDisplay.parent("username");
      usernameDisplay.addClass("username-display");
    }
  });
}

function displayAllCurrentUsers() {
  socket.on("displayAllUsers", (users) => {
    socket.on("welcomeMsg", (msg) => {
      const welcome = createP(msg);
      welcome.parent("users");
    });

    // socket.on("message", (msg) => {
    //   const update = createP(msg);
    //   update.parent("users");
    // });
  });
}

function handleSynthChange() {
  osc.setType(synthType.value());
}
function handleMute() {
  if (this.checked()) {
    osc.amp(0.0);
  } else {
    osc.amp(0.4);
  }
}

function mouseDragged() {
  // Draw
  stroke(colorPicker.value());
  strokeWeight(strokeWidth);
  line(mouseX, mouseY, pmouseX, pmouseY);

  let freq = constrain(map(mouseX, 0, width, 100, 500), 100, 500);

  // Send the mouse coordinates
  sendmouse(mouseX, mouseY, pmouseX, pmouseY);
  sendAudio(freq);
}

//Need to emit tone data as well

// Sending data to the socket
function sendmouse(x, y, pX, pY) {
  const data = {
    x: x,
    y: y,
    px: pX,
    py: pY,
    color: colorPicker.value(),
    strokeWidth: strokeWidth,
  };
  socket.emit("mouse", data);
}
function sendAudio(freq) {
  const data = {
    freq,
  };
  socket.emit("audio", data);
}

socket.emit("join", { username, room });
