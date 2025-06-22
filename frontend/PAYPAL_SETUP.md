# PayPal Payment Gateway Setup

This guide will help you set up PayPal payments for the Resumic.ai pricing page.

## Prerequisites

1. A PayPal Business account
2. PayPal Developer account (for testing)

## Setup Steps

### 1. PayPal Developer Account Setup

1. Go to [PayPal Developer Portal](https://developer.paypal.com/)
2. Sign in with your PayPal account
3. Navigate to "Apps & Credentials"
4. Create a new app or use an existing one

### 2. Get Your Client ID

1. In the PayPal Developer Portal, go to your app
2. Copy the **Client ID** (not the Secret)
3. You'll need both Sandbox and Live Client IDs

### 3. Environment Configuration

Create a `.env` file in the `frontend` directory with the following variables:

```env
# API Configuration
VITE_API_URL=http://localhost:5001/api

# PayPal Configuration
VITE_PAYPAL_CLIENT_ID=your_paypal_client_id_here

# For development (Sandbox)
VITE_PAYPAL_CLIENT_ID=your_sandbox_client_id_here

# For production (Live)
VITE_PAYPAL_CLIENT_ID=your_live_client_id_here
```

### 4. Backend API Endpoints

Make sure your backend has the following endpoints implemented:

#### Create Subscription
```
POST /api/subscriptions/create
Content-Type: application/json
Authorization: Bearer <token>

{
  "planId": "pro",
  "planName": "Pro",
  "amount": 12,
  "billingCycle": "monthly",
  "currency": "USD",
  "paypalOrderId": "PAY-123456789"
}
```

#### Update Subscription Status
```
PUT /api/subscriptions/status
Content-Type: application/json
Authorization: Bearer <token>

{
  "subscriptionId": "sub_123456789",
  "status": "active",
  "paypalOrderId": "PAY-123456789"
}
```

#### Cancel Subscription
```
POST /api/subscriptions/{subscriptionId}/cancel
Content-Type: application/json
Authorization: Bearer <token>
```

#### Get Subscription History
```
GET /api/subscriptions/history
Authorization: Bearer <token>
```

### 5. Testing

#### Sandbox Testing
1. Use your Sandbox Client ID for development
2. Use PayPal's sandbox accounts for testing payments
3. Test both successful and failed payment scenarios

#### Live Testing
1. Switch to your Live Client ID for production
2. Test with real PayPal accounts
3. Ensure all error handling works correctly

## Security Considerations

1. **Never expose your PayPal Secret** - only use the Client ID in frontend code
2. **Always validate payments on the backend** - don't rely solely on frontend validation
3. **Use HTTPS in production** - PayPal requires secure connections
4. **Implement webhook handling** - for subscription status updates
5. **Store subscription data securely** - encrypt sensitive payment information

## PayPal Webhooks (Recommended)

Set up PayPal webhooks to handle subscription events:

1. Go to PayPal Developer Portal
2. Navigate to Webhooks
3. Add webhook endpoints for:
   - `BILLING.SUBSCRIPTION.ACTIVATED`
   - `BILLING.SUBSCRIPTION.CANCELLED`
   - `BILLING.SUBSCRIPTION.EXPIRED`
   - `PAYMENT.SALE.COMPLETED`

## Error Handling

The payment component includes error handling for:
- Network errors
- Payment failures
- User cancellations
- Invalid subscription data

## Support

If you encounter issues:
1. Check PayPal Developer documentation
2. Verify your Client ID is correct
3. Ensure your backend endpoints are working
4. Check browser console for errors

## Production Checklist

- [ ] Use Live PayPal Client ID
- [ ] Enable HTTPS
- [ ] Set up webhooks
- [ ] Test all payment scenarios
- [ ] Implement proper error logging
- [ ] Set up monitoring for payment failures
- [ ] Configure backup payment methods (if needed) 