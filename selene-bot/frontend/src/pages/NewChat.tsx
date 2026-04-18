import React, { useRef, useEffect, useCallback } from "react";
import { InteractiveMoon, NewChatBranch, VoiceWaveIcon } from "../components/Icons";
import SendIcon from "../components/SendIcon";
import Sidebar from "../components/Sidebar";
import { useChatActions, useChatInfo, useMessages } from "../stores/MainChatStore";
import { useNavigate } from "react-router-dom";
import { useUserData } from "../stores/UserStore";
import { useSidebarActions, useSidebarInfo } from "../stores/SidebarStore";
import { useHotkeys } from 'react-hotkeys-hook'
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition'
import { useAudioVisualizer, VoiceDots } from "../components/VoiceRecorder";
import { motion, AnimatePresence } from 'framer-motion';
import { playStartRecordSound, playStopRecordSound } from "../utils/sounds";
import DynamicGreeting from "../components/DynamicGreeting";
import { useTranslation } from "../../node_modules/react-i18next";

export default function NewChat() {
  const messages = useMessages()
  const { loading, input, hoveredVoiceMode } = useChatInfo()
  const { setInput, newChat, setHoveredVoiceMode } = useChatActions()

  const { t } = useTranslation()

  const userData = useUserData()

  const { sidebarOpen } = useSidebarInfo()
  const { setSidebarOpen } = useSidebarActions()

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const navigate = useNavigate()

  const { transcript, listening, resetTranscript } = useSpeechRecognition();
  
  const { volume, startVisualizer, stopVisualizer } = useAudioVisualizer()

  const theme = localStorage.getItem('theme') || 'dark'

  const SUGGESTIONS = t('newChat.suggestions', { returnObjects: true }) as string[]

  const handleToggle = () => {
    if (listening) {
      playStopRecordSound()
      createChat(transcript);
      SpeechRecognition.stopListening();
      stopVisualizer();
      resetTranscript();
      setHoveredVoiceMode(false);
    } else {
      resetTranscript();
      SpeechRecognition.startListening({ continuous: true, language: 'en-US' });

      setTimeout(() => {
        startVisualizer();
        playStartRecordSound()
      }, 200);
    }
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 168)}px`;
  }, [input]);

  const handleSidebarHotkey = useCallback((event: KeyboardEvent) => {
    event.preventDefault();
    setSidebarOpen(!sidebarOpen);
  }, [sidebarOpen]);

  const createChat = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;

      const chatId = await newChat(text)

      if (chatId) {
        navigate(`/chat/${chatId}`)
      }
    },
    [loading]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      createChat(input);
    }
  };

  useHotkeys('ctrl+x', handleSidebarHotkey)
  useHotkeys('ctrl+k', (e) => {e.preventDefault(); window.location.href = '/recents';})

  return (
    <div
      className="flex h-screen w-full overflow-hidden select-none"
      style={{ background: "var(--color-base-100)", color: "var(--color-base-content)" }}
    >
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-10px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeUp {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes sway {
          0%, 100% { transform: translateX(0) rotate(0deg); }
          50% { transform: translateX(2px) rotate(1deg); }
        }
        .sidebar-enter { animation: slideIn 0.2s ease both; }
        .fadeup { animation: fadeUp 0.4s ease both; }
        .icon-btn { transition: opacity 0.15s; }
        .icon-btn:hover { opacity: 0.65 !important; }
        .branch-decoration { animation: sway 8s ease-in-out infinite; }
      `}</style>

      <Sidebar />

      <div className="flex flex-col flex-1 min-w-0">
        {userData.name && (
          <div className="relative">
            <NewChatBranch />
          </div>
        )}

        <main className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-5">
          {userData.name && (
            <div className="flex flex-col items-center justify-center flex-1 gap-6 text-center max-w-2xl mx-auto w-full">
              {userData.plan === 'free' && <div className={`inter inline-flex items-center gap-1.5 rounded-lg h-8 pl-2 pr-2.5 text-center text-sm 
                            bg-[var(--color-base-400)] text-[var(--color-base-text)] select-none mb-10`}>
              {t(`newChat.${userData.plan}`)} {t('newChat.plan')}
              <div className="size-[3px] bg-[var(--color-base-content)] rounded-full mt-0.5"></div>
              <a
                className={`inline underline underline-offset-[3px] text-[var(--color-base-text)]
                          [&:not(:is(:hover,:focus))]:decoration-[color-mix(in_srgb,currentColor,transparent_60%)] 
                          cursor-pointer`}
                href="/upgrade">
                {t('newChat.upgrade')}
              </a>
            </div>}
              
              {userData.name && <><div className="fadeup w-25 h-25 rounded-full flex items-center justify-center" style={{ animationDelay: '60ms' }}>
                <InteractiveMoon />
              </div>

              <div className="fadeup" style={{ animationDelay: "60ms" }}>
                <DynamicGreeting />
              </div>

              <div className="flex flex-wrap justify-center gap-3 w-full fadeup max-w-2xl mx-auto" style={{ animationDelay: "100ms" }}>
                {SUGGESTIONS.map((s, index) => (
                  <button
                    key={s}
                    onClick={() => createChat(s)}
                    className="inter group relative flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 
                              hover:scale-[1.01] active:scale-[0.99] hover:shadow-[0_8px_20px_-6px_rgba(23,178,164,0.3)]"
                    style={{
                      background: "var(--color-base-200)",
                      color: "var(--color-base-text)",
                      border: "1px solid var(--color-base-300)",
                      animationDelay: `${100 + index * 40}ms`
                    }}
                  >
                    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[rgb(23,178,164)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <span className="relative z-10 opacity-80 group-hover:opacity-100">{s}</span>
                    
                    <svg 
                      className="relative z-10 w-3.5 h-3.5 opacity-0 -translate-x-2 group-hover:opacity-40 group-hover:translate-x-0 transition-all duration-300" 
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                    </svg>
                  </button>
                ))}
              </div></>}

              <div className="w-full fadeup" style={{ animationDelay: "140ms" }}>
                <div
                  onClick={() => textareaRef.current?.focus()}
                  className="relative flex items-end gap-3 rounded-[20px] px-5 py-2.5 max-w-3xl min-h-10 mx-auto transition-border duration-200 shadow-xs border border-[var(--color-outline-2)]/20 hover:focus-within:shadow-sm focus-within:shadow-sm hover:border-[var(--color-base-300)] focus-within:border-[var(--color-base-300)] cursor-text"
                  style={{
                    background: theme === 'light' ? 'rgb(255, 255, 255)' : "var(--color-base-500)",
                  }}
                >
                <textarea
                  ref={textareaRef}
                  rows={1}
                  value={input.length > 0 ? input : transcript || input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={listening ? t('newChat.listeningPlaceholder') : t('newChat.defaultPlaceholder')}
                  className="inter flex-1 bg-transparent resize-none outline-none text-sm mt-[6px] leading-none min-h-[26px] max-h-[168px] text-[var(--color-base-content)] placeholder:text-[var(--color-base-text)] placeholder:opacity-70"
                />
                <motion.div 
                  layout
                  initial={false}
                  animate={{ 
                    width: listening ? 'auto' : '36px',
                  }}
                  className={`relative right-0 bottom-[2px] ${listening ? 'bg-[var(--color-outline)]/10' : ''} flex items-center gap-3 overflow-hidden rounded-lg px-0 h-9 transition-colors`}
                  style={{ paddingLeft: listening ? '10px' : '0', paddingRight: listening ? '10px' : '0' }}
                >
                  <AnimatePresence mode="wait">
                    {!listening && !input.trim() ? (
                      <motion.button
                        key="mic-btn"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleToggle}
                        onMouseEnter={() => !input.trim() && setHoveredVoiceMode(true)}
                        onMouseLeave={() => !input.trim() && setHoveredVoiceMode(false)}
                        className="w-9 h-9 flex items-center justify-center shrink-0"
                      >
                        <VoiceWaveIcon active={hoveredVoiceMode} />
                      </motion.button>
                    ) : !input.trim() ? (
                      <motion.div
                        key="recording-panel"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="flex items-center gap-4 shrink-0"
                      >
                        <VoiceDots volume={volume} isActive={listening} />
                        
                        <button 
                          onClick={handleToggle}
                          className="inter text-sm font-bold text-[var(--color-outline)] transition-colors"
                        >
                          {t('newChat.cancel')}
                        </button>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="send-panel"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="flex items-center gap-4 shrink-0"
                      >
                        <button 
                          onClick={() => createChat(input)}
                          className={`shrink-0 w-9 h-9 rounded-lg text-[var(--color-base-content)] bg-[var(--color-primary)]/75 flex items-center justify-center transition-all hover:bg-[var(--color-primary)]/90 active:scale-95 disabled:opacity-20`}
                        >
                          <SendIcon />
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </main>
      </div>
    </div>
  );
}