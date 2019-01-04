"use strict";

const express = require("express");
const socketIO = require("socket.io");
const path = require("path");

const SOCKET_PORT = process.env.PORT || 3000;
const INDEX = path.join(__dirname, "index.html");

const server = express()
  .get("/", (req, res) => res.sendFile(INDEX))
  .listen(SOCKET_PORT, () => console.log(`Listening on ${SOCKET_PORT}`));

//create socket server
const io = socketIO(server);


let allUsers = [];


// io.emit //==> to everyone including sender
// socket.broadcast.emit //==> to everyone except sender
// io.to(targetRoom).emit("roommsg", text); //==> send to room
// io.to(targetSocketID).emit("private", text); //==> send to person (same as room)

// //joining a room
// socket.join(roomName, () => {
//   socket
//     .to(roomName)
//     .emit("saySomething", socket.id + " has joined this room");
// });

// //leaving a room
// socket.leave(roomName, () => {
//   io.to(roomName).emit("saySomething", socket.id + " has left the room");
// });


io.on("connection", function (socket) {
  console.log("###################-- " + socket.id, " connected");


  io.to(socket.id).emit("yourID",
    {
      ok: true,
      id: socket.id
    }
  );

  // socket.broadcast.emit("newUserJoined",
  // {
  //   ok: true,
  //   id: socket.id
  // }
  // );


  socket.on("sendProfile", function (msg, callback) {
    msg.id = socket.id;
    socket.profile = {};
    socket.profile.name = msg.name;
    socket.profile.userId = msg.userId;

    allUsers[msg.userId] = JSON.parse(JSON.stringify(msg));


    console.log("###################--- sendProfile --- ",msg);

    // if (allUsers[msg.SendTo]) {
    //   io.to(allUsers[msg.SendTo].id).emit("yourID",
    //     {
    //       ok: true,
    //       id: socket.id
    //     }
    //   );
    // }
    // else {
    //   //user not connected
    // }
  });


  socket.on("sendToByUserID", function (msg, callback) {

    if (socket.profile)
      msg.username = socket.profile.name;
    else msg.username = "no Profile";

    if (allUsers[msg.SendTo]) {
      io.to(allUsers[msg.SendTo].id).emit("sendTo",
        msg
      );
    }
    else {
      //user not connected
    }

    console.log("###################--- sendToByUserID --- ",msg);
  });

  socket.on("sendToBySocketID", function (msg, callback) {
    io.to(msg.SendTo).emit("sendTo",
      msg
    );
  });


  ////////////////////////////////////////////////////////////////////////////////////////
  socket.on("disconnect", function () {
    let name = "";
    if (socket.profile) {
      name = socket.profile.name;
    }
    console.log("###################-- " + socket.id, name, " disconnected ");

    //-- remove name from used names list
    var index = allUsers.indexOf(name);
    if (index > -1) {
      allUsers.splice(index, 1);
    }

    // let newMsg = {
    //   ts: Date.now(),
    //   from: "system",
    //   msg: name + " has left this room",
    //   color: "red"
    // };

    // io.to(room).emit("roomChat", newMsg);

    // //-- delete player socket
    // delete connectedPlayerSockets[socket.id];

    // //get all active rooms and remove any meta data of empty room
    // var room_list = [];
    // for (var oneRoom in io.sockets.adapter.rooms) {
    //   room_list.push(oneRoom);
    // }
    // let room_keys = Object.keys(roomsMetaData);

    // for (let index = 0; index < room_keys.length; index++) {
    //   if (room_list.indexOf(room_keys[index]) < 0) {
    //     delete roomsMetaData[room_keys[index]];
    //   }
    // }
    // console.log(
    //   "###################-- All rooms (after disconnect) " + room_list
    // );
    // console.log(
    //   "###################-- All rooms METADATA (after disconnect) " +
    //   roomsMetaData
    // );
  });

  ////////////////////////////////////////////////////////////////////////////////////////
});
