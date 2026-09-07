# Omnihub 🌊

A premium, modern, and fluid web platform for communities, file sharing, and content discovery.
Built with Next.js, Firebase, and Cloudflare.

## Features
- **Premium Aquatic UI**: High-quality visual experience, smooth animations, and Canvas effects.
- **Firebase Auth & DB**: Secure user authentication and real-time database.
- **Cloudflare Integration**: Blazing fast global deployment via Pages and Workers for secure API proxying.
- **Responsive Design**: Perfect fit for Android devices, tablets, and desktop.
- **File Uploads**: Support for images (Cloudinary) and large files (Google Drive via Worker).

## Environment Setup
Create a `.env.local` file based on `.env.example`:
```bash
cp .env.example .env.local
```
Fill out the variables using your Firebase and Cloudflare credentials.

## Local Development
```bash
npm install
npm run dev
```

## Cloudflare Worker Setup
The `worker` directory contains a secure proxy for API keys.
```bash
cd worker
npm install -g wrangler
wrangler deploy
```
*Note: Make sure to set your secure environment variables via `wrangler secret put <KEY>`.*

## Architecture
- **Frontend**: Next.js App Router (React), Tailwind CSS, Lucide React.
- **Backend Edge**: Cloudflare Workers.
- **Database**: Firebase Firestore.
- **Storage**: Cloudinary (Images) / Google Drive (Files).
