import { useNavigate } from "react-router-dom";
import useUpgradeItems from "../utils/prices";
import { RightArrowIcon, UpgradeCheckMark } from "./Icons";
import { useTranslation } from "../../node_modules/react-i18next";

interface BillingProps {
  currentPlan: string;
}

export default function BillingSection({ currentPlan }: BillingProps) {
  const navigate = useNavigate();
  const { plans } = useUpgradeItems();

  const currentPlanData = plans.find((p) => p.id === currentPlan);

  const { t } = useTranslation()

  if (!currentPlanData) return null;

  return (
    <div className="space-y-6">
      <div>
        <h3
          className="inter text-lg font-semibold mb-6"
          style={{ color: "var(--color-base-content)" }}
        >
          {t('settingsBilling.currentPlan')}
        </h3>

        <div
          className="rounded-xl p-6"
          style={{
            background: "var(--color-base-200)",
            border: "1px solid var(--color-base-300)",
          }}
        >
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                style={{
                  color: "var(--color-base-content)"
                }}
              >
                {currentPlanData.icon}
              </div>
              <div>
                <h4
                  className="inter text-xl font-semibold mb-1"
                  style={{ color: "var(--color-base-content)" }}
                >
                  {currentPlanData.name} {t('settingsBilling.plan')}
                </h4>
                <p
                  className="inter text-sm"
                  style={{ color: "var(--color-base-text)" }}
                >
                  {currentPlanData.description}
                </p>
              </div>
            </div>

            {currentPlan !== "max" && (
              <button
                onClick={() => navigate("/upgrade")}
                className="inter px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-90 active:scale-98"
                style={{
                  background: "var(--color-base-content)",
                  color: "var(--color-base-100)",
                  fontWeight: 500
                }}
              >
                {t('settingsBilling.upgradeButton')}
              </button>
            )}
          </div>

          <div className="space-y-2.5">
            {currentPlanData.highlight && (
              <p
                className="inter text-sm font-medium mb-3"
                style={{ color: "var(--color-base-text)" }}
              >
                {currentPlanData.highlight}
              </p>
            )}
            {currentPlanData.features.map((feature, index) => (
              <div
                key={index}
                className="inter flex items-start gap-3 text-sm"
                style={{ color: "var(--color-base-text)" }}
              >
                <UpgradeCheckMark />
                <span>{feature}</span>
              </div>
            ))}
          </div>

          {currentPlan === "free" && (
            <div
              className="mt-6 pt-6 border-t"
              style={{ borderColor: "var(--color-base-300)" }}
            >
              <p
                className="inter text-xs"
                style={{ color: "var(--color-base-text)" }}
              >
                {t('settingsBilling.usageLimitsFree')}
              </p>
            </div>
          )}

          {currentPlan === "pro" && (
            <div
              className="mt-6 pt-6 border-t space-y-3"
              style={{ borderColor: "var(--color-base-300)" }}
            >
              <div className="flex items-center justify-between">
                <p
                  className="inter text-sm"
                  style={{ color: "var(--color-base-text)" }}
                >
                  {t('settingsBilling.billingCycle')}
                </p>
                <p
                  className="inter text-sm font-medium"
                  style={{ color: "var(--color-base-content)" }}
                >
                  {t('settingsBilling.billingCycleValue')}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <p
                  className="inter text-sm"
                  style={{ color: "var(--color-base-text)" }}
                >
                  {t('settingsBilling.nextBillingDate')}
                </p>
                <p
                  className="inter text-sm font-medium"
                  style={{ color: "var(--color-base-content)" }}
                >
                  {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <p
                  className="inter text-sm"
                  style={{ color: "var(--color-base-text)" }}
                >
                  {t('settingsBilling.amount')}
                </p>
                <p
                  className="inter text-sm font-medium"
                  style={{ color: "var(--color-base-content)" }}
                >
                  ${currentPlanData.price}.00 USD
                </p>
              </div>
              <div className="pt-3">
                <button
                  onClick={() => {
                    console.log("Manage subscription");
                  }}
                  className="inline-flex items-center gap-1 justify-center inter text-sm font-medium"
                  style={{ color: "var(--color-base-content)" }}
                >
                  {t('settingsBilling.manageSubscription')}
                  <RightArrowIcon className="text-[var(--color-base-text)] mt-0.5"/>
                </button>
              </div>
              <p
                className="inter text-xs pt-3"
                style={{ color: "var(--color-base-text)" }}
              >
                {t('settingsBilling.usageLimitsPro')}
              </p>
            </div>
          )}

          {currentPlan === "max" && (
            <div
              className="mt-6 pt-6 border-t space-y-3"
              style={{ borderColor: "var(--color-base-300)" }}
            >
              <div className="flex items-center justify-between">
                <p
                  className="inter text-sm"
                  style={{ color: "var(--color-base-text)" }}
                >
                  {t('settingsBilling.usageTier')}
                </p>
                <p
                  className="inter text-sm font-medium"
                  style={{ color: "var(--color-base-content)" }}
                >
                  20x Pro {t('settingsBilling.usage')}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <p
                  className="inter text-sm"
                  style={{ color: "var(--color-base-text)" }}
                >
                  {t('settingsBilling.billingCycle')}
                </p>
                <p
                  className="inter text-sm font-medium"
                  style={{ color: "var(--color-base-content)" }}
                >
                  {t('settingsBilling.billingCycleValue')}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <p
                  className="inter text-sm"
                  style={{ color: "var(--color-base-text)" }}
                >
                  {t('settingsBilling.nextBillingDate')}
                </p>
                <p
                  className="inter text-sm font-medium"
                  style={{ color: "var(--color-base-content)" }}
                >
                  {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <p
                  className="inter text-sm"
                  style={{ color: "var(--color-base-text)" }}
                >
                  {t('settingsBilling.amount')}
                </p>
                <p
                  className="inter text-sm font-medium"
                  style={{ color: "var(--color-base-content)" }}
                >
                  $200.00 USD
                </p>
              </div>
              <div className="pt-3">
                <button
                  onClick={() => {
                    console.log("Manage subscription");
                  }}
                  className="inline-flex items-center gap-1 justify-center inter text-sm font-medium"
                  style={{ color: "var(--color-base-content)" }}
                >
                  {t('settingsBilling.manageSubscription')}
                  <RightArrowIcon className="text-[var(--color-base-text)] mt-0.5"/>
                </button>
              </div>
              <p
                className="inter text-xs pt-3"
                style={{ color: "var(--color-base-content)", opacity: 0.5 }}
              >
                {t('settingsBilling.usageLimitsMax')}
              </p>
            </div>
          )}
        </div>
      </div>

      {(currentPlan === "pro" || currentPlan === "max") && (
        <div>
          <h3
            className="inter text-lg font-semibold mb-6"
            style={{ color: "var(--color-base-content)" }}
          >
            {t('settingsBilling.paymentMethod')}
          </h3>

          <div
            className="rounded-xl px-6 py-5"
            style={{
              background: "var(--color-base-200)",
              border: "1px solid var(--color-base-300)",
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-8 rounded flex items-center justify-center"
                  style={{
                    background: "var(--color-base-300)",
                  }}
                >
                  <svg width="24" height="18" viewBox="0 0 32 20" fill="none">
                    <rect width="32" height="20" rx="3" fill="var(--color-base-400)" opacity="0.3"/>
                    <circle cx="12" cy="10" r="5" fill="var(--color-error)" opacity="0.8"/>
                    <circle cx="20" cy="10" r="5" fill="var(--color-warning)" opacity="0.8"/>
                  </svg>
                </div>

                <div>
                  <p
                    className="inter text-sm font-medium mb-0.5"
                    style={{ color: "var(--color-base-content)" }}
                  >
                    •••• •••• •••• 4242
                  </p>
                  <p
                    className="inter text-xs"
                    style={{ color: "var(--color-base-text)", opacity: 0.7 }}
                  >
                    {t('settingsBilling.expires')} 12/26
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  console.log("Update payment method");
                }}
                className="inter px-4 py-1.5 rounded-lg border border-[var(--color-outline-2)] text-sm font-medium transition-all hover:bg-[var(--color-base-400)] hover:border-transparent active:scale-98"
                style={{
                  color: "var(--color-base-content)",
                  fontWeight: 500
                }}
              >
                {t('settingsBilling.updatePaymentMethod')}
              </button>
            </div>
          </div>
        </div>
      )}

      {(currentPlan === "pro" || currentPlan === "max") && (
        <div>
          <h3
            className="inter text-lg font-semibold mb-6"
            style={{ color: "var(--color-base-content)" }}
          >
            {t('settingsBilling.billingHistory')}
          </h3>

          <div
            className="rounded-xl overflow-hidden"
            style={{
              background: "var(--color-base-200)",
              border: "1px solid var(--color-base-300)",
            }}
          >
            {[
              { date: "Mar 1, 2026", amount: currentPlan === "pro" ? 20 : 200, status: t('settingsBilling.invoiceStatusPaid') },
              { date: "Feb 1, 2026", amount: currentPlan === "pro" ? 20 : 200, status: t('settingsBilling.invoiceStatusPaid') },
              { date: "Jan 1, 2026", amount: currentPlan === "pro" ? 20 : 200, status: t('settingsBilling.invoiceStatusPaid') },
            ].map((invoice, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 transition-all hover:bg-opacity-70"
                style={{
                  borderBottom: index < 2 ? "1px solid var(--color-base-300)" : "none",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--color-base-250)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                <div>
                  <p
                    className="inter text-sm font-medium mb-1"
                    style={{ color: "var(--color-base-content)" }}
                  >
                    {currentPlanData.name} {t('settingsBilling.plan')}
                  </p>
                  <p
                    className="inter text-xs"
                    style={{ color: "var(--color-base-text)", opacity: 0.7 }}
                  >
                    {invoice.date}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <p
                    className="inter text-sm font-medium"
                    style={{ color: "var(--color-base-content)" }}
                  >
                    ${invoice.amount}.00
                  </p>
                  <span
                    className="inter text-[var(--color-outline)] bg-[var(--color-outline)]/15 text-xs px-2 py-1 rounded-full"
                  >
                    {invoice.status}
                  </span>
                  <button
                    className="text-sm text-[var(--color-base-text)] hover:text-[var(--color-base-content)]"
                    title={t('settingsBilling.downloadInvoice')}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}