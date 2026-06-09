# Agent Guidelines: ReviewPulse

Welcome, coding agent! This document outlines conventions, design patterns, and instructions for working on the ReviewPulse repository.

## 1. Architecture Overview
- **Backend**: Laravel REST APIs. Follow standard Eloquent Model conventions.
- **Frontend**: Next.js App Router. Uses React hooks and custom Tailwind CSS components.

## 2. Key Performance Rules
- **Avoid N+1 Queries**: When loading relationships inside business or review resource loops, use eager loading (e.g., `with('relationshipName')`).
- **Local SQLite DB**: Use `DB_CONNECTION=sqlite` locally to bypass remote MySQL round-trip latency (typically saves 100-300ms per call).

## 3. Deployment & Secrets
- Never commit active `.env` files.
- Keep the `DB_CONNECTION` switch clean so developers and agents can safely test locally before pushing to production.
