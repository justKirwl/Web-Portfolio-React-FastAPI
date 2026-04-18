export default function TypingDots() {
  return (
    <div className="flex items-center gap-[5px] px-1 py-0.5">
      <style>{`
        @keyframes rubik-bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.35; }
          40%            { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="block w-2 h-2 rounded-sm"
          style={{
            background: "var(--color-primary)",
            animation: `rubik-bounce 1.3s ${i * 0.18}s infinite ease-in-out`,
          }}
        />
      ))}
    </div>
  );
}