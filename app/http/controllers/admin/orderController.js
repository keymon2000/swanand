const Order = require('../../../models/order')
function orderController(){
    return {
        index(req,res){
            Order.find({ status: { $ne: 'completed' } },null,{ sort: { 'createdAt': -1 }})
                .populate('customerId', '-password')
                .exec()
                .then((orders) => {
                    if (req.xhr) {
                        return res.json(orders);
                    } else {
                        return res.render('admin/orders');
                    }
                })
                .catch((err) => {
                    // Handle any errors here
                    console.error(err);
                    // Respond with an error message or render an error page
                    return res.status(500).send('An error occurred');
                });
        }
    }
}
module.exports=orderController;