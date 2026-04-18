import React, { useCallback, useEffect, useRef, useState } from "react";
import { useChatActions } from "../stores/MainChatStore";
import { useSidebarActions, useSidebarInfo } from "../stores/SidebarStore";
import { useUserDropdownActions, useUserDropdownInfo } from "../stores/UserDropdownStore";
import { BillingIcon, ChevronUpIcon, DotsIcon, MessagesIcon, SidebarCloseIcon, SidebarOpenIcon } from "./Icons";
import PlusIcon from "./PlusIcon";
import UserDropdown from "./UserDropdown";
import { useUserActions, useUserData } from "../stores/UserStore";
import { avatars } from "../utils/avatars";
import { useNavigate, useParams } from "react-router-dom";
import ChatContextMenu from "./ChatContextMenu";
import { TransitionGroup, CSSTransition } from 'react-transition-group'
import GeneratingTitle from './GeneratingText'
import SeleneLogo from "./Logo";
import DefaultAvatar from './DefaultAvatar'
import { useTranslation } from "../../node_modules/react-i18next";

export default function Sidebar() {
    const { setMessages } = useChatActions();

    const { chats, sidebarWidth, resizing, openChatMenu, sidebarOpen, titleGeneratingId, finalTitle, showChats } = useSidebarInfo();
    const { setSidebarOpen, getChats, setOpenChatMenu, setResizing, setSidebarWidth, setFavoriteFlag, saveRenaming, setIsRenaming, deleteChat, setDisplayTitle, setFinalTitle, setGeneratingTitle, setShowChats } = useSidebarActions();

    const { dropdownOpen } = useUserDropdownInfo();
    const { setDropdownOpen } = useUserDropdownActions();

    const userData = useUserData();
    const { getUser } = useUserActions();

    const [isMobile, setIsMobile] = useState(false);

    const targetRef = useRef<HTMLButtonElement | null>(null);
    const sidebarButtonRef = useRef<HTMLButtonElement>(null);
    const chatsContainerRef = useRef<HTMLDivElement>(null);
    const isFetchedData = useRef<boolean>(false);
    const sidebarRef = useRef<HTMLDivElement>(null);
    const chatButtonsRef = useRef<Record<string, any>>({});
    const buttonsRef = useRef<Record<string, any>>({})

    const params = useParams()

    const { t } = useTranslation()

    const theme = localStorage.getItem('theme') || 'dark'
    
    chats.forEach((_, idx) => { chatButtonsRef.current[idx] = chatButtonsRef.current[idx] || React.createRef<HTMLButtonElement>(); });

    const navigate = useNavigate();

    useEffect(() => {
        if (isFetchedData.current) return;

        getChats();
        getUser();

        isFetchedData.current = true;
    }, []);

    const handleMouseDown = useCallback(() => {
        setResizing(true);
    }, []);

    useEffect(() => {
        if (!resizing) return;

        const handleMouseMove = (e: MouseEvent) => {
            const newWidth = e.clientX;
            if (newWidth >= 220 && newWidth <= 480) {
                setSidebarWidth(newWidth);
            }
        };

        const handleMouseUp = () => {
            setResizing(false);

            setSidebarWidth(260);
        };

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);

        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
        };
    }, [resizing]);

    useEffect(() => {
        const mql = window.matchMedia(`(max-width: 768px)`);
        
        const handleMediaQueryChange = (event: MediaQueryListEvent) => {
        setIsMobile(event.matches);
        };

        setIsMobile(mql.matches);

        mql.addEventListener('change', handleMediaQueryChange);

        return () => {
        mql.removeEventListener('change', handleMediaQueryChange);
        };
    }, []);

    useEffect(() => {
        if (titleGeneratingId && finalTitle) {
            const oldTitle = chats.find(c => c.chatId === titleGeneratingId)?.title || t('chat.untitled')
            let i = oldTitle.length
            const eraseInterval = setInterval(() => {
            setDisplayTitle(titleGeneratingId, oldTitle.slice(0, i - 1))
            i--
            if (i <= 0) {
                clearInterval(eraseInterval)
                let j = 0
                const typeInterval = setInterval(() => {
                setDisplayTitle(titleGeneratingId, finalTitle.slice(0, j + 1))
                j++
                if (j >= finalTitle.length) {
                    clearInterval(typeInterval)

                    setGeneratingTitle('');
                    setFinalTitle('');
                }
                }, 80)
            }
            }, 60)
        }
    }, [titleGeneratingId, finalTitle])

    const starredChats = chats.filter(c => c.favorite);
    const regularChats = chats.filter(c => !c.favorite);

    return (
    <>
        <style>{`
        .label-enter {
            transition: opacity 180ms ease, transform 180ms ease;
        }
        .label-hidden {
            opacity: 0;
            transform: translateX(-6px);
            pointer-events: none;
        }
        .label-visible {
            opacity: 1;
            transform: translateX(0);
        }
        `}</style>

        <aside
        ref={sidebarRef}
        className="select-none sidebar-enter flex flex-col shrink-0 border-r relative"
        style={{
            width: sidebarOpen ? isMobile ? '100%' : sidebarWidth : 48,
            background: "var(--color-base-100)",
            borderColor: "var(--color-base-300)",
            transition: resizing ? "none" : "width 0.2s ease",
        }}
        >
        <div
            className="flex items-center justify-between px-3 pt-3.5 pb-3"
            style={{ borderColor: "var(--color-base-300)" }}
        >
            {sidebarOpen && (
                <div className="cursor-pointer" onClick={() => navigate('/new')}>
                    <SeleneLogo />
                </div>
            )}

            <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            ref={sidebarButtonRef}
            className={`tooltip-box flex text-[var(--color-base-text)] items-center gap-2 p-1.5 rounded-[var(--radius-field)] hover:text-[var(--color-base-content)] hover:bg-[var(--color-base-400)] transition-all`}
            data-tip={`${sidebarOpen ? t('sidebar.closeSidebarTip') : t('sidebar.openSidebarTip')} 𝘊𝘵𝘳𝘭+𝘹`}
            >
            {sidebarOpen ? <SidebarCloseIcon /> : <SidebarOpenIcon />}
            </button>
        </div>

        <div className={`flex flex-col gap-2 ${sidebarOpen ? "px-3 pt-3" : "items-center pt-3"}`}>
            <button
                onClick={() => navigate('/upgrade')}

                className={`${!sidebarOpen && 'tooltip-box'} text-[var(--color-base-text)] flex items-center gap-2 p-1.5 rounded-[var(--radius-field)] hover:bg-[var(--color-base-400)] hover:text-[var(--color-base-content)] transition-all`}
                data-tip={t('sidebar.billing')}
            >
                <BillingIcon />
                {sidebarOpen && <span className="text-sm inter">{t('sidebar.billing')}</span>}
            </button>

            <button
                onClick={() => {
                    navigate('/recents')
                    setSidebarOpen(false);
                }}
                className={`${!sidebarOpen && 'tooltip-box'} group text-[var(--color-base-text)] flex items-center justify-between gap-2 p-1.5 rounded-[var(--radius-field)] hover:bg-[var(--color-base-400)] hover:text-[var(--color-base-content)] transition-all`}
                data-tip={`${t('sidebar.recents')} 𝘊𝘵𝘳𝘭+𝘬`}
            >
                <div className="flex items-center gap-2">
                    <MessagesIcon />
                    {sidebarOpen && <span className="text-sm inter">{t('sidebar.recents')}</span>}
                </div>
                {sidebarOpen && <span className="text-xs inter opacity-0 group-hover:opacity-100 text-[var(--color-base-text)] mr-2.5">Ctrl+K</span>}
            </button>

            {!sidebarOpen && (
                <button
                onClick={() => {
                    navigate("/new");
                    setMessages([]);
                    setSidebarOpen(false);
                }}
                className={`${!sidebarOpen && 'tooltip-box'} mt-5 flex items-center gap-2 p-1.5 text-[var(--color-base-text)] bg-[var(--color-base-300)] rounded-xl transition-all ${theme === 'light' ? 'hover:bg-[var(--color-base-400)] hover:text-[var(--color-base-content)]' : 'hover:bg-[var(--color-base-600)] hover:text-[var(--color-base-content)]'}`}
                data-tip={t('sidebar.newConversation')}
                >
                <PlusIcon />
            </button>
            )}
        </div>

        {sidebarOpen && <div className="px-3 pt-3 pb-1">
            <button
            onClick={() => {
                navigate("/new");
                setMessages([]);
                setSidebarOpen(false);
            }}
            className="cursor-pointer flex items-center gap-2 min-w-[235px] max-w-[235px] px-3 py-2 rounded-[var(--radius-field)] bg-[var(--color-base-200)] text-sm transition-opacity duration-150 hover:bg-[var(--color-base-400)]"
            style={{
                color: "var(--color-base-text)",
                border: "1px solid var(--color-base-300)",
            }}
            >
            <PlusIcon />
            <span className="inter">{t('sidebar.newConversation')}</span>
            </button>
        </div>}

        {sidebarOpen && <div className="flex-1 overflow-y-auto px-3 pt-3" ref={chatsContainerRef}>
            {starredChats.length > 0 && (
                <>
                    <h2
                        className={`flex justify-between items-center gap-2 text-xs tracking-widest font-semibold pb-2 mt-1 pl-2 pr-2 inter ${sidebarOpen ? "label-visible label-enter" : "label-hidden"}`}
                        style={{ color: "var(--color-base-text)", opacity: 0.75 }}
                    >
                        {t('sidebar.starred')}
                    </h2>
                    
                    <div className="flex flex-col gap-1 mb-4">
                        <TransitionGroup>
                        {starredChats.map(chat => {
                            if (!buttonsRef.current[chat.chatId]) {
                                buttonsRef.current[chat.chatId] = React.createRef();
                            }
                            if (!chatButtonsRef.current[chat.chatId]) {
                                chatButtonsRef.current[chat.chatId] = React.createRef();
                            }
                            return (
                                <CSSTransition
                                    key={chat.chatId}
                                    timeout={300}
                                    classNames="slide"
                                    nodeRef={buttonsRef.current[chat.chatId]}
                                >
                                    <div
                                        key={chat.chatId}
                                        ref={buttonsRef.current[chat.chatId]}
                                        className="relative group mb-1"
                                    >
                                        <button
                                            onClick={() => {
                                                navigate(`/chat/${chat.chatId}`);
                                                setSidebarOpen(false);
                                            }}
                                            className={`inter w-full text-[var(--color-base-text)] ${params.id && params.id === chat.chatId ? 'bg-[var(--color-base-400)]' : ''} text-left px-3 py-1.5 pr-8 rounded-lg text-sm hover:bg-[var(--color-base-400)] hover:text-[var(--color-base-content)] flex items-center gap-2`}
                                            style={{
                                                border: "1px solid transparent"
                                            }}
                                        >
                                            <span className="truncate flex-1">
                                                {titleGeneratingId === chat.chatId && finalTitle ? chat.title : titleGeneratingId === chat.chatId
                                                    ? <GeneratingTitle />
                                                    : sidebarWidth >= 350
                                                    ? chat.title
                                                    : chat.title.slice(0, 34) + (chat.title.length > 34 ? "…" : "")
                                                }

                                                {titleGeneratingId === chat.chatId && finalTitle && (
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
                                        </button>

                                        <button
                                            ref={chatButtonsRef.current[chat.chatId]}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setIsRenaming(false, chat.title);
                                                setOpenChatMenu(openChatMenu === chat.chatId ? null : chat.chatId);
                                            }}
                                            className="absolute right-0 top-1/2 -translate-y-1/2 p-1 h-full flex w-8 h-8 items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 text-[var(--color-base-text)] hover:bg-[var(--color-base-400)] hover:text-[var(--color-base-content)]"
                                        >
                                            <DotsIcon />
                                        </button>

                                        {openChatMenu === chat.chatId && (
                                            <ChatContextMenu
                                                containerRef={chatsContainerRef}
                                                onDelete={deleteChat}
                                                chatButtonRef={chatButtonsRef.current[chat.chatId]}
                                                chat={chat}
                                                onClose={() => setOpenChatMenu(null)}
                                                onRename={saveRenaming}
                                                onToggleFavorite={setFavoriteFlag}
                                            />
                                        )}
                                    </div>
                                </CSSTransition>
                            );
                        })}
                        </TransitionGroup>
                    </div>
                </>
            )}
            
            <div className="flex items-center group w-fit" onClick={() => setShowChats(!showChats)}>
                <h2
                    className={`flex justify-between items-center gap-2 text-xs tracking-widest font-semibold pb-2 mt-1 pl-2 pr-2 inter ${sidebarOpen ? "label-visible label-enter" : "label-hidden"} cursor-pointer`}
                    style={{ color: "var(--color-base-text)", opacity: 0.75 }}
                >
                    {t('sidebar.recents')}
                </h2>
                <span className="text-[var(--color-base-text)] text-xs opacity-0 pb-2 mt-1.5 pr-2 transition-opacity group-hover:opacity-75 cursor-pointer">
                    {showChats ? t('sidebar.hide') : t('sidebar.show')}
                </span>
            </div>
            
            {regularChats.length > 0 && showChats ? (
                <div className="flex flex-col gap-1">
                    <TransitionGroup>
                    {regularChats.map(chat => {
                        if (!buttonsRef.current[chat.chatId]) {
                            buttonsRef.current[chat.chatId] = React.createRef();
                        }
                        if (!chatButtonsRef.current[chat.chatId]) {
                            chatButtonsRef.current[chat.chatId] = React.createRef();
                        }
                        return (
                            <CSSTransition
                                key={chat.chatId}
                                timeout={300}
                                classNames="slide"
                                nodeRef={buttonsRef.current[chat.chatId]}
                            >
                                <div
                                    key={chat.chatId}
                                    ref={buttonsRef.current[chat.chatId]}
                                    className="relative group mb-1"
                                >
                                    <button
                                        onClick={() => {
                                            navigate(`/chat/${chat.chatId}`);
                                            setSidebarOpen(false);
                                        }}
                                        className={`inter w-full text-[var(--color-base-text)] ${params.id && params.id === chat.chatId ? 'bg-[var(--color-base-400)]' : ''} text-left px-3 py-1.5 pr-8 rounded-lg text-sm hover:bg-[var(--color-base-400)] hover:text-[var(--color-base-content)] flex items-center gap-2`}
                                        style={{
                                            border: "1px solid transparent"
                                        }}
                                    >
                                        <span className="truncate flex-1">
                                            {titleGeneratingId === chat.chatId && finalTitle ? chat.title : titleGeneratingId === chat.chatId
                                                ? <GeneratingTitle />
                                                : sidebarWidth >= 350
                                                ? chat.title
                                                : chat.title.slice(0, 34) + (chat.title.length > 34 ? "…" : "")
                                            }

                                            {titleGeneratingId === chat.chatId && finalTitle && (
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
                                    </button>

                                    <button
                                        ref={chatButtonsRef.current[chat.chatId]}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setIsRenaming(false, chat.title);
                                            setOpenChatMenu(openChatMenu === chat.chatId ? null : chat.chatId);
                                        }}
                                        className="absolute right-0 top-1/2 -translate-y-1/2 p-1 h-full flex w-8 h-8 items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 text-[var(--color-base-text)] hover:bg-[var(--color-base-400)] hover:text-[var(--color-base-content)]"
                                    >
                                        <DotsIcon />
                                    </button>

                                    {openChatMenu === chat.chatId && (
                                        <ChatContextMenu
                                            containerRef={chatsContainerRef}
                                            onDelete={deleteChat}
                                            chatButtonRef={chatButtonsRef.current[chat.chatId]}
                                            chat={chat}
                                            onClose={() => setOpenChatMenu(null)}
                                            onRename={saveRenaming}
                                            onToggleFavorite={setFavoriteFlag}
                                        />
                                    )}
                                </div>
                            </CSSTransition>
                        );
                    })}
                    </TransitionGroup>
                </div>
            ) : showChats && regularChats.length === 0 && starredChats.length === 0 ? (
                <p className="text-xs px-1 leading-relaxed inter" style={{ color: "var(--color-base-content)", opacity: 0.22 }}>
                    {t('sidebar.empty')}
                </p>
            ) : showChats && regularChats.length === 0 && starredChats.length > 0 ? null : null}
        </div>}

        {sidebarOpen ? <div className="relative px-3 pb-3.5 pt-2 border-t" style={{ borderColor: "var(--color-base-300)" }}>
            {dropdownOpen && (
            <UserDropdown
                user={userData}
                onClose={() => setDropdownOpen(false)}
                targetRef={targetRef}
                smallVersion={true}
            />
            )}

            <button
            ref={targetRef}
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="cursor-pointer flex items-center gap-2.5 w-full px-2.5 py-2 rounded-[var(--radius-field)] transition-all duration-150 hover:opacity-80 group"
            style={{
                background: dropdownOpen ? "var(--color-base-200)" : "transparent",
            }}
            >
            {userData.avatar === 1 ? <DefaultAvatar username={userData.name}/> : <div className="rounded-full">{avatars[userData.avatar]}</div>}
            <div className={`${sidebarOpen ? "flex-1 min-w-0 text-left label-visible label-enter" : "label-hidden"}`}>
                <p className="text-xs font-semibold truncate leading-none mb-0.5" style={{ color: "var(--color-base-content)" }}>
                {userData.name}
                </p>
                <p className="text-[10px] truncate leading-none" style={{ color: "var(--color-base-content)", opacity: 0.38 }}>
                {userData.email}
                </p>
            </div>
            <span style={{ color: "var(--color-base-content)", opacity: dropdownOpen ? 0.6 : 0.3 }}>
                <ChevronUpIcon flipped={!dropdownOpen} />
            </span>
            </button>
        </div> : (
            <>
            <div className="flex-1" />

            <div className="relative px-2 pb-1 pt-2">
            {dropdownOpen && (
                <UserDropdown
                user={userData}
                onClose={() => setDropdownOpen(false)}
                targetRef={targetRef}
                smallVersion={false}
                />
            )}
            <button
                ref={targetRef}
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="cursor-pointer rounded-full"
                title="User menu"
                style={{ opacity: dropdownOpen ? 1 : 0.8 }}
            >
                {userData.avatar === 1 ? <div className="mb-3"><DefaultAvatar username={userData.name}/></div> : <div className="w-9 h-9 rounded-full">{avatars[userData.avatar]}</div>}
            </button>
            </div>
            </>
        )}

        {sidebarOpen &&
            <div className={`absolute top-0 right-0 bottom-0 group w-2 h-full cursor-col-resize -mr-1 z-30 grid place-items-center max-md:hidden`} onMouseDown={handleMouseDown}>
                <div className="absolute top-0 bottom-0 right-1 w-[0.5px] opacity-50 bg-[var(--color-outline-2)] transition-all group-hover:delay-75 group-hover:bg-[var(--color-outline)] group-hover:w-[1px] group-hover:translate-x-[0.5px]" />
                <div className="h-6 w-2 relative rounded-full border bg-[var(--color-base-100)] shadow-xs border-[var(--color-outline-2)] transition-all duration-200 group-hover:delay-75 group-hover:border-[var(--color-outline)] cursor-col-resize group-hover:bg-[var(--color-outline)]/15" />
            </div>
        }
        </aside>
    </>
    );
}