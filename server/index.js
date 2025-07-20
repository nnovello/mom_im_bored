import dotenv from 'dotenv';
import express from 'express';
import axios from 'axios';
import cors from 'cors';
import winston from 'winston';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

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

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
}); 