import { useTranslation } from "../../node_modules/react-i18next";
import { useChatActions, useChatInfo } from "../stores/MainChatStore";

export default function FeedbackModal({ messageId }: { messageId: string }) {
    const { isSubmittingFeedback: isSubmitting, feedbackType: type, selectedIssue, details, feedbackModalOpen: isOpen } = useChatInfo()

    const { setFeedbackModalOpen, setSelectedIssue, setDetails, setDislikeEnabled, setLikeEnabled } = useChatActions()

    const { t } = useTranslation()

    const negativeIssues = t('messageFeedback.negativeIssues', { returnObjects: true }) as string[]

    const handleCancel = () => {
        setSelectedIssue("");
        setDetails("");
        setFeedbackModalOpen(false);
    };

    if (!isOpen) return null;

    return (
    <>
      <div
        className="fixed inset-0 bg-black z-50 flex items-center justify-center"
        onClick={handleCancel}
        style={{
          animation: "fadeIn 0.2s ease"
        }}
      >
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes scaleIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
        `}</style>

        <div
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md rounded-xl overflow-hidden"
          style={{
            background: "var(--color-base-200)",
            border: "1px solid var(--color-base-300)",
            animation: "scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <div className="px-6 pt-4 pb-1">
            <h2 className="inter text-lg font-semibold" style={{ color: "var(--color-base-content)" }}>
              {type === "positive" ? t('messageFeedback.title.positive') : t('messageFeedback.title.negative')}
            </h2>
          </div>

          <div className="px-6 py-5 space-y-4">
            {type === "negative" && (
              <div>
                <label
                  className="inter block text-sm mb-2"
                  style={{ color: "var(--color-base-text)", opacity: 0.8 }}
                >
                  {t('messageFeedback.negativeIssueLabel')}
                </label>
                <div className="relative">
                  <select
                    value={selectedIssue}
                    onChange={(e) => setSelectedIssue(e.target.value)}
                    className="cursor-pointer inter w-full px-4 py-2.5 rounded-lg outline-none text-sm appearance-none transition-all"
                    style={{
                      background: "var(--color-base-300)",
                      border: "1px solid var(--color-outline-2)",
                      color: "var(--color-base-content)",
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%23999' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E")`,
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "right 1rem center",
                      paddingRight: "3rem",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = "var(--color-outline)";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = "var(--color-base-400)";
                    }}
                  >
                    <option value="">{t('messageFeedback.negativeIssueSelect')}</option>
                    {negativeIssues.map((issue) => (
                      <option key={issue} value={issue}>
                        {issue}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div>
              <label
                className="inter block text-sm mb-2"
                style={{ color: "var(--color-base-text)", opacity: 0.8 }}
              >
                {t('messageFeedback.detailsLabel')}
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder={
                  type === "positive"
                    ? t('messageFeedback.detailsPlaceholder.positive')
                    : t('messageFeedback.detailsPlaceholder.negative')
                }
                rows={4}
                className="inter w-full px-4 py-3 rounded-lg outline-none border border-[var(--color-outline-2)] text-sm resize-none transition-all hover:border-[var(--color-outline-2)] focus:shadow-xs focus:shadow-blue-300 focus:border-[var(--color-outline)]"
                style={{
                  background: "var(--color-base-300)",
                  color: "var(--color-base-content)"
                }}
              />
            </div>

            <p
              className="inter text-xs leading-relaxed"
              style={{ color: "var(--color-base-content)", opacity: 0.5 }}
            >
              <i>{t('messageFeedback.note')}{" "}</i>
              <a
                href="#"
                className="underline decoration-[var(--color-base-text)] hover:decoration-[var(--color-base-content)]"
                style={{ textDecorationThickness: "1px", textUnderlineOffset: "2px" }}
              >
                <i>{t('messageFeedback.learnMore')}</i>
              </a>
            </p>
          </div>

          <div
            className="px-6 pt-1 pb-4 flex items-center justify-end gap-3"
          >
            <button
              onClick={() => {
                if (type === 'positive') {
                  setLikeEnabled(messageId, true)
                }
                else {
                  setDislikeEnabled(messageId, true)
                }

                handleCancel()
              }}
              disabled={isSubmitting}
              className="inter px-4 py-1.5 rounded-lg text-sm font-medium transition-all hover:opacity-90 active:scale-98 disabled:opacity-50"
              style={{
                background: "var(--color-base-content)",
                color: "var(--color-base-100)",
                fontWeight: 500
              }}
            >
              {isSubmitting ? t('messageFeedback.buttons.submitting') : t('messageFeedback.buttons.submit')}
            </button>
            <button
              onClick={handleCancel}
              disabled={isSubmitting}
              className="inter px-4 py-1.5 border border-[var(--color-outline-2)] rounded-lg text-sm font-medium transition-all hover:border-transparent hover:bg-[var(--color-base-400)] active:scale-98 disabled:opacity-50"
              style={{
                color: "var(--color-base-content)"
              }}
            >
              {t('messageFeedback.buttons.cancel')}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}