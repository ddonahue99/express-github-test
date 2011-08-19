require.paths.unshift('.')

/* Load Github keys */
try {
  var keys = require('keys')
} catch(e) {
  console.log("Could not load keys.js");
}

/**
 * Module dependencies.
 */

var express = require('express'),
    auth = require('connect-auth');

var app = module.exports = express.createServer();

// Configuration
app.configure(function(){
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'butts' }));
  app.use(
    auth([
    auth.Github({
      appId : keys.id
    , appSecret: keys.secret 
    , callback: keys.callbackAddress
    , scope: "user,repo,gist"})
    ])
  );
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes
app.get('/', function(req, res){
  res.send('Hello, Internet. Would you like to <a href="/github">log in with github</a>?');
});

app.get('/github', protect, function(req, res){
  res.send('<p>Hello! Here is some JSON that proves you are logged in:<p>' + 
           '<p>' + JSON.stringify( req.getAuthDetails() ) + '</p>');
});

var port = process.env.PORT || 4000;
app.listen(port);

function protect(req, res, next) {
  if( req.isAuthenticated() ) next();
  else {
    req.authenticate(["github"], function(error, authenticated) {
      if( error ) next(new Error("Problem authenticating"));
      else {
        if( authenticated === true)next();
        else if( authenticated === false ) next(new Error("Access Denied!"));
        else {
          // Abort processing, browser interaction was required (and has happened/is happening)
        }
      }
    })
  }
}

console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
