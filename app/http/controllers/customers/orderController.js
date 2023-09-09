const Order = require('../../../models/order')
const moment = require('moment')
function orderController(){
    return {
        store(req,res){
             //Validate request
             const { phone, address } = req.body
             if(!phone || !address) {
                 req.flash('error', 'All fileds are required')
                 return res.status(422).json({ message: 'All fields are required' });
             }
    
            const order = new Order ({
                customerId: req.user._id,
                items: req.session.cart.items,
                phone,
                address
            })
            order.save().then((result) => {
                req.flash('success', 'Order placed successfully');
                delete req.session.cart;
                return res.redirect('/customers/orders');
            }).catch(err => {
                console.log(err);
                return res.status(500).json({message:err});
            })
        },
        async index(req, res) {
            const orders = await Order.find({ customerId: req.user._id }, 
                null, 
                { sort: { 'createdAt': -1 } })
            res.header('Cache-Control', 'no-store')         //As we place the order, we are redirected to teh rders list page with the popup if order places successfully, nut if we move back and forward then again this message gets diaplayed so to remove in such cases we do this by removing the cache
            res.render('customers/orders', { orders: orders , moment: moment})
        },
    }
}
module.exports=orderController;