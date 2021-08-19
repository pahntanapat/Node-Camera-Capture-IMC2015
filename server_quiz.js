var fs = require('fs'),
	mammoth = require('mammoth'),
	mime = require('mime'),
	rimraf = require('rimraf'),
	Config = require('./node_modules/class.Config.js'),
	Backup = require('./node_modules/class.Backup.js'),
	forEach = require('async-foreach').forEach,
	
	$M = require('./node_modules/misc.fn.js'),
	$C = new Config('config_quiz.json',fs),
	timer = require('./node_modules/class.Timer.js'),
	
	buScore=new Backup(fs,$C.BACKUP_SCORE_FOLDER),
	buRead=new Backup(fs,$C.BACKUP_READ_STATUS_FOLDER)
;

// Utilities function
var connLog = new (require('./node_modules/class.ConnectionLog.js'))($M,$C,
	function(ip,tag,connEvent){
		var emitAlert=new Date().toLocaleString();
		console.log('* '+emitAlert+"\t"+ip+"\t"+connEvent+"\t"+tag+".");
		
		if(connEvent!=connLog.EVENT_UPDATE){
			emitAlert='<h4>'+ip+' <b>'+connEvent+'</b> '+tag+'.<br/><small>'+emitAlert+'</small></h4>';
			slideSIO.emit($C.EVENT_CONN_ALERT,emitAlert);
			scoreSIO.emit($C.EVENT_CONN_ALERT,emitAlert);
		}
	},
	function(){
		tabletSIO.emit($C.EVENT_CONN_PING,connLog.now());
		monitorSIO.emit($C.EVENT_CONN_PING,connLog.now());
		slideSIO.emit($C.EVENT_CONN_PING,connLog.now());
		scoreSIO.emit($C.EVENT_CONN_PING,connLog.now());
		scoreboardSIO.emit($C.EVENT_CONN_PING,connLog.now());
		flipSIO.emit($C.EVENT_CONN_PING,connLog.now());
		conSIO.emit($C.EVENT_CONN_PING,connLog.now());
		return [Date.now()];
	});

function readIMGtoInline(path,callback){
	if($M.isFunction(callback))
		fs.readFile(path,function(err,data){
			callback('<img src="data:'+mime.lookup(path)+';base64,'+data.toString('base64')+'" />',err);
		});
	else
		return '<img src="data:'+mime.lookup(path)+';base64,'+fs.readFileSync(path).toString('base64')+'" />'
}

function emitQuiz(html){
	tabletSIO.emit($C.EVENT_CHANGE_SLIDE, html);
	monitorSIO.emit($C.EVENT_CHANGE_SLIDE, html);
}
function emitError(errMsg){
	slideSIO.emit($C.EVENT_ERROR_MSG,errMsg);
	scoreSIO.emit($C.EVENT_ERROR_MSG,errMsg);
	console.log(errMsg);
}
function setReadStatus(){
	slideSIO.emit($C.EVENT_UPDATE_READ_STATUS, readStatus);
	buRead.backup({
		'readStatus':readStatus,
		'overlayIMG':overlayIMG
	},function(err){
		if(err) console.log("Back up read status fail!: "+err.toString());
	});
}
function updateScore(){
	scoreboardSIO.emit($C.EVENT_UPDATE_SCORE, numQuiz, score);
	tabletSIO.emit($C.EVENT_UPDATE_SCORE, numQuiz, score);
	scoreSIO.emit($C.EVENT_UPDATE_SCORE, numQuiz, score, item);
	flipSIO.emit($C.EVENT_UPDATE_SCORE, score);
	
	buScore.backup({'numQuiz':numQuiz,'score':score},function(err){
		if(err) console.log("Back up score fail!: "+err.toString());
	});
}
function updateTimer(time){
	tabletSIO.emit($C.EVENT_UPDATE_TIMER,time);
	monitorSIO.emit($C.EVENT_UPDATE_TIMER,time);
	slideSIO.emit($C.EVENT_UPDATE_TIMER,time);
}

function moreInfo(html){
	scoreSIO.emit($C.EVENT_UPDATE_MORE_INFO,html);
	slideSIO.emit($C.EVENT_UPDATE_MORE_INFO,html);
}
// Read Quiz from file with specified extension
function loadQuiz(file, overlay,callback){
	// callback(html,err)
	try{
		switch(true){
			case fs.existsSync(file+$C.DOCX):
				mammoth.convertToHtml({path:file+$C.DOCX}).then(function(result){
					result.err='';
					for(i in result.messages)
						result.err+=result.messages[i].type.toUpperCase()+': '+result.messages[i].message+"\n";

					callback(result.value,result.err)
				}).fail(function(e){
					callback('',e.toString());
				}).done();
				break;
			case fs.existsSync(file+$C.PNG):
				readIMGtoInline(file+$C.PNG,callback);
				break;
			case fs.existsSync(file+$C.JPG):
				readIMGtoInline(file+$C.JPG,callback);
				break;
			case fs.existsSync(file+$C.JPEG):
				readIMGtoInline(file+$C.JPEG,callback);
				break;
			case fs.existsSync(file+$C.GIF):
				readIMGtoInline(file+$C.GIF,callback);
				break;
			case fs.existsSync(file+$C.JSON):
				fs.readFile(file+$C.JSON,function(err,data){
					data=JSON.parse(data);
					
					if($M.isset(data.overlay))
						overlayIMG[overlay]=data.overlay;
					slideSIO.emit($C.EVENT_PRESET_TIMER, data.time);
					
					callback('<div class=\"text-center\"><h2>'+data.title+'</h2><h4>'
						+($M.isset(data.score)?'Score: '+data.score+'<br>':'')
						+'Time: '+data.time+'</h4></div>'
					);
				});
				break;
			default:
				callback('','ERROR: File does not exists. "'+file+'['+$C.DOCX+'|'+$C.JPG+'|'+$C.JPEG+'|'+$C.GIF+'|'+$C.PNG+'|'+$C.JSON+']"')
		}
	}catch(e){
		callback('',e.toString());
	}
}
// load Overlay IMG
function loadOverlay(overlayId, callback){ // callback()
	if($M.isset(overlayIMG[overlayId]) && currentSlide==$C.SLIDE_QUIZ){
		var overlay=['',''];
		forEach(overlayIMG[overlayId],function(v,k){
			try{
				overlay[0]+=readIMGtoInline(v,false);
			}catch(e){
				overlay[1]+=k+". "+e.toString()+"\n";
			}			
		},function(){
			tabletSIO.emit($C.EVENT_SET_OVERLAY,overlay[0]);
			monitorSIO.emit($C.EVENT_SET_OVERLAY,overlay[0]);
			if(overlay[1].length>0)
				emitError(overlay[1])
			return $M.isFunction(callback)?callback(overlay[0],overlay[1]):overlay[0];
		});
		return;
	}
	tabletSIO.emit($C.EVENT_SET_OVERLAY,'');
	monitorSIO.emit($C.EVENT_SET_OVERLAY,'');
	return $M.isFunction(callback)?callback('',''):'';
}

// Important variables

var readStatus={},
	overlayIMG={},
	currentSlide='',
	
	numQuiz=0, // number of quiz to render the scoreboard
	item=[], // list of items
	score=[{teamName:"Full score",item:{}, score:[]}],
	
	timer = new timer(1000,updateTimer)
;

// Server Part
var express = require('express'),
	app = express(),
	
	multer = require('multer')({dest:$C.UPLOAD_FOLDER}),
	bodyParser = require('body-parser'),
	
	port = Number(process.argv[2]) || 80
;

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.get($C.CLIENT_URL_CONFIG,function(req,res){
	res.type('.js');
	res.end($C.toClientConfig('$C'));
});
app.post('/slide.html',multer.single('backupFile'),function(req,res){ // response list of quiz set or quiz
	var path='';
	switch(req.body.act){
		case 'loadBU':
			path=$C.BACKUP_READ_STATUS_FOLDER+'/'+req.body.backupFile;break;
		case 'loadExtBU':
			path=req.body.backupFile;break;
		case 'uploadBU':
			path=req.file.path;break;
		case 'overlay':
			overlayIMG[req.body.qOvlId]=$M.isset(req.body.overlay)?req.body.overlay:[];
			loadOverlay(req.body.qOvlId,'');
			setReadStatus();
			res.json({
				'msg':"\nload overlay successfully\n"
			});
			return;
		default:
			var quizDir = $C.QUIZ_FOLDER;
			if($M.isset(req.body.quiz_set)) // if there is quiz_set parameter --> get list of quiz in quiz_set
				quizDir+='/'+req.body.quiz_set;
			
			if($M.isset(req.body.quiz_no)){ // if there is quiz_no parameter --> get list of overlay file in both global & local folder
				quizDir+='/'+req.body.quiz_no+'/'+$C.OVERLAY_FOLDER;
				res.json({
					'globalOverlay':fs.existsSync($C.OVERLAY_FOLDER)?fs.readdirSync('./'+$C.OVERLAY_FOLDER).filter(function(path){
							return fs.lstatSync($C.OVERLAY_FOLDER+'/'+path).isFile();
						}):[],
					'quizOverlay':fs.existsSync(quizDir)?fs.readdirSync(quizDir).filter(function(path){
							return fs.lstatSync(quizDir+'/'+path).isFile();
						}):[],
					'qOvlId':req.body.quiz_set+'/'+req.body.quiz_no,
					'overlayIMG':$M.isset(overlayIMG[req.body.quiz_set+'/'+req.body.quiz_no])?overlayIMG[req.body.quiz_set+'/'+req.body.quiz_no]:[]
				});
			}else{
				res.json({
					'quizSet':fs.readdirSync(quizDir).filter(function(path){
							return fs.lstatSync(quizDir+'/'+path).isDirectory();
						}),
					'readStatus':readStatus
				});
			}
			return;
	}
	try{
		temp=buRead.recovery(path,true);
		readStatus=temp.readStatus;
		overlayIMG=temp.overlayIMG;
		
		temp={result:true,msg:"Recovery backup file successfully"};
	}catch(e){
		temp={result:false,msg:"Error: cannot recovery backup file '"+req.body.backupFile+"' because "+e.toString()};
		console.log(e);
	}
	res.json(temp);
	console.log(temp.msg);
	setReadStatus();
	if(req.body.act=='uploadBU'){
		rimraf(req.file.path,function(e){
			if(e) console.log
		});
	}
});
app.post('/score.html',multer.single('backupFile'),function(req,res){
	switch(req.body.act){
		case 'setScore': // Set scores
			numQuiz=req.body.numQuiz;
			var tmp=[];
			
			for(var i in req.body.teamName){
				if(!$M.isset(req.body.item)) req.body.item=[];
				if(!$M.isset(req.body.score)) req.body.score=[];
				
				tmp[req.body.index[i]]={
					teamName:req.body.teamName[i],
					item:$M.isset(req.body.item[i])?req.body.item[i]:{},
					score:$M.isset(req.body.score[i])?req.body.score[i]:[]
				};
			}
			score=tmp;
			res.json({result:true,msg:"Set scores successfully"});
			break;
		case 'clear': // Clear scoreboard
			score=[{teamName:"Full score",item:{}, score:[]}];
			numQuiz=0;
			res.json({result:true,msg:"Clear scoreboard successfully"});
			break;
		case 'loadBU':
			req.body.backupFile=$C.BACKUP_SCORE_FOLDER+'/'+req.body.backupFile;
		case 'loadExtBU':
			try{
				temp=buScore.recovery(req.body.backupFile,true);
				score=temp.score;
				numQuiz=temp.numQuiz;
				
				temp={result:true,msg:"Recovery backup file successfully"};
			}catch(e){
				temp={result:false,msg:"Error: cannot recovery backup file '"+req.body.backupFile+"' because "+e.toString()};
			}
			res.json(temp);
			console.log(temp.msg);
			updateScore();
			break;
		case 'uploadBU':
			try{
				temp=buScore.recovery(req.file.path,true);
				score=temp.score;
				numQuiz=temp.numQuiz;
				
				temp={result:true,msg:"Recovery backup file successfully"};
			}catch(e){
				temp={result:false,msg:"Error: cannot recovery backup file '"+req.body.file+"' because "+e.toString()};
			}
			
			res.json(temp);
			console.log(temp.msg);
			rimraf(req.file.path,function(e){
				if(e) console.log
			});
			updateScore();
			break;
		default:
			res.location('score.html');
			return;
	}
	updateScore();
});
app.post($C.CLIENT_CONN,function(req,res){res.json(connLog.htmlPost(req,res));});

app.use(express.static($C.WWW_FOLDER));
app.use(express.static($C.SHARED_WWW_FOLDER));

var server = app.listen(port, function() {
	console.log("* HTTP server listening on at http://%s:%s ", server.address().address, port);
});

// Socket.IO Part
var sio = require('socket.io')(server),
	tabletSIO = sio.of($C.CLIENT_TABLET),
	monitorSIO = sio.of($C.CLIENT_MONITOR),
	slideSIO=sio.of($C.CLIENT_SLIDE_CONTROL_PANEL),
	scoreSIO=sio.of($C.CLIENT_SCORE_CONTROL_PANEL),
	scoreboardSIO=sio.of($C.CLIENT_SCOREBOARD),
	flipSIO=sio.of($C.CLIENT_FLIP),
	
	conSIO=connLog.getSIO(sio)
;

tabletSIO.on('connection', function(socket) { // Teams' tablet
	var ip = $M.getIP(socket);
	if (!ip) return;
	connLog.onConnect(ip,$C.CLIENT_TABLET);
	
	socket.on($C.EVENT_CONN_PING,function(){
		connLog.onUpdate(ip,$C.CLIENT_TABLET);
	});

	socket.on($C.EVENT_SET_TEAM_NAME, function(no, name) {
		connLog.onUpdate(ip,$C.CLIENT_TABLET);
		
		if($M.isset(score[no])){
			score[no].teamName=name;
		}else{
			if(!$M.isset(score[0])){
				score[0]={teamName:"Full score",item:{}, score:[]};
			}
			score[no]={
				teamName:name,
				item:score[0].item,
				score:[]
			};
		}
		updateScore();
	});
	socket.on('disconnect', function() {
		connLog.onDisconnect(ip,$C.CLIENT_TABLET);
	});
});
monitorSIO.on('connection', function(socket) { // Monitor shown on projector
	var ip = $M.getIP(socket);
	if (!ip) return
	connLog.onConnect(ip,$C.CLIENT_MONITOR);

	socket.on($C.EVENT_CONN_PING,function(){
		connLog.onUpdate(ip,$C.CLIENT_MONITOR);
	});
	
	socket.on('disconnect', function() {
		connLog.onDisconnect(ip,$C.CLIENT_MONITOR);
	});
});
slideSIO.on('connection', function(socket) { // Slide controller
	var ip = $M.getIP(socket);
	if (!ip) return
	connLog.onConnect(ip,$C.CLIENT_SLIDE_CONTROL_PANEL);
	
	
	socket.on($C.EVENT_CONN_PING,function(){
		connLog.onUpdate(ip,$C.CLIENT_SLIDE_CONTROL_PANEL);
	});
	
	socket.on($C.EVENT_CHANGE_SLIDE, function(act, quizSet, slide){
		connLog.onUpdate(ip,$C.CLIENT_SLIDE_CONTROL_PANEL);
		currentSlide=act;
		switch(act){
			case $C.SLIDE_BLANK:
				emitQuiz('');break;
			case $C.SLIDE_HTML:
			case $C.SLIDE_MENU:
				emitQuiz(quizSet);break;
			case $C.SLIDE_LOGO:
				emitQuiz($C.SLIDE_LOGO);break;
			case $C.SLIDE_UNREAD:
				var i = $M.isset(readStatus[quizSet])?readStatus[quizSet].indexOf(slide):-1;
				if(i>=0){
					readStatus[quizSet].splice(i,1);
					setReadStatus();
				}
				break;
			case $C.SLIDE_QUIZ:
			case $C.SLIDE_ANSWER:
			case $C.SLIDE_COVER:
				emitQuiz($C.SLIDE_LOADING);
				loadOverlay(quizSet+'/'+slide, function(){
					loadQuiz($C.QUIZ_FOLDER+'/'+quizSet+'/'+slide+'/'+act, quizSet+'/'+slide, function(html,err){
						emitQuiz(html);
						if(err) emitError(err);
						if(act==$C.SLIDE_COVER) moreInfo(html);
					});
				});
				if(act==$C.SLIDE_COVER) break;
			case $C.SLIDE_READ:
				if(!$M.isset(readStatus[quizSet]))
					readStatus[quizSet]=[];
				if(readStatus[quizSet].indexOf(slide)==-1)
					readStatus[quizSet].push(slide);
				setReadStatus();
				break;
			default:
		}
	});
	
	socket.on($C.EVENT_UPDATE_TIMER,function(act,time){
		connLog.onUpdate(ip,$C.CLIENT_SLIDE_CONTROL_PANEL);
		switch(act){
			case $C.TIMER_START:
				time*=1000;
				timer.time=time;
				updateTimer(time);
			case $C.TIMER_RESUME:
				timer.start();
				break;
			case $C.TIMER_PAUSE:
				timer.pause();
				break;
			case $C.TIMER_CLEAR:
				timer.stop();
				break;
		}
	});
	
	socket.on($C.EVENT_SET_BACKUP, function(isAuto){
		connLog.onUpdate(ip,$C.CLIENT_SLIDE_CONTROL_PANEL);
		buRead.isAutoBackup=isAuto;
	});
	socket.on($C.EVENT_CLEAR_BACKUP,function(){
		connLog.onUpdate(ip,$C.CLIENT_SLIDE_CONTROL_PANEL);
		buRead.clear(function(e){
			if(e) console.log(e);
		});
	});

	socket.on('disconnect', function() {
		connLog.onDisconnect(ip,$C.CLIENT_SLIDE_CONTROL_PANEL);
	});
});
scoreSIO.on('connection', function(socket) { // Scoreboard editor
	var ip = $M.getIP(socket);
	if (!ip) return;
	connLog.onConnect(ip,$C.CLIENT_SCORE_CONTROL_PANEL);
	
	fs.readdir($C.WWW_FOLDER+'/'+$C.ITEM_FOLDER,function(e,dir){
		if(e){
			console.log("ERROR: reading item-containing folder; "+e.toString());
		}else{
			item=dir.filter(function(path){
				return fs.lstatSync($C.WWW_FOLDER+'/'+$C.ITEM_FOLDER+'/'+path).isFile();
			});
		}
		updateScore();
	});
	
	
	socket.on($C.EVENT_CONN_PING,function(){
		connLog.onUpdate(ip,$C.CLIENT_SCORE_CONTROL_PANEL);
	});
	socket.on($C.EVENT_SET_BACKUP, function(isAuto){
		connLog.onUpdate(ip,$C.CLIENT_SCORE_CONTROL_PANEL);
		buScore.isAutoBackup=isAuto;
	});
	socket.on($C.EVENT_CLEAR_BACKUP,function(){
		connLog.onUpdate(ip,$C.CLIENT_SCORE_CONTROL_PANEL);
		buScore.clear(function(e){
			if(e) console.log(e);
		});
	});
	socket.on('disconnect', function() {
		connLog.onDisconnect(ip,$C.CLIENT_SCORE_CONTROL_PANEL);
	});
});
scoreboardSIO.on('connection', function(socket) { // Scoreboard shown on projector
	var ip = $M.getIP(socket);
	if (!ip) return;
	connLog.onConnect(ip,$C.CLIENT_SCOREBOARD);
	
	updateScore();

	socket.on($C.EVENT_CONN_PING,function(){
		connLog.onUpdate(ip,$C.CLIENT_SLIDEBOARD);
	});
	socket.on('disconnect', function() {
		connLog.onDisconnect(ip,$C.CLIENT_SCOREBOARD);
	});
});
flipSIO.on('connection', function(socket) { // Scoreboard shown on projector
	var ip = $M.getIP(socket);
	if (!ip) return;
	connLog.onConnect(ip,$C.CLIENT_FLIP);
	
	updateScore();

	socket.on($C.EVENT_CONN_PING,function(){
		connLog.onUpdate(ip,$C.CLIENT_FLIP);
	});
	socket.on('disconnect', function() {
		connLog.onDisconnect(ip,$C.CLIENT_FLIP);
	});
});
// Console Interactions
console.log(
	"Commands to show variable's value or do something:\n" +
	"  readStatus or r\n" +
	"  item or i\n" +
	"  numQuiz or n\n"+
	"  score or s\n" +
	"  overlayIMG or o\n"+
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
			case 'r':
			case 'readStatus':
				console.log($M.JSONtoStr(readStatus,true));
				break;
			case 'o':
			case 'overlayIMG':
				console.log($M.JSONtoStr(overlayIMG,true));
				break;
			case 's':
			case 'score':
				console.log($M.JSONtoStr(score,true));
				break;
			case 'n':
			case 'numQuiz':
				console.log(numQuiz);
				break;
			case 'i':
			case 'item':
				console.log(item);
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