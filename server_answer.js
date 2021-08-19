var fs = require('fs'),
	rimraf = require('rimraf'),
	Config = require('./node_modules/class.Config.js'),

	$M = require('./node_modules/misc.fn.js'),
	$C = new Config('config_answer.json',fs), // store configuration from JSON
	
	buAns = new (require('./node_modules/class.Backup.js'))(fs,$C.BACKUP_ANSWER_FOLDER)
;

var cameraData=[], // contain picture captured from MS Surface
	cameraQuizNo=0, // Quiz No. shown on camera client
	monitorQuizNo=0 // Quiz No. shown on monitor
;

// Miscellaneous function
var connLog = new (require('./node_modules/class.ConnectionLog.js'))($M,$C,
	function(ip,tag,connEvent){
		var emitAlert=new Date().toLocaleString();
		console.log('* '+emitAlert+"\t"+ip+"\t"+connEvent+"\t"+tag+".");
		
		if(connEvent!=connLog.EVENT_UPDATE){
			emitAlert='<h4>'+ip+' <b>'+connEvent+'</b> '+tag+'.<br/><small>'+emitAlert+'</small></h4>';
			adminCPSIO.emit($C.EVENT_CONN_ALERT,emitAlert);
		}
	},
	function(){
		cameraSIO.emit($C.EVENT_CONN_PING,connLog.now());
		monitorSIO.emit($C.EVENT_CONN_PING,connLog.now());
		adminCPSIO.emit($C.EVENT_CONN_PING,connLog.now());
		conSIO.emit($C.EVENT_CONN_PING,connLog.now());
		return [Date.now()];
	});

function log(msg){ // print msg to CMD and emit to admin_cp page
	var log = (new Date().toJSON())+": "+msg.toString();
	if(adminCPSIO) adminCPSIO.emit($C.EVENT_LOG,log);
	console.log(log);
}
function backup(){
	buAns.backup(cameraData,function(err){
		if(err) log("Back up answer fail!: "+err.toString());
	});
}

// Server Part
var port = Number(process.argv[2]) || 80,
	
	express = require('express'),
	app = express(),
	
	multer = require('multer')({dest:$C.UPLOAD_FOLDER}),
	bodyParser = require('body-parser')
;
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.get($C.CLIENT_URL_CONFIG,function(req,res){
	res.type('.js');
	res.end($C.toClientConfig('$C'));
});

app.post($C.CLIENT_URL_INIT_MONITOR,function(req,res){
	if($M.isset(req.body.monitorQuizNo)){ // if queryString monitorQuizNo is set
		// Convert cameraData that quiz no = req.post.monitorQuizNo to JSON, if it exists
		// if not exists return blank array [];
		res.json(
			$M.isset(cameraData[req.body.monitorQuizNo])?cameraData[req.body.monitorQuizNo]:[]
		);
	}else{
		// Convert cameraData that quiz no = monitorQuizNo (global setting) to JSON, if it exists
		// if not exists return blank array [];
		res.json(
			$M.isset(cameraData[monitorQuizNo])?cameraData[monitorQuizNo]:[]
		);
	}
});
app.get($C.CLIENT_URL_INIT_MONITOR,function(req,res){
	res.end(
		'var cameraData='+$M.JSONtoStr(
			($M.isset(cameraData[monitorQuizNo])?cameraData[monitorQuizNo]:[]), false
		)+', monitorQuizNo='+monitorQuizNo+';'
	);
});
app.post('/control_panel.html',multer.single('backupFile'),function(req,res){
	var path='';
	switch(req.body.act){
		case 'loadBU':
			path=$C.BACKUP_ANSWER_FOLDER+'/'+req.body.backupFile;break;
		case 'loadExtBU':
			path=req.body.backupFile;break;
		case 'uploadBU':
			path=req.file.path;break;
		default:
			res.location('/admin.html');return;
	}
	
	try{
		cameraData=buAns.recovery(path,true);
		temp={result:true,msg:"Recovery backup file successfully"};
	}catch(e){
		temp={result:false,msg:"Error: cannot recovery backup file '"+req.body.file+"' because "+e.toString()};
	}
	if(req.body.act=='uploadBU'){
		rimraf(req.file.path,function(e){
			if(e) console.log
		});
	}
	res.json(temp);
	console.log(temp.msg);
	backup();
});
app.post($C.CLIENT_CONN,function(req,res){res.json(connLog.htmlPost(req,res));});

app.use(express.static($C.WWW_FOLDER));
app.use(express.static($C.SHARED_WWW_FOLDER));

var server = app.listen(port, function() {
	console.log("* HTTP server listening on at http://%s:%s ", server.address().address, port);
});


// Socket.IO
var
	sio = require('socket.io')(server),
	conSIO=connLog.getSIO(sio)
;

// Socket.IO of surface B (camera)
var cameraSIO = sio.of($C.CLIENT_CAMERA);
cameraSIO.on('connection', function(socket) {
	var ip = $M.getIP(socket);
	if (!ip) return;
	connLog.onConnect(ip,$C.CLIENT_CAMERA);
	
	socket.on($C.EVENT_CONN_PING,function(){
		connLog.onUpdate(ip,$C.CLIENT_CAMERA);
	});
	
	socket.on($C.EVENT_RECEIVE_IMG, function(data){ // When Picture (Answer) is sent.
		//log("* Client " + ip + " sent picture size: "+data.picture.length+"\nTime = "+data.time);
		data['ip']=ip; // Add ip to data before send to Monitor.html
		
		if(!$M.isset(cameraData[cameraQuizNo])) // If this is new camera, create new array key
			cameraData[cameraQuizNo]={};
		
		cameraData[cameraQuizNo][ip]=data; // store all data in variable
		monitorSIO.emit($C.EVENT_RECEIVE_IMG,cameraQuizNo,data); // Emit to monitor
		backup();
	});
	
	socket.on('disconnect', function() {
		connLog.onDisconnect(ip,$C.CLIENT_CAMERA);
	});
});

// Socket.IO for monitor
var monitorSIO = sio.of($C.CLIENT_MONITOR);
monitorSIO.on('connection', function(socket) {
	var ip = $M.getIP(socket);
	if (!ip) return;
	connLog.onConnect(ip,$C.CLIENT_MONITOR);
	
	socket.on($C.EVENT_CONN_PING,function(){
		connLog.onUpdate(ip,$C.CLIENT_MONITOR);
	});
	
	socket.on('disconnect', function() {
		connLog.onDisconnect(ip,$C.CLIENT_MONITOR);
	});
});

// SIO for administrator control panel of this system
var adminCPSIO = sio.of($C.CLIENT_ADMIN_CONTROL_PANEL);
adminCPSIO.on('connection', function(socket){
	var ip = $M.getIP(socket);
	if (!ip) return;
	connLog.onConnect(ip,$C.CLIENT_ADMIN_CONTROL_PANEL);
	
	socket.on($C.EVENT_CONN_PING,function(){
		connLog.onUpdate(ip,$C.CLIENT_ADMIN_CONTROL_PANEL);
	});
	
	socket.on($C.EVENT_SET_CAMERA_QUIZ, function(quizNo){ // When admin sets quiz No to receive images form cameras
		cameraQuizNo=quizNo;
		log("Admin "+ip+" sets current quiz No. to be "+quizNo);
	});
	
	socket.on($C.EVENT_SET_MONITOR_QUIZ, function(force, quizNo){ // When admin sets quiz No to show images on monitor
		monitorQuizNo=quizNo;
		log("Admin "+ip+" sets monitors' quiz No. to be "+quizNo+(force?' forcefully':''));
		// Emit force (isForce Self-Directed monitor to show), quiz No and cameraData (if not exists, send blank array)
		monitorSIO.emit($C.EVENT_SET_MONITOR_QUIZ, force, monitorQuizNo,$M.isset(cameraData[cameraQuizNo])?cameraData[monitorQuizNo]:[]);
	});
	
	socket.on($C.EVENT_FORCE_CAPT,function(){ // When click capture button on admin control panel. emit to monitor
		cameraSIO.emit($C.EVENT_FORCE_CAPT);
	});
	
	socket.on($C.EVENT_SET_BACKUP,function(backUp){
		buAns.isAutoBackup=backUp;
		log("Automatic backup system is turned o"+(backUp?"n":"ff")+".");
	});
	socket.on($C.EVENT_CLEAR_BACKUP,function(){
		buAns.clear(function(e){
			if(e) console.log(e);
		});
	});
	
	socket.on('disconnect', function() {
		connLog.onDisconnect(ip,$C.CLIENT_ADMIN_CONTROL_PANEL);
	});
});

// Console Interactions
console.log(
	"Commands to show variable's value or do something:\n" +
	"  cameraData or c\n" +
	"  cameraQuizNo or cq\n" +
	"  monitorQuizNo or mq\n" +
	"  quit or q"
);
process.stdin.on('readable', function() {
	var cmd = process.stdin.read(); // read Command From Command Prompt to do some action
	if (!cmd) return;
	cmd = cmd.toString('utf8');
	if (cmd.indexOf('!') !== -1) return;

	cmd = cmd.split(/\r?\n/g);
	for (i = 0;cmd.length > i;i++) {
		var T = cmd[i].split(' ');
		switch (T[0]) {
			case 'c':
			case 'cameraData':
				console.log($M.JSONtoStr(cameraData,true));
				break;
			case 'cq':
			case 'cameraQuizNo':
				console.log(cameraQuizNo);
				break;
			case 'mq':
			case 'monitorQuizNo':
				console.log(monitorQuizNo);
				break;
			case 'cl':
			case 'connectionLog':
				console.log(connLog.toConsole());
				break;
			case 'cc':
			case 'clearConnectionLog':
				console.log(connLog.clear());
				break;
			case 'q':
			case 'quit':
				server.close();
				console.log("Turn off server and Delete temporary uploaded files");
				rimraf('./'+$C.UPLOAD_FOLDER,function(){
					console.log("-------- Good bye --------");
					process.exit();
				});
				break;
		}
	}
});