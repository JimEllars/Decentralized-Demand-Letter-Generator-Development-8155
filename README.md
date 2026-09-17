# AXiM Demand Letter Generator

## Overview
The Decentralized Demand Letter Generator is a flagship B2B/Business Development SaaS Micro-App designed to provide automated, legally formatted formal demand letters.

## Architecture Guarantee
100% No-GCP Perimeter, Zero-Database / Zero-Knowledge in RAM. Documents are compiled on the edge in Cloudflare memory and never saved to persistent storage.

## Environment Variables
* `BACKEND_URL`: URL of the AXiM Payment Backend
* `EMAILIT_API_KEY`: Key for the EmailIt API
* `RESEND_API_KEY`: Key for the Resend API (fallback)
* `AXIM_TELEMETRY_URL`: URL to transmit runtime telemetry
* `AXIM_TELEMETRY_KEY`: Key for telemetry transmission
* `TURNSTILE_SECRET_KEY`: Key for Turnstile

## Instructions
* Local Development: `npm run dev`
* Edge Deployment: `npx wrangler deploy`
