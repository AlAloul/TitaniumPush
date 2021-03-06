var osname = Ti.Platform.osname;
var ortc;
if(osname === 'android'){
	ortc = require('co.realtime.ortc');
	ortc.setNotificationTitle("Universal Push");
}else{
	ortc = require('co.realtime.ortc.apns'); //for push notifications on iOS, otherwise can use require('co.realtime.ortc');
}

// this sets the background color of the master UIView (when there are no windows/tab groups on it)
Titanium.UI.setBackgroundColor('#000');

ortc.addEventListener('onException', function(e) {	
	addRowToEvents('Exception: '+e.info);
});

ortc.addEventListener('onConnected', function(e) {
	addRowToEvents('Connected');
	btConnect.title = 'Disconnect';
});

ortc.addEventListener('onDisconnected', function(e) {
	addRowToEvents('Disconnected');
	btConnect.title ='Connect';
});

ortc.addEventListener('onSubscribed', function(e) { 
	addRowToEvents('Subscribed to channel: '+e.channel);
});

ortc.addEventListener('onUnsubscribed', function(e) { 
	addRowToEvents('Unsubscribed from: '+e.channel);
});

ortc.addEventListener('onMessage', function(e) {
	addRowToEvents('(Channel: '+e.channel+') Message received: '+e.message);
	Titanium.API.log('(onMessage Channel: '+e.channel+') Message received: '+e.message);
});

ortc.addEventListener('onNotification', function(e) {
	addRowToEvents('(onNotification Channel: '+e.channel+') Message received: '+e.message+' Payload received: '+e.payload);
	Titanium.API.log(JSON.stringify(e));
	Titanium.API.log('(onNotification Channel: '+e.channel+') Message received: '+e.message);
});


ortc.addEventListener('onPresence', function(e) {
	if (e.error != ""){
		addRowToEvents('(Channel: '+e.channel+') Presence error: ' + e.error);
	} else {
		addRowToEvents('(Channel: '+e.channel+') Presence: '+e.result);
	}
});

var win = Titanium.UI.createWindow({  
    title:'ORTC example',
    backgroundColor:'#fff'
});

var tableview = Ti.UI.createTableView({
  data: [],
  height: '47%',
  top: '53%'
});
win.add(tableview);

var btConnect = Titanium.UI.createButton({
	title:'Connect',
	top: '23%',
	left: '3%',
	width: '30%',
	height: '8%'
});
btConnect.addEventListener('click', function(e) {
	if(btConnect.title == 'Connect') {
		ortc.connectionMetadata = 'Titanium example';
		if(osname === 'android'){
			ortc.setGoogleProjectId('462540995476');
		}
		ortc.clusterUrl = 'http://ortc-developers.realtime.co/server/2.1';
		if(taAuthToken.value != '') {
			ortc.connect(taAppKey.value, taAuthToken.value);
		} else {
			ortc.connect(taAppKey.value);
		}
	} else {
		ortc.disconnect();
	}
});
win.add(btConnect);

var taAppKey= Titanium.UI.createTextArea({
	value: 'EhJ020',
	backgroundColor:'#ffffdd',
	color: '#000000',
	borderRadius: 5,
	borderWidth: 1,
	borderColor: '#bbb',
	top: '13%',
	left:'3%',
	width: '46%',
	height:'8%',
	font: {fontSize:14}
});
win.add(taAppKey);

var taChannel= Titanium.UI.createTextArea({
	value: 'yellow',
	backgroundColor:'#ffffdd',
	color: '#000000',
	borderRadius: 5,
	borderWidth: 1,
	borderColor: '#bbb',
	top: '13%',
	left:'51%',
	width: '46%',
	height:'8%',
	font: {fontSize:14}
});
taChannel._hint = taChannel.value;
taChannel.addEventListener('focus', function(e){
	if(e.source.value == e.source._hint){
		e.source.value = "";
	}
});
taChannel.addEventListener('blur', function(e){
	if(e.source.value == ""){
		e.source.value = e.source.value._hint;
	}
});
win.add(taChannel);


var taAuthToken= Titanium.UI.createTextArea({
	value: 'AuthenticationToken',
	backgroundColor:'#ffffdd',
	color: '#000000',
	borderRadius: 5,
	borderWidth: 1,
	borderColor: '#bbb',
	top: '3%',
	left:'3%',
	width: '94%',
	height:'8%',
	font: {fontSize:14}
});
taAuthToken._hint = taAuthToken.value;
taAuthToken.addEventListener('focus', function(e){
	if(e.source.value == e.source._hint){
		e.source.value = "";
	}
});
taAuthToken.addEventListener('blur', function(e){
	if(e.source.value == ""){
		e.source.value = e.source.value._hint;
	}
});
win.add(taAuthToken);

var btSubscribe = Titanium.UI.createButton({
	title:'Subscribe',
	top: '23%',
	left: '35%',
	width: '30%',
	height: '8%'
});
btSubscribe.addEventListener('click', function(e) {
	ortc.subscribeWithNotifications(taChannel.value, true);
});
win.add(btSubscribe);

var btUnsubscribe = Titanium.UI.createButton({
	title:'Unsubscribe',
	top: '23%',
	left: '67%',
	width: '30%',
	height: '8%'
});
btUnsubscribe.addEventListener('click', function(e) {
	ortc.unsubscribe(taChannel.value);
});
win.add(btUnsubscribe);

var btPresence = Titanium.UI.createButton({
	title:'Presence',
	top: '43%',
	left: '3%',
	width: '94%',
	height: '8%'
});
btPresence.addEventListener('click', function(e) {
	ortc.presence(taChannel.value);
});
win.add(btPresence);

var btSend = Titanium.UI.createButton({
	title:'Send',
	top: '33%',
	left: '3%',
	width: '30%',
	height: '8%'
});
btSend.addEventListener('click', function(e) {
	ortc.send(taChannel.value, taMessage.value);
});
win.add(btSend);

var taMessage= Titanium.UI.createTextArea({
	value: 'Message from Titanium',
	backgroundColor:'#ffffdd',
	color: '#000000',
	borderRadius: 5,
	borderWidth: 1,
	borderColor: '#bbb',
	top: '33%',
	left:'35%',
	width: '62%',
	height:'8%',
	font: {fontSize:14}
});
win.add(taMessage);

win.open();

function addRowToEvents(text){
	var row = Ti.UI.createTableViewRow();
	var now = new Date();
	var h = now.getHours();
	var m = now.getMinutes();
	var s = now.getSeconds();
	if(h<10) h = '0' + h;
	if(m<10) m = '0' + m;
	if(s<10) s = '0' + s;
	var time = h+':'+m+':'+s;
	var lTime = Ti.UI.createLabel({
		text: time,
		font: {fontSize:11},
		top: 3,
		left: 5,
		color: '#aaa'
	});
	var lText = Ti.UI.createLabel({
		text: text,
		font: {fontSize:13},
		top: 18,
		left:5
	});
	row.add(lTime);
	row.add(lText);
	tableview.appendRow(row);
}

if(osname === 'android'){
	// check for notifications when main activity starts
	var currActivity = Titanium.Android.currentActivity;

	var channel = currActivity.getIntent().getStringExtra('channel');
	Titanium.API.info('channel: ' + channel);
	var message = currActivity.getIntent().getStringExtra('message');
	Titanium.API.info('message: ' + message);
	var payload = currActivity.getIntent().getStringExtra('payload');
	Titanium.API.info('payload: ' + payload);

	if(channel && message){
		addRowToEvents('(onNotification Channel: '+channel+') Message received: '+message+' Payload received: '+payload);
	}
}

