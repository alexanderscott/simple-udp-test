"use strict";

var dgram = require('dgram'),
    packageJson = require('../package.json'),
    commander = require('commander');

commander
  .version(packageJson.version)
  .option('-s, --server', 'Run UDP server')
  .option('-c, --client', 'Run UDP client')
  .option('-p, --port [port]', 'UDP port to listen on [8127]', 8127)
  .option('-h, --host [host]', 'UDP host to send to [localhost]', 'localhost')
  .option('-r, --retry [milliseconds]', 'Retry interval [3000]', 3000)
  .parse(process.argv);


var server = dgram.createSocket('udp4');
var buff = new Buffer("Check 1, 2... This thing on?");

if(commander.server){
    // Resend buffer every 1 second
    setInterval(function(){
        server.send(buff, 0, buff.length, commander.port, commander.host, function(err, res){
            if(err) console.error("[UDP-SERVER] Received error: ", err);
            else console.log("[UDP-SERVER] Received response: ", res);
        });
    }, commander.retry);

} else {
    server.on("listening", function () {
      var address = server.address();
      console.log("[UDP-CLIENT] Listening: " + address.address + ":" + address.port);
    });

    server.on("message", function (msg, rinfo) {
      console.log("[UDP-CLIENT] Received message: " + msg + " from " + rinfo.address + ":" + rinfo.port);
    });

    server.on("error", function (err) {
      console.log("[UDP-CLIENT] Error:\n" + err.stack);
      server.close();
    });

    server.on("close", function () {
      console.log("[UDP-CLIENT] Closing");
      process.exit(0);
    });

    server.bind(commander.port);
}


