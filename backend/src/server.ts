import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import dotenv from 'dotenv';
import { connectDatabase } from './config/database';
import { initializePaymentConfig } from './config/payment.config';
import { ContactRepository } from './repositories/ContactRepository';
import { VolunteerRepository } from './repositories/VolunteerRepository';
import { PaymentRepository } from './repositories/PaymentRepository';
import { EmailService } from './services/EmailService';
import { GoogleSheetsService } from './services/GoogleSheetsService';
import { anudanStateService } from './services/anudanState.service';
import { ContactController } from './controllers/ContactController';
import { VolunteerController } from './controllers/VolunteerController';
import { BhogController } from './controllers/BhogController';
import { QuestionairController } from './controllers/QuestionairController';
import { AnudanController } from './controllers/AnudanController';
import { createContactRoutes } from './routes/contactRoutes';
import { createVolunteerRoutes } from './routes/volunteerRoutes';
import { createPaymentRoutes } from './routes/paymentRoutes';
import { createBhogRoutes } from './routes/bhogRoutes';
import { createQuestionairRoutes } from './routes/questionairRoutes';
import { createAnudanRoutes } from './routes/anudanRoutes';
import { createIciciPaymentRoutes } from './routes/iciciPaymentRoutes';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? [
        'https://amader-barir-pujo-2026-new-test.vercel.app',
        'https://amader-barir-pujo-2026-new-9257.vercel.app',
        'https://amader-barir-pujo-2026-new.onrender.com',
        'https://amader-barir-pujo-2026-new-icici.onrender.com'
      ]
    : [
        'http://localhost:5173',
        'http://localhost:3000'
      ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true,
}));

// Body parsing middleware
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(compression());

// Log all incoming requests for debugging
app.use((req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.url}`);
  next();
});

// Initialize dependencies
const contactRepository = new ContactRepository();
const volunteerRepository = new VolunteerRepository();
const paymentRepository = new PaymentRepository();
const emailService = new EmailService();
const sheetsService = new GoogleSheetsService();
const contactController = new ContactController(contactRepository, emailService);
const volunteerController = new VolunteerController(volunteerRepository, emailService);
const bhogController = new BhogController(sheetsService);
const questionairController = new QuestionairController(sheetsService);
const anudanController = new AnudanController(sheetsService);

// Routes
app.use('/api', createContactRoutes(contactController));
app.use('/api', createVolunteerRoutes(volunteerController));
app.use('/api/payment', createPaymentRoutes(paymentRepository));
app.use('/api/payment', createIciciPaymentRoutes());
app.use('/api/bhog', createBhogRoutes(bhogController));
app.use('/api', createQuestionairRoutes(questionairController));
app.use('/api/anudan', createAnudanRoutes(sheetsService));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Get server's public IP address
app.get('/my-ip', async (req, res) => {
  const response = await fetch('https://api.ipify.org?format=json');
  res.json(await response.json());
});

// Mock payment page redirect (for mock payment provider)
// This route redirects to the frontend mock payment page
app.get('/mock-payment/:transactionId', (req, res) => {
  const { transactionId } = req.params;
  const frontendUrl = process.env.PAYMENT_REDIRECT_URL?.split('/payment/result')[0] || 'http://localhost:5173';
  res.redirect(`${frontendUrl}/mock-payment?transactionId=${transactionId}`);
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDatabase();

    // Initialize payment configuration
    initializePaymentConfig();

    // Validate ICICI PG configuration if using icici provider
    if (process.env.PAYMENT_PROVIDER === 'icici') {
      const returnURL = process.env.ICICI_PG_RETURN_URL;
      const frontendURL = process.env.FRONTEND_URL;

      if (!returnURL) {
        throw new Error('ICICI_PG_RETURN_URL is not set. Required when PAYMENT_PROVIDER=icici');
      }

      if (!frontendURL) {
        throw new Error('FRONTEND_URL is not set. Required for callback redirects');
      }

      // Prevent localhost/ngrok in production
      if (process.env.NODE_ENV === 'production') {
        if (returnURL.includes('localhost')) {
          throw new Error('ICICI_PG_RETURN_URL cannot contain "localhost" in production. ICICI cannot reach localhost.');
        }
        if (returnURL.includes('ngrok')) {
          throw new Error('ICICI_PG_RETURN_URL cannot contain "ngrok" in production. Use the Render domain instead.');
        }
      } else {
        // Development mode: warn if not using ngrok or localhost
        if (!returnURL.includes('ngrok') && !returnURL.includes('localhost')) {
          console.warn('[ICICI PG] WARNING:: ICICI_PG_RETURN_URL does not contain "ngrok" or "localhost".');
          console.warn('[ICICI PG] You may be testing against the deployed Render backend from local development.');
        }
      }

      console.log('[ICICI PG] Configuration:');
      console.log(`[ICICI PG] ICICI_PG_RETURN_URL = ${returnURL}`);
      console.log(`[ICICI PG] FRONTEND_URL        = ${frontendURL}`);

      // Validate FRONTEND_URL doesn't have trailing path
      if (frontendURL.endsWith('/payment') || frontendURL.endsWith('/payment/')) {
        console.warn('[ICICI PG] WARNING: FRONTEND_URL should not include "/payment" path. It should be the base domain only.');
        console.warn('[ICICI PG] Current FRONTEND_URL:', frontendURL);
        console.warn('[ICICI PG] Expected format: https://yourdomain.com');
      }
    }

    // Initialize Anudan state service (loads from MongoDB)
    await anudanStateService.initialize();

    // Start Express server
    app.listen(PORT, () => {
      console.log(`Server running on thee port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
