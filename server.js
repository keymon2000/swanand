require('dotenv').config()
const express=require('express');
const app=express();
const ejs=require('ejs');
const expressLayout=require('express-ejs-layouts');
const path=require('path');
const PORT=process.env.PORT || 3300;
const mongoose=require('mongoose');
const session = require('express-session')
const flash = require('express-flash')
const MongoDbStore = require('connect-mongo')
const passport = require('passport')
const Emitter = require('events')





//database connection
mongoose.connect(process.env.MONGO_CONNECTION_URL, {
   useNewUrlParser: true, 
   useUnifiedTopology: true
});
const connection = mongoose.connection;
  connection
    .once('open', function () {
      console.log('Database connected');
    })
    .on('error', function (err) {
      console.log(err);
    });
 
 //Evenyt Emitter
const eventEmitter = new Emitter()
app.set('eventEmitter', eventEmitter)               //to access any event on frontend to any of the file in backend   

 //session config
 app.use(session({                                  //to generate cookies. Upon each request from http, server sees if the client already has a cookie, if so then it directly goes to taht id of the cookie stored in its database and if not the generates a uniques cookie fro the first time we make the request
  secret: process.env.COOKIE_SECRET,
  resave: false,
  store: MongoDbStore.create({                    //for the cookie, if storage not given then stores cookies by default in ram memory
    mongoUrl: process.env.MONGO_CONNECTION_URL
  }),
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 } //24hrs
}))


//Passport config
const passportInit = require('./app/config/passport')
passportInit(passport)
app.use(passport.initialize())
app.use(passport.session())





app.use(flash())
//Assets
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
app.use(express.json()) 

//Global middleware
app.use((req, res, next) => {
  res.locals.session = req.session                    
  res.locals.user = req.user              //Here done to get the users data to the web.js page and use them to display in browser
  next()
})


//template engine setup
app.use(expressLayout);
app.set('views',path.join(__dirname,'/resources/views'));
app.set('view engine','ejs');

require('./api/web')(app);

const server = app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`)
})

//Socket
const io = require('socket.io')(server)                 //real time update on placing order and changing the status of order
io.on('connection', (socket) => {
  // Join private room
  socket.on('join', (orderId) => {
      socket.join(orderId)
  })
})

eventEmitter.on('orderUpdated', (data) => {                     //update the status of the order in real time
  io.to(`order_${data.id}`).emit('orderUpdated', data)
})

eventEmitter.on('orderPlaced', (data) => {                      //Update a new order on admin page in real time
  io.to('adminRoom').emit('orderPlaced', data)
})