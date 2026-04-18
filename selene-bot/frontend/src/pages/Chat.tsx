import { useRef, useEffect, useCallback, useState } from "react";
import MessageBubble from "../components/MessageBubble";
import { SelectChevronDown, StarIcon, StopIcon, VoiceWaveIcon } from "../components/Icons";
import SendIcon from "../components/SendIcon";
import Sidebar from "../components/Sidebar";
import { useChatActions, useChatInfo, useMessages } from "../stores/MainChatStore";
import { useSidebarActions, useSidebarInfo } from "../stores/SidebarStore";
import { useNavigate, useParams } from "react-router-dom";
import { useUserActions } from "../stores/UserStore";
import ChatOptionsDropdown from "../components/ChatOptionsDropdown";
import { useHotkeys } from "react-hotkeys-hook";
import { motion, AnimatePresence } from 'framer-motion';
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import { useAudioVisualizer, VoiceDots } from "../components/VoiceRecorder";
import { playStartRecordSound, playStopRecordSound } from "../utils/sounds";
import { VoiceListeningGlow } from "../components/VoiceListeningGlow";
import { useTranslation } from "../../node_modules/react-i18next";

export default function Chat() {
  const messages = useMessages()
  const { loading, input, botGeneratingId, isEditing, chat, chatOptionsOpen, generatingSource, usedSession, hoveredVoiceMode } = useChatInfo()
  const { setInput, sendPrompt, getChatMessages, checkNewChat, getChat, setChatTitle, setIsEditing, saveInChatRenaming, setChatOptionsOpen, setFavoriteFlag, saveBotMessage, setHoveredVoiceMode } = useChatActions()

  const { sidebarOpen } = useSidebarInfo()
  const { deleteChat, setSidebarOpen } = useSidebarActions()

  const { getUser } = useUserActions()

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const isFetchedData = useRef<boolean>(false);
  const isMessageEffectTriggered = useRef<boolean>(false);
  const chatIdRef = useRef<string>(undefined);

  const params = useParams()

  const navigate = useNavigate();

  const { t } = useTranslation()

  const [editTitle, setEditTitle] = useState(chat.title);
  const chevronRef = useRef<HTMLButtonElement>(null);

  const { transcript, listening, resetTranscript } = useSpeechRecognition();

  const { volume, startVisualizer, stopVisualizer } = useAudioVisualizer()

  const handleToggle = () => {
    if (listening) {
      playStopRecordSound()
      sendMessage(transcript, true);
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
    if (isEditing && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditing]);

  const handleSaveTitle = () => {
    if (editTitle.trim() && editTitle !== chat.title) {
      saveInChatRenaming(chat.chatId, editTitle.trim());
      setChatTitle(editTitle.trim())
    }
    setIsEditing(false);
  };

  const handleTitleClick = () => {
    setEditTitle(chat.title);
    setIsEditing(true);
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

  useEffect(() => {
    if (isFetchedData.current && chatIdRef.current === params.id) return

    setInput('');
    getChatMessages(params.id!)
    getUser()
    getChat(params.id!)

    isFetchedData.current = true;
    chatIdRef.current = params.id;
  }, [params.id])

  useEffect(() => {
    if (!isMessageEffectTriggered.current && messages.length > 0) {
      isNewChatFunc().then(res => {
        if (res) {
          sendMessage(messages.find(message => message.isUser)?.content!, false)
        }
      })

      isMessageEffectTriggered.current = true;
    }
  }, [messages])

  const handleSidebarHotkey = useCallback((event: KeyboardEvent) => {
    event.preventDefault();
    setSidebarOpen(!sidebarOpen);
  }, [sidebarOpen]);

  const isNewChatFunc = useCallback(async () => { const res = await checkNewChat(params.id!); return res }, [params.id])

  const sendMessage = useCallback(
    async (text: string, createUserMessage: boolean) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;

      sendPrompt(params.id!, createUserMessage, text)
      setInput('');
    },
    [loading]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !botGeneratingId) {
      e.preventDefault();
      sendMessage(input, true);
    }
  };

  useHotkeys('ctrl+x', handleSidebarHotkey)
  useHotkeys('ctrl+k', (e) => {e.preventDefault(); window.location.href = '/recents';})

  return (
    <div
      className="inter flex h-screen w-full"
      style={{ background: "var(--color-base-100)", color: "var(--color-base-content)" }}
    >
      <style>{`
      @keyframes slideIn {
        from { opacity: 0; transform: translateX(-10px); }
        to   { opacity: 1; transform: translateX(0); }
      }
      @keyframes fadeUp {
        from { opacity: 0; transform: translateY(12px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      .sidebar-enter { animation: slideIn 0.2s ease both; }
      .fadeup { animation: fadeUp 0.4s ease both; }
      .icon-btn { transition: opacity 0.15s; }
      .icon-btn:hover { opacity: 0.65 !important; }
    `}</style>

      <Sidebar />

      <div className="flex flex-col flex-1 min-w-0">
        <header
          className="flex items-center gap-2 px-4 py-3 border-b shrink-0"
          style={{
            borderColor: "rgba(0, 0, 0, 0.1)",
            background: "var(--color-base-100)",
          }}
        >
          {isEditing ? (
            <input
              ref={titleInputRef}
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleSaveTitle}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === 'Escape') {
                  handleSaveTitle();
                }
              }}
              className="bg-transparent text-sm font-medium outline-none px-2 py-1 rounded-md shadow-md"
              style={{
                color: "var(--color-base-content)",
                border: "1px solid var(--color-outline-2)",
              }}
            />
          ) : (
            <div className="flex items-center min-w-0 flex-1">
              <button
                onClick={handleTitleClick}
                className="inter flex items-center gap-2 min-w-0 px-2 py-1 rounded-md rounded-tr-none rounded-br-none transition-colors"
                style={{
                  color: "var(--color-base-text)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--color-base-400)";
                  e.currentTarget.style.color = "var(--color-base-content)";
                  chevronRef.current!.style.backgroundColor = 'var(--color-base-400)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "var(--color-base-text)";
                  chevronRef.current!.style.backgroundColor = 'transparent';
                }}
              >
                {chat.favorite && (
                  <span style={{ color: "var(--color-warning)", flexShrink: 0 }}>
                    <StarIcon filled />
                  </span>
                )}
                <h1 className="text-sm font-medium truncate">
                  {chat.title || t('chat.untitled')}
                </h1>
              </button>

              <div className="w-[1.5px] h-7"></div>

              <div>
                <button
                  ref={chevronRef}
                  onClick={() => setChatOptionsOpen(!chatOptionsOpen)}
                  className="h-7 w-7 flex items-center justify-center rounded-lg rounded-tl-none rounded-bl-none transition-all duration-200"
                  style={{
                    color: chatOptionsOpen ? "var(--color-base-content)" : "var(--color-base-text)",
                    background: chatOptionsOpen ? "var(--color-base-400)" : "transparent",
                  }}
                  onMouseEnter={(e) => {
                    if (!chatOptionsOpen) {
                      e.currentTarget.style.color = "var(--color-base-content)";
                      e.currentTarget.style.background = "var(--color-base-400)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!chatOptionsOpen) {
                      e.currentTarget.style.color = "var(--color-base-text)";
                      e.currentTarget.style.background = "transparent";
                    }
                  }}
                >
                  <SelectChevronDown />
                </button>

                <div className="relative">
                  {chatOptionsOpen && (
                    <ChatOptionsDropdown
                      chat={chat}
                      triggerRef={chevronRef}
                      onClose={() => setChatOptionsOpen(false)}
                      onRename={() => {
                        setChatOptionsOpen(false);
                        handleTitleClick();
                      }}
                      onDelete={deleteChat}
                      onToggleFavorite={setFavoriteFlag}
                    />
                  )}
                </div>
              </div>
            </div>
          )}
        </header>

        {usedSession && usedSession >= 90 && (
          <div
            className="session-warning shrink-0 mx-4 mt-2.5 px-3 py-2 rounded-[var(--radius-field)] flex items-center gap-2.5 transition-all hover:shadow-sm"
            style={{
              background: "var(--color-base-200)",
              border: "1px solid var(--color-base-300)",
            }}
          >
            <div className="relative shrink-0 w-5 h-5">
              <svg width="20" height="20" viewBox="0 0 20 20" className="transform -rotate-90">
                <circle
                  cx="10"
                  cy="10"
                  r="8"
                  fill="none"
                  stroke="var(--color-base-300)"
                  strokeWidth="2.5"
                />
                <circle
                  cx="10"
                  cy="10"
                  r="8"
                  fill="none"
                  stroke="var(--color-warning)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeDasharray={`${(Math.min(usedSession / 700, 1) * 340.27)} 50.27`}
                  style={{ transition: "stroke-dasharray 0.3s ease" }}
                />
              </svg>
            </div>

            <span className="text-xs flex-1" style={{ color: "var(--color-base-content)", opacity: 0.6 }}>
              {usedSession >= 100 ? t('chat.sessionLimitReached') : t('chat.sessionUsage', { usedSession: usedSession })}
            </span>

            <button
              onClick={() => navigate('/upgrade')}
              className="shrink-0 text-xs font-medium px-2.5 py-1 rounded-[var(--radius-field)] transition-all hover:opacity-80"
              style={{
                color: "var(--color-warning)",
                background: "transparent",
              }}
            >
              {t('chat.upgrade')}
            </button>
          </div>
        )}

        <main className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-5">
          <div className="max-w-3xl mx-auto w-full flex flex-col gap-5">

              {messages.map((m, idx) => <MessageBubble key={idx} msg={m} lastMessageIndex={messages.at(-1)?.messageId!} />)}

            <div ref={bottomRef} />
          </div>
        </main>

        <footer className="shrink-0 px-5 pb-5 pt-2" style={{ background: "var(--color-base-100)" }}>
          <div className="max-w-3xl mx-auto w-full">
            <div
              className="flex items-end gap-3 rounded-[20px] px-4 py-3 min-h-10 transition-border duration-150 border border-[var(--color-outline-2)]/10 hover:border-[var(--color-base-300)] focus-within:border-[var(--color-base-300)]"
              style={{ background: "var(--color-base-200)", position: 'relative', overflow: 'visible' }}
            >
              <VoiceListeningGlow volume={volume} isListening={listening}/>

              <textarea
                ref={textareaRef}
                rows={1}
                value={input.length > 0 ? input : transcript || input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={listening ? t('chat.listeningPlaceholder') : t('chat.replyPlaceholder')}
                className="inter flex-1 bg-transparent resize-none outline-none text-sm mt-[6px] leading-none min-h-[24px] max-h-[168px] px-2 text-[var(--color-base-content)] placeholder:text-[var(--color-base-text)] placeholder:opacity-70"
              />

              <motion.div 
                layout
                initial={false}
                animate={{ 
                  width: listening ? 'auto' : '36px',
                }}
                className={`relative right-1 bottom-[2px] ${listening ? 'bg-[var(--color-outline)]/10' : ''} flex items-center gap-3 overflow-hidden rounded-lg px-0 h-9 transition-colors`}
                style={{ paddingLeft: listening ? '10px' : '0', paddingRight: listening ? '10px' : '0' }}
              >
                <AnimatePresence mode="wait">
                  {!listening && !input.trim() && !botGeneratingId ? (
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
                  ) : !input.trim() && !botGeneratingId ? (
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
                          {t('chat.cancel')}
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
                        onClick={() => {
                          if (!botGeneratingId) {
                            sendMessage(input, true)
                            return
                          }

                          generatingSource?.close()
                          saveBotMessage(messages.find(message => message.messageId === botGeneratingId)!, params.id!)
                        }}
                        disabled={(!botGeneratingId && !loading && !input.trim())}
                        className={`shrink-0 w-9 h-9 rounded-lg text-[var(--color-base-content)] ${botGeneratingId ? 'border border-[var(--color-outline-2)]' : 'bg-[var(--color-primary)]/75'} flex items-center justify-center transition-all ${botGeneratingId ? 'hover:border-transparent hover:bg-[var(--color-base-400)]' : 'hover:bg-[var(--color-primary)]/90'} active:scale-95 disabled:opacity-20`}
                      >
                        {botGeneratingId ? <StopIcon /> : <SendIcon />}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
            <p className="text-center text-xs mt-2" style={{ color: "var(--color-base-text)", opacity: 0.6 }}>
              {t('chat.sendHint')}
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}