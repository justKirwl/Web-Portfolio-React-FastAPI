import { useCallback, useEffect, useRef } from "react";
import Sidebar from "../components/Sidebar";
import { useSettingsActions, useSettingsData, useSettingsInfo, useSettingsSensitiveData } from "../stores/SettingsStore";
import { ChangeIcon, CrossIcon } from "../components/Icons";
import { AnimatePresence, motion } from "framer-motion";
import DefaultAvatar from "../components/DefaultAvatar";
import { avatars } from "../utils/avatars";
import BillingSection from "../components/SettingsBillingSection";
import { useTranslation } from "../../node_modules/react-i18next";
import { useSettingsItems } from "../utils/settingsUtils";
import SettingsAccountSection from "../components/SettingsAccountSection";

export default function Settings() {
  const { activeSection } = useSettingsInfo()

  const settingsData = useSettingsData()

  const sensitiveData = useSettingsSensitiveData()

  const { sections, workFunctions } = useSettingsItems()

  const { setActiveSection, setSettingsData, getSettingsData, updateData, resetSettingsData, setAvatarRotating, setAvatarId, updateTheme } = useSettingsActions()

  const isFetched = useRef<boolean>(false);

  const { t, i18n } = useTranslation()

  useEffect(() => {
    if (isFetched.current) return

    getSettingsData()

    isFetched.current = true;
  }, [])

  useEffect(() => setActiveSection(t('settings.general')), [i18n.resolvedLanguage])

  const validateFields = useCallback(() => {
    if (settingsData.displayName.length <= 0) return false

    return true
  }, [settingsData])

  return (
    <div
      className="inter flex h-screen w-full overflow-hidden"
      style={{ background: "var(--color-base-100)", color: "var(--color-base-content)" }}
    >
      <Sidebar />

      <div className="my-10 flex flex-1 max-w-7xl mx-auto">
        <div
          className="w-64 flex flex-col shrink-0"
        >
          <nav className="flex-1 overflow-y-auto p-4">
            <h2
              className="text-2xl font-semibold mb-6 px-2 merriweather"
              style={{ color: "var(--color-base-text)" }}
            >
              {t('settings.title')}
            </h2>
            <div className="space-y-1">
              {sections.map((section) => (
                <button
                  key={section}
                  onClick={() => setActiveSection(section)}
                  className="w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-all"
                  style={{
                    background: activeSection === section ? "var(--color-base-400)" : "transparent",
                    color: "var(--color-base-content)",
                    opacity: activeSection === section ? 1 : 0.7,
                  }}
                  onMouseEnter={(e) => {
                    if (activeSection !== section) {
                      e.currentTarget.style.background = "var(--color-base-300)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeSection !== section) {
                      e.currentTarget.style.background = "transparent";
                    }
                  }}
                >
                  {section}
                </button>
              ))}
            </div>
          </nav>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl p-8 md:p-12">
          {activeSection === t('settings.general') && (
            <div className="space-y-10">
              <section>
                <h3
                  className="text-lg font-semibold mb-6"
                  style={{ color: "var(--color-base-content)" }}
                >
                  {t('settings.profile')}
                </h3>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label
                      className="block text-sm font-medium mb-2"
                      style={{ color: "var(--color-base-text)" }}
                    >
                      {t('settings.fullName')}
                    </label>
                    <div className="relative flex items-center gap-3">
                      <div className="group">
                        {settingsData.avatarId !== 1 && (
                          <button onClick={() => setAvatarId(1)} className="transition-all hover:bg-[var(--color-base-400)]/50 text-[var(--color-base-text)] hover:text-[var(--color-base-content)] rounded-full group-hover:opacity-100 opacity-0 w-5 h-5 absolute -top-2 -left-2 border border-[var(--color-outline-2)]/25 backdrop-blur-sm flex items-center justify-center z-50">
                            <div className="w-[12px] h-[12px] flex items-center justify-center">
                              <CrossIcon />
                            </div>
                          </button>
                        )}
                        <button onClick={() => {
                            setAvatarRotating(true)
                            setAvatarId(avatars[settingsData.avatarId! + 1] ? settingsData.avatarId! + 1 : 2)

                            setTimeout(() => setAvatarRotating(false), 500)
                          }} className="inline-flex items-center justify-center relative shrink-0 select-none border border-[var(--color-outline-2)] transition-all duration-100 backface-hidden h-11 w-6 rounded-[0.6rem] px-5 active:scale-[0.985] whitespace-nowrap flex-shrink-0 group">
                          <ChangeIcon />
                          <div className="group-hover:opacity-40 transition-all group-hover:blur-[3px] group-hover:scale-[1.15]">
                            <div className="w-[34px] h-[34px] flex items-center justify-center">
                              {settingsData.avatarId === 1 ? <DefaultAvatar username={settingsData.fullName}/> : (
                                <div className="flex shrink-0 items-center justify-center rounded-full font-semibold select-none h-8 w-8">
                                    {avatars[settingsData.avatarId!]}
                                </div>
                              )}
                            </div>
                          </div>
                        </button>
                      </div>
                      <input
                        type="text"
                        value={settingsData.fullName}
                        onChange={(e) => setSettingsData({ ...settingsData, fullName: e.target.value})}
                        className="flex-1 px-4 py-2.5 rounded-lg border border-[var(--color-base-300)] bg-[var(--color-base-200)] outline-none text-sm transition-all hover:border-[var(--color-outline-2)] focus:shadow-xs focus:shadow-blue-300 focus:border-[var(--color-outline)] disabled:bg-[var(--color-base-400)] disabled:cursor-not-allowed"
                        style={{
                          color: "var(--color-base-content)"
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      className="block text-sm font-medium mb-2"
                      style={{ color: "var(--color-base-text)" }}
                    >
                      {t('settings.displayName')}
                    </label>
                    <input
                      type="text"
                      value={settingsData.displayName}
                      onChange={(e) => setSettingsData({ ...settingsData, displayName: e.target.value})}
                      className="w-full px-4 py-2.5 border border-[var(--color-base-300)] rounded-lg outline-none text-sm transition-all hover:border-[var(--color-outline-2)] focus:shadow-xs focus:shadow-blue-300 focus:border-[var(--color-outline)]"
                      style={{
                        background: "var(--color-base-200)",
                        color: "var(--color-base-content)"
                      }}
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: "var(--color-base-text)" }}
                  >
                    {t('settings.workFunction')}
                  </label>
                  <select
                    value={settingsData.workFunction}
                    onChange={(e) => setSettingsData({ ...settingsData, workFunction: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-lg outline-none text-sm transition-all appearance-none border border-[var(--color-base-300)] hover:border-[var(--color-outline-2)] cursor-pointer"
                    style={{
                      background: "var(--color-base-200)",
                      color: "var(--color-base-content)",
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%23666' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E")`,
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "right 1rem center",
                      paddingRight: "3rem",
                    }}
                  >
                    <option value="">{t('settings.workFunctionSelect')}</option>
                    {workFunctions.map((func) => (
                      <option key={func} value={func}>
                        {t(`settings.workFunctions.${func}`)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mt-6">
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: "var(--color-base-text)" }}
                  >
                    {t('settings.preferences')}
                  </label>
                  <p
                    className="text-xs mb-3"
                    style={{ color: "var(--color-base-text)", opacity: 0.6 }}
                  >
                    {t('settings.preferencesNote')}
                  </p>
                  <textarea
                    value={settingsData.preferences}
                    onChange={(e) => setSettingsData({ ...settingsData, preferences: e.target.value})}
                    placeholder={t('settings.preferencesPlaceholder')}
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg outline-none text-sm border border-[var(--color-base-300)] resize-none transition-all hover:border-[var(--color-outline-2)] focus:shadow-xs focus:shadow-blue-300 focus:border-[var(--color-outline)]"
                    style={{
                      background: "var(--color-base-200)",
                      color: "var(--color-base-content)"
                    }}
                  />
                </div>
              </section>

              <AnimatePresence>
                {!Object.entries(settingsData).every(([key, value]) => !(key in sensitiveData) || value === (sensitiveData as any)[key]) && validateFields() && (
                  <motion.section
                    initial={{ opacity: 0, y: 20, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: 10, height: 0 }}
                    transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                    className="overflow-hidden mt-12"
                  >
                    <div className="flex justify-end gap-3 pb-4">
                      <button onClick={resetSettingsData} className="inline-flex justify-center items-center shrink-0 select-none min-w-[5rem] whitespace-nowrap border px-4 py-2 h-9 border-[var(--color-outline-2)] bg-[var(--color-base-200)] text-sm font-medium transition-all duration-100 rounded-lg hover:bg-[var(--color-base-400)] active:scale-[0.985]">
                        {t('settings.cancel')}
                      </button>
                      <button onClick={() => {const res = validateFields(); if (res) {updateData()}}} className="inline-flex justify-center items-center shrink-0 select-none bg-[var(--color-base-content)] font-medium text-[var(--color-base-400)] text-sm backface-hidden after:absolute after:inset-0 after:bg-[radial-gradient(at_bottom,hsla(var(--bg-000)/20%),hsla(var(--bg-000)/0%))] after:opacity-0 after:transition after:duration-200 after:translate-y-2 hover:after:opacity-100 hover:after:translate-y-0 transition-transform will-change-transform duration-150 ease-[cubic-bezier(0.165,0.85,0.45,1)] hover:scale-x-[1.015] hover:scale-y-[1.005] h-9 px-4 py-2 rounded-lg min-w-[5rem] active:scale-[0.985] whitespace-nowrap">
                        {t('settings.saveChanges')}
                      </button>
                    </div>
                  </motion.section>
                )}
              </AnimatePresence>

              <section className="pt-8 border-t" style={{ borderColor: "var(--color-base-300)" }}>
                <h3
                  className="text-lg font-semibold mb-6"
                  style={{ color: "var(--color-base-content)" }}
                >
                  {t('settings.appearance')}
                </h3>

                <div className="mb-8">
                  <label
                    className="block text-sm font-medium mb-4"
                    style={{ color: "var(--color-base-content)" }}
                  >
                    {t('settings.colorMode')}
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    {(["light", "auto", "dark"] as const).map((mode) => (
                      <button
                        key={mode}
                        onClick={async () => {
                          if (settingsData.colorMode !== mode && await updateTheme()) {
                            setSettingsData({ ...settingsData, colorMode: mode})
                            document.documentElement.dataset.theme = mode
                            localStorage.setItem('theme', mode)  
                          }
                        }}
                        className="relative group"
                      >
                        <div
                          className="rounded-lg overflow-hidden transition-all"
                          style={{
                            border: `2px solid ${
                              settingsData.colorMode === mode ? "var(--color-outline)" : "var(--color-base-300)"
                            }`,
                          }}
                        >
                          <div
                            className="aspect-[4/3] p-3 flex flex-col justify-between"
                            style={{
                              background:
                                mode === "light"
                                  ? "#f1f1f1ff"
                                  : mode === "auto"
                                  ? "linear-gradient(to bottom, #ffffff 50%, #1a1a1a 50%)"
                                  : "#1a1a1a",
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex gap-1">
                                <div
                                  className="w-1.5 h-1.5 rounded-full"
                                  style={{ background: mode === "dark" ? "#4a4a4a" : "#e0e0e0" }}
                                />
                                <div
                                  className="w-1.5 h-1.5 rounded-full"
                                  style={{ background: mode === "dark" ? "#4a4a4a" : "#e0e0e0" }}
                                />
                              </div>
                              <div
                                className="w-1 h-1 rounded-full"
                                style={{ background: "var(--color-error)" }}
                              />
                            </div>

                            <div className="space-y-1.5">
                              <div
                                className="w-3/4 h-2 rounded-sm ml-auto"
                                style={{
                                  background:
                                    mode === "dark"
                                      ? "var(--color-outline)"
                                      : mode === "light"
                                      ? "#d3dde0ff"
                                      : "var(--color-outline)",
                                }}
                              />
                              <div
                                className="w-2/3 h-2 rounded-sm"
                                style={{ background: mode === "dark" ? "#2a2a2a" : "#d1d0d0ff" }}
                              />
                            </div>
                          </div>
                        </div>
                        <p
                          className="text-sm mt-2 text-center capitalize font-medium"
                          style={{
                            color:
                              settingsData.colorMode === mode
                                ? "var(--color-base-content)"
                                : "var(--color-base-content)",
                            opacity: settingsData.colorMode === mode ? 1 : 0.6,
                          }}
                        >
                          {t(`settings.${mode}`)}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeSection === t('settings.account') && <SettingsAccountSection />}

          {activeSection === t('settings.billing') && <BillingSection currentPlan={settingsData.billingPlan} />}
        </div>
      </div>
      </div>
    </div>
  );
}