var presenterCollection = {};

var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var fs= require('fs');

app.set('view engine', 'pug')

app.get('/broadcast', function (req, res) {
    res.sendFile(__dirname + '/page/presenter.html');
});


app.get('/listen/:broadcasterId', function (req, res) {

    fs.readFile(__dirname + '/page/listener.html','utf8', (err, data) => {
        if (err) throw err;

        let withBroadcaster = data.replace('BROADCASTER_ID',req.params.broadcasterId);
        res.send(withBroadcaster);
    });
   // res.sendFile(__dirname + '/page/listener.html?broadcaster_id='+req.param('broadcasterId'));
});


app.get('/js/:js_file',function(req,res){
    res.sendFile(__dirname + '/page/js/'+req.params.js_file);
});


io.on('connection', function (socket) {

    /* Presenter */
    socket.on('bufferHeader', function (packet) {
        presenterCollection[packet.id] = packet.audioData;

        socket.broadcast.emit(packet.id, packet.audioData);
    });

    // Broadcast the received buffer
    socket.on('stream', function (packet) {
        socket.broadcast.emit(packet.id, packet.audioData);
    });

    // Send buffer header to new user
    socket.on('requestBufferHeader', function (data) {

        console.log("New client to join",data.id);
        console.log("Setup ",data.id+'-init');
        socket.emit(data.id+'-init', presenterCollection[data.id]);
    });


});

server.listen(process.env.PORT || 5000);
