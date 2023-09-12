import { loadStripe } from '@stripe/stripe-js'
import { placeOrder } from './apiService'
import { CardWidget } from './CardWidget'

export async function initStripe () {
    const stripe = await loadStripe('pk_test_51Np89YSBTyMHipGBPuRg8z0ptBJJ5ss9R8GmlL7dqd5GLrr4bElgTq7Aa2Epk4FGdLs2JNKObi237SWK5qpq4Txg00daft4FTt');
    let card = null;

    function mountWidget() {
        const elements = stripe.elements()
        let style = {
            base: {
                color: '#32325d',
                fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
                fontSmoothing: 'antialiased',
                fontSize: '16px',
                '::placeholder': {
                    color: '#aab7c4'
                }
            },
            invalid: {
                color: '#fa755a',
                iconColor: '#fa755a'
            }
        }
    
        card = elements.create('card', { style , hidePostalCode: true })
        card.mount('#card-element')
    }

    const paymentType = document.querySelector('#paymentType');
    if(!paymentType){
        return;
    }
    paymentType.addEventListener('change', (e) => {
        if(e.target.value === 'card') {
            //Display Widget
            // card = new CardWidget(stripe)               //CALL THE CALSSwe created
            // card.mount()
            mountWidget()
        } else {
            card.destroy()
        }
    })
    //Ajax call 
    const paymentForm = document.querySelector('#payment-form');
    if(paymentForm){
        paymentForm.addEventListener('submit', async (e) => {
            e.preventDefault();                             //Not to submit form in the default form action location
            let formData = new FormData(paymentForm);
            let formObject = {}
            for(let [key, value] of formData.entries()) {
                formObject[key] = value
            }

            if (!card) {
                //Ajax
                placeOrder(formObject);
                return;
            }
            // stripe.createToken(card).then((res)=>{
            //     formObject.stripeToken = res.token.id;
            //     placeOrder(formObject);
            // }).catch((err)=>{
            //     console.log(err);
            // })
            stripe.createPaymentMethod({
                type: 'card',
                card: card,
              }).then(function(result) {
                if (result.error) {
                  // Handle errors (e.g., card declined)
                //   errorElement.textContent = result.error.message;
                } else {
                  // PaymentMethod created successfully
                  var paymentMethodId = result.paymentMethod.id;
                  // Send paymentMethodId to your server for use in PaymentIntent creation
                  // You can use AJAX to send this ID to your server
                  formObject.stripeToken = paymentMethodId;
                  placeOrder(formObject);
                //   handlePaymentMethod(paymentMethodId);
                }
              });
            // });
            
            


            // stripe.createPaymentMethod({
            //     type: 'card',
            //     card: card,
            //   }).then(function(result) {
            //     if (result.error) {
            //       // Handle errors (e.g., card declined)
            //       console.error(result.error);
            //     } else {
            //       // PaymentMethod created successfully, result.paymentMethod.id contains the PaymentMethod ID
            //       var paymentMethodId = result.paymentMethod.id;
            //       formObject.stripeToken = paymentMethodId;
            //       placeOrder(formObject);
            //       // Pass paymentMethodId to your server for use in PaymentIntent creation
            //       // You can use AJAX to send this ID to your server
            //     }
            // });
            // const token = await card.createToken()
            // formObject.stripeToken = token.id;
            // placeOrder(formObject);
            
        })
    }
}
