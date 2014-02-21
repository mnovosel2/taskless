exports.active=function(req,res){
		req.tasks.find({active:true},function(err,docs){
					if(err)
						return next(new Error('Error fetching active tasks'));
					res.render('tasks',{
						header:'Effectively manage your own tasks',
						title: 'TaskLess',
						active_tasks:docs||[]
					})	
		});
		
}
exports.add=function(req,res,next){
	var description=req.body.desc,
		activeTask=req.body.active;

 	if(!description || !activeTask)
  		return next(new Error('No data found'));

	new req.tasks({
		desc:description,
		active:activeTask
	}).save(function(err,docs){
		if(err){
			res.json(err);
		}else{
			res.redirect('/tasks');
		}
	});
}
exports.completeAll=function(req,res,next){
	if(!req.body.complete_all)
		return next();
	req.tasks.update({active:true},{$set:{active:false}},{multi:true},function(err,numAffected){
		if(err)
			return next(new Error('Update failed'));
		console.info('Completed '+numAffected+' tasks');
		res.redirect('/tasks');
	});
}
exports.completed=function(req,res,next){
	req.tasks.find({active:false},function(err,docs){
		if(err)
			return next(new Error('Error fetching completed tasks'));
		res.render('completed_tasks',{
			header:'Effectively manage your own tasks',
			title: 'TaskLess',
			tasks: docs || []
		});
	});
}
exports.setTaskCompleted=function(req,res,next){
	if(!req.body.setcompleted)
			return next(new Error('Param is not set'));
	req.tasks.findByIdAndUpdate(req.taskById._id,{$set:{active:false}},{new:true},function(err,docs){
			if(err)
				return next(new Error('Setting task completed failed'));
			res.redirect('/tasks');
	});
}
exports.del=function(req,res,next){
	req.tasks.findByIdAndRemove(req.taskById._id,function(err,docs){
		if(err)
			return next(new Error('Unable to delete'));
		res.send(200,'Task deleted');
	});
}