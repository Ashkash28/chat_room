
    $(document).ready(function (){
    	var current_user;

    	$('#chatroom-options').hide();
    	$('#container-board').hide();
        var socket = io.connect();

        $('.cancel-btn').click(function(){
        	$('.first').attr('placeholder', 'place your name here').val("");
        });
        // emit user's name
        $('.ok-btn').click(function(){
	        socket.emit('user_name',$("input[name='name']").val());
	    	$('#container-prompt').hide();
	    	current_user = $("input[name='name']").val();
        // console.log(current_user);
        });
        // listen for chatroom list and generate chatroom buttons
        socket.on('chatroom_list',function(data){
        	// console.log('chatroom_list',data);
        	$('#existing-chatrooms').html("");
        	for (i in data){
	        	$('#existing-chatrooms').append("<button class='chatroom-btn btn btn-info' type='button' value='"+data[i]+"'>"+data[i]+"</button>");
        	}
        	$('#chatroom-options').show();

        });
// MIGHT CAUGHT ERROR, CHANGE CLASS BTN
        // emit user's chatroom
        $(document).on('click','.btn',function(){
        	var value=$(this).val();
        	if (value=='Create'){
        		var chatroom_data={
        			'chatroom' : $("input[name='chatroom-name']").val(),
        			'new' : true
        		};
        	}
        	else{
        		chatroom_data={
        			'chatroom' : value,
        			'new' : false
        		};
        	}
        	socket.emit('select_chatroom',chatroom_data);
        	// console.log(chatroom_data);
        });

        // get all latest board_data
        var current_chatroom='';
        socket.on('board_data',function(data){
        	// console.log('board_data:',data);
        	current_chatroom=data.chatroom_id;
        	$('#chatroom-id').html(current_chatroom);
        	$('#chatroom-options').hide();
        	$('#container-board').show();
        	// console.log('messages',data);
        	// display data
        	$('#main-board').html(""); //clear previous data
        	for (i in data.msgs){
        		$('#main-board').append("<div><p class='name'>"+data.msgs[i].name+":</p><p class='msg'>"+data.msgs[i].msg+"</p></div>"
        		);
        	}
        });

        // send new message data
        $('#msg-area input').keypress(function(e){
        	if(e.which == 13){
	        	socket.emit('msg_data',{
	        		'chatroom_id':current_chatroom,
	        		'msg':$('#msg-area input').val()
	        	});
        		$('#msg-area input').val('');
        	}
        });

        // listen to any new message and update browser (only if message belongs to chatroom)
        socket.on('new_msg',function(data){
        	// console.log(data);
        	if (data.chatroom_id==current_chatroom){
        		if(data.name == current_user)
        		{
        			$('#main-board').append("<div><p class='name current'>"+data.name+":</p><p class='msg current'> "+ " " + data.msg+ " " + " </p></div>"); 
        		}
        		else
        		{
        			$('#main-board').append("<div><p class='name'>"+data.name+":</p><p class='msg'>"+data.msg+"</p></div>");
        		} 
        		$("#main-board").animate({ scrollTop: $("#main-board")[0].scrollHeight}, 1000);
       		
        	}
        });

        // emits when user exiting room
        $('#exit-room-btn').click(function(){
        	current_chatroom="";
        	socket.emit('exit_room');
        	$('#container-board').hide();        	
        });

    });

