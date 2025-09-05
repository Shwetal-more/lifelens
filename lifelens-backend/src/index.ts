// src/index.ts
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { sendSms } from './services/sms';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || '*'
}));

// rate limiter for api routes
app.use('/api/', rateLimit({ windowMs: 60_000, max: 25 }));

app.get('/', (_req, res) => res.send('LifeLens backend running'));

app.post('/api/send-sms', async (req, res) => {
  try {
    const { to, body } = req.body;
    if (!to || !body) return res.status(400).json({ success: false, error: 'Missing to or body' });

    // Optionally sanitize body length
    if (typeof body !== 'string' || body.length > 1000) {
      return res.status(400).json({ success: false, error: 'Invalid message body' });
    }

    const result = await sendSms(to, body);
    return res.status(200).json({ success: true, sid: result.sid, status: result.status });
  } catch (err: any) {
    console.error('Error in send-sms:', err);
    // Twilio REST errors carry message; return friendly message
    return res.status(500).json({ success: false, error: err.message || 'Server error' });
  }
});

// optional twilio status callback endpoint
app.post('/api/sms-status', (req, res) => {
  console.log('Twilio status callback:', req.body);
  // store in DB if needed
  res.sendStatus(200);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`SMS backend listening on ${PORT}`));
