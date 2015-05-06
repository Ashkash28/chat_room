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

var server = app.listen(8000,function(){
	console.log('listening to port 8000');
});


var users={};
var msgs=[];
var chatrooms={};
var chatroom_list=[];

var io = require('socket.io').listen(server);
io.sockets.on('connection',function(socket){
	// Listen to new user data, store user's info and emit chatroom_list data
	socket.on('user_name',function(data){
		users[socket.id]=data;
		socket.emit('chatroom_list',chatroom_list)
	});
	// Listen to chatroom data, store chatroom data,sends user chatroom data
	socket.on('select_chatroom',function(data){
		if (data.new) { //if new chatroom, create new JSON item and add to list of chatrooms
			chatrooms[data.chatroom]={
				'chatroom_id':data.chatroom,
				'msgs':[]
			};
			chatroom_list.push(data.chatroom);
		}
		socket.emit('board_data',chatrooms[data.chatroom]);
		// console.log(chatrooms);
	});
	// Listen to new message by any user, save it to message list, then broadcast latest
	socket.on('msg_data',function(data){
		var msg={
			'chatroom_id':data.chatroom_id,
			'name':users[socket.id],
			'msg':data.msg
		};
		chatrooms[data.chatroom_id].msgs.push(msg);
		io.emit("new_msg",msg);
		// console.log(msg);
		// console.log(chatrooms);
	});
	//Listen to user exiting room and give user updated list of rooms (to previous created socket listener)
	socket.on('exit_room',function(data){
		socket.emit('chatroom_list',chatroom_list);
	});
});
