/* Setup Node Modules */
var express = require('express');
var app = express();

/* Setup Server Variables and connection to files  */
app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/website'));

app.set('views', __dirname + '/website');
app.set('view engine', 'ejs');

/* Setup Main Routing */
app.get('/', function(request, response) {
	response.render('index');
});

/* Start Server */
app.listen(app.get('port'), function() {
	console.log('Node app is running on port', app.get('port'));
});
