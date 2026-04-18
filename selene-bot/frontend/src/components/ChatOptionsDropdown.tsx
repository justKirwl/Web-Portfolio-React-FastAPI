import { useEffect, useRef } from "react";
import { EditIcon, StarIcon, TrashIcon } from "./Icons";
import { useNavigate } from "react-router-dom";
import type { Chat } from "../stores/SidebarStore";
import { useChatActions } from "../stores/MainChatStore";
import { useTranslation } from "../../node_modules/react-i18next";

export default function ChatOptionsDropdown({
  chat,
  triggerRef,
  onClose,
  onDelete,
  onRename,
  onToggleFavorite,
}: {
  chat: Chat;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  onClose: () => void;
  onDelete: (chatId: string) => Promise<boolean>;
  onRename: () => void;
  onToggleFavorite: (chatId: string) => Promise<void>;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const { setMessages } = useChatActions()

  const navigate = useNavigate()

  const { t } = useTranslation()

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && triggerRef.current && !ref.current.contains(e.target as Node) && !triggerRef.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="inter absolute left-0 top-full shadow-[0px_2px_8px_0px_hsl(0 0% 0%/8%)] mt-1 rounded-xl overflow-y-auto overflow-x-hidden backdrop-blur-xl p-1 z-50 min-w-[180px]"
      style={{
        background: "var(--color-base-300)",
        border: "1px solid var(--color-outline-2)",
        animation: "dropDown 0.15s ease both",
      }}
    >
      <style>{`
        @keyframes dropDown {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <button
        onClick={() => {
          onRename();
          onClose();
        }}
        className={`inter flex items-center  justify-start w-[170px] gap-2 mt-1
              text-[var(--color-base-text)] hover:text-[var(--color-base-content)] rounded-lg px-3 py-1.5 text-sm group`}
        onMouseEnter={(e) => { e.currentTarget.style.background = "var(--color-base-400)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
      >
        <EditIcon className="shrink-0"/>
        {t('chatDropdown.rename')}
      </button>

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