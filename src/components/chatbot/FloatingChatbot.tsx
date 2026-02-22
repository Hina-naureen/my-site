/**
 * FloatingChatbot — Physical AI Textbook AI Tutor
 *
 * Canonical path: src/components/chatbot/FloatingChatbot.tsx
 * Mounted globally via src/theme/Root.tsx (swizzled Root wrapper)
 *
 * Features:
 *  - Fixed bottom-right FAB with pulse + glow animation
 *  - Dark glassmorphism chat panel
 *  - POST /api/chat → FastAPI RAG backend
 *  - Graceful offline fallback with local knowledge base
 *  - Typewriter streaming effect on bot replies
 *  - Source citations from RAG retrieval
 *  - Urdu / English toggle
 *  - Personalized greeting from AuthContext
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import styles from './FloatingChatbot.module.css';
import { useAuth } from '@site/src/components/auth/AuthContext';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Message {
  id: number;
  role: 'user' | 'bot';
  text: string;
  time: string;
  sources?: { title: string; path: string; excerpt: string }[];
  mode?: 'rag' | 'fallback';
}

type ConnStatus = 'checking' | 'online' | 'offline';

// ── Constants ─────────────────────────────────────────────────────────────────

const API_URL = 'http://localhost:8000/api/chat';

const SUGGESTIONS_EN = [
  'What is Physical AI?',
  'Explain ROS 2 nodes',
  'What is NVIDIA Isaac?',
  'VLA model overview',
];

const SUGGESTIONS_UR = [
  'فزیکل AI کیا ہے؟',
  'ROS 2 کی وضاحت کریں',
  'NVIDIA Isaac کیا ہے؟',
];

// ── Fallback knowledge base (offline mode) ────────────────────────────────────

const FALLBACK_KB = [
  {
    kw: ['hello', 'hi', 'hey'],
    ans: "Hello! I'm your Physical AI & Robotics textbook assistant. Ask me about any module — ROS 2, NVIDIA Isaac, VLA models, simulation, or the capstone project.",
  },
  {
    kw: ['physical ai', 'what is this', 'course', 'overview'],
    ans: 'Physical AI is AI that operates in the physical world — humanoid robots, autonomous vehicles, and robotic arms. This textbook covers the full stack: sensors → ROS 2 → simulation → VLA models.',
  },
  {
    kw: ['ros', 'ros2', 'robot operating system', 'nodes', 'topics'],
    ans: 'ROS 2 is the middleware connecting sensors, actuators, and compute. Module 2 covers nodes, topics, services, actions, and the Nav2 navigation stack.',
  },
  {
    kw: ['vla', 'vision language', 'action model', 'llm planning'],
    ans: 'VLA (Vision-Language-Action) models combine vision + language to produce robot actions. Module 5 covers VLA architecture, Whisper voice control, and LLM-to-ROS planning bridges.',
  },
  {
    kw: ['isaac', 'nvidia isaac', 'synthetic data', 'vslam'],
    ans: 'NVIDIA Isaac Sim is a photorealistic robot simulator for generating synthetic training data. Module 4 covers Isaac Sim setup, data pipelines, and Isaac ROS VSLAM.',
  },
  {
    kw: ['gazebo', 'simulation', 'digital twin', 'unity'],
    ans: 'Module 3 covers Gazebo for robot simulation (digital twins) and Unity for visualization. Sim-to-real transfer is a core topic.',
  },
  {
    kw: ['sensor', 'lidar', 'camera', 'imu', 'perception'],
    ans: 'Module 1: Foundations covers the sensor stack — LiDAR, depth cameras, IMUs, GPS. Explains raw data → perception pipeline.',
  },
  {
    kw: ['capstone', 'project', 'humanoid', 'autonomous'],
    ans: 'Module 6 — Capstone: Build an autonomous humanoid robot integrating ROS 2, VLA models, and NVIDIA Isaac.',
  },
  {
    kw: ['help', 'topics', 'what can you do'],
    ans: 'I can answer questions about:\n• Physical AI & Robotics fundamentals\n• ROS 2 (nodes, topics, Nav2)\n• NVIDIA Isaac Sim & VSLAM\n• VLA / LLM planning\n• Gazebo simulation\n• Sensors & perception\n• The capstone project\n\nConnect the backend for AI-powered answers!',
  },
];

function fallbackAnswer(query: string): { text: string; sources: [] } {
  const q = query.toLowerCase();
  let best = 0;
  let answer =
    "I'm your Physical AI textbook assistant! Ask about ROS 2, NVIDIA Isaac, VLA models, simulation, sensors, or the capstone project.";
  for (const entry of FALLBACK_KB) {
    const score = entry.kw.reduce(
      (s, k) => s + (q.includes(k) ? k.split(' ').length * 2 : 0),
      0,
    );
    if (score > best) {
      best = score;
      answer = entry.ans;
    }
  }
  return { text: answer, sources: [] };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getTime(): string {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function levelGreeting(level: string, name: string): string {
  const n = name.split(' ')[0];
  if (level === 'beginner') return `Hi ${n}! I'll keep explanations simple and clear.`;
  if (level === 'expert') return `Welcome back, ${n}. Ask me anything — I'll go deep.`;
  return `Hi ${n}! I'll tailor answers to your intermediate level.`;
}

// ── Typewriter hook ───────────────────────────────────────────────────────────

function useTypewriter() {
  const [content, setContent] = useState<Record<number, string>>({});
  const timers = useRef<Record<number, ReturnType<typeof setInterval>>>({});

  const stream = useCallback((id: number, text: string) => {
    if (timers.current[id]) clearInterval(timers.current[id]);
    let i = 0;
    timers.current[id] = setInterval(() => {
      i += 5;
      setContent(prev => ({ ...prev, [id]: text.slice(0, i) }));
      if (i >= text.length) {
        clearInterval(timers.current[id]);
        delete timers.current[id];
        setContent(prev => ({ ...prev, [id]: text }));
      }
    }, 14);
  }, []);

  useEffect(() => () => Object.values(timers.current).forEach(clearInterval), []);

  return { content, stream };
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function FloatingChatbot(): React.JSX.Element {
  const { user } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [hasUnread, setHasUnread] = useState(false);
  const [connStatus, setConnStatus] = useState<ConnStatus>('checking');
  const [history, setHistory] = useState<{ role: string; content: string }[]>([]);
  const [urduMode, setUrduMode] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const nextId = useRef(1);
  const isOpenRef = useRef(isOpen);
  const { content: twContent, stream } = useTypewriter();

  // Keep ref in sync
  useEffect(() => { isOpenRef.current = isOpen; }, [isOpen]);

  // Personalised welcome
  useEffect(() => {
    const welcome: Message = {
      id: nextId.current++,
      role: 'bot',
      time: getTime(),
      text: user
        ? levelGreeting(user.background_level, user.name)
        : "Hello! I'm your Physical AI & Robotics tutor.\nAsk me about any module — ROS 2, NVIDIA Isaac, VLA, or the capstone project.",
    };
    setMessages([welcome]);
  }, [user?.id]);

  // Probe backend
  useEffect(() => {
    let cancelled = false;
    fetch('http://localhost:8000/health', { signal: AbortSignal.timeout(3000) })
      .then(r => { if (!cancelled) setConnStatus(r.ok ? 'online' : 'offline'); })
      .catch(() => { if (!cancelled) setConnStatus('offline'); });
    return () => { cancelled = true; };
  }, []);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, twContent]);

  // Focus + clear unread on open
  useEffect(() => {
    if (isOpen) {
      setHasUnread(false);
      const t = setTimeout(() => inputRef.current?.focus(), 280);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  // ── Send ────────────────────────────────────────────────────────────────────

  const sendMessage = useCallback(async (text?: string) => {
    const msgText = (text ?? input).trim();
    if (!msgText || isTyping) return;

    setShowSuggestions(false);
    const userMsg: Message = { id: nextId.current++, role: 'user', text: msgText, time: getTime() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    const newHistory = [...history, { role: 'user', content: msgText }];

    try {
      let result: { answer: string; sources: { title: string; path: string; excerpt: string }[]; mode: string };

      if (connStatus === 'online') {
        const res = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: msgText,
            history: history.slice(-6),
            user_level: user?.background_level ?? 'intermediate',
            language: urduMode ? 'ur' : 'en',
          }),
          signal: AbortSignal.timeout(15000),
        });
        if (!res.ok) throw new Error('Backend error');
        result = await res.json();
      } else {
        await new Promise(r => setTimeout(r, 600 + Math.random() * 300));
        const fb = fallbackAnswer(msgText);
        result = { answer: fb.text, sources: fb.sources, mode: 'fallback' };
      }

      const botId = nextId.current++;
      const botMsg: Message = {
        id: botId,
        role: 'bot',
        text: result.answer,
        time: getTime(),
        sources: result.sources,
        mode: result.mode as 'rag' | 'fallback',
      };
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
      stream(botId, result.answer);
      setHistory([...newHistory, { role: 'assistant', content: result.answer }]);
      if (!isOpenRef.current) setHasUnread(true);
    } catch {
      const errId = nextId.current++;
      setMessages(prev => [
        ...prev,
        {
          id: errId,
          role: 'bot',
          text: "Couldn't reach the AI backend. Make sure `uvicorn main:app` is running on port 8000.",
          time: getTime(),
          mode: 'fallback',
        },
      ]);
      setIsTyping(false);
      setConnStatus('offline');
    }
  }, [input, isTyping, history, connStatus, user, urduMode, stream]);

  const clearChat = useCallback(() => {
    setMessages([{
      id: nextId.current++,
      role: 'bot',
      time: getTime(),
      text: 'Chat cleared! Ask me anything about the Physical AI textbook.',
    }]);
    setHistory([]);
    setShowSuggestions(true);
    setInput('');
  }, []);

  // ── Derived ─────────────────────────────────────────────────────────────────

  const statusLabel =
    connStatus === 'online' ? 'AI Online · RAG'
    : connStatus === 'checking' ? 'Connecting…'
    : 'Offline · Local KB';

  const statusColor =
    connStatus === 'online' ? '#22c55e'
    : connStatus === 'checking' ? '#f59e0b'
    : '#94a3b8';

  const suggestions = urduMode ? SUGGESTIONS_UR : SUGGESTIONS_EN;

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── Chat Panel ─────────────────────────────────────────────────────── */}
      <div
        className={`${styles.chatPanel} ${isOpen ? styles.open : ''}`}
        role="dialog"
        aria-label="Physical AI Textbook Chatbot"
        aria-modal="true"
      >
        {/* Header */}
        <div className={styles.panelHeader}>
          <div className={styles.headerLeft}>
            <div className={styles.botAvatar} aria-hidden="true">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2L14.4 8.6L21.5 9.3L16.5 14L18 21L12 17.5L6 21L7.5 14L2.5 9.3L9.6 8.6L12 2Z"
                  stroke="rgba(255,255,255,0.95)" strokeWidth="1.6" strokeLinejoin="round"
                  fill="rgba(255,255,255,0.12)"
                />
              </svg>
            </div>
            <div>
              <div className={styles.botName}>
                PhysAI Tutor
                {user && (
                  <span style={{ fontSize: '0.65rem', opacity: 0.7, marginLeft: '0.4rem' }}>
                    · {user.name.split(' ')[0]}
                  </span>
                )}
              </div>
              <div className={styles.botStatus}>
                <span className={styles.statusDot} style={{ background: statusColor }} aria-hidden="true" />
                <span style={{ color: statusColor }}>{statusLabel}</span>
              </div>
            </div>
          </div>

          <div className={styles.headerActions}>
            {connStatus === 'online' && (
              <span className={styles.ragBadge} title="Retrieval-Augmented Generation">RAG</span>
            )}
            <button
              className={styles.clearBtn}
              onClick={() => setUrduMode(p => !p)}
              title={urduMode ? 'Switch to English' : 'Switch to Urdu'}
              aria-label="Toggle language"
              style={{ fontSize: '0.65rem', padding: '0 0.4rem', minWidth: 28 }}
            >
              {urduMode ? 'EN' : 'اردو'}
            </button>
            <button className={styles.clearBtn} onClick={clearChat} title="Clear conversation" aria-label="Clear chat">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M3 6h18M8 6V4h8v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button className={styles.closeBtn} onClick={() => setIsOpen(false)} aria-label="Close chat">
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className={styles.messages} role="log" aria-live="polite">
          {messages.map(msg => (
            <div key={msg.id} className={`${styles.message} ${styles[msg.role]}`}>
              {msg.role === 'bot' && (
                <div className={styles.msgAvatar} aria-hidden="true">
                  <span className={styles.avatarInitials}>AI</span>
                </div>
              )}
              <div className={styles.msgContent}>
                <div className={styles.bubble}>
                  {twContent[msg.id] !== undefined ? twContent[msg.id] : msg.text}
                  {twContent[msg.id] !== undefined && twContent[msg.id] !== msg.text && (
                    <span className={styles.typingCursor} aria-hidden="true" />
                  )}
                </div>

                {/* Source citations */}
                {msg.sources && msg.sources.length > 0 && twContent[msg.id] === msg.text && (
                  <div className={styles.sourcesList}>
                    {msg.sources.slice(0, 2).map((s, i) => (
                      <div key={i} className={styles.sourceTag} title={s.excerpt}>
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                            stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                          <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                        </svg>
                        {s.title}
                      </div>
                    ))}
                    {msg.mode === 'fallback' && (
                      <span style={{ fontSize: '0.65rem', color: '#64748b', marginLeft: '0.3rem' }}>
                        (offline mode)
                      </span>
                    )}
                  </div>
                )}

                <div className={styles.msgMeta}>
                  <span className={styles.timestamp}>{msg.time}</span>
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className={`${styles.message} ${styles.bot}`} aria-label="Bot is thinking">
              <div className={styles.msgAvatar} aria-hidden="true">
                <span className={styles.avatarInitials}>AI</span>
              </div>
              <div className={styles.msgContent}>
                <div className={`${styles.bubble} ${styles.typingBubble}`}>
                  <span className={styles.dot} />
                  <span className={styles.dot} />
                  <span className={styles.dot} />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Suggestion chips */}
        {showSuggestions && (
          <div className={styles.suggestions} role="group" aria-label="Suggested questions">
            {suggestions.map(s => (
              <button key={s} className={styles.chip} onClick={() => sendMessage(s)}>
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className={styles.inputRow}>
          <input
            ref={inputRef}
            className={styles.input}
            type="text"
            placeholder={urduMode ? 'سوال پوچھیں…' : 'Ask about any textbook topic…'}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            disabled={isTyping}
            aria-label="Chat input"
            dir={urduMode ? 'rtl' : 'ltr'}
          />
          <button
            className={styles.sendBtn}
            onClick={() => sendMessage()}
            disabled={isTyping || !input.trim()}
            aria-label="Send message"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M22 2L11 13" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Footer */}
        <div className={styles.panelFooter} aria-hidden="true">
          {connStatus === 'online'
            ? '⚡ Powered by LangChain RAG + ChromaDB'
            : '📚 Offline — connect FastAPI backend for AI answers'}
        </div>
      </div>

      {/* ── FAB ────────────────────────────────────────────────────────────── */}
      <button
        className={`${styles.fab} ${isOpen ? styles.fabOpen : ''}`}
        onClick={() => setIsOpen(prev => !prev)}
        aria-label={isOpen ? 'Close chat' : 'Open PhysAI Tutor'}
        aria-expanded={isOpen}
      >
        <span className={styles.fabIcon}>
          {isOpen ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M18 6L6 18M6 6L18 18" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M21 15C21 15.53 20.79 16.04 20.41 16.41C20.04 16.79 19.53 17 19 17H7L3 21V5C3 4.47 3.21 3.96 3.59 3.59C3.96 3.21 4.47 3 5 3H19C19.53 3 20.04 3.21 20.41 3.59C20.79 3.96 21 4.47 21 5V15Z"
                stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              />
            </svg>
          )}
        </span>
        {!isOpen && <span className={styles.fabPulse} aria-hidden="true" />}
        {!isOpen && <span className={styles.fabGlow} aria-hidden="true" />}
        {hasUnread && !isOpen && <span className={styles.unreadDot} aria-label="New message" />}
      </button>
    </>
  );
}
