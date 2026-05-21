"use client";

import { useEffect, useRef, memo, useState } from "react";
import "./turnstile-captcha.css"

export const TurnstileWrapper = memo(({ onVerify }: { onVerify: (t: string) => void }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const isInitializedRef = useRef(false);
  const [isVisible, setIsVisible] = useState(false);

  // 1. Defer initialization until the element is in the DOM and visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const scriptId = "cloudflare-turnstile-script";
    let isMounted = true;

    const renderTurnstile = () => {
      if (!isMounted || !window.turnstile || !containerRef.current) return;
      if (isInitializedRef.current || widgetIdRef.current) return;

      try {
        isInitializedRef.current = true;
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "0x4AAAAAADJDC_EPmDS_64My",
          callback: (token: string) => {
            if (isMounted) onVerify(token);
          },
          theme: "dark",
        });
      } catch (err) {
        // Suppress expected DOM manipulation errors that we can't control
        if (!(err instanceof Error && err.name === 'NotFoundError')) {
           console.error("[Turnstile] Render error:", err);
        }
        isInitializedRef.current = false;
      }
    };

    const script = document.getElementById(scriptId) as HTMLScriptElement;
    if (!script) {
      const s = document.createElement("script");
      s.id = scriptId;
      s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      s.async = true;
      s.onload = renderTurnstile;
      document.head.appendChild(s);
    } else if (window.turnstile) {
      renderTurnstile();
    } else {
      script.onload = renderTurnstile;
    }

    return () => {
      isMounted = false;
    };
  }, [isVisible, onVerify]);

  return (
    <div 
      ref={containerRef} 
      className="turnstile-captcha-container" 
      data-testid="turnstile-container"
    />
  );
});

TurnstileWrapper.displayName = "TurnstileWrapper";
