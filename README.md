# Restaurant AI Phone Receptionist

Production AI voice receptionist handling real inbound phone calls with low latency, live transfers, SMS follow-ups, and call analytics.

![AI Voice Receptionist Flow](./image-1.png)

## Overview

This project implements a **real-time AI phone receptionist** for a restaurant, built on Twilio Media Streams and a streaming Voice AI pipeline. The agent answers incoming calls, handles common customer questions, sends SMS links on demand, and escalates to a human when needed, all with fast, natural turn-taking.

This system is deployed and actively used by a real business.

## Architecture (High Level)

- **Telephony:** Twilio Voice + Media Streams
- **Voice AI:** Realtime speech-to-speech Voice AI API (low latency, barge-in support)
- **Backend:** Node.js + Fastify + WebSockets
- **Messaging:** Twilio SMS
- **Analytics & Admin:** Firebase Auth + Firestore + React dashboard
- **Deployment:** Docker + Google Cloud Run, Firebase Hosting

## System Flow

1. Caller dials the restaurant phone number.
2. Twilio streams live audio to the backend over WebSockets.
3. Audio is processed in real time by the Voice AI API.
4. The agent responds with streaming speech output.
5. The agent can:

   - Answer questions
   - Send SMS links (menu, website, directions)
   - Forward the call to a human

6. Call transcripts and metadata are saved for analytics and QA.

## Live Demo

- **Live phone demo:** +1 (253) 523-3245
  Calls are answered by the AI receptionist.

## Admin Portal

- **QA & analytics dashboard:**
  [http://banded-arch-441723-g6.web.app/qa](http://banded-arch-441723-g6.web.app/qa)

The admin portal allows staff to:

- Edit question and answer content
- Review call analytics
- Inspect call topics and trends

## Real Client Website

- **Business website:**
  [https://bshotchicken.com](https://bshotchicken.com)

This demonstrates the system is part of a real production setup, not a demo.

## Repository Structure (Simplified)

- `server/` – Fastify server, WebSocket handling, Twilio webhooks
- `realtime/` – Voice streaming and agent session logic
- `tools/` – Call forwarding and SMS tool functions
- `analytics/` – Post-call processing and Firestore persistence
- `admin/` – React + Firebase admin dashboard
- `docker/` – Container and deployment configs

## Key Features

- Real-time speech-to-speech voice agent
- Low latency with interruption (barge-in) support
- Live call forwarding to human staff
- SMS follow-ups during calls
- Call transcripts and topic analytics
- Editable QA content via admin dashboard

## Use Cases

- Restaurant phone reception
- Appointment or reservation intake
- High-volume inbound call automation
- Customer support voice agents

## Notes

- Secrets and credentials are handled via environment variables.
- This repository is structured for real deployment, not toy demos.
- Sensitive keys and production credentials are intentionally excluded.
