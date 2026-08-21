<div align="center">

# 🚀 Leadora
### AI-Powered B2B Lead Generation & Sales Automation Platform

**Find clients. Spot opportunity. Close deals — all in one platform.**

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen?style=for-the-badge)](https://leadora-mu.vercel.app/)
[![Built with React](https://img.shields.io/badge/React-Vite-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![Supabase](https://img.shields.io/badge/Backend-Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

[**🔗 Live Demo**](https://leadora-mu.vercel.app/) · [Features](#-features) · [How It Works](#-how-it-works) · [Tech Stack](#-tech-stack) · [Getting Started](#-getting-started)

</div>

---

## 📖 Overview

**Leadora** helps freelancers, agencies, and web developers discover potential business clients, identify businesses without websites, generate personalized outreach scripts, and create AI-powered website prompts — turning cold prospecting into a streamlined, repeatable pipeline.

Instead of manually hunting for leads and writing pitches from scratch, Leadora automates the entire top-of-funnel process — from **discovery** to **outreach** to **conversion**.

---

## ✨ Features

### 🔎 AI-Powered Lead Discovery
- Search businesses by **city** and **category**
- Surface relevant local businesses via the **Google Places API**
- Filter leads by **rating** and review volume
- Automatically **prioritize businesses without websites** — your highest-value prospects

### 📊 Lead Management
- Save leads to your personal workspace
- Store business info: ratings, reviews, phone numbers, addresses
- Add and manage **custom tags** for organization
- **Bulk delete** or manage saved leads efficiently

### 📞 AI Cold Call Scripts
- Generate **personalized, business-specific** cold-call scripts
- Tailored opening lines and value propositions
- Built-in **objection handling**
- Natural, non-pushy **soft-close strategies**

### 🤖 AI Website Builder Prompts
- Generate detailed, ready-to-use prompts for AI website builders
- Industry-specific design recommendations
- Color palette and branding suggestions
- Structured hero sections, service blocks, CTAs, and brand personality

### 🔐 Authentication & Security
- Email/password authentication
- Google OAuth login
- Secure, production-grade auth via **Supabase**

### 🗺️ Rich Business Data
Every lead includes:

| Field | Description |
|---|---|
| Business Name | Legal/trade name |
| Category | Industry classification |
| Location & Address | Full geographic data |
| Coordinates | Lat/long for mapping |
| Phone Number | Direct contact |
| Rating & Reviews | Social proof metrics |
| Website Status | Has a site or not (key targeting signal) |

---

## 🔄 How It Works

```
   🔍 Search
      ↓
   🏢 Discover Local Businesses
      ↓
   🎯 Identify Businesses Without Websites
      ↓
   💾 Save Leads
      ↓
   📞 Generate AI Outreach Script
      ↓
   🌐 Generate AI Website Prompt
      ↓
   🛠️  Build & Pitch Website
      ↓
   ✅ Convert Lead Into Client
```

Every stage is designed to remove friction — so you spend less time prospecting and more time closing.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite |
| Styling | Tailwind CSS, shadcn/ui |
| Backend / Auth / DB | Supabase |
| AI Engine | Groq API |
| Maps & Business Data | Google Places API |
| Deployment | Vercel |
| Version Control | GitHub |

---

## 🚦 Getting Started

```bash
# Clone the repository
git clone https://github.com/<your-username>/leadora.git
cd leadora

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your Supabase URL/Key, Groq API key, and Google Places API key

# Run locally
npm run dev
```

---

## 🗺️ Roadmap

- [ ] CSV/bulk export for leads
- [ ] Email outreach sequencing
- [ ] CRM-style pipeline view (Kanban)
- [ ] Team/workspace collaboration
- [ ] Multi-language script generation

---

## 📄 License

This project is open for personal and educational use. Contact the author for commercial licensing.

---

<div align="center">

**Built with ❤️ to help freelancers and agencies land more clients.**

[🔗 Try Leadora Live](https://leadora-mu.vercel.app/)

</div>
