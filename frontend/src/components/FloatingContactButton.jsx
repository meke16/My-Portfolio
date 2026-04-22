import React, { useEffect, useMemo, useRef, useState } from "react";

function toTelHref(phone) {
  const value = String(phone || "").trim();
  if (!value) return "";
  return `tel:${value.replace(/\s+/g, "")}`;
}

function toTelegramHref(raw) {
  const value = String(raw || "").trim();
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;
  const slug = value.replace(/^@/, "").replace(/^\//, "");
  return slug ? `https://t.me/${slug}` : "";
}

function toWhatsAppHref(raw) {
  const value = String(raw || "").trim();
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;

  let digits = value.replace(/\D+/g, "");
  if (!digits) return "";

  // Convert local ETH format (09...) to international (251...).
  if (digits.startsWith("0")) {
    digits = `251${digits.slice(1)}`;
  }

  return `https://wa.me/${digits}`;
}

export default function FloatingContactButton({ info }) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);

  const primaryPhone = useMemo(() => {
    if (Array.isArray(info?.phones) && info.phones.length > 0) {
      return String(info.phones[0] || "").trim();
    }
    if (typeof info?.phones === "string") {
      return info.phones.trim();
    }
    return "";
  }, [info?.phones]);

  const socials = useMemo(() => {
    if (info?.socials && typeof info.socials === "object" && !Array.isArray(info.socials)) {
      return info.socials;
    }
    return {};
  }, [info?.socials]);

  const actions = useMemo(() => {
    const callHref = toTelHref(primaryPhone);
    const telegramHref = toTelegramHref(socials.telegram || socials.tg || '@meke_16');
    const whatsappHref = toWhatsAppHref(socials.whatsapp || primaryPhone);

    return [
      {
        key: "call",
        label: "Call",
        detail: primaryPhone,
        href: callHref,
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.89.33 1.76.62 2.6a2 2 0 0 1-.45 2.11L8 9.91a16 16 0 0 0 6 6l1.48-1.28a2 2 0 0 1 2.11-.45c.84.29 1.71.5 2.6.62A2 2 0 0 1 22 16.92z" />
          </svg>
        ),
      },
      {
        key: "telegram",
        label: "Telegram",
        detail: socials.telegram || socials.tg
          ? `@${String(socials.telegram || socials.tg).replace(/^@/, "")}`
          : "",
        href: telegramHref,
        icon: (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M9.04 15.37l-.38 5.35c.54 0 .78-.23 1.06-.5l2.54-2.43 5.26 3.86c.97.53 1.65.25 1.91-.9l3.46-16.2h.01c.32-1.49-.54-2.08-1.49-1.72L1.61 10.9c-1.43.56-1.41 1.35-.24 1.71l5.04 1.57L18.1 6.7c.55-.35 1.04-.16.63.19" />
          </svg>
        ),
      },
      {
        key: "whatsapp",
        label: "WhatsApp",
        detail: String(socials.whatsapp || primaryPhone || "").trim(),
        href: whatsappHref,
        icon: (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M20.52 3.48A11.87 11.87 0 0 0 12.07 0C5.52 0 .2 5.3.2 11.84c0 2.09.55 4.12 1.6 5.92L0 24l6.42-1.68a11.82 11.82 0 0 0 5.65 1.43h.01c6.55 0 11.87-5.3 11.87-11.84 0-3.16-1.24-6.13-3.43-8.43zM12.08 21.74h-.01a9.84 9.84 0 0 1-5.02-1.37l-.36-.21-3.81 1 1.02-3.71-.23-.38a9.8 9.8 0 0 1-1.5-5.23c0-5.43 4.44-9.84 9.9-9.84 2.64 0 5.12 1.03 6.98 2.9a9.73 9.73 0 0 1 2.9 6.95c0 5.43-4.45 9.85-9.88 9.85zm5.4-7.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.95 1.17-.17.2-.35.22-.65.08-.3-.15-1.27-.46-2.42-1.46a9.06 9.06 0 0 1-1.67-2.07c-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.53.15-.17.2-.3.3-.5.1-.2.05-.38-.02-.53-.08-.15-.67-1.61-.92-2.21-.24-.58-.48-.5-.67-.51h-.57c-.2 0-.53.08-.8.38-.27.3-1.05 1.02-1.05 2.48 0 1.46 1.08 2.87 1.23 3.07.15.2 2.1 3.2 5.1 4.48.71.3 1.26.48 1.7.61.71.22 1.35.18 1.86.11.57-.08 1.76-.72 2.01-1.42.25-.7.25-1.3.17-1.43-.08-.13-.28-.2-.58-.35z" />
          </svg>
        ),
      },
    ];
  }, [primaryPhone, socials]);

  const hasAnyAction = useMemo(() => actions.some((item) => item.href), [actions]);

  useEffect(() => {
    const onPointerDown = (event) => {
      if (!open) return;
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    const onEscape = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown, { passive: true });
    document.addEventListener("keydown", onEscape);

    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onEscape);
    };
  }, [open]);

  if (!hasAnyAction) {
    return null;
  }

  return (
    <div ref={panelRef} className="fixed right-4 bottom-24 md:bottom-6 z-[55] flex flex-col items-end gap-2">
      {open && (
        <div className="w-[230px] rounded-2xl border border-white/10 bg-[#0f0f0f]/95 backdrop-blur-xl p-2 shadow-[0_18px_45px_rgba(0,0,0,0.45)]">
          <p className="px-2 pb-2 text-[10px] font-mono tracking-[0.16em] uppercase text-[#666]">
            Quick contact
          </p>
          <div className="space-y-1">
            {actions.map((item) => (
              item.href ? (
                <a
                  key={item.key}
                  href={item.href}
                  target={item.key === "call" ? undefined : "_blank"}
                  rel={item.key === "call" ? undefined : "noopener noreferrer"}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 border border-transparent hover:border-[#ff4500]/35 hover:bg-[#ff4500]/10 transition-all duration-200"
                >
                  <span className="text-[#ff4500]">{item.icon}</span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-white">{item.label}</span>
                    {item.detail && (
                      <span className="block text-[11px] text-[#8a8a8a] truncate">{item.detail}</span>
                    )}
                  </span>
                </a>
              ) : (
                <div
                  key={item.key}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 border border-white/10 opacity-55"
                >
                  <span className="text-[#666]">{item.icon}</span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-[#9a9a9a]">{item.label}</span>
                    <span className="block text-[11px] text-[#666] truncate">Not set</span>
                  </span>
                </div>
              )
            ))}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-14 h-14 rounded-full bg-[#ff4500] text-white shadow-[0_16px_36px_rgba(255,69,0,0.35)] hover:bg-[#e63e00] active:scale-95 transition-all duration-200 flex items-center justify-center"
        aria-label={open ? "Close quick contact" : "Open quick contact"}
        aria-expanded={open}
      >
        {open ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.3" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.89.33 1.76.62 2.6a2 2 0 0 1-.45 2.11L8 9.91a16 16 0 0 0 6 6l1.48-1.28a2 2 0 0 1 2.11-.45c.84.29 1.71.5 2.6.62A2 2 0 0 1 22 16.92z" />
          </svg>
        )}
      </button>
    </div>
  );
}