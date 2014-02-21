
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


app.use(express.cookieParser());


app.use(express.session({secret:'41b34628014a19cae61fd34015d1e23a'}));

app.use(express.csrf());

app.use(function(req,res,next){
	res.locals._csrf=req.csrfToken();
	next();
});

//https://github.com/emberfeather/less.js-middleware
app.use(require('less-middleware')({ src: path.join(__dirname, 'public'), compress:true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(app.router);

app.use(function(err,req,res,next){
	console.error(err.stack);
	res.send(500,'Server error');
});
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

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

app.all('*',function(req,res){
	res.send(404);
});
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
