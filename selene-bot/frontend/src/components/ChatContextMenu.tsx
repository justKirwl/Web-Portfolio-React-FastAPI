import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { EditIcon, StarIcon, TrashIcon } from "./Icons";
import { useSidebarActions, useSidebarInfo, type Chat } from "../stores/SidebarStore";
import { useNavigate } from "react-router-dom";
import { useChatActions } from "../stores/MainChatStore";
import { useTranslation } from "../../node_modules/react-i18next";

interface ChatContextMenuProps {
  chat: Chat;
  chatButtonRef: React.RefObject<HTMLButtonElement>
  onDelete: (chatId: string) => Promise<boolean>
  onClose: () => void;
  onRename: (chatId: string, newName: string) => Promise<void>;
  onToggleFavorite: (chatId: string) => Promise<void>;
  containerRef: React.RefObject<HTMLDivElement | null>
}

export default function ChatContextMenu({ chat, chatButtonRef, onDelete, onClose, onRename, onToggleFavorite, containerRef }: ChatContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  const { setMessages } = useChatActions()

  const { newName, isRenaming } = useSidebarInfo()
  const { setNewName, setIsRenaming } = useSidebarActions()

  const navigate = useNavigate()

  const { t } = useTranslation()

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && chatButtonRef.current && !ref.current.contains(e.target as Node) && !chatButtonRef.current.contains(e.target as Node)) {onClose(); setIsRenaming(false, chat.title)};
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const [position, setPosition] = useState('top-full');

  useLayoutEffect(() => {
    const checkPosition = () => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        const containerRect = containerRef.current!.getBoundingClientRect();

        const relativeTop = rect.top - containerRect.top;
        const relativeBottom = rect.bottom - containerRect.top;
        const viewportHeight = containerRect.height;

        if (relativeBottom > viewportHeight) {
          setPosition('bottom-full');
        } else if (relativeTop < 0) {
          setPosition('top-full');
        }
      }
    };

    checkPosition();
    window.addEventListener('scroll', checkPosition);
    window.addEventListener('resize', checkPosition);

    return () => {
      window.removeEventListener('scroll', checkPosition);
      window.removeEventListener('resize', checkPosition);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`inter absolute right-0 ${position} shadow-[0px_2px_8px_0px_hsl(0 0% 0%/8%)] mt-1 rounded-xl overflow-y-auto overflow-x-hidden backdrop-blur-xl p-1 z-50 min-w-[160px]`}
      style={{
        background: "var(--color-base-300)",
        border: "1px solid var(--color-outline-2)",
        animation: "dropDown 0.15s ease both"
      }}
    >
      <style>{`
        @keyframes dropDown {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {isRenaming ? (
        <div className="px-3 py-2">
          <input autoFocus value={newName} onChange={(e) => setNewName(e.target.value)}
            onKeyDown={async (e) => {
              if (e.key === "Enter") {
                await onRename(chat.chatId, newName)
                setIsRenaming(false, chat.title)
              }
              if (e.key === "Escape") {
                setIsRenaming(false, chat.title);
                onClose();
              }
            }}
            className="w-full text-xs rounded-[var(--radius-field)] px-2 py-1"
            style={{
              background: "var(--color-base-100)",
              color: "var(--color-base-content)",
              border: "1px solid var(--color-outline-2)",
              outline: 'none'
            }}
          />
        </div>
      ) : (
        <button
          onClick={() => setIsRenaming(true, chat.title)}
          className={`inter flex items-center  justify-start w-[170px] gap-2 mt-1
                text-[var(--color-base-text)] hover:text-[var(--color-base-content)] rounded-lg px-3 py-1.5 text-sm group`}
          onMouseEnter={(e) => { e.currentTarget.style.background = "var(--color-base-400)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
        >
          <EditIcon className="shrink-0"/>
          {t('chatDropdown.rename')}
        </button>
      )}

      <button
        onClick={() => {
          onToggleFavorite(chat.chatId);
          onClose();
        }}
        className={`inter flex items-center justify-start w-[170px] gap-2
              text-[var(--color-base-text)] hover:text-[var(--color-base-content)] rounded-lg px-3 py-1.5 text-sm group`}
        onMouseEnter={(e) => { e.currentTarget.style.background = "var(--color-base-400)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
      >
        <StarIcon filled={chat.favorite} />
        {chat.favorite ? t('chatDropdown.unstar') : t('chatDropdown.star')}
      </button>

      <div className="h-[0.5px] my-1.5 mx-2" style={{ background: "var(--color-outline-2)", opacity: 0.5 }} />

      <button
        onClick={() => {
          onDelete(chat.chatId);
          setMessages([]);
          navigate('/new');
          onClose();
        }}
        className={`inter flex items-center justify-start w-[170px] gap-2 mt-1 mb-1
              text-[var(--color-base-red)] rounded-lg px-3 py-1.5 text-sm group`}
        onMouseEnter={(e) => { e.currentTarget.style.background = "var(--color-base-400)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
      >
        <TrashIcon />
        {t('chatDropdown.delete')}
      </button>
    </div>
  );
}