
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'TaskLess',header:'Effectively manage your own tasks'});
};