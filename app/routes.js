module.exports = function(app, passport, db) {

// normal routes ===============================================================

    // show the home page (will also have our login links)
    app.get('/', function(req, res) {
        res.render('index.ejs');
    });

    // PROFILE SECTION =========================
    app.get('/camera', isLoggedIn, function(req, res) {
        db.collection('designs').find().toArray((err, result) => {
          if (err) return console.log(err)
          res.render('camera.ejs', {
            user : req.user,
            messages: result
          })
        })
    });
    // CHOSEN DESIGN INFO AND TRY BUTTON ===============
    app.get('/artist', isLoggedIn, function(req, res){
      db.collection('designs').find().toArray((err, result) => {
        if (err) return console.log(err)
      })
    })

    // LOGOUT ==============================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

// upload designs routes ===============================================================


    app.post('/upload', (req, res) => {
      db.collection('designs').save({source: req.body.source, userid: req.session.passport.user}, (err, result) => {
        if (err) return console.log(err)
        console.log('saved to database')
        res.redirect('/artist')
      })
    })

    app.delete('/upload', (req, res) => {
      db.collection('designs').findOneAndDelete({source: req.body.source}, (err, result) => {
        if (err) return res.send(500, err)
        res.send('Message deleted!')
      })
    })

// =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================

    // locally --------------------------------
        // LOGIN ===============================
        // show the login form
        // app.get('/artist', function(req, res) {
        //     res.render('login.ejs');
        // });


        //MUST CHANGE ROUTE NAMES ----------------++++++++++########!!!!!!!!
        app.get('/artist', isLoggedIn, function(req, res) {
            db.collection('designs').find({userid: req.session.passport.user}).toArray((err, result) => {
              if (err) return console.log(err)
              res.render('artist.ejs', {
                user : req.user,
                img: result
              })
            })
        });


        // process the login form
        app.post('/artist', passport.authenticate('local-login', {
            successRedirect : '/artist', // redirect to the secure profile section
            failureRedirect : '/', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

        // SIGNUP =================================
        // show the signup form

        //signup is displaying designs for the public
        //MUST CHANGE ROUTE NAMES ----------------++++++++++########!!!!!!!!!
        app.get('/signup', isLoggedIn, function(req, res) {
            db.collection('designs').find().toArray((err, result) => {
              if (err) return console.log(err)
              res.render('signup.ejs', {
                user : req.user,
                img: result
              })
            })
        });
        app.get('/signup', function(req, res) {
            res.render('signup.ejs', { message: req.flash('signupMessage') });
        });

        // process the signup form
        app.post('/signup', passport.authenticate('local-signup', {
            successRedirect : '/artist', // redirect to the secure profile section
            failureRedirect : '/signup', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

// =============================================================================
// UNLINK ACCOUNTS =============================================================
// =============================================================================
// used to unlink accounts. for social accounts, just remove the token
// for local account, remove email and password
// user account will stay active in case they want to reconnect in the future

    // local -----------------------------------
    app.get('/unlink/local', isLoggedIn, function(req, res) {
        var user            = req.user;
        user.local.email    = undefined;
        user.local.password = undefined;
        user.save(function(err) {
            res.redirect('/artist');
        });
    });

};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}
