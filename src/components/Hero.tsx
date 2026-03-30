import { Button } from "@/components/ui/button";
import { ArrowRight, Check, Play } from "lucide-react";
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
        className="relative flex flex-col items-center overflow-hidden pt-20"
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

        <div className="container relative z-10 px-4 py-12 md:py-20">
          <div className="max-w-3xl mx-auto text-center text-white">
            {/* Eyebrow */}
            <div className="inline-block mb-5 px-4 py-2 bg-accent/20 backdrop-blur-sm rounded-full border border-accent/30">
              <span className="text-accent-foreground font-semibold text-xs md:text-sm">
                Corso online live di 16 ore | Introduzione al Biofeedback in Psicoterapia
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-5 leading-tight">
              Impara a integrare il biofeedback nella tua pratica clinica in modo semplice, concreto e scientificamente rigoroso
            </h1>

            {/* Sottotitolo */}
            <p className="text-base md:text-xl mb-4 text-white/85 leading-relaxed max-w-2xl mx-auto">
              Per psicologi e psicoterapeuti che vogliono iniziare a usare il biofeedback in seduta senza perdersi nella complessità tecnica e senza snaturare la relazione terapeutica.
            </p>

            {/* Social proof */}
            <p className="text-sm md:text-base text-white/70 mb-6">
              ⭐ Già scelto da psicologi e psicoterapeuti che vogliono integrare il biofeedback nella pratica clinica
            </p>

            {/* CTA primaria */}
            <Button
              variant="hero"
              size="xl"
              className="text-base md:text-lg w-full sm:w-auto"
              onClick={() => navigate("/checkout")}
            >
              Iscriviti ora al corso — €{formatPrice(tierInfo.tier.totalPrice)}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>

            {/* Microproof */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-center items-center mt-4 text-white/80 text-sm">
              <span className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-accent-foreground" /> Corso live (non registrato)
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-accent-foreground" /> Accessibile anche senza basi tecniche
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-accent-foreground" /> Supporto + community + supervisione
              </span>
            </div>

            {/* Video intro text */}
            <p className="mt-10 mb-4 text-white/90 font-medium text-base md:text-lg">
              Guarda il video e scopri perché il biofeedback non è complesso come ti hanno fatto credere
            </p>

            {/* VSL Video */}
            <div className="mx-auto max-w-sm w-full aspect-[9/16] rounded-xl overflow-hidden border border-white/15 bg-black/40 relative">
              <video
                className="w-full h-full object-cover"
                controls
                preload="metadata"
                poster=""
                playsInline
              >
                <source src={VIDEO_URL} type="video/mp4" />
                Il tuo browser non supporta il tag video.
              </video>
              {/* Play overlay fallback — only shows if poster is empty and video hasn't loaded */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-16 h-16 bg-accent/80 rounded-full flex items-center justify-center backdrop-blur-sm opacity-0 peer-paused:opacity-100">
                  <Play className="h-7 w-7 text-accent-foreground ml-1" />
                </div>
              </div>
            </div>

            {/* Bullet points sotto video */}
            <div className="mt-8 text-left max-w-md mx-auto">
              <p className="text-white/90 font-semibold mb-3 text-base">
                In questo video scoprirai:
              </p>
              <ul className="space-y-2 text-white/80 text-sm md:text-base">
                <li className="flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 mt-1 text-accent-foreground shrink-0" />
                  Perché molti terapeuti non riescono a usare il biofeedback (anche dopo averlo studiato)
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 mt-1 text-accent-foreground shrink-0" />
                  Come iniziare a integrarlo davvero nelle tue sedute
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 mt-1 text-accent-foreground shrink-0" />
                  Come avere maggiore chiarezza nei processi clinici
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 mt-1 text-accent-foreground shrink-0" />
                  Perché non serve essere esperti di tecnologia
                </li>
              </ul>
            </div>

            {/* CTA secondaria */}
            <div className="mt-8">
              <Button
                variant="hero"
                size="xl"
                className="text-base md:text-lg w-full sm:w-auto"
                onClick={() => navigate("/checkout")}
              >
                Iscriviti ora e inizia a usare il biofeedback nella tua pratica clinica
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>

            {/* Partner logos */}
            <div className="mt-10 flex justify-center gap-4">
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
          </div>
        </div>

        {/* Bottom gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Sticky CTA */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ${
          showStickyCta ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="bg-accent/95 backdrop-blur-md border-t border-accent-foreground/10 px-4 py-3 md:py-2">
          <div className="container mx-auto flex items-center justify-between gap-3">
            <span className="text-accent-foreground font-medium text-sm hidden sm:block">
              €{formatPrice(tierInfo.tier.totalPrice)} — Posti limitati
            </span>
            <Button
              variant="outline"
              size="sm"
              className="bg-accent-foreground text-accent hover:bg-accent-foreground/90 border-0 font-semibold w-full sm:w-auto"
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
