import { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSupportActions, useSupportInfo, useSupportMessages } from "../stores/SupportStore";
import { useTranslation } from "../../node_modules/react-i18next";

export default function SupportChat() {
  const messages = useSupportMessages()

  const { message, isTyping, supportChatOpen: isOpen, activeTab, expandedFaq } = useSupportInfo()

  const { setMessages, setMessage, setIsTyping, setSupportChatOpen: onClose, sendSupportMessage, setActiveTab, setExpandedFaq } = useSupportActions()

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { t, i18n } = useTranslation()

  const quickActions = t('supportChat.quickActions', { returnObjects: true }) as string[]
  const faqItems = t('supportChat.faqQuestions', { returnObjects: true }) as { question: string, answer: string }[]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    setMessages([{text: i18n.resolvedLanguage === 'ru' ? "Привет! Я Selene, и я твой помощник. Как я могу тебе помочь?" : "Hi! I'm Selene, your support assistant. How can I help you today?", sender: "support" as const, time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}])
  }, [i18n.resolvedLanguage])

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const newMessage = {
      text: message,
      sender: "user" as const,
      time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages([...messages, newMessage]);
    
    setIsTyping(true);
    const res = await sendSupportMessage();
    setIsTyping(false);
    setMessage('');
    setMessages([
      ...messages,
      {
        text: res ? t('supportChat.messages.success') : t('supportChat.messages.error'),
        sender: "support",
        time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40"
            style={{ background: "rgba(0, 0, 0, 0.3)", backdropFilter: "blur(2px)" }}
            onClick={() => onClose(false)}
          />
 
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ 
              type: "spring",
              damping: 25,
              stiffness: 300,
            }}
            className="inter fixed bottom-6 right-6 z-50 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
            style={{
              width: "400px",
              height: "min(600px, calc(100vh - 48px))",
              maxHeight: "calc(100vh - 48px)",
              background: "var(--color-base-100)",
              border: "1px solid var(--color-base-300)",
            }}
          >
            <style>{`
              @keyframes typing {
                0%, 100% { opacity: 0.3; }
                50% { opacity: 1; }
              }
              .typing-dot {
                animation: typing 1.4s infinite;
              }
              .typing-dot:nth-child(2) {
                animation-delay: 0.2s;
              }
              .typing-dot:nth-child(3) {
                animation-delay: 0.4s;
              }
              .message-fade-in {
                animation: fadeSlideUp 0.3s ease both;
              }
              @keyframes fadeSlideUp {
                from {
                  opacity: 0;
                  transform: translateY(10px);
                }
                to {
                  opacity: 1;
                  transform: translateY(0);
                }
              }
            `}</style>
 
            <div
              className="border-b shrink-0"
              style={{
                background: "var(--color-base-200)",
                borderColor: "var(--color-base-300)",
              }}
            >
              <div className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{
                      background: "linear-gradient(135deg, var(--color-primary), var(--color-secondary))",
                    }}
                  >
                    <img src="/selene_support.png" alt="Selene Support" className="object-cover rounded-xl"/>
                  </div>
                  <div>
                    <p className="font-semibold text-sm merriweather" style={{ color: "var(--color-base-content)" }}>
                      {t('supportChat.header.title')}
                    </p>
                    <p className="text-xs flex items-center gap-1.5" style={{ color: "var(--color-base-text)", opacity: 0.6 }}>
                      {t('supportChat.header.status')}
                    </p>
                  </div>
                </div>
 
                <button
                  onClick={() => onClose(false)}
                  className="p-2 rounded-lg transition-all hover:bg-opacity-70"
                  style={{ color: "var(--color-base-content)", opacity: 0.6 }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "var(--color-base-300)";
                    e.currentTarget.style.opacity = "1";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.opacity = "0.6";
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
 
              <div className="flex px-6">
                <button
                  onClick={() => setActiveTab("chat")}
                  className="flex-1 px-4 py-3 text-sm font-medium transition-all relative"
                  style={{
                    color: "var(--color-base-content)",
                    opacity: activeTab === "chat" ? 1 : 0.6,
                  }}
                  onMouseEnter={(e) => {
                    if (activeTab !== "chat") e.currentTarget.style.opacity = "0.8";
                  }}
                  onMouseLeave={(e) => {
                    if (activeTab !== "chat") e.currentTarget.style.opacity = "0.6";
                  }}
                >
                  {t('supportChat.tabs.chat')}
                  {activeTab === "chat" && (
                    <div
                      className="absolute bottom-0 left-0 right-0 h-0.5"
                      style={{ background: "var(--color-base-content)" }}
                    />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("faq")}
                  className="flex-1 px-4 py-3 text-sm font-medium transition-all relative"
                  style={{
                    color: "var(--color-base-content)",
                    opacity: activeTab === "faq" ? 1 : 0.6,
                  }}
                  onMouseEnter={(e) => {
                    if (activeTab !== "faq") e.currentTarget.style.opacity = "0.8";
                  }}
                  onMouseLeave={(e) => {
                    if (activeTab !== "faq") e.currentTarget.style.opacity = "0.6";
                  }}
                >
                  {t('supportChat.tabs.faq')}
                  {activeTab === "faq" && (
                    <div
                      className="absolute bottom-0 left-0 right-0 h-0.5"
                      style={{ background: "var(--color-base-content)" }}
                    />
                  )}
                </button>
              </div>
            </div>
 
            <div className="flex-1 overflow-y-auto" style={{ background: "var(--color-base-100)" }}>
              {activeTab === "chat" ? (
                <div className="px-6 py-4 space-y-4">
                  {messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"} message-fade-in`}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div
                        className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                          msg.sender === "user" ? "rounded-br-sm" : "rounded-bl-sm"
                        }`}
                        style={{
                          background:
                            msg.sender === "user"
                              ? "var(--color-primary)"
                              : "var(--color-base-200)",
                          color:
                            msg.sender === "user"
                              ? "var(--color-primary-content)"
                              : "var(--color-base-content)",
                        }}
                      >
                        <p className="text-sm leading-relaxed">{msg.text}</p>
                        <p
                          className="text-xs mt-1"
                          style={{ opacity: 0.6 }}
                        >
                          {msg.time}
                        </p>
                      </div>
                    </div>
                  ))}
 
                  {isTyping && (
                    <div className="flex justify-start">
                      <div
                        className="px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-1"
                        style={{
                          background: "var(--color-base-200)",
                        }}
                      >
                        <div
                          className="w-2 h-2 rounded-full typing-dot"
                          style={{ background: "var(--color-base-content)", opacity: 0.6 }}
                        />
                        <div
                          className="w-2 h-2 rounded-full typing-dot"
                          style={{ background: "var(--color-base-content)", opacity: 0.6 }}
                        />
                        <div
                          className="w-2 h-2 rounded-full typing-dot"
                          style={{ background: "var(--color-base-content)", opacity: 0.6 }}
                        />
                      </div>
                    </div>
                  )}
 
                  <div ref={messagesEndRef} />
                </div>
              ) : (
                <div className="px-6 py-4 space-y-3">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-1" style={{ color: "var(--color-base-content)" }}>
                      {t('supportChat.faq.title')}
                    </h3>
                    <p className="text-sm" style={{ color: "var(--color-base-content)", opacity: 0.6 }}>
                      {t('supportChat.faq.subtitle')}
                    </p>
                  </div>
 
                  {faqItems.map((item, index) => (
                    <div
                      key={index}
                      className="rounded-xl overflow-hidden transition-all"
                      style={{
                        background: "var(--color-base-200)",
                        border: "1px solid var(--color-base-300)",
                      }}
                    >
                      <button
                        onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                        className="w-full px-4 py-3 flex items-center justify-between text-left transition-all"
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "var(--color-base-250)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "transparent";
                        }}
                      >
                        <span className="text-sm font-medium pr-4" style={{ color: "var(--color-base-content)" }}>
                          {item.question}
                        </span>
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="shrink-0 transition-transform duration-200"
                          style={{
                            transform: expandedFaq === index ? "rotate(180deg)" : "rotate(0deg)",
                            color: "var(--color-base-content)",
                            opacity: 0.6,
                          }}
                        >
                          <path d="M6 9l6 6 6-6" />
                        </svg>
                      </button>
                      
                      <div
                        style={{
                          maxHeight: expandedFaq === index ? "500px" : "0",
                          overflow: "hidden",
                          transition: "max-height 0.3s ease",
                        }}
                      >
                        <div
                          className="px-4 pb-3 pt-1 text-sm leading-relaxed"
                          style={{
                            color: "var(--color-base-content)",
                            opacity: 0.8,
                            borderTop: "1px solid var(--color-base-300)",
                          }}
                        >
                          {item.answer}
                        </div>
                      </div>
                    </div>
                  ))}
 
                  <div
                    className="mt-6 p-4 rounded-xl text-center"
                    style={{
                      background: "var(--color-base-200)",
                      border: "1px solid var(--color-base-300)",
                    }}
                  >
                    <p className="text-sm mb-3" style={{ color: "var(--color-base-content)", opacity: 0.7 }}>
                      {t('supportChat.faq.stillHaveQuestions')}
                    </p>
                    <button
                      onClick={() => setActiveTab("chat")}
                      className="px-4 py-1.5 rounded-lg text-sm transition-all hover:opacity-90"
                      style={{
                        background: "var(--color-base-content)",
                        color: "var(--color-base-400)",
                        fontWeight: 500
                      }}
                    >
                      {t('supportChat.faq.chatWithSupport')}
                    </button>
                  </div>
                </div>
              )}
            </div>
 
            {activeTab === "chat" && (
              <div
                className="px-6 py-3 border-t flex gap-2 overflow-x-auto shrink-0"
                style={{
                  background: "var(--color-base-100)",
                  borderColor: "var(--color-base-300)",
                }}
              >
                {quickActions.map((action) => (
                  <button
                    key={action}
                    onClick={() => setMessage(`${t('supportChat.input.needHelpWith')} ${action.toLowerCase()}`)}
                    className="px-3 py-1.5 rounded-full text-xs font-medium transition-all hover:scale-105 whitespace-nowrap"
                    style={{
                      background: "var(--color-base-200)",
                      color: "var(--color-base-content)",
                      border: "1px solid var(--color-base-300)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "var(--color-base-300)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "var(--color-base-200)";
                    }}
                  >
                    {action}
                  </button>
                ))}
              </div>
            )}
 
            {activeTab === "chat" && (
              <>
                <div
                  className="flex items-end gap-2 px-2 ml-2 mr-2 py-2 rounded-xl"
                  style={{
                    background: "var(--color-base-200)",
                    border: "1px solid var(--color-base-300)",
                  }}
                >
                  <textarea
                    ref={inputRef}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={t('supportChat.input.placeholder')}
                    rows={1}
                    className="flex-1 bg-transparent resize-none outline-none text-sm placeholder:select-none px-2 py-2 leading-5"
                    style={{
                      color: "var(--color-base-content)",
                      maxHeight: "100px",
                    }}
                    onInput={(e) => {
                      const target = e.target as HTMLTextAreaElement;
                      target.style.height = "auto";
                      target.style.height = `${Math.min(target.scrollHeight, 100)}px`;
                    }}
                  />

                  <button
                    onClick={handleSendMessage}
                    disabled={!message.trim()}
                    className="p-2 rounded-lg transition-all hover: active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                    style={{
                      background: message.trim() ? "var(--color-base-text)" : "var(--color-base-300)",
                      color: message.trim() ? "var(--color-base-400)" : "var(--color-base-content)",
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                    </svg>
                  </button>
                </div>
                <p
                  className="text-xs mt-2 mb-2 text-center"
                  style={{ color: "var(--color-base-content)", opacity: 0.4 }}
                >
                  {t('supportChat.replyTime')}
                </p>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}