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
  app.get('/artist/:artist', function(req, res) {
    db.collection('users').findOne({"local.email": req.params.artist}, (err, user) => {
      if(!user) return res.redirect('back')
      getUserDesigns(user._id).then( (result) => {
        let designs = result.map( function(design) {
          design.image = design.image.toString('base64');
          return design;
        })
        return designs;
      }).then( (designs) => {
        res.render('artist.ejs', {
          user: user,
          designs: designs
        })
      })
    })
  })

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
    if(!req.file) return res.redirect('back')
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
      res.redirect('/profile')
    })
  })

  // app.get('/photos', isLoggedIn, (err, result) => {
  //
  // })

  app.post('/upload', (req, res) => {
    db.collection('designs').save({source: req.body.source, userid: req.session.passport.user}, (err, result) => {
      if (err) return console.log(err)
      console.log('saved to database')
      res.redirect('/profile')
    })
  })

  app.delete('/deleteDesign', (req, res) => {
    db.collection('designs').findOneAndDelete({_id: ObjectId(req.body._id)}, (err, result) => {
      if (err) return res.send(500, err)
      res.send('Design deleted!')
    })
  })

  // =============================================================================
  // AUTHENTICATE (FIRST LOGIN) ==================================================
  // =============================================================================

  //MUST CHANGE ROUTE NAMES ----------------++++++++++########!!!!!!!!
  app.get('/profile', isLoggedIn, function(req, res) {
    getUserDesigns(req.user._id).then( (result) => {
      let designs = result.map( function(design) {
        design.image = design.image.toString('base64');
        return design;
      })
      return designs;
    }).then( (designs) => {
      res.render('profile.ejs', {
        user : req.user,
        designs: designs
      })
    })
  });

  app.get('/public', function(req, res) {
    db.collection('users').find().toArray((err, users) => {
      getDesigns().then( (result) => {
        let designs = result.map( function(design) {
          design.image = design.image.toString('base64')
          let user = users.find(user => {
            console.log("user: " + user._id.toString(), "design: " + design.userId.toString())
            return user._id.toString() === design.userId.toString()
          })
          if(user){
            design.user = user
          }
          console.log(design.user)
          return design;
        })
        return designs;
      }).then( (designs) => {
        res.render('public.ejs', {
          designs: designs
        })
      })
    })
  });

  app.get('/design/:filename', function(req, res) {
    // console.log(req.params.filename)
    var filename = req.params.filename
    console.log(typeof filename)
    filename.toString
    console.log("OK",getDesign(filename))
    getDesign(filename).then((result) => {
      console.log('img', result.image);
      result.image = result.image.toString('base64')
      return result;
    }).then( (design) => {
      // console.log('WHOA', design);
      res.render('design.ejs', {
        design: design,
        filename: filename
      })
    })
  })

  function getUserDesigns(userId) {
    return new Promise((resolve, reject) => {
      db.collection('designs').find({userId: userId}).toArray((err, result) => {
        if (err) {
          reject(err)
        } else {
          resolve(result);
        }
      })
      return ;
    })
  }

  function getDesigns() {
    return new Promise((resolve, reject) => {
      db.collection('designs').find({}).toArray((err, result) => {
        if (err) {
          reject(err)
        } else {
          resolve(result);
        }
      })
      return ;
    })
  }

  function getDesign(filename) {
    filename.trim()
    console.log(filename);
    console.log("HEY HEY HEY");
    // let gooseid = require('mongoose').Types.ObjectId(String(designId));
    // let hxid = new ObjectId.createFromHexString(filename)

    return new Promise((resolve, reject) => {
      db.collection('designs').findOne({filename: filename}, (err, result) => {
        if (err) {
          reject(err)
        } else {
          resolve(result);
        }
      })
      return ;
    })
  }



  // process the login form
  app.post('/login', passport.authenticate('local-login', {
    successRedirect : '/profile', // redirect to the secure profile section
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
  app.post('/signup', upload.single('profilePhoto'), passport.authenticate('local-signup', {
    successRedirect : '/profile', // redirect to the secure profile section
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
      res.redirect('/profile');
    });
  });

};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated())
  return next();

  res.redirect('/');
}
