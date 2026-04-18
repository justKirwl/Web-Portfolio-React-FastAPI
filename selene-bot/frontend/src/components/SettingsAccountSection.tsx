import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSettingsActions, useSettingsData, useSettingsInfo } from "../stores/SettingsStore";
import { InfoIcon, RightArrowIcon } from "./Icons";
import { useTranslation } from "../../node_modules/react-i18next";

export default function SettingsAccountSection() {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const navigate = useNavigate();

  const settingsData = useSettingsData()

  const { t } = useTranslation()

  const { isDeletingAccount } = useSettingsInfo()

  const { deleteAccount } = useSettingsActions()

  const handleDownloadSeleneCode = () => {
    console.log("Downloading Selene Code...");
  };

  const handleDeleteAccount = async () => {
    await deleteAccount()
    setShowDeleteConfirm(false);
    navigate('/auth?next=/new')
  };

  const isPaidPlan = settingsData.billingPlan === "pro" || settingsData.billingPlan === "max";

  return (
    <div className="space-y-12">
      <section>
        <div
          className="rounded-xl p-6 flex items-center justify-between gap-6"
          style={{
            background: "var(--color-base-200)",
            border: "1px solid var(--color-base-300)",
          }}
        >
          <div className="flex-1">
            <h4 className="merriweather text-base font-semibold mb-2" style={{ color: "var(--color-base-content)" }}>
              {t('settingsAccount.seleneCode.title')}
            </h4>
            <p className="inter text-sm mb-4" style={{ color: "var(--color-base-text)" }}>
              {isPaidPlan 
                ? t('settingsAccount.seleneCode.descriptionPaid')
                : t('settingsAccount.seleneCode.descriptionFree')
              }
            </p>

            {isPaidPlan ? (
              <button
                onClick={handleDownloadSeleneCode}
                className="inline-flex items-center justify-center gap-1 inter rounded-lg text-sm outline-none"
                style={{
                  fontWeight: 500,
                  color: "var(--color-outline)",
                }}
              >
                {t('settingsAccount.seleneCode.downloadButton')}
                <RightArrowIcon className="shrink-0 w-3.5 h-3.5"/>
              </button>
            ) : (
              <button
                onClick={() => navigate('/upgrade')}
                className="inline-flex items-center justify-center gap-1 inter rounded-lg text-sm outline-none"
                style={{
                  fontWeight: 500,
                  color: "var(--color-outline)",
                }}
              >
                {t('settingsAccount.seleneCode.upgradeButton')}
                <RightArrowIcon className="shrink-0"/>
              </button>
            )}
          </div>

          <div
            className="shrink-0 px-4 py-3 rounded-lg select-none"
            style={{
              background: "var(--color-base-100)",
              border: "1px solid var(--color-base-400)",
            }}
          >
            <pre
              className="text-xs leading-tight font-mono"
              style={{
                color: "var(--color-primary)",
                fontFamily: "'Courier New', monospace",
                textShadow: "0 0 8px currentColor",
              }}
            >
{`  ____       _                  
 / ___|  ___| | ___ _ __   ___ 
 \\___ \\ / _ \\ |/ _ \\ '_ \\ / _ \\
  ___) |  __/ |  __/ | | |  __/
 |____/ \\___|_|\\___|_| |_|\\___|
  ____          _      
 / ___|___   __| | ___ 
| |   / _ \\ / _\` |/ _ \\
| |__| (_) | (_| |  __/
 \\____\\___/ \\__,_|\\___|`}
            </pre>
          </div>
        </div>

        {isPaidPlan && (
          <div
            className="mt-4 px-4 py-3 rounded-lg flex items-start gap-2"
            style={{
              background: "var(--color-base-200)",
              border: "1px solid var(--color-base-300)",
            }}
          >
            <InfoIcon className="shrink-0 w-4.5 h-4.5"/>
            <div>
              <p className="inter text-xs font-medium mb-1" style={{ color: "var(--color-base-content)" }}>
                {t('settingsAccount.seleneCode.installationTitle')}
              </p>
              <p className="inter text-xs leading-relaxed" style={{ color: "var(--color-base-text)" }}>{t('settingsAccount.seleneCode.installationInstruction1')}<code className='px-1.5 py-0.5 rounded text-sm tracking-wide' style={{ background: 'var(--color-base-300)', fontFamily: 'Italic' }}>selene-code --install</code>{t('settingsAccount.seleneCode.installationInstruction2')}</p>
            </div>
          </div>
        )}
      </section>

      <section className="pt-1.5 border-t" style={{ borderColor: "var(--color-base-300)" }}>
        <div
          className="rounded-xl p-6"
        >
          <div className="flex items-center rounded justify-between gap-6 px-4 py-3 bg-[var(--color-base-200)] border border-[var(--color-base-300)]">
            <div className="flex-1">
              <h4 className="inter text-sm" style={{ color: "var(--color-base-content)", fontWeight: 400 }}>
                {t('settingsAccount.deleteAccount.title')}
              </h4>
            </div>

            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="inter shrink-0 px-4 py-2 rounded-lg text-sm font-medium bg-[var(--color-base-content)] outline-none text-[var(--color-base-400)] transition-all duration-100 hover:opacity-95 active:scale-[0.99]"
              style={{ fontWeight: 500 }}
            >
              {t('settingsAccount.deleteAccount.button')}
            </button>
          </div>
        </div>

        {showDeleteConfirm && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0, 0, 0, 0.5)" }}
            onClick={() => setShowDeleteConfirm(false)}
          >
            <div
              className="rounded-xl p-6 max-w-md w-full"
              style={{
                background: "var(--color-base-500)",
                border: "1px solid var(--color-outline-2)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                >
                  <InfoIcon className="shrink-0 w-6 h-6"/>
                </div>

                <div className="flex-1">
                  <h4 className="text-lg font-semibold mb-2" style={{ color: "var(--color-base-content)" }}>
                    {t('settingsAccount.deleteAccount.confirmTitle')}
                  </h4>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--color-base-content)", opacity: 0.7 }}>
                    {t('settingsAccount.deleteAccount.confirmDescription')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 justify-end">
                <button
                  disabled={isDeletingAccount}
                  onClick={() => setShowDeleteConfirm(false)}
                  className="inter px-4 py-1.5 border border-[var(--color-outline-2)] bg-[var(--color-base-300)] rounded-lg text-sm font-medium transition-all duration-50 hover:bg-[var(--color-base-400)] hover:border-transparent disabled:bg-[var(--color-base-300)] disabled:border-[var(--color-outline-2)] disabled:opacity-50"
                  style={{
                    fontWeight: 500,
                    color: "var(--color-base-content)"
                  }}
                >
                  {t('settingsAccount.deleteAccount.cancel')}
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={isDeletingAccount}
                  className="inline-flex items-center justify-center gap-1.5 inter px-4 py-1.5 bg-[var(--color-base-content)] rounded-lg text-sm font-medium transition-all duration-50 hover:opacity-90 disabled:opacity-50"
                  style={{
                    color: "var(--color-base-400)",
                    fontWeight: 500
                  }}
                >
                  {isDeletingAccount && (
                    <div className="loading w-3.5 h-3.5 text-[var(--color-base-200)]"></div>
                  )}
                  {t('settingsAccount.deleteAccount.confirmDelete')}
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}