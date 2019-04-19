module.exports = function(app, passport, db, multer, ObjectId, Design, mkdirp, fs) {
// normal routes ===============================================================

    // show the home page (will also have our login links)
    app.get('/', function(req, res) {
        res.render('index.ejs');
    });



    // Camera SECTION =========================
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
    // app.get('/artist', isLoggedIn, function(req, res){
    //   db.collection('designs').find().toArray((err, result) => {
    //     if (err) return console.log(err)
    //   })
    // })

    // LOGOUT ==============================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

// upload designs routes ===============================================================

// multer ==================================================
var uploadPath = 'public/uploads'
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadPath)
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now()+'.png')
  }
})

var upload = multer({ storage: storage })
  mkdirp.sync(uploadPath)

    app.post('/upload/photo', isLoggedIn, upload.single('picture'), (req, res) => {
      let userId = req.user._id

      let newDesign = new Design()

      let img = fs.readFileSync(req.file.path)
      let encodeImg = img.toString('base64')
      let imgToUpload = {
        contentType: req.file.mimetype, image: new Buffer(encodeImg, 'base64')
      };

      newDesign.image = new Buffer(encodeImg, 'base64')
      newDesign.userId = userId;
      // newDesign.save(function(err) {
      //   console.log('saving photo')
      //   if(err) {
      //     return console.log(err)
      //   }
      //   console.log('Sucess! We uploaded it.')
      // });
      db.collection('designs').save(newDesign, (err, result) => {
        if(err) {
          return console.log(err)
        }
        console.log('Sucess! We uploaded it.')
        res.redirect('/artist')
      })
    })

    // app.get('/photos', isLoggedIn, (err, result) => {
    //
    // })

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
            getDesigns(req.user._id).then( (result) => {
              let designs = result.map( function(design) {
                design.image = design.image.toString('base64');
                return design;
              })
              return designs;
            }).then( (designs) => {
              res.render('artist.ejs', {
                user : req.user,
                designs: designs
              })
            })
        });

        app.get('/design/:designId', isLoggedIn, function(req, res) {
          console.log(req.params.designId)
          var designId = req.params.designId
          console.log(typeof designId);
          designId.toString;
          getDesign(designId).then( (result) => {
            console.log(result);
            result.image = result.image.toString('base64')
          }).then( (design) => {
            res.render('design.ejs', {
              user : req.user,
              design: design
            })
          })

        })
        function getDesigns(userId) {
          return new Promise((resolve, reject) => {
            db.collection('designs').find({userId: userId}).toArray((err, result) => {
              if (err) {
                reject(err)
              } else {
                resolve(result);
              }
            })
          })
        }

        function getDesign(designId) {
          designId.trim()
          console.log(designId);
          console.log("HEY HEY HEY");
          // let gooseid = require('mongoose').Types.ObjectId(String(designId));
          let hxid = new ObjectId.createFromHexString(designId)

          console.log(typeof hxid);
          return new Promise((resolve, reject) => {
            Design.findById(hxid, (err, result) => {
              if (err) {
                reject(err)
              } else {
                resolve(result);
              }
            })
            // db.collection('designs').findOne({ "_id": hxid }, (err, result) => {
            //   if (err) {
            //     reject(err)
            //   } else {
            //     resolve(result);
            //   }
            // })
          })
        }


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
