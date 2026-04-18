import { toast } from "sonner";

export const InfoToast = ({ htmlTitle, description }: { htmlTitle: string; description?: string }) => {
  return (
    <div
      className="flex items-start bg-[var(--color-outline)]/15 backdrop-blur-xs gap-3 p-4 rounded-lg border"
      style={{
        borderColor: "var(--color-outline)",
      }}
    >
      <div
        className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
        style={{
          background: "var(--color-outline)",
        }}
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2.5"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4M12 8h.01" />
        </svg>
      </div>

      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-medium mb-0.5"
          style={{ color: "var(--color-base-content)" }}
          dangerouslySetInnerHTML={{ __html: htmlTitle }}
        />
        {description && (
          <p
            className="text-xs leading-relaxed"
            style={{ color: "var(--color-base-content)", opacity: 0.7 }}
          >
            {description}
          </p>
        )}
      </div>
    </div>
  );
};

export const ErrorToast = ({ htmlTitle, description }: { htmlTitle: string; description?: string }) => {
  return (
    <div
      className="flex items-start bg-[var(--color-error)]/15 backdrop-blur-xs gap-3 p-4 rounded-lg border"
      style={{
        borderColor: "var(--color-error)",
      }}
    >
      <div
        className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
        style={{
          background: "var(--color-error)",
        }}
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2.5"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
      </div>

      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-medium mb-0.5"
          style={{ color: "var(--color-base-content)" }}
          dangerouslySetInnerHTML={{ __html: htmlTitle }}
        />
        {description && (
          <p
            className="text-xs leading-relaxed"
            style={{ color: "var(--color-base-text)" }}
          >
            {description}
          </p>
        )}
      </div>
    </div>
  );
};

export const WarningToast = ({ htmlTitle, description }: { htmlTitle: string; description?: string }) => {
  return (
    <div
      className="flex items-start bg-[var(--color-warning)]/15 backdrop-blur-xs gap-3 p-4 rounded-lg border"
      style={{
        borderColor: "var(--color-warning)",
      }}
    >
      <div
        className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
        style={{
          background: "var(--color-warning)",
        }}
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2.5"
        >
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      </div>

      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-medium mb-0.5"
          style={{ color: "var(--color-base-content)" }}
          dangerouslySetInnerHTML={{ __html: htmlTitle }}
        />
        {description && (
          <p
            className="text-xs leading-relaxed"
            style={{ color: "var(--color-base-content)", opacity: 0.7 }}
          >
            {description}
          </p>
        )}
      </div>
    </div>
  );
};

export const showInfoToast = (htmlTitle: string, description?: string) => {
  toast.custom(() => <InfoToast htmlTitle={htmlTitle} description={description} />, {
    closeButton: true
  });
};

export const showErrorToast = (htmlTitle: string, description?: string) => {
  toast.custom(() => <ErrorToast htmlTitle={htmlTitle} description={description} />, {
    closeButton: true
  });
};

export const showWarningToast = (htmlTitle: string, description?: string) => {
  toast.custom(() => <WarningToast htmlTitle={htmlTitle} description={description} />, {
    closeButton: true
  });
};