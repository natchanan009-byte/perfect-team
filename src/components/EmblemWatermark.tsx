// ตราตำรวจ (นรต.) เป็นลายน้ำพื้นหลังจางๆ ใช้ร่วมกันหลายหน้า
export function EmblemWatermark() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 flex items-center justify-center overflow-hidden"
    >
      <svg
        viewBox="0 0 120 120"
        className="h-[min(90vw,640px)] w-[min(90vw,640px)] opacity-[0.04]"
      >
        {/* โล่ */}
        <path
          d="M60 8 L104 24 V60 C104 88 84 106 60 114 C36 106 16 88 16 60 V24 Z"
          fill="none"
          stroke="#0F172A"
          strokeWidth="1.5"
        />
        {/* ปีกซ้าย/ขวา */}
        <path d="M28 58 Q44 50 58 58 Q44 60 28 62 Z" fill="#0F172A" />
        <path d="M92 58 Q76 50 62 58 Q76 60 92 62 Z" fill="#0F172A" />
        {/* ดาว */}
        <path
          d="M60 34 l5.5 11.5 12.5 1.8 -9 8.9 2.2 12.6 -11.2 -6 -11.2 6 2.2 -12.6 -9 -8.9 12.5 -1.8 Z"
          fill="#0F172A"
        />
        <text
          x="60"
          y="98"
          textAnchor="middle"
          fill="#0F172A"
          fontSize="13"
          fontWeight="700"
          letterSpacing="1"
        >
          นรต.
        </text>
      </svg>
    </div>
  );
}
