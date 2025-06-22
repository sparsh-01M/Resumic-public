# Backend PayPal Integration Setup

This guide will help you set up the backend with PayPal payment integration for Resumic.ai.

## Prerequisites

1. PayPal Business account
2. PayPal Developer account
3. MongoDB database
4. Node.js and npm

## Environment Configuration

Create a `.env` file in the `backend` directory with the following variables:

```env
# Server Configuration
PORT=5001
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/resumic-ai

# JWT Configuration
JWT_SECRET=your_jwt_secret_here

# PayPal Configuration
PAYPAL_CLIENT_ID=your_paypal_client_id_here
PAYPAL_CLIENT_SECRET=your_paypal_client_secret_here

# For development (Sandbox)
PAYPAL_CLIENT_ID=your_sandbox_client_id_here
PAYPAL_CLIENT_SECRET=your_sandbox_client_secret_here

# For production (Live)
PAYPAL_CLIENT_ID=your_live_client_id_here
PAYPAL_CLIENT_SECRET=your_live_client_secret_here

# Other Services
GOOGLE_AI_API_KEY=your_google_ai_api_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

## PayPal Developer Setup

### 1. Get PayPal Credentials

1. Go to [PayPal Developer Portal](https://developer.paypal.com/)
2. Sign in with your PayPal account
3. Navigate to "Apps & Credentials"
4. Create a new app or use an existing one
5. Copy both **Client ID** and **Client Secret**

### 2. Set Up Webhooks

1. In PayPal Developer Portal, go to "Webhooks"
2. Add a new webhook with the following URL:
   ```
   https://your-domain.com/api/webhooks/paypal
   ```
3. Select the following events:
   - `BILLING.SUBSCRIPTION.ACTIVATED`
   - `BILLING.SUBSCRIPTION.CANCELLED`
   - `BILLING.SUBSCRIPTION.EXPIRED`
   - `PAYMENT.SALE.COMPLETED`
   - `PAYMENT.SALE.DENIED`

## API Endpoints

### Subscription Endpoints

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
  "subscriptionId": "subscription_id_here",
  "status": "active",
  "paypalOrderId": "PAY-123456789"
}
```

#### Cancel Subscription
```
POST /api/subscriptions/{subscriptionId}/cancel
Authorization: Bearer <token>
```

#### Get Subscription History
```
GET /api/subscriptions/history
Authorization: Bearer <token>
```

#### Get Current Subscription
```
GET /api/subscriptions/current
Authorization: Bearer <token>
```

### Webhook Endpoint

#### PayPal Webhook
```
POST /api/webhooks/paypal
Content-Type: application/json

{
  "event_type": "BILLING.SUBSCRIPTION.ACTIVATED",
  "resource": {
    "id": "subscription_id",
    "status": "ACTIVE",
    "start_time": "2024-01-01T00:00:00Z"
  }
}
```

## Database Schema

### Subscription Model

```typescript
interface ISubscription {
  userId: mongoose.Types.ObjectId;
  planId: 'free' | 'pro' | 'teams';
  planName: string;
  amount: number;
  billingCycle: 'monthly' | 'yearly';
  currency: string;
  status: 'pending' | 'active' | 'cancelled' | 'expired' | 'failed';
  paypalSubscriptionId?: string;
  paypalOrderId?: string;
  paypalPaymentId?: string;
  startDate: Date;
  endDate?: Date;
  nextBillingDate?: Date;
  cancelledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

## Security Considerations

1. **Environment Variables**: Never commit `.env` files to version control
2. **Webhook Verification**: Implement proper webhook signature verification in production
3. **HTTPS**: Use HTTPS in production for all webhook endpoints
4. **Rate Limiting**: Implement rate limiting for API endpoints
5. **Input Validation**: All inputs are validated before processing
6. **Error Handling**: Comprehensive error handling and logging

## Testing

### Sandbox Testing

1. Use PayPal Sandbox credentials
2. Test with sandbox PayPal accounts
3. Verify webhook events are received
4. Test all subscription statuses

### Production Testing

1. Use PayPal Live credentials
2. Test with real PayPal accounts
3. Verify webhook signature verification
4. Monitor error logs

## Monitoring

### Logs to Monitor

1. PayPal webhook events
2. Subscription status changes
3. Payment failures
4. API errors

### Metrics to Track

1. Successful subscriptions
2. Failed payments
3. Cancellation rates
4. Revenue metrics

## Troubleshooting

### Common Issues

1. **Webhook not receiving events**: Check webhook URL and event types
2. **Payment verification fails**: Verify PayPal credentials and order status
3. **Subscription not updating**: Check database connection and user authentication
4. **CORS errors**: Verify CORS configuration for frontend domain

### Debug Steps

1. Check server logs for errors
2. Verify PayPal credentials
3. Test webhook endpoint manually
4. Check database connectivity
5. Verify user authentication

## Deployment

### Production Checklist

- [ ] Use Live PayPal credentials
- [ ] Enable HTTPS
- [ ] Set up webhook signature verification
- [ ] Configure proper CORS origins
- [ ] Set up monitoring and logging
- [ ] Test all endpoints
- [ ] Set up database backups
- [ ] Configure rate limiting

## Support

If you encounter issues:

1. Check PayPal Developer documentation
2. Verify environment variables
3. Check server logs
4. Test with PayPal sandbox first
5. Contact PayPal support if needed 