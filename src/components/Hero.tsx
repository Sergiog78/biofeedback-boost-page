import { Button } from "@/components/ui/button";
import { ArrowRight, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import heroImage from "@/assets/biofeedback-hero.jpg";
import bfeLogo from "@/assets/bfe-logo-text.png";
import righettoLogo from "@/assets/righetto-logo.png";
import { getCurrentTier, formatPrice } from "@/lib/pricing-tiers";

const VIDEO_URL = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/videos/vsl.mp4`;

const Hero = () => {
  const navigate = useNavigate();
  const [tierInfo, setTierInfo] = useState(getCurrentTier());
  const [showStickyCta, setShowStickyCta] = useState(false);
  const heroRef = useRef<HTMLElement>(null);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasScrolledRef = useRef(false);

  useEffect(() => {
    const interval = setInterval(() => setTierInfo(getCurrentTier()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Sticky CTA: show after 5s of scrolling, hide when hero is visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShowStickyCta(false);
          hasScrolledRef.current = false;
          if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
        }
      },
      { threshold: 0.3 }
    );

    if (heroRef.current) observer.observe(heroRef.current);

    const handleScroll = () => {
      if (hasScrolledRef.current) return;
      hasScrolledRef.current = true;
      scrollTimerRef.current = setTimeout(() => {
        setShowStickyCta(true);
      }, 5000);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
    };
  }, []);

  return (
    <>
      <section
        ref={heroRef}
        className="relative overflow-hidden"
      >
        {/* Background */}
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 8, 49, 0.88), rgba(0, 8, 49, 0.80)), url(${heroImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />

        {/* Content: 2-col on desktop, stacked on mobile/tablet */}
        <div className="relative z-10 mx-auto max-w-7xl px-5 py-8 pt-24 md:px-10 lg:grid lg:grid-cols-[1fr_auto] lg:gap-12 lg:items-start lg:py-16 lg:pt-28 lg:pb-12">
          
          {/* LEFT COLUMN — Copy */}
          <div className="flex flex-col gap-5">
            {/* Eyebrow */}
            <span className="text-sm md:text-base font-semibold tracking-wide uppercase text-accent-foreground">
              Corso online live di 16 ore · Introduzione al Biofeedback in Psicoterapia
            </span>

            {/* Headline */}
            <h1 className="text-[28px] leading-[1.3] md:text-[36px] lg:text-[42px] lg:leading-[1.2] font-bold text-white">
              Impara a integrare il biofeedback nella tua pratica clinica in modo semplice, concreto e scientificamente rigoroso
            </h1>

            {/* Sottotitolo */}
            <p className="text-base md:text-lg leading-relaxed text-white/80 lg:max-w-[480px]">
              Per psicologi e psicoterapeuti che vogliono iniziare a usare il biofeedback in seduta senza perdersi nella complessità tecnica e senza snaturare la relazione terapeutica.
            </p>

            {/* Social proof */}
            <p className="text-sm text-white/60">
              ⭐ Già scelto da psicologi e psicoterapeuti che vogliono integrare il biofeedback nella pratica clinica
            </p>

            {/* CTA */}
            <Button
              variant="hero"
              size="xl"
              className="text-base font-semibold w-full sm:w-fit"
              onClick={() => navigate("/checkout")}
            >
              👉 Iscriviti ora e blocca il prezzo early bird
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>

            {/* Microcopy sotto CTA */}
            <div className="text-sm text-white/70 -mt-3">
              <p>Prezzo attuale: <span className="font-semibold text-white/90">€{formatPrice(tierInfo.tier.totalPrice)}</span>{tierInfo.nextTier && <span className="line-through ml-1.5 text-white/40">€{formatPrice(tierInfo.nextTier.totalPrice)}</span>}</p>
              <p className="text-white/50 text-xs mt-0.5">Il prezzo aumenterà nei prossimi giorni</p>
            </div>

            {/* Microproof */}
            <div className="flex flex-col gap-1.5 text-sm text-white/70">
              <span className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-accent-foreground shrink-0" /> Corso live (non registrato)
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-accent-foreground shrink-0" /> Accessibile anche senza basi tecniche
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-accent-foreground shrink-0" /> Supporto + community + supervisione
              </span>
            </div>
          </div>

          {/* RIGHT COLUMN — Video */}
          <div className="mt-8 lg:mt-0 w-full lg:w-[380px] lg:shrink-0">
            {/* Caption sopra video */}
            <p className="text-sm font-medium text-white/80 mb-3">
              👉 Guarda questo video prima di iscriverti
            </p>

            {/* Video container — 9:16 vertical */}
            <div className="w-full aspect-[9/16] rounded-xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.25)] border border-white/10 bg-black/40">
              <video
                className="w-full h-full object-cover"
                controls
                preload="metadata"
                playsInline
              >
                <source src={VIDEO_URL} type="video/mp4" />
                Il tuo browser non supporta il tag video.
              </video>
            </div>

            {/* Bullet points sotto video */}
            <div className="mt-6 text-left">
              <p className="text-white/90 font-semibold mb-3 text-sm md:text-base">
                In questo video scoprirai:
              </p>
              <ul className="space-y-2 text-white/75 text-sm leading-relaxed">
                <li className="flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 mt-0.5 text-accent-foreground shrink-0" />
                  Perché molti terapeuti non riescono a usare il biofeedback (anche dopo averlo studiato)
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 mt-0.5 text-accent-foreground shrink-0" />
                  Come iniziare a integrarlo davvero nelle tue sedute
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 mt-0.5 text-accent-foreground shrink-0" />
                  Come avere maggiore chiarezza nei processi clinici
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 mt-0.5 text-accent-foreground shrink-0" />
                  Perché non serve essere esperti di tecnologia
                </li>
              </ul>
            </div>

            {/* CTA secondaria — solo mobile */}
            <div className="mt-6 lg:hidden">
              <Button
                variant="hero"
                size="xl"
                className="text-base font-semibold w-full"
                onClick={() => navigate("/checkout")}
              >
                👉 Iscriviti ora e blocca il prezzo early bird
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Partner logos */}
        <div className="relative z-10 flex justify-center gap-4 pb-10">
          <div className="bg-white/5 backdrop-blur-sm rounded-lg px-6 py-3 border border-white/10">
            <img
              src={bfeLogo}
              alt="BFE - Biofeedback Federation of Europe"
              className="h-8 md:h-10 w-auto opacity-80 hover:opacity-100 transition-opacity"
            />
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-lg px-6 py-3 border border-white/10">
            <img
              src={righettoLogo}
              alt="Righetto - Partner dispositivi biofeedback"
              className="h-8 md:h-10 w-auto opacity-80 hover:opacity-100 transition-opacity"
            />
          </div>
        </div>

        {/* Bottom gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Sticky CTA — mobile-optimized */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ${
          showStickyCta ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="bg-white/95 backdrop-blur-md border-t border-border shadow-[0_-2px_10px_rgba(0,0,0,0.1)] px-3 py-3">
          <div className="container mx-auto flex items-center justify-between gap-3">
            <span className="text-foreground font-medium text-sm hidden sm:block">
              €{formatPrice(tierInfo.tier.totalPrice)} — Posti limitati
            </span>
            <Button
              variant="hero"
              size="sm"
              className="font-semibold w-full sm:w-auto"
              onClick={() => navigate("/checkout")}
            >
              Iscriviti al corso
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Hero;
