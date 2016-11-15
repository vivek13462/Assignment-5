var main = function () {
    'use strict';


  var socket= io.connect();
  
  var $userFormArea=$("#userFormArea");
  var $userForm=$("#userForm");
  var $users=$('#users');
  var $username=$('#username');
  var $mainArea=$("#mainArea");
  var $uploadForm=$('#uploadForm');
  var $upload=$('#upload');
  var $userList=$('#userList'); 
  
  socket.on('get users', function(data){
    var html='';
    for (var i = 0; i < data.length; i++) {
   // html+='<li  class="bg-info" >'+ data[i] +'</li>';
html+='<p class="btn-info btn-sm"> <span class="glyphicon glyphicon-user"></span>' + data[i]+ '</p>';
  }
  $userList.html(html);
  }); 


  $userForm.submit(function(e){
    
      e.preventDefault();
      socket.emit('new user', $username.val(),function(data){
        if(data){
          $userFormArea.hide();
          $mainArea.show();

        }
      });
      $username.val('');
  });


}

$(document).ready(main);

