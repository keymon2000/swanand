const Menu=require('../../models/menu')
function homeController(){
    return {
        async index(req,res){
            const prods=await Menu.find();
            return res.render('home',{prods:prods});
        }
    }
}
module.exports=homeController;