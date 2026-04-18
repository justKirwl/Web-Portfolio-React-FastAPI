import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useChatActions, useChatInfo, useMessages } from "../stores/MainChatStore";
import type { Message } from "../utils/mainChatTypes";
import { AIBall, CopyIcon, DislikeIcon, LikeIcon, RetryIcon, EditIcon, MessageCheckMark, BrainIcon, CircleCheckMarkIcon, ArrowRightIcon, LoaderIcon, InfoIcon } from "./Icons";
import FeedbackModal from "./MessageFeedbackModal";
import { useTranslation } from "../../node_modules/react-i18next";

export default function MessageBubble({msg, lastMessageIndex}: { msg: Message, lastMessageIndex: string }) {
  const messages = useMessages()
  const { savingMessageId, savedMessageId, botGeneratingId, isMessageCopiedId, editedContent } = useChatInfo()

  const params = useParams()

  const { setMessageCopiedId, setFeedbackModalOpen, setFeedbackType, regenerateResponse, setEditedContent, saveEditedMessage } = useChatActions()

  const [isThinkingExpanded, setIsThinkingExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const editTextareaRef = useRef<HTMLTextAreaElement>(null);

  const { t } = useTranslation()
 
  const isThinking = botGeneratingId === msg.messageId && !msg.isUser && !msg.content;
  const isWorking = botGeneratingId === msg.messageId && !msg.isUser && msg.content;
  const showThinkingBadge = !msg.isUser && !isThinking && !isWorking && msg.content;
 
  useEffect(() => {
    if (isEditing && editTextareaRef.current) {
      editTextareaRef.current.focus();
      editTextareaRef.current.style.height = 'auto';
      editTextareaRef.current.style.height = `${editTextareaRef.current.scrollHeight}px`;
    }
  }, [isEditing]);
 
  const handleEditClick = () => {
    setEditedContent(msg.content);
    setIsEditing(true);
  };
 
  const handleSaveEdit = async () => {
    if (editedContent.trim() && editedContent !== msg.content) {
      await regenerateResponse(messages.indexOf(msg), params.id!, true)

      saveEditedMessage(msg.messageId)
    }
    setIsEditing(false);
  };
 
  const handleCancelEdit = () => {
    setEditedContent(msg.content);
    setIsEditing(false);
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', { 
      day: '2-digit',
      month: 'short',
    });
  };

  const handleLikeClick = () => {
      setFeedbackType("positive");
      setFeedbackModalOpen(true);
  };

  const handleDislikeClick = () => {
      setFeedbackType("negative");
      setFeedbackModalOpen(true);
  };

  return (
    <div className={`flex gap-3 ${msg.isUser ? "justify-end" : "justify-start"} group relative`}>
      <style>{`
        @keyframes pulse-glow {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.05); }
        }
        @keyframes expandDown {
          from { 
            opacity: 0; 
            transform: translateY(-10px);
            max-height: 0;
          }
          to { 
            opacity: 1; 
            transform: translateY(0);
            max-height: 300px;
          }
        }
        @keyframes collapseUp {
          from { 
            opacity: 1; 
            transform: translateY(0);
            max-height: 300px;
          }
          to { 
            opacity: 0; 
            transform: translateY(-10px);
            max-height: 0;
          }
        }
        @keyframes rotateChevron {
          from { transform: rotate(0deg); }
          to { transform: rotate(90deg); }
        }
        .thinking-animation {
          animation: pulse-glow 2s ease-in-out infinite;
        }
        .expand-down {
          animation: expandDown 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .collapse-up {
          animation: collapseUp 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .chevron-rotate {
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .chevron-rotated {
          transform: rotate(360deg);
        }
      `}</style>

      <FeedbackModal messageId={msg.messageId}/>

      <div className={`max-w-[70%] flex flex-col gap-2 ${msg.isUser ? "items-end" : "items-start"}`}>
        {isThinking && botGeneratingId === msg.messageId && (
          <div className="flex items-center gap-1.5">
            <BrainIcon className="shrink-0 text-[var(--color-base-content)] opacity-90"/>
            <span
              className="text-xs font-medium"
              style={{
                color: "var(--color-base-content)",
                opacity: 0.8,
                backgroundImage:
                  "linear-gradient(20deg, var(--color-base-content) 0%, #fff 50%, var(--color-base-300) 100%)",
                backgroundSize: "200% auto",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                animation: "shimmer 4s infinite",
              }}
            >
              {t('messageBubble.states.thinking')}
            </span>
          </div>
        )}
        {isWorking && botGeneratingId === msg.messageId && (
          <div className="flex items-center gap-1.5">
            <EditIcon className="shrink-0 text-[var(--color-base-content)] opacity-90"/>
            <span
              className="text-xs font-medium"
              style={{
                color: "var(--color-base-content)",
                opacity: 0.8,
                backgroundImage:
                  "linear-gradient(20deg, var(--color-base-content) 0%, #fff 50%, var(--color-base-300) 100%)",
                backgroundSize: "200% auto",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                animation: "shimmer 4s infinite",
              }}
            >
              {t('messageBubble.states.working')}
            </span>
          </div>
        )}
        {showThinkingBadge && (
          <div className="flex flex-col gap-2 w-full">
            <button
              onClick={() => setIsThinkingExpanded(!isThinkingExpanded)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all hover:bg-opacity-80 group/badge"
            >
              <div className="mr-3">
                <ArrowRightIcon className={`absolute top-[7px] ${isThinkingExpanded ? 'rotate-[0deg]' : 'rotate-[-90deg]'}`}/>
                <LoaderIcon className="absolute top-[7px]"/>
              </div>

              <span className="text-xs font-medium" style={{ color: "var(--color-base-text)" }}>
                {msg.thinkingTime! >= 10 ? t('messageBubble.badges.thoughtForMoment') : t('messageBubble.badges.thoughtForSeconds', { seconds: msg.thinkingTime })}
              </span>
            </button>

            {isThinkingExpanded && (
              <div
                className="expand-down flex flex-col gap-10 px-4 py-3 rounded-lg overflow-hidden"
                style={{
                  marginTop: "-8px",
                  paddingTop: "12px",
                }}
              >
                <div className="relative">
                  <div className="flex items-start gap-2.5">
                    <BrainIcon className="shrink-0 text-[var(--color-base-text)] mt-0.5 opacity-50"/>
                    <div className="flex-1">
                      <p className="inter text-sm font-medium mb-1" style={{ color: "var(--color-base-content)" }}>
                        {t('messageBubble.details.thinkingTitle')}
                      </p>
                      <p className="text-xs leading-relaxed" style={{ color: "var(--color-base-content)", opacity: 0.6 }}>
                        {t('messageBubble.details.thinkingDescription')}
                      </p>
                    </div>
                  </div>

                  <div className="absolute top-7 w-px h-12 ml-2" style={{ background: "var(--color-base-text)", opacity: 0.3 }} />
                </div>

                <div className="relative">
                  <div className="flex items-start gap-2.5">
                    <EditIcon className="shrink-0 text-[var(--color-base-text)] opacity-50"/>
                    <div className="flex-1">
                      <p className="inter text-sm font-medium mb-1" style={{ color: "var(--color-base-content)" }}>
                        {t('messageBubble.details.workingTitle')}
                      </p>
                      <p className="text-xs leading-relaxed" style={{ color: "var(--color-base-content)", opacity: 0.6 }}>
                        {t('messageBubble.details.workingDescription')}
                      </p>
                    </div>
                  </div>

                  <div className="absolute top-7 w-px h-12 ml-2" style={{ background: "var(--color-base-text)", opacity: 0.3 }} />
                </div>

                <div className="flex items-start gap-2.5">
                  <CircleCheckMarkIcon className="shrink-0 text-[var(--color-base-text)] opacity-50"/>
                  <div className="flex-1">
                    <p className="inter text-sm font-medium mb-1" style={{ color: "var(--color-base-content)" }}>
                      {t('messageBubble.states.done')}
                    </p>
                    <p className="text-xs leading-relaxed" style={{ color: "var(--color-base-content)", opacity: 0.6 }}>
                      {t('messageBubble.details.doneDescription')}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {!isThinking && <div className="relative w-full">
          {msg.isUser && isEditing ? (
            <div className="px-3 py-3 text-sm leading-relaxed whitespace-pre-wrap break-words bg-[var(--color-base-400)] rounded-lg">
              <textarea onChange={(e) => setEditedContent(e.target.value)} className="rounded-lg border border-[var(--color-base-300)] outline-none w-full px-3 py-2 bg-[var(--color-base-500)] resize-none transition-all hover:border-[var(--color-outline-2)] focus:shadow-xs focus:shadow-blue-300 focus:border-[var(--color-outline)]">{editedContent}</textarea>
              <div className="flex">
                <div className="flex gap-1.5">
                  <InfoIcon className="text-[var(--color-base-text)] h-3.5 w-3.5"/>
                  <span className="text-xs text-[var(--color-base-text)]">{t('messageBubble.editing.warning')}</span>
                </div>
                <div className="flex gap-1.5">
                  <button onClick={handleCancelEdit} className="inline-flex justify-center items-center shrink-0 select-none min-w-[5rem] whitespace-nowrap border px-4 py-2 h-9 border-[var(--color-outline-2)] bg-[var(--color-base-200)] text-sm font-medium transition-all duration-200 rounded-lg hover:bg-black hover:border-transparent active:scale-[0.985]">
                    {t('messageBubble.editing.cancel')}
                  </button>
                  <button onClick={handleSaveEdit} disabled={msg.content === editedContent} className="inline-flex justify-center items-center shrink-0 select-none bg-[var(--color-base-content)] font-medium text-[var(--color-base-400)] text-sm backface-hidden after:absolute after:inset-0 after:bg-[radial-gradient(at_bottom,hsla(var(--bg-000)/20%),hsla(var(--bg-000)/0%))] after:opacity-0 after:transition after:duration-200 after:translate-y-2 hover:after:opacity-100 hover:after:translate-y-0 transition-transform will-change-transform duration-150 ease-[cubic-bezier(0.165,0.85,0.45,1)] hover:scale-x-[1.015] hover:scale-y-[1.005] h-9 px-4 py-2 rounded-lg min-w-[5rem] active:scale-[0.985] whitespace-nowrap disabled:scale-100">
                    {t('messageBubble.editing.save')}
                  </button>
                </div>
              </div>
            </div>
          ) :
          <div
            className="px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap break-words"
            style={
              msg.isUser
                ? {
                    background: "var(--color-base-400)",
                    color: "var(--color-base-content)",
                    borderRadius: "var(--radius-box) var(--radius-box) 4px var(--radius-box)",
                  }
                : {
                    background: "var(--color-base-200)",
                    color: "var(--color-base-content)",
                    border: "1px solid var(--color-base-300)",
                    borderRadius: "var(--radius-box) var(--radius-box) var(--radius-box) 4px",
                  }
            }
          >
            {!msg.content && !botGeneratingId ? (
              <div className="flex items-center gap-1.5 rounded-lg py-1 px-2">
                <button
                  onClick={() => regenerateResponse(messages.indexOf(msg), params.id!, false)}
                  className="py-1 px-1.5 rounded-md text-[var(--color-base-content)] transition-all hover:bg-[var(--color-outline)]/15 hover:text-[var(--color-outline)] active:scale-95"
                  style={{ opacity: 0.5 }}
                  onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.8"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.opacity = "0.5"; }}
                  title={t('messageBubble.retry.title')}
                >
                  <RetryIcon />
                </button>
                <span className="text-xs text-[var(--color-base-text)] merriweather">
                  {t('messageBubble.retry.message')}
                </span>
              </div>
            ) : (
              <span>
                {msg.content}
                {isWorking && botGeneratingId === msg.messageId && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="inline-block h-2.5 w-2.5 ml-1 animate-pulse align-middle"
                    fill="currentColor"
                    viewBox="0 0 8 8"
                    style={{ color: "var(--color-base-content)", opacity: 0.6 }}
                  >
                    <circle cx="4" cy="4" r="3" />
                  </svg>
                )}
              </span>
            )}
          </div>}
        </div>}

        {!isThinking && !isEditing && (
          <div className={`flex items-center gap-2 ${lastMessageIndex === msg.messageId ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-all duration-200 ${msg.isUser ? 'flex-row-reverse' : 'flex-row'}`}>
            {msg.isUser ? (
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(msg.content)
                    setMessageCopiedId(msg.messageId)
                    setTimeout(() => setMessageCopiedId(null), 2000)
                  }}
                  className="p-1.5 rounded-md transition-all hover:bg-[var(--color-base-300)] active:scale-95"
                  style={{ color: "var(--color-base-content)", opacity: 0.5 }}
                  onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.8"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.opacity = "0.5"; }}
                  title={t('messageBubble.actions.copy')}
                >
                  {isMessageCopiedId === msg.messageId ? <MessageCheckMark /> : <CopyIcon />}
                </button>
                <button
                  onClick={handleEditClick}
                  className="p-1.5 rounded-md transition-all hover:bg-[var(--color-base-300)] active:scale-95"
                  style={{ color: "var(--color-base-content)", opacity: 0.5 }}
                  onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.8"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.opacity = "0.5"; }}
                  title={t('messageBubble.actions.edit')}
                >
                  <EditIcon className="shrink-0"/>
                </button>
                <span 
                  className="text-xs px-2"
                  style={{ color: "var(--color-base-content)", opacity: 0.4 }}
                  title={new Date(msg.ts).toLocaleDateString('en-US', { 
                    day: '2-digit', 
                    month: 'short', 
                    year: 'numeric', 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                >
                  {formatTime(msg.ts || Date.now())}
                </span>
              </div>
            ) : botGeneratingId !== msg.messageId && (
              <>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(msg.content)
                      setMessageCopiedId(msg.messageId)
                      setTimeout(() => setMessageCopiedId(null), 2000)
                    }}
                    className="p-1.5 rounded-md transition-all hover:bg-[var(--color-base-300)] active:scale-95"
                    style={{ color: "var(--color-base-content)", opacity: 0.5 }}
                    onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.8"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.opacity = "0.5"; }}
                    title={t('messageBubble.actions.copy')}
                  >
                    {isMessageCopiedId === msg.messageId ? <MessageCheckMark /> : <CopyIcon />}
                  </button>
                  {msg.content && !botGeneratingId && (
                    <button
                      onClick={() => regenerateResponse(messages.indexOf(msg), params.id!, false)}
                      className="p-1.5 rounded-md transition-all hover:bg-[var(--color-base-300)] active:scale-95"
                      style={{ color: "var(--color-base-content)", opacity: 0.5 }}
                      onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.8"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.opacity = "0.5"; }}
                      title={t('messageBubble.retry.title')}
                    >
                      <RetryIcon />
                    </button>
                  )}
                  <button
                    onClick={handleLikeClick}
                    className={`p-1.5 rounded-md ${msg.isLikeEnabled ? 'bg-[var(--color-base-400)]' : ''} transition-all hover:bg-[var(--color-base-300)] active:scale-95`}
                    style={{ color: "var(--color-base-content)", opacity: 0.5 }}
                    onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.8"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.opacity = "0.5"; }}
                    title={t('messageBubble.actions.like')}
                  >
                    <LikeIcon />
                  </button>
                  <button 
                    onClick={handleDislikeClick}
                    className={`p-1.5 rounded-md ${msg.isDislikeEnabled ? 'bg-[var(--color-base-400)]' : ''} transition-all hover:bg-[var(--color-base-300)] active:scale-95`}
                    style={{ color: "var(--color-base-content)", opacity: 0.5 }}
                    onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.8"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.opacity = "0.5"; }}
                    title={t('messageBubble.actions.dislike')}
                  >
                    <DislikeIcon />
                  </button>
                </div>

                {savingMessageId === msg.messageId && (
                  <div className="text-xs flex items-center gap-1.5 px-2"
                      style={{ color: "var(--color-base-content)", opacity: 0.5 }}>
                    <div className="w-2.5 h-2.5 border-2 rounded-full animate-spin border-t-transparent border-[var(--color-base-content)]"></div>
                    <span>{t('messageBubble.saving')}</span>
                  </div>
                )}

                {savedMessageId === msg.messageId && (
                  <div className="text-xs flex items-center gap-1 px-2"
                      style={{ color: "var(--color-base-content)", opacity: 0.5 }}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="var(--color-success)"
                      strokeWidth={2.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{t('messageBubble.saved')}</span>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {!msg.isUser && lastMessageIndex === msg.messageId && botGeneratingId !== msg.messageId && (
          <div
            className="shrink-0 w-[32px] h-[32px] mt-5 rounded-full flex items-center justify-center self-start mb-8"
          >
            <AIBall />
          </div>
        )}
      </div>
    </div>
  );
}