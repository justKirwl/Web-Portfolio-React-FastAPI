export default function GeneratingTitle() {
  return (
    <span
      className="relative inline-block font-medium"
      style={{
        color: "var(--color-base-content)",
        opacity: 0.8,
        backgroundImage:
          "linear-gradient(90deg, var(--color-base-content) 0%, #fff 50%, var(--color-base-300) 100%)",
        backgroundSize: "200% auto",
        backgroundClip: "text",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        animation: "shimmer 2s linear infinite",
      }}
    >
      Generating...
    </span>
  )
}