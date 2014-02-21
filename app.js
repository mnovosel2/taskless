
var express = require('express'),
 	routes = require('./routes'),
 	taskRoute=require('./routes/tasks'),
 	http = require('http'),
 	path = require('path'),
 	mongoose=require('mongoose'),
 	app = express();

//Database
mongoose.connect('mongodb://localhost/todoApp');
var taskSchema=new mongoose.Schema({
	desc: String,
	active: Boolean,
});
var tasks=mongoose.model('tasks',taskSchema);

//omogucuje koristenje req.tasks u svakom routeu (vidjeti tasks.js)...vazno je postaviti prije app.router
//next prosljeduje request na sljedeci middleware nakon obrade u ovom
app.use(function(req,res,next){
	req.tasks=tasks;
	next();
});


app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');




app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());

//middleware za obradu cookieja...ako proslijedimo funkciji string
//onda nastaju signed cookies. Cookieje enkodiramo da vidimo da nisu
//mijenjani na klijentovoj strani
//kreacija signed cookieja: res.cookie('name', 'value', {signed: true})
//mora biti prije sessiona 
app.use(express.cookieParser());

//omogucuje session...secret je kljuc koji pomaze enkripciji session podataka
//postavljamo sessione kroz request kao i sve ostano
//npr. req.session.podaci=podaci
app.use(express.session({secret:'41b34628014a19cae61fd34015d1e23a'}));

//csrf zbog Cross-Site Request Forgery mora dolaziti poslije cookie i session middlewarea
//http://www.senchalabs.org/connect/csrf.html
//http://www.gnucitizen.org/blog/csrf-demystified/
app.use(express.csrf());
//postavimo _csrf vidljiv svim templatima...ako postavimo var u locals
//onda je vidljiva u templatima kroz requestove
//umjesto req.session._csrf koji je deprecated koristiti req.csrfToken()
app.use(function(req,res,next){
	res.locals._csrf=req.csrfToken();
	next();
});

//https://github.com/emberfeather/less.js-middleware
app.use(require('less-middleware')({ src: path.join(__dirname, 'public'), compress:true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(app.router);
//error handler ide obicno zadnji
app.use(function(err,req,res,next){
	console.error(err.stack);
	res.send(500,'Server error');
});
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}
//app.param() koristimo kad zelimo napraviti odredene promjene
//na requestovima na odredeni zahtjev, npr. /:task_id
//te se promjene dogode prije routinga i vidljive su na svim routeovima dalje
app.param('task_id',function(req,res,next,task_id){
	req.tasks.findById(task_id,function(err,docs){
		if(err)
			return next(new Error('Task id not valid'));
		req.taskById=docs;
		return next();
	});
});

app.get('/',routes.index);
app.get('/tasks',taskRoute.active);
app.post('/tasks',taskRoute.completeAll);
app.post('/tasks',taskRoute.add);
app.post('/tasks/:task_id',taskRoute.setTaskCompleted);
app.del('/tasks/:task_id',taskRoute.del);
app.get('/tasks/completed',taskRoute.completed);

//za sve requestove za koje nemamo route postavljen
//ide na kraj tako da ako nademo route prije, do ovoga nece ni doci
app.all('*',function(req,res){
	res.send(404);
});
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
