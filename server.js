var express=require('express');
var path=require('path');
var bodyParser=require('body-parser');
var app=express();

app.use(express.static(path.join(__dirname, "./static")));
app.use(bodyParser.urlencoded());
app.set('views', path.join(__dirname, "./views"));
app.set('view engine','ejs');

app.get('/',function(req,res){
	res.render('index');
});

app.get('/board',function(req,res){
	res.render('board');
});

var server = app.listen(8000,function(){
	console.log('listening to port 8000');
});


var users={};
var msgs=[];

var io = require('socket.io').listen(server);
io.sockets.on('connection',function(socket){
	// Listen to new user data, add info to users, and give new user all existing message
	socket.on('user_name',function(data){
		users[socket.id]=data;
		socket.emit('board_data',msgs);
	});
	// Listen to new message by any user, save it to message list, then broadcast latest
	socket.on('msg_data',function(data){
		var msg={'name':users[socket.id],'msg':data};
		// msg[users[socket.id]]=data;
		msgs.push(msg);
		io.emit("new_msg",msg);
		console.log(msg);
	});
});
