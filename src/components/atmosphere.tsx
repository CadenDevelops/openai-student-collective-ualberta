"use client";

import { useEffect, useRef, useState } from "react";

export function Atmosphere() {
  const [paused, setPaused] = useState(false);
  const [ready, setReady] = useState(false);
  const manualPause = useRef(false);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    try { manualPause.current = localStorage.getItem("collective-motion") === "paused"; } catch { /* Storage is optional. */ }
    const updatePreference = () => setPaused(preference.matches || manualPause.current);
    updatePreference();
    setReady(true);
    preference.addEventListener("change", updatePreference);
    return () => preference.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.motion = paused ? "paused" : "playing";
  }, [paused]);

  function toggle() {
    const next = !paused;
    manualPause.current = next;
    setPaused(next);
    try { localStorage.setItem("collective-motion", next ? "paused" : "playing"); } catch { /* Storage is optional. */ }
  }

  return <>
    <div className="atmosphere" aria-hidden="true">
      <div className="colour-field field-violet" />
      <div className="colour-field field-blue" />
      <div className="colour-field field-rose" />
      <div className="sky-tint" />
      <div className="orbital-system">
        <div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="orbit orbit-three" />
      </div>
      <div className="star-field" />
      <div className="horizon-grid" />
      <div className="horizon-line" />
      <div className="scan-lines" />
      <div className="atmosphere-shade" />
    </div>
    {ready && <button type="button" className="motion-toggle" onClick={toggle} aria-label={paused ? "Play background animation" : "Pause background animation"} title={paused ? "Play background animation" : "Pause background animation"}>
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">{paused ? <path d="m5 3 8 5-8 5V3Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/> : <path d="M5.5 3v10m5-10v10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>}</svg>
      <span>{paused ? "Play motion" : "Pause motion"}</span>
    </button>}
  </>;
}

export function ScrollReveals() {
  useEffect(() => {
    if (!('IntersectionObserver' in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.remove("reveal-pending");
          observer.unobserve(entry.target);
        }
      }
    }, { threshold: 0.12 });
    document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => {
      if (el.getBoundingClientRect().top > window.innerHeight) {
        el.classList.add("reveal-pending");
        observer.observe(el);
      }
    });
    return () => observer.disconnect();
  }, []);
  return null;
}
