import { Button } from "@/components/ui/button";
import { ArrowRight, Check, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import heroImage from "@/assets/biofeedback-hero.webp";
import centersLogo from "@/assets/centers-of-excellence.webp";
import righettoLogo from "@/assets/righetto-logo.webp";
import { getCurrentTier, formatPrice, getDiscountPercent } from "@/lib/pricing-tiers";

const YOUTUBE_VIDEO_ID = "dV9ER9Hx3J8";

const Hero = () => {
  const navigate = useNavigate();
  const [tierInfo, setTierInfo] = useState(getCurrentTier());
  const [showStickyCta, setShowStickyCta] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const heroRef = useRef<HTMLElement>(null);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasScrolledRef = useRef(false);

  useEffect(() => {
    const interval = setInterval(() => setTierInfo(getCurrentTier()), 1000);
    return () => clearInterval(interval);
  }, []);

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

        {/* Content */}
        <div className="relative z-10 mx-auto max-w-[1320px] px-4 py-8 pt-24 md:px-5 lg:grid lg:grid-cols-[1.4fr_auto] lg:gap-12 lg:items-start lg:py-16 lg:pt-28 lg:pb-12 lg:px-3">
          
          {/* LEFT COLUMN — Copy */}
          <div className="flex flex-col gap-5 text-center lg:text-left items-center lg:items-start">
            {/* Eyebrow */}
            <span className="inline-block bg-white text-primary text-sm md:text-base font-semibold tracking-wide uppercase px-5 py-2 rounded-full">
              Corso online <span className="text-destructive">live</span> di 16 ore · Introduzione al Biofeedback in Psicoterapia
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
              ⭐ Già scelto da 30+ psicoterapeuti nella prima edizione · Prossima edizione: 9 maggio 2026
            </p>

            {/* CTA */}
            <Button
              variant="hero"
              size="xl"
              className="text-base font-semibold w-full sm:w-fit"
              onClick={() => navigate("/checkout")}
            >
              Iscriviti ora e blocca il prezzo attuale
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>

            {/* Microcopy sotto CTA */}
            <div className="text-sm text-white/70 -mt-3">
              <p className="flex items-center justify-center lg:justify-start gap-2 flex-wrap">
                <span className="font-semibold text-white/90">€{tierInfo.tier.basePrice} + IVA</span>
                <span className="text-white/70">(€{tierInfo.tier.totalPrice.toFixed(2).replace(".", ",")} IVA inclusa)</span>
                {getDiscountPercent(tierInfo.tier) > 0 && (
                  <span className="inline-flex items-center rounded-full bg-accent/20 text-accent-foreground text-xs font-medium px-2.5 py-0.5">
                    −{getDiscountPercent(tierInfo.tier)}% rispetto al prezzo finale
                  </span>
                )}
              </p>
              <p className="text-white/50 text-xs mt-0.5">IVA 22% inclusa nel totale. Deducibile per professionisti con P.IVA.</p>
              <p className="flex items-center justify-center lg:justify-start gap-1.5 flex-wrap text-sm text-white/80 mt-2 pt-2 border-t border-white/20">
                <span>oppure <span className="font-semibold text-white">3 rate da €{(tierInfo.tier.totalPrice / 3).toFixed(2).replace(".", ",")}</span> senza interessi ·</span>
                <img
                  src="https://x.klarnacdn.net/payment-method/assets/badges/generic/klarna.svg"
                  alt="Klarna"
                  className="h-4 w-auto inline-block bg-white rounded px-1 py-0.5"
                  loading="lazy"
                  decoding="async"
                />
              </p>
            </div>

            {/* Microproof — 3 bullet essenziali in riga */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-x-4 gap-y-2 text-xs md:text-sm text-white/80">
              <span className="flex items-center gap-1.5 font-semibold text-accent-foreground">
                <Check className="h-3.5 w-3.5 shrink-0" /> Certificazione BFE
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-accent-foreground shrink-0" /> Slide + materiali
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-accent-foreground shrink-0" /> Gruppo WhatsApp
              </span>
            </div>
          </div>

          {/* RIGHT COLUMN — Video (9:16 vertical) */}
          <div className="mt-8 lg:mt-0 w-full max-w-[280px] sm:max-w-[300px] mx-auto lg:mx-0 lg:w-[300px] lg:shrink-0 text-center lg:text-left">
            {/* Caption sopra video */}
            <p className="text-sm font-medium text-white/80 mb-3">
              👉 Guarda questo video prima di iscriverti
            </p>

            {/* Video container — 9:16 to match the vertical YouTube video */}
            <div className="w-full aspect-[9/16] rounded-xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.25)] border border-white/10 relative">
              {!videoLoaded ? (
                <button
                  type="button"
                  onClick={() => setVideoLoaded(true)}
                  className="absolute inset-0 w-full h-full group cursor-pointer bg-black"
                  aria-label="Guarda il video prima di iscriverti"
                >
                  <img
                    src={`https://i.ytimg.com/vi/${YOUTUBE_VIDEO_ID}/sddefault.jpg`}
                    alt="Video introduttivo al corso di biofeedback con Gabriele Ciccarese"
                    width="300"
                    height="533"
                    loading="eager"
                    {...({ fetchpriority: "high" } as any)}
                    decoding="async"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const img = e.currentTarget;
                      if (!img.dataset.fallback) {
                        img.dataset.fallback = "1";
                        img.src = `https://i.ytimg.com/vi/${YOUTUBE_VIDEO_ID}/hqdefault.jpg`;
                      }
                    }}
                  />
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="flex items-center justify-center w-[72px] h-[72px] rounded-full bg-black/70 group-hover:bg-black/85 transition-colors">
                      <span
                        className="block ml-1"
                        style={{
                          width: 0,
                          height: 0,
                          borderTop: "16px solid transparent",
                          borderBottom: "16px solid transparent",
                          borderLeft: "24px solid white",
                        }}
                      />
                    </span>
                  </span>
                </button>
              ) : (
                <iframe
                  src={`https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}?autoplay=1&rel=0&playsinline=1`}
                  title="Video introduttivo al corso di biofeedback con Gabriele Ciccarese"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full border-0 bg-black"
                />
              )}
            </div>

            {/* Bullet points sotto video — keep left aligned */}
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

          </div>
        </div>

        {/* Partner logos */}
        <div className="relative z-10 flex justify-center items-start gap-6 pb-10 flex-wrap">
          <div className="flex flex-col items-center gap-2">
            <div className="bg-white/5 backdrop-blur-sm rounded-lg px-6 py-3 border border-white/10">
              <img
                src={centersLogo}
                alt="Centers of Excellence 2025-26"
                className="h-12 md:h-15 w-auto opacity-80 hover:opacity-100 transition-opacity"
                style={{ height: "3.75rem" }}
                width="120"
                height="60"
                loading="lazy"
                decoding="async"
              />
            </div>
            <span className="text-xs text-white/60 font-medium">Centro di Eccellenza BFE</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="bg-white/5 backdrop-blur-sm rounded-lg px-6 py-3 border border-white/10">
              <img
                src={righettoLogo}
                alt="Righetto - Partner dispositivi biofeedback"
                className="h-12 md:h-15 w-auto opacity-80 hover:opacity-100 transition-opacity"
                style={{ height: "3.75rem" }}
                width="120"
                height="60"
                loading="lazy"
                decoding="async"
              />
            </div>
            <span className="text-xs text-white/60 font-medium">Righetto</span>
          </div>
        </div>

        {/* Bottom gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Sticky CTA */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ${
          showStickyCta ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="bg-white/95 backdrop-blur-md border-t border-border shadow-[0_-2px_10px_rgba(0,0,0,0.1)] px-3 py-2.5">
          <div className="container mx-auto flex items-center justify-between gap-3">
            <div className="hidden sm:flex items-center gap-3 text-sm">
              <span className="text-foreground font-medium">
                €{tierInfo.tier.basePrice} + IVA · tot. €{tierInfo.tier.totalPrice.toFixed(2).replace(".", ",")}
              </span>
              {tierInfo.nextTier && tierInfo.timeRemaining.totalMs > 0 && (
                <div className="flex items-center gap-1.5 text-accent">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="font-semibold tabular-nums">
                    {String(tierInfo.timeRemaining.days).padStart(2, "0")}g{" "}
                    {String(tierInfo.timeRemaining.hours).padStart(2, "0")}h{" "}
                    {String(tierInfo.timeRemaining.minutes).padStart(2, "0")}m
                  </span>
                </div>
              )}
            </div>
            <div className="flex sm:hidden items-center gap-2 text-xs">
              <span className="text-foreground font-semibold">
                €{tierInfo.tier.basePrice}+IVA · €{tierInfo.tier.totalPrice.toFixed(2).replace(".", ",")}
              </span>
              {tierInfo.nextTier && tierInfo.timeRemaining.totalMs > 0 && (
                <div className="flex items-center gap-1 text-accent">
                  <Clock className="w-3 h-3" />
                  <span className="font-semibold tabular-nums">
                    {String(tierInfo.timeRemaining.days).padStart(2, "0")}:{String(tierInfo.timeRemaining.hours).padStart(2, "0")}:{String(tierInfo.timeRemaining.minutes).padStart(2, "0")}
                  </span>
                </div>
              )}
            </div>
            <Button
              variant="hero"
              size="sm"
              className="font-semibold shrink-0"
              onClick={() => navigate("/checkout")}
            >
              Iscriviti ora
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Hero;
