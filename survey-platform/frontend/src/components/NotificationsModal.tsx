import { X, Bell, Check, CheckCheck, Trash2, Filter, Search } from 'lucide-react';
import { useEffect, useMemo, useRef } from 'react';
import { useNotificationStore } from '../stores/NotificationStore';
import { useUserDropdownStore } from '../stores/UserDropdownStore';
import { useTranslation } from '../../node_modules/react-i18next';

export default function NotificationsModal() {
  const { searchQuery, filter, setFilter, setSearchQuery, setShowNotifications, notifications, markAsRead, markAllAsRead, deleteNotification } = useNotificationStore()
  const { fetchNotifications } = useUserDropdownStore()
  const isFetched = useRef<boolean>(false)
  const { t } = useTranslation()
  const language = localStorage.getItem('prefered_language') || 'en'

  const typeColors = useMemo(() => ({
    success: {
      bg: 'bg-green-500/10',
      border: 'border-green-500/30',
      text: 'text-green-600',
      icon: '✓'
    },
    info: {
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/30',
      text: 'text-blue-600',
      icon: 'ℹ'
    },
    warning: {
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/30',
      text: 'text-yellow-600',
      icon: '⚠'
    },
    error: {
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
      text: 'text-red-600',
      icon: '✕'
    }
  }), [])

  useEffect(() => {
    if (isFetched.current) return

    fetchNotifications()

    isFetched.current = true
  }, [])

  const filteredNotifications = notifications.filter(notif => {
    const matchesFilter = filter === 'all' || !notif.read;
    const matchesSearch = notif.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         notif.message.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-gray backdrop-blur-sm bg-opacity-50">
      <div className="bg-[var(--color-base-200)] border-2 border-[var(--color-base-300)] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        
        <div className="flex items-center justify-between p-6 border-b border-[var(--color-base-300)]">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Bell className="w-8 h-8 text-[var(--color-primary)]" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[var(--color-base-content)]">{t('notifications.title')}</h2>
              <p className="text-sm text-[var(--color-base-content)] opacity-60">
                {unreadCount > 1 ? unreadCount > 5 && language === 'ru' ? t('notifications.unreadCount.many', { count: unreadCount }) : t('notifications.unreadCount.few', { count: unreadCount }) : t('notifications.unreadCount.one', { count: unreadCount })}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowNotifications(false)}
            className="cursor-pointer p-2 rounded-lg hover:bg-[var(--color-base-300)] transition-all"
          >
            <X className="w-6 h-6 text-[var(--color-base-content)]" />
          </button>
        </div>

        <div className="p-4 border-b border-[var(--color-base-300)] space-y-3">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                filter === 'all'
                  ? 'bg-[var(--color-primary)] text-[var(--color-primary-content)] shadow-lg'
                  : 'bg-[var(--color-base-300)] text-[var(--color-base-content)] hover:bg-[var(--color-base-300)]/70'
              }`}
            >
              <Filter className="w-4 h-4" />
              {t('notifications.filters.all')}
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                filter === 'unread'
                  ? 'bg-[var(--color-primary)] text-[var(--color-primary-content)] shadow-lg'
                  : 'bg-[var(--color-base-300)] text-[var(--color-base-content)] hover:bg-[var(--color-base-300)]/70'
              }`}
            >
              {t('notifications.filters.unread')}
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-xs font-bold">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-base-content)] opacity-40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('notifications.searchPlaceholder')}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-[var(--color-base-100)] text-[var(--color-base-content)] border-2 border-[var(--color-base-300)] focus:border-[var(--color-primary)] focus:outline-none transition-colors"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => {
              const colors = typeColors[notification.type];
              return (
                <div
                  key={notification.id}
                  className={`p-4 rounded-xl border transition-all ${
                    notification.read
                      ? 'bg-[var(--color-base-100)] border-[var(--color-base-300)] opacity-70'
                      : 'bg-[var(--color-base-200)] border-[var(--color-primary)]/30 shadow-md'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    
                    <div className={`w-10 h-10 rounded-lg ${colors.bg} border ${colors.border} flex items-center justify-center flex-shrink-0`}>
                      <span className={`text-xl ${colors.text}`}>{colors.icon}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className={`font-bold text-[var(--color-base-content)] ${!notification.read ? 'text-[var(--color-primary)]' : ''}`}>
                          {notification.title}
                        </h4>
                      </div>
                      <p className="text-sm text-[var(--color-base-content)] opacity-80 mb-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-[var(--color-base-content)] opacity-50 font-medium">
                        {notification.time}
                      </p>
                    </div>

                    <div className="flex mt-5 gap-1 flex-shrink-0">
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="p-2 rounded-lg hover:bg-[var(--color-success)]/10 text-[var(--color-success)] transition-all group"
                          title={t('notifications.actions.markAsRead')}
                        >
                          <Check className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="p-2 rounded-lg hover:bg-[var(--color-error)]/10 text-[var(--color-error)] transition-all group"
                        title={t('notifications.actions.delete')}
                      >
                        <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-20 h-20 rounded-full bg-[var(--color-base-300)] flex items-center justify-center mb-4">
                <Bell className="w-10 h-10 text-[var(--color-base-content)] opacity-30" />
              </div>
              <h3 className="text-xl font-bold text-[var(--color-base-content)] mb-2">
                {t('notifications.empty.title')}
              </h3>
              <p className="text-[var(--color-base-content)] opacity-60 text-center">
                {filter === 'unread' ? t('notifications.empty.messageUnread') : t('notifications.empty.messageDefault')}
              </p>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-[var(--color-base-300)] flex items-center justify-between">
          <p className="text-sm text-[var(--color-base-content)] opacity-60">
            {filteredNotifications.length > 1 ? filteredNotifications.length > 5 && language === 'ru' ? t('notifications.footerCount.many', { count: filteredNotifications.length }) : t('notifications.footerCount.few', { count: filteredNotifications.length }) : t('notifications.footerCount.one', { count: filteredNotifications.length })}
          </p>
          <div className="flex gap-2">
            <button
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
              className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                unreadCount > 0
                  ? 'bg-[var(--color-success)] text-white hover:scale-102 shadow-lg'
                  : 'bg-[var(--color-base-300)] text-[var(--color-base-content)] opacity-50 cursor-not-allowed'
              }`}
            >
              <CheckCheck className="w-4 h-4" />
              {t('notifications.actions.markAllAsRead')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}