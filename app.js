const express = require("express"),
    path = require("path"),
    logger = require("morgan"),
    cookieParser = require("cookie-parser"),
    bodyParser = require("body-parser"),
    session = require("express-session"),
    passport = require("passport"),
    db = require("./db"),
    getMindMap = require("./routes/getMindMap"),
    setMindMap = require("./routes/setMindMap"),
    mind = require("./routes/mind"),
    getAvailableMaps = require("./routes/getAvailableMaps"),
    createMindMap = require("./routes/createMindMap"),
    innerUnivers = require("./routes/innerUnivers"),
    passportLocal = require("passport-local");

const LocalStrategy = passportLocal.Strategy,
    app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, "public", "favicon.ico")));
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    "extended": true,
    "limit": "1000kb"
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(passport.initialize());
app.use(passport.session());
app.use(session({
    "secret": "mindUniverse",
    "resave": false,
    "saveUninitialized": false
}));

app.use("/getMindMap", getMindMap);
app.use("/setMindMap", setMindMap);
app.use("/getAvailableMaps", getAvailableMaps);
app.use("/createMindMap", createMindMap);
app.use("/", innerUnivers);
app.use("/mind", mind);


app.post("/login",
  passport.authenticate("local", {
      "successRedirect": "/mind",
      "failureRedirect": "/"
  })
);

passport.serializeUser((user, cb) => {
    cb(null, user.id);
});

passport.deserializeUser((id, cb) => {
    db.users.findById(id, (err, user) => {
        if (err) {
            return cb(err);
        }

        return cb(null, user);
    });

});

passport.use(new LocalStrategy(
  (username, password, done) => {
      db.users.findByUsername(username, (err, user) => {
          if (err) {
              return done(err);
          }
          if (!user) {
              return done(null, false, {"message": "Incorrect username."});
          }
          if (!user.password === password) {
              return done(null, false, {"message": "Incorrect password."});
          }

          return done(null, user);
      });
  }
));

// catch 404 and forward to error handler
app.use((req, res, next) => {
    const err = new Error("Not Found");

    err.status = 404;
    next(err);

});

// error handlers

// development error handler
// will print stacktrace
if (app.get("env") === "development") {
    app.use((err, req, res) => {
        console.log(err);
        res.status(err.status || 500);
        res.render("error", {
            "message": err.message,
            "error": err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use((err, req, res) => {
    res.status(err.status || 500);
    res.render("error", {
        "error": {},
        "message": err.message
    });
});


module.exports = app;
