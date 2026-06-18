Thankfull Stripe automatically handles any case where 

1. Stripe customer ID is defined in DB
2. The customer is labelled as not paying
3. The customer is ACTUALLY paying in Stripe (perhaps this was not caught due to webhook error or misfire from Stripe)


^ For this case the route should also reconcile with stripe in the case that 
1. Customer ID defined
2. Customer is labelled as not paying