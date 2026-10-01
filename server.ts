import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { WebSocketServer, WebSocket } from 'ws';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

const PORT = parseInt(process.env.PORT || '3000', 10);
const server = http.createServer(app);

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

function getSystemInstruction(counselorName: string = 'Aarav') {
  return `You are ${counselorName}, the official AI Voice Admission Counselor for the Industrial Training Institute (ITI) Admissions Portal.
Your objective is to assist prospective students, parents, and candidates by answering admissions-related inquiries, guiding them through registration workflows, resolving common doubts, and politely overcoming hesitations or objections regarding vocational education.

Voice Persona & Tone Guidelines:
- Channel: Voice / Spoken Conversation.
- Tone: Professional, empathetic, reassuring, patient, and concise.
- Pacing & Style: Keep responses short, typically 2 to 3 sentences (under 40 words) per turn, to sound natural over voice.
- Speak in clear, plain language; avoid academic jargon, excessive technical acronyms, or complex bullet points.
- Use conversational connectors (e.g., "I understand," "Certainly," "That's a very fair question").
- Never list long URLs or complicated paths aloud; offer to send SMS/WhatsApp links or direct them to key portal buttons instead.

Core Knowledge & FAQ Handling:
1. Eligibility:
   - Age: Minimum 14 years completed by admission cut-off date (no upper age limit for most regular trades).
   - 8th Pass: Wireman, Welder, Carpenter.
   - 10th Pass (Matriculation): Electrician, Fitter, Turner, Machinist, COPA (Computer Operator and Programming Assistant), Stenography.
   - 12th Pass / Science Stream: Select advanced technical trades.
2. Application Process:
   - Online registration -> Profile completion -> Uploading documents -> Choice filling (trades & colleges) -> Merit list verification -> Seat allotment -> Physical reporting/fee deposit.
   - Documents needed: Mark sheet (8th/10th/12th), Aadhaar Card, Passport-size photographs, Category/Caste certificate, Domicile certificate, Income certificate.
3. Certification & Fees:
   - Certificates: NCVT (National Council for Vocational Training - recognized nationwide and abroad) and SCVT (State Council for Vocational Training).
   - Fees: Government ITIs have nominal subsidized fees; Private ITIs follow state fee committee guidelines.

Objection Handling (Listen -> Acknowledge -> Reframe -> Call to Action):
- Value vs Degree: ITI offers immediate hands-on industrial skills and faster job placement. Through lateral entry, students can join 2nd year Diploma or Engineering degree later.
- Low marks in 10th: Admissions consider merit across various trades; many popular trades accept standard pass marks.
- Cost concerns: Government ITIs are highly subsidized with state/central scholarship schemes.
- Confusion on trade: Electrical/machine preference -> Electrician or Fitter. Computer preference -> COPA.

Conversational Guardrails & Rules:
1. One Question at a Time: Never ask multiple questions in a single response.
2. Clarification Before Escalation: If audio is unclear, gently say: "I'm sorry, I didn't quite catch that. Could you please repeat your trade or question?"
3. Escalation to Human Helpdesk: For payment deduction disputes, server errors, or specific dispute resolution: "For this specific account matter, let me connect you to our admissions helpdesk executive or share their direct helpline number (1800-200-5566). Would that help?"
4. No Guarantees: Never promise seat allotment or job placement. Use "based on seat availability and merit cut-offs."
5. Session Wrap-up: When winding down, ask: "Have I answered everything you needed today, or can I help you start your application?"`;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    liveModel: 'gemini-3.8-live',
    hasKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

// Fallback chat API for text interaction or testing
app.post('/api/chat', async (req, res) => {
  try {
    const { message, counselor = 'Aarav', history = [] } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const systemInstruction = getSystemInstruction(counselor);
    const contents = [
      ...history.map((h: { role: string; content: string }) => ({
        role: h.role === 'model' ? 'model' : 'user',
        parts: [{ text: h.content }],
      })),
      {
        role: 'user',
        parts: [{ text: message }],
      },
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const reply = response.text || 'I apologize, I could not process that query. Could you please try again?';
    res.json({ reply, counselor });
  } catch (error: any) {
    console.error('Chat error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// WebSocket Server for Gemini 3.8 Live API
const wss = new WebSocketServer({ server, path: '/live' });

wss.on('connection', async (clientWs, req) => {
  console.log('Client connected to Live audio bridge');

  // Parse query params for counselor choice
  const url = new URL(req.url || '', `http://${req.headers.host || 'localhost'}`);
  const requestedCounselor = url.searchParams.get('counselor') || 'Aarav';
  const counselorName = requestedCounselor === 'Ananya' ? 'Ananya' : 'Aarav';
  // Prebuilt voice: Aoede / Kore for Ananya, Zephyr / Fenrir / Puck for Aarav
  const voiceName = counselorName === 'Ananya' ? 'Aoede' : 'Zephyr';

  let liveSession: any = null;
  let isClosing = false;

  try {
    if (!process.env.GEMINI_API_KEY) {
      clientWs.send(JSON.stringify({
        type: 'error',
        message: 'GEMINI_API_KEY is not configured on the server.',
      }));
      return;
    }

    console.log(`Connecting to Gemini Live API with model gemini-3.8-live and voice ${voiceName}...`);

    liveSession = await ai.live.connect({
      model: 'gemini-3.8-live',
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName,
            },
          },
        },
        systemInstruction: getSystemInstruction(counselorName),
        outputAudioTranscription: {},
        inputAudioTranscription: {},
      },
      callbacks: {
        onopen: () => {
          console.log('Gemini Live session connected successfully');
          if (clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(JSON.stringify({
              type: 'ready',
              counselor: counselorName,
              voice: voiceName,
            }));
          }
        },
        onmessage: (message: LiveServerMessage) => {
          if (clientWs.readyState !== WebSocket.OPEN) return;

          // 1. Audio data from model
          const parts = message.serverContent?.modelTurn?.parts || [];
          for (const part of parts) {
            if (part.inlineData?.data) {
              clientWs.send(JSON.stringify({
                type: 'audio',
                data: part.inlineData.data,
                mimeType: part.inlineData.mimeType || 'audio/pcm;rate=24000',
              }));
            }
          }

          // 2. Transcriptions
          const outTranscription = message.serverContent?.outputTranscription?.text;
          if (outTranscription) {
            clientWs.send(JSON.stringify({
              type: 'transcript',
              role: 'model',
              text: outTranscription,
            }));
          }

          const inTranscription = message.serverContent?.inputTranscription?.text;
          if (inTranscription) {
            clientWs.send(JSON.stringify({
              type: 'transcript',
              role: 'user',
              text: inTranscription,
            }));
          }

          // 3. User interruption
          if (message.serverContent?.interrupted) {
            clientWs.send(JSON.stringify({ type: 'interrupted' }));
          }

          // 4. Turn complete
          if (message.serverContent?.turnComplete) {
            clientWs.send(JSON.stringify({ type: 'turnComplete' }));
          }
        },
        onerror: (err: any) => {
          console.error('Gemini Live API error:', err);
          if (clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(JSON.stringify({
              type: 'error',
              message: err?.message || 'Live session encountered an error',
            }));
          }
        },
        onclose: () => {
          console.log('Gemini Live session closed');
          if (!isClosing && clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(JSON.stringify({ type: 'closed' }));
          }
        },
      },
    });

    // Notify client that session is ready
    if (clientWs.readyState === WebSocket.OPEN) {
      clientWs.send(JSON.stringify({
        type: 'ready',
        counselor: counselorName,
        voice: voiceName,
      }));
    }

    clientWs.on('message', (rawData) => {
      try {
        const payload = JSON.parse(rawData.toString());

        if (payload.type === 'audio' && payload.data && liveSession) {
          liveSession.sendRealtimeInput({
            audio: {
              data: payload.data,
              mimeType: 'audio/pcm;rate=16000',
            },
          });
        } else if (payload.type === 'text' && payload.text && liveSession) {
          liveSession.sendClientContent({
            turns: [
              {
                role: 'user',
                parts: [{ text: payload.text }],
              },
            ],
            turnComplete: true,
          });
        } else if (payload.type === 'ping') {
          clientWs.send(JSON.stringify({ type: 'pong' }));
        }
      } catch (err) {
        console.error('Error processing client message:', err);
      }
    });

    clientWs.on('close', () => {
      console.log('Client disconnected, closing Live session');
      isClosing = true;
      if (liveSession) {
        try {
          liveSession.close();
        } catch (e) {
          // ignore close error
        }
      }
    });

    clientWs.on('error', (err) => {
      console.error('Client WebSocket error:', err);
      isClosing = true;
      if (liveSession) {
        try {
          liveSession.close();
        } catch (e) {
          // ignore close error
        }
      }
    });
  } catch (err: any) {
    console.error('Failed to establish Live session:', err);
    if (clientWs.readyState === WebSocket.OPEN) {
      clientWs.send(JSON.stringify({
        type: 'error',
        message: err?.message || 'Failed to initialize Gemini Live session',
      }));
    }
  }
});

// Vite middleware or static serving
async function setupServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`ITI Admission Voice Counselor server listening on port ${PORT}`);
  });
}

setupServer();
