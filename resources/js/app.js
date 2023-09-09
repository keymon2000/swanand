import axios from 'axios';
import Noty from 'noty';
let addToCart = document.querySelectorAll('.add-to-cart')  
let cartCounter = document.querySelector('#cartCounter')  


function updateCart(prod) {
    // return res
    axios.post('/update-cart', prod).then(res => {
    console.log(res);
    cartCounter.innerText = res.data.totalQty;
        new Noty({
            type: 'success',
            timeout: 1000,
            text: 'Item added to cart',
            progressBar: false,
        }).show();
    }).catch(err => {
        new Noty({
            type: 'error',
            timeout: 1000,
            text: 'Something went wrong',
            progressBar: false,
        }).show();
    })
}

addToCart.forEach((btn) => {                        //recieves the info saved in json format
    btn.addEventListener('click', (e) => {
        let prod = JSON.parse(btn.dataset.prod);
        updateCart(prod)
    })
})