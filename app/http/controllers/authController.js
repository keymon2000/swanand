const User=require('../../models/user');
const bcrypt = require ('bcrypt');
const passport = require('passport');
function authController(){
    return {
        login(req,res){
            return res.render('auth/login');
        },postLogin(req,res,next){
            const {email, password } = req.body

            if(!email || !password) {
                req.flash('error', 'All fields are required')
                return res.redirect('/login')
            }
            //Validate request
            if(!email || !password) {
                req.flash('error', 'All fields are required')
                return res.redirect('/login')
            }
            passport.authenticate('local', (err, user, info) => {
                if(err) {
                    req.flash('error', info.message )                       //Respected message from which category we get the error in passport file
                    return next(err)
                }
                if(!user) {
                    req.flash('error', info.message)
                    return res.redirect('/login')
                }
                req.logIn(user, (err) => {
                    if(err) {
                        req.flash('error', info.message)
                        return next(err)
                    }
                    return res.redirect('/')
                })
            })(req, res, next)
        },
        register(req,res){
            return res.render('auth/register');
        },
        async postRegister(req,res){
            const {name,email,password}=req.body;
            //Validate request
            if(!name || !email || !password) {
                req.flash('error', 'All fields are required')
                req.flash('name', name)                                 // If any field not found we pass the values from those fields we recieve to keep the data that user has filled except the password
                req.flash('email', email)
                return res.redirect('/register')
            }

            //Check if email exist

            // let userExist = null;
            let userExist = await User.findOne({
                email,
                account_type: 'email'
            });
            if (userExist) {
                req.flash('error', 'Email already taken')
                req.flash('name', name)
                req.flash('email', email)
                return res.redirect('/register')
            }   

            //Hash password
            const hashedPassword = await bcrypt.hash(password, 10)

            //Create a user
            const user = new User({
                name,
                email,
                password: hashedPassword
            })

            user.save().then((user) => {
                //Login
                return res.redirect('/')
            }).catch(err => {
                req.flash('error', 'Something went wrong')
                return res.redirect('/register')
            })
        },
        logout(req, res) {
            req.logout(function(err) {
                if (err) { return next(err); }
                res.redirect('/');
            });
        }
    }
}
module.exports=authController;