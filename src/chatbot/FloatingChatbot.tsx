/**
 * FloatingChatbot — Enterprise AI Tutor widget entry point.
 *
 * Canonical path: src/chatbot/FloatingChatbot.tsx
 * Mounted globally in src/theme/Root.tsx
 *
 * Features:
 *  - Fixed bottom-right FAB with pulse animation
 *  - Dark glassmorphism chat panel
 *  - POST /api/chat → FastAPI RAG backend
 *  - Graceful offline fallback with local KB
 *  - Typewriter streaming, source citations, Urdu mode
 *  - Personalized greeting from auth context
 */
export { default } from '@site/src/components/chatbot/FloatingChatbot';
