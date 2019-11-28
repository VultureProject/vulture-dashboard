const express = require('express');
const reload = require('express-reload')
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const swig = require('swig');
const session = require('express-session')
const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const Account = require('./models/account');
const app_settings = require('./helpers/settings');
const helper = require('./helpers/utils');
const cartoHelper = require('./helpers/carto');
const logsHelper = require('./helpers/logs');
const statsHelper = require('./helpers/stats');
const mapsHelper = require('./helpers/maps');
const alertsHelper = require('./helpers/alerts');
const sharedsession = require("express-socket.io-session");
const pbkdf2 = require('pbkdf2-sha256');

const swig_ = new swig.Swig();

const app = express();
const server = require('http').Server(app);
const io = require('socket.io');

var redis_config = {};
if (app_settings.redis_use_socket){
    redis_config.path = app_settings.redis_socket;
} else {
    redis_config.host = app_settings.redis_host;
    redis_config.port = app_settings.redis_port;
}

const redis = require('redis');
const redisClient = redis.createClient(redis_config);
const redisStore = require('connect-redis')(session);
const uuid = require('uuid/v4');

app.use(logger(app_settings.log_level));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.set('views', __dirname + "/views/");

app.use('/static', express.static(path.join(__dirname, 'public')));

app.engine('html', swig_.renderFile);
app.set('view engine', 'html');

const io_vue = io(server);
const io_carto = io_vue.of(app_settings.websocket_path + "/carto");
const io_stats = io_vue.of(app_settings.websocket_path + "/stats");
const io_map = io_vue.of(app_settings.websocket_path + "/map");
const io_logs = io_vue.of(app_settings.websocket_path + "/logs");
const io_alerts = io_vue.of(app_settings.websocket_path + "/alerts");

const accountRouter = require('./routes/account')();
const cartoRouter = require('./routes/carto')();
const statsRouter = require('./routes/stats')();
const mapRouter = require('./routes/map')();
const logsRouter = require('./routes/logs')();
const alertsRouter = require('./routes/alerts')();
const configRouter = require('./routes/config')();


const sessionMiddleware = session({
    genid: (req) => {
        return uuid() // use UUIDs for session IDs
    },
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true,
    cookie: {secure: false},
    store: new redisStore({
        client: redisClient,
        ttl: 86400
    }),
})

app.use(sessionMiddleware)

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(
    function(username, password, done) {
        Account.findOne({
            username: username
        }, function(err, user){
            if (err)
                return done(err);

            if (!user)
                return done(null, false);

            var parts = user.password.split('$');
            var iterations = parts[1];
            var salt = parts[2];

            var hash = pbkdf2(password, new Buffer(salt), iterations, 32).toString('base64');
            if (hash !== parts[3])
                return done(null, false)

            return done(null, user)
        })
    }
));

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});

io_carto.use(sharedsession(sessionMiddleware, {autoSave:true})); 
io_stats.use(sharedsession(sessionMiddleware, {autoSave:true})); 
io_map.use(sharedsession(sessionMiddleware, {autoSave:true})); 
io_logs.use(sharedsession(sessionMiddleware, {autoSave:true})); 
io_alerts.use(sharedsession(sessionMiddleware, {autoSave:true})); 

io_stats.on('connect', function(socket){
    console.log('Connected to stats')
    helper.config(socket);
    statsHelper.stats_socket(socket);
})

io_carto.on('connect', function(socket){
    console.log('Connected to carto')
    helper.config(socket);
    cartoHelper.carto_socket(socket);
})

io_map.on('connect', function(socket){
    console.log('Connected to map')
    helper.config(socket);
    mapsHelper.map_socket(socket);
})

io_logs.on('connect', function(socket){
    console.log('Connected to logs')
    helper.config(socket);
    logsHelper.logs_socket(socket);
})

io_alerts.on('connect', function(socket){
    console.log('Connected to alerts');
    helper.config(socket);
    alertsHelper.alerts_socket(socket);
})

app.use(function (req, res, next) {
    res.locals.path = req.path;

    if (req.session.group_by)
        res.locals.group_by = req.session.group_by;

    if (req.session.filter){
        res.locals.filter = {
            key_filter: req.session.filter.key_filter,
            value_filter: req.session.filter.value_filter.join(',')
        }
    }

    if (req.session.config_carto){
        res.locals.config_carto = {
            number_of_nodes: req.session.config_carto.number_of_nodes
        }
    } else {
        res.locals.config_carto = {
            number_of_nodes: app_settings.number_of_nodes
        }
    }

    res.locals.settings = {
        number_of_nodes: app_settings.number_of_nodes
    }

    if (req.session.dark)
        res.locals.dark = req.session.dark;
    else
        res.locals.dark = "false";

    next();
})


function is_authenticated(req, res, next){
    if (req.path === "/auth/login" || req.path === "/auth/logout")
        return next();

    if (req.user)
        return next();

    return res.redirect('/dashboard/auth/login');
}

app.use(is_authenticated);

app.use('/', statsRouter);
app.use('/auth', accountRouter);
app.use('/carto', cartoRouter);
app.use('/map', mapRouter);
app.use('/logs', logsRouter);
app.use('/alerts', alertsRouter);
app.use('/config', configRouter);

app.post(function (err, req, res, next) {
    console.log(err.message)
    throw(err)
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

mongoose.connect(app_settings.mongo_connection.url, app_settings.mongo_connection.options);
module.exports = {app: app, server: server};
