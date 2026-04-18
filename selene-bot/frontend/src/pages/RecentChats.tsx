import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSidebarActions, useSidebarInfo, type Chat } from "../stores/SidebarStore";
import Sidebar from "../components/Sidebar";
import { DotsIcon, PlusRecentsIcon, SearchIcon, StarIcon } from "../components/Icons";
import ChatContextMenu from "../components/ChatContextMenu";
import { useRecentChats, useRecentChatsActions, useRecentChatsInfo } from "../stores/RecentStore";
import { useHotkeys } from "react-hotkeys-hook";
import { useTranslation } from "../../node_modules/react-i18next";

export default function Recents() {
  const { sidebarOpen } = useSidebarInfo();
  const { setSidebarOpen, setIsRenaming } = useSidebarActions();

  const chats = useRecentChats()
  const { searchQuery, openChatMenu } = useRecentChatsInfo()
  const { setFavoriteFlag, getChats, setOpenChatMenu, setSearchQuery, saveInChatRenaming, deleteChat } = useRecentChatsActions()

  const chatButtonsRef = useRef<Record<string, any>>({});
  const isChatsFetched = useRef<boolean>(false);

  const recentChatsRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();

  const theme = localStorage.getItem('theme') || 'dark'

  const { t } = useTranslation()

  const filteredChats = useMemo(() => {
    return chats.filter((chat) => {
      const matchesSearch = chat.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    })
  }, [chats, searchQuery])

  const groupedChats = useMemo(() => ({
    today: filteredChats.filter((c) => {
      const diff = Date.now() - new Date(c.updatedAt * 1000).getTime();
      return diff < 24 * 60 * 60 * 1000;
    }),
    yesterday: filteredChats.filter((c) => {
      const diff = Date.now() - new Date(c.updatedAt * 1000).getTime();
      return diff >= 24 * 60 * 60 * 1000 && diff < 48 * 60 * 60 * 1000;
    }),
    lastWeek: filteredChats.filter((c) => {
      const diff = Date.now() - new Date(c.updatedAt * 1000).getTime();
      return diff >= 48 * 60 * 60 * 1000 && diff < 7 * 24 * 60 * 60 * 1000;
    }),
    older: filteredChats.filter((c) => {
      const diff = Date.now() - new Date(c.updatedAt * 1000).getTime();
      return diff >= 7 * 24 * 60 * 60 * 1000;
    }),
  }), [filteredChats])

  useEffect(() => {
    if (isChatsFetched.current) return

    getChats();

    isChatsFetched.current = true;
  }, [])

  const handleSidebarHotkey = useCallback((event: KeyboardEvent) => {
    event.preventDefault();
    setSidebarOpen(!sidebarOpen);
  }, [sidebarOpen]);

  useHotkeys('ctrl+x', handleSidebarHotkey)

  const renderChatCard = (chat: Chat, idx: number) => {
    if (!chatButtonsRef.current[chat.chatId]) {
      chatButtonsRef.current[chat.chatId] = React.createRef();
    }

    return (
      <div
        key={chat.chatId}
        className="relative"
        style={{ animationDelay: `${idx * 0.05}s` }}
      >
        <div
          onClick={() => navigate(`/chat/${chat.chatId}`)}
          className={`cursor-pointer select-none inter w-full text-left px-4 py-3.5 rounded-lg bg-[var(--color-base-200)] hover:${theme === 'light' ? 'bg-[var(--color-base-300)]' : 'bg-[var(--color-base-600)]'} active:scale-[0.99] flex items-start gap-3`}
          style={{ border: "1px solid var(--color-base-300)" }}
        >
          {chat.favorite && (
            <span className="shrink-0 mt-0.5" style={{ color: "var(--color-warning)" }}>
              <StarIcon filled />
            </span>
          )}

          <div className="flex-1 min-w-0">
            <h4
              className="font-semibold text-sm mb-1 truncate"
              style={{ color: "var(--color-base-content)" }}
            >
              {chat.title}
            </h4>
            {chat.lastMessage && (
              <p
                className="text-xs truncate leading-relaxed"
                style={{ color: "var(--color-base-content)", opacity: 0.5 }}
              >
                {chat.lastMessage}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span
              className="text-xs"
              style={{ color: "var(--color-base-content)", opacity: 0.4 }}
            >
              {chat.updatedAtHumanized}
            </span>

            <button
              ref={chatButtonsRef.current[chat.chatId]}
              onClick={(e) => {
                e.stopPropagation();
                setIsRenaming(false, chat.title);
                setOpenChatMenu(openChatMenu === chat.chatId ? null : chat.chatId);
              }}
              className={`p-1.5 rounded-md transition-all opacity-50 hover:opacity-100 hover:${theme === 'light' ? 'bg-[var(--color-base-400)]' : 'bg-[var(--color-base-300)]'}`}
              style={{ color: "var(--color-base-content)" }}
            >
              <DotsIcon />
            </button>
          </div>
        </div>

        {openChatMenu === chat.chatId && (
          <ChatContextMenu
            containerRef={recentChatsRef}
            onDelete={deleteChat}
            chat={chat}
            onClose={() => setOpenChatMenu(null)}
            chatButtonRef={chatButtonsRef.current[chat.chatId]}
            onRename={saveInChatRenaming}
            onToggleFavorite={setFavoriteFlag}
          />
        )}
      </div>
    );
  };

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
          className="shrink-0 px-6 pt-12 flex flex-col items-center"
          style={{
            borderColor: "var(--color-base-300)",
            background: "var(--color-base-100)",
          }}
        >
          <div className="w-full max-w-3xl">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-semibold mb-6 merriweather select-none" style={{ color: "var(--color-base-text)" }}>
                {t('recents.title')}
              </h1>

              <button
                onClick={() => navigate("/new")}
                className="inter flex items-center gap-1 px-2 py-2 rounded-lg text-sm transition-all hover:opacity-90 active:scale-98"
                style={{
                  background: "var(--color-base-content)",
                  color: "var(--color-base-200)",
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                  fontWeight: 500
                }}
              >
                <PlusRecentsIcon />
                {t('recents.newChat')}
              </button>
            </div>

            <div
              className="flex items-center gap-3 px-4 py-3 rounded-lg mb-5"
              style={{
                background: "var(--color-base-200)",
                border: "1px solid var(--color-base-300)",
              }}
            >
              <span style={{ color: "var(--color-base-content)", opacity: 0.4 }}>
                <SearchIcon />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('recents.searchPlaceholder')}
                className="flex-1 bg-transparent outline-none text-sm"
                style={{ color: "var(--color-base-content)" }}
              />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-4 py-2 flex justify-center">
          <div className="min-h-[300px] overflow-auto px-3 -mx-3 -my-1 pb-20 py-1 sm:pl-6 sm:-ml-6 w-full max-w-3xl space-y-4" ref={recentChatsRef} style={{ height: 'calc(-224px + 100vh)' }}>
            {groupedChats.today.length > 0 && (
              <div>
                <h3
                  className="text-xs uppercase tracking-wider font-semibold mb-4 px-1"
                  style={{ color: "var(--color-base-content)", opacity: 0.5 }}
                >
                  {t('recents.today')}
                </h3>
                <div className="space-y-2">
                  {groupedChats.today.map(renderChatCard)}
                </div>
              </div>
            )}

            {groupedChats.yesterday.length > 0 && (
              <div>
                <h3
                  className="text-xs uppercase tracking-wider font-semibold mb-4 px-1"
                  style={{ color: "var(--color-base-content)", opacity: 0.5 }}
                >
                  {t('recents.yesterday')}
                </h3>
                <div className="space-y-2">
                  {groupedChats.yesterday.map(renderChatCard)}
                </div>
              </div>
            )}

            {groupedChats.lastWeek.length > 0 && (
              <div>
                <h3
                  className="text-xs uppercase tracking-wider font-semibold mb-4 px-1"
                  style={{ color: "var(--color-base-content)", opacity: 0.5 }}
                >
                  {t('recents.lastWeek')}
                </h3>
                <div className="space-y-2">
                  {groupedChats.lastWeek.map(renderChatCard)}
                </div>
              </div>
            )}

            {groupedChats.older.length > 0 && (
              <div>
                <h3
                  className="text-xs uppercase tracking-wider font-semibold mb-4 px-1"
                  style={{ color: "var(--color-base-content)", opacity: 0.5 }}
                >
                  {t('recents.older')}
                </h3>
                <div className="space-y-2">
                  {groupedChats.older.map(renderChatCard)}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}