import dotenv from 'dotenv';
import express from 'express';
import axios from 'axios';
import cors from 'cors';
import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';
import stripePkg from 'stripe';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
//check .env for dev build
//console.log('Loaded STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY);
//console.log('Loaded OPENAI_API_KEY:', process.env.OPENAI_API_KEY);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Serve static files from the React build
app.use(express.static(path.join(__dirname, '../build')));

// Setup winston logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level.toUpperCase()}]: ${message}`;
    })
  ),
  transports: [
    new winston.transports.File({ filename: 'backend-error.log', level: 'error' }),
    new winston.transports.File({ filename: 'backend-combined.log' }),
    new winston.transports.Console()
  ]
});
//logger.error('Test Error');

// Health check endpoint
app.get('/health', (req, res) => {
  logger.info('--- Incoming GET /health ---');
  logger.info('Endpoint: /health');
  logger.info('Headers:', req.headers);
  logger.info('Body:', JSON.stringify(req.body, null, 2));
  res.json({ status: 'ok', message: 'Server is running.' });
});

// Proxy endpoint for ChatGPT
app.post('/api/chatgpt', async (req, res) => { 
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const userAgent = req.headers['user-agent'] || 'unknown';
  logger.info(`OpenAI API Request | Caller IP: ${ip} | User Agent: ${userAgent} ` + JSON.stringify(req.body, null, 2));
  try {
    const { messages, model = 'gpt-3.5-turbo', ...rest } = req.body;
    if (!process.env.OPENAI_API_KEY) {
      logger.error(`Caller IP: ${ip} | User Agent: ${userAgent} | Status: 500 | OpenAI API key not configured on server.`);
      return res.status(500).json({ error: 'OpenAI API key not configured on server.' });
    }
    if (!messages) {
      logger.error(`Caller IP: ${ip} | User Agent: ${userAgent} | Status: 400 | Missing messages in request body.`);
      return res.status(400).json({ error: 'Missing messages in request body.' });
    }
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model,
        messages,
        ...rest
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    logger.info(`Status: 200 | OpenAI API Response | Caller IP: ${ip} | User Agent: ${userAgent} `+ JSON.stringify(response.data, null, 2));
    res.json(response.data);
  } catch (error) {
    if (error?.response) {
      logger.error(`Caller IP: ${ip} | User Agent: ${userAgent} | Status: 503 | OpenAI API error | Error: ${JSON.stringify(error.response.data)}`);
      return res.status(503).json({
        error: error.response.data || error.message
      });
    }
    logger.error(`Caller IP: ${ip} | User Agent: ${userAgent} | Status: 500 | Error in /api/chatgpt | Error: ${error.message}`);
    res.status(500).json({
      error: error.message
    });
  }
});

// Endpoint to create a Stripe Checkout session for tips
app.post('/api/create-checkout-session', async (req, res) => {
  logger.info('--- Incoming POST /api/create-checkout-session ---');
  logger.info('Headers: ' + JSON.stringify(req.headers));
  logger.info('Body: ' + JSON.stringify(req.body));
  console.log('--- Incoming POST /api/create-checkout-session ---');
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  try {
    const { amount } = req.body;
    logger.info('Received amount: ' + amount);
    logger.info('STRIPE_SECRET_KEY present: ' + (process.env.STRIPE_SECRET_KEY ? 'yes' : 'no'));
    console.log('Received amount:', amount);
    console.log('STRIPE_SECRET_KEY present:', process.env.STRIPE_SECRET_KEY ? 'yes' : 'no');
    if (!amount || typeof amount !== 'number' || amount < 100) {
      logger.error('Invalid tip amount (minimum $1)');
      console.error('Invalid tip amount (minimum $1)');
      return res.status(400).json({ error: 'Invalid tip amount (minimum $1)' });
    }
    if (!process.env.STRIPE_SECRET_KEY) {
      logger.error('STRIPE_SECRET_KEY is missing from environment variables');
      console.error('STRIPE_SECRET_KEY is missing from environment variables');
      return res.status(500).json({ error: 'Stripe secret key not configured on server.' });
    }
    const stripe = stripePkg(process.env.STRIPE_SECRET_KEY);
    let session;
    try {
      session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: "Tip for Mom, I'm Bored!",
                description: 'Thank you for supporting our app!',
              },
              unit_amount: amount,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${req.headers.origin || 'http://localhost:3000'}/?success=true`,
        cancel_url: `${req.headers.origin || 'http://localhost:3000'}/?canceled=true`,
      });
      logger.info('Stripe Checkout session created: ' + JSON.stringify(session));
      console.log('Stripe Checkout session created:', session);
    } catch (stripeErr) {
      logger.error('Stripe API error: ' + (stripeErr && stripeErr.message ? stripeErr.message : stripeErr));
      logger.error('Stripe API error (full): ' + JSON.stringify(stripeErr));
      console.error('Stripe API error:', stripeErr && stripeErr.message ? stripeErr.message : stripeErr);
      console.error('Stripe API error (full):', stripeErr);
      throw stripeErr;
    }
    res.json({ url: session.url });
  } catch (error) {
    logger.error('Stripe Checkout session error: ' + (error && error.message ? error.message : error));
    logger.error('Stripe Checkout session error (full): ' + JSON.stringify(error));
    console.error('Stripe Checkout session error:', error && error.message ? error.message : error);
    console.error('Stripe Checkout session error (full):', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build', 'index.html'));
});

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
}); 