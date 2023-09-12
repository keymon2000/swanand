import axios from 'axios';
import Noty from 'noty';
import moment from 'moment';
import { initAdmin } from './admin'
import { initStripe } from './stripe'
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

//Remove the alert message after X seconds
const alertMsg = document.querySelector('#success-alert')
if(alertMsg) {
    setTimeout(() => {
        alertMsg.remove()
    }, 2000)
}



//Change order status
let statuses = document.querySelectorAll('.status_line')
let hiddenInput = document.querySelector('#hiddenInput')
let order =  hiddenInput ? hiddenInput.value : null
order = JSON.parse(order)
let time = document.createElement('small')

function updateStatus(order) {                      //These are for the prder traking page wherein we change color of various statuses
    statuses.forEach((status) => {
        status.classList.remove('step-completed')           //remove the orange color from all
        status.classList.remove('current')                   //remove gray from all the code ahead will fill the required with respective colors
    })
    let stepCompleted = true;
    statuses.forEach((status) => {
        let dataProp = status.dataset.status
        if(stepCompleted) {
            status.classList.add('step-completed')
        }
        if(dataProp === order.status) {
            console.log(dataProp);
            stepCompleted = false;
            time.innerText = moment(order.updatedAt).format('hh:mm A')
            status.appendChild(time)
            if(status.nextElementSibling){
                status.nextElementSibling.classList.add('current')
            }
        }     
    })
}

updateStatus(order);

initStripe()

//Socket
// const io = require('socket.io')(server) 
let socket = io()
// Join 
if(order) {
    socket.emit('join', `order_${order._id}`)
}

let adminAreaPath = window.location.pathname        //get the url opened like /admin/status
if(adminAreaPath.includes('admin')) {               //if it is the admin page then only this works
    initAdmin(socket)                           //pass socket to admin page to be used 
    socket.emit('join', 'adminRoom')
}

socket.on('orderUpdated', (data) => {
    const updatedOrder = { ...order }           //to copy the order data we use ... in js
    updatedOrder.updatedAt = moment().format()
    updatedOrder.status = data.status
    updateStatus(updatedOrder)
    new Noty({
        type: 'success',
        timeout: 1000,
        text: 'Order updated',
        progressBar: false,
    }).show();
})