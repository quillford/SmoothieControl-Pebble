// SmoothieControl - an app for jogging the axes on your Smoothieware powered machine

var UI = require("ui");
var Vector2 = require("vector2");
var Settings = require("settings");
var ajax = require("ajax");

var ipAddress = Settings.option("ipAddress");
var currentAxis;
var joggingIncrements = ["0.1", "1", "10", "100"];
var joggingIncrement = joggingIncrements[1];

Settings.config(
  { url: "http://quillford.github.io/pebble-configs/SmoothieControl-config.html"},
  function(e){
    console.log("opening settings");
  },
  function(e){
    console.log("closed settings");
    console.log(Settings.option("ipAddress"));
    ipAddress = Settings.option("ipAddress");
  }
);

var main_menu = new UI.Menu({
  sections: [{
    items: [{
      title: "SmoothieControl",
      subtitle: "Choose a function"
    }, {
      title: "X axis",
      subtitle: "Jog the X axis"
    }, {
      title: "Y axis",
      subtitle: "Jog the Y axis"
    }, {
      title: "Z axis",
      subtitle: "Jog the Z axis"
    }, {
      title: "Home all",
      subtitle: "Home all axes (XYZ)"
    }, {
      title: "Shortcuts",
      subtitle: "List of quick commands"
    }, {
      title: "Help",
      subtitle: "List of commands"
    }]
  }]
});

main_menu.on("select", function(e) {
  switch(e.itemIndex){
    case 0:
      break;
    case 1:
      // X axis
      switchAxis("X");
      break;
    case 2:
      // Y axis
      switchAxis("Y");
      break;
    case 3:
      // Z axis
      switchAxis("Z");
      break;
    case 4:
      // Home all axes
      send_command("G28");
      break;
    case 5:
      // Shortcuts menu
      shortcuts_menu.show();
      break;
    case 6:
      // Help
      help_window.show();
      break;
    default:
      jogging_window.show();
      break;
  }
});

var shortcuts_menu = new UI.Menu({
  sections: [{
    items: [{
      title: "Shortcuts",
      icon: "images/menu_icon.png",
      subtitle: "Choose a function"
    }, {
      title: "Motors off",
      subtitle: "Turn the motors off"
    }, {
      title: "Fans on",
      subtitle: "Turn the fans on"
    }, {
      title: "Fans off",
      subtitle: "Turn the fans off"
    }]
  }]
});

shortcuts_menu.on("select", function(e) {
  switch(e.itemIndex){
    case 0:
      break;
    case 1:
      // Motors off
      send_command("M18");
      break;
    case 2:
      // Fans on
      send_command("M106");
      break;
    case 3:
      send_command("M107");
      break;
  }
});

var jogging_window = new UI.Window();

var jogging_axis = new UI.Text({
  position: new Vector2(0, 0),
  size: new Vector2(144, 168),
  font: "gothic-28"
});
var jogging_increment = new UI.Text({
  position: new Vector2(42, 68),
  size: new Vector2(144, 168),
  font: "gothic-18-bold",
  text: "Increment: " + joggingIncrement
});
var jogging_negative = new UI.Text({
  position: new Vector2(115, 115),
  size: new Vector2(144, 168),
  font: "gothic-18-bold"
});
var jogging_positive = new UI.Text({
  position: new Vector2(115, 5),
  size: new Vector2(144, 168),
  font: "gothic-18-bold"
});

var help_window = new UI.Card({
  title: "Help",
  subtitle: "Things to note",
  body: "Home by choosing an axis then long-clicking the select button"
});

jogging_window.add(jogging_axis);
jogging_window.add(jogging_increment);
jogging_window.add(jogging_negative);
jogging_window.add(jogging_positive);

main_menu.show();

function switchAxis(axis){
  currentAxis = axis;
  jogging_axis.text(axis + " Axis");
  jogging_window.show();
  jogging_negative.text("-"+axis);
  jogging_positive.text("+"+axis);
}

jogging_window.on("click", "select", function(){
  joggingIncrement++;
  if(joggingIncrement >= joggingIncrements.length){
    joggingIncrement = 0;
  }
  jogging_increment.text("Increment: " + joggingIncrements[joggingIncrement].toString());
});

jogging_window.on("click", "up", function(){
  var feedrate = 3000;
  if(currentAxis == "Z"){
    feedrate = 200; 
  }
  send_command("G91 G0 " + currentAxis + joggingIncrements[joggingIncrement] + " F" + feedrate+ " G90");
});

jogging_window.on("click", "down", function(){
  var feedrate = 3000;
  if(currentAxis == "Z"){
    feedrate = 200; 
  }
  send_command("G91 G0 " + currentAxis + -(joggingIncrements[joggingIncrement]) + " F" + feedrate+ " G90");
});

jogging_window.on("longClick", "select", function(){
  send_command("G28 " + currentAxis + "0");
});

function send_command(command){
  console.log("sending " + command);
  ajax(
  {
    url: "http://" + ipAddress + "/command",
    method: "post",
    type: "text",
    async: true,
    data: command + "\n"
  },
  function(data, status, request) {
    console.log("Successfully sent command");
  },
  function(error, status, request) {
    console.log("Request to the printer failed");
    console.log("Status: " + status);
    console.log("Error: " + error);
  }
);
}