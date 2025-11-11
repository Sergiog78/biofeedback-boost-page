import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/biofeedback-hero.jpg";
import bfeLogo from "@/assets/bfe-logo-text.png";
import righettoLogo from "@/assets/righetto-logo.png";
const Hero = () => {
  const navigate = useNavigate();
  return <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20">
      <div className="absolute inset-0 z-0" style={{
      backgroundImage: `linear-gradient(rgba(0, 8, 49, 0.85), rgba(0, 8, 49, 0.75)), url(${heroImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    }} />
      
      <div className="container relative z-10 px-4 py-20">
        <div className="max-w-4xl mx-auto text-center text-white">
          <div className="inline-block mb-6 px-4 py-2 bg-accent/20 backdrop-blur-sm rounded-full border border-accent/30">
            <span className="text-accent-foreground font-semibold text-sm">Certificazione BFE - Centro di Eccellenza Nova Mentis</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            Introduzione al Biofeedback in Psicoterapia
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 text-white/90 leading-relaxed">
            Percorso formativo online di 10 incontri per integrare il biofeedback nella pratica clinica
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <div className="flex items-center gap-2 text-white/90">
              <div className="w-2 h-2 bg-accent rounded-full"></div>
              <span className="font-medium">20 ore totali</span>
            </div>
            <div className="flex items-center gap-2 text-white/90">
              <div className="w-2 h-2 bg-accent rounded-full"></div>
              <span className="font-medium">10 incontri live</span>
            </div>
            <div className="flex items-center gap-2 text-white/90">
              <div className="w-2 h-2 bg-accent rounded-full"></div>
              <span className="font-medium">Certificazione internazionale</span>
            </div>
          </div>
          
          <div className="space-y-4">
            <Button variant="hero" size="xl" className="text-lg" onClick={() => navigate('/checkout')}>
              Iscriviti ora con lo sconto
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            
            <div className="text-white/80">
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <span className="text-sm line-through opacity-70">700€</span>
                <span className="text-accent font-bold text-2xl">497€</span>
                <span className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full text-green-400 text-xs font-medium">-29% • Risparmi 203€</span>
              </div>
              <div className="mt-3 px-4 py-2 bg-gradient-to-r from-amber-500/30 to-yellow-500/30 rounded-lg">
                <p className="text-amber-200 font-semibold text-sm">
                  ⚠️ OFFERTA RISERVATA esclusivamente ai partecipanti al 1° Convegno Nazionale sul Biofeedback in Psicoterapia • Valida solo 48 ore
                </p>
              </div>
              <p className="text-sm mt-2 text-accent">Offerta valida fino al 10 novembre 2025</p>
            </div>
            
            <div className="mt-8 flex justify-center gap-4">
              <div className="bg-white/5 backdrop-blur-sm rounded-lg px-6 py-3 border border-white/10">
                <img src={bfeLogo} alt="BFE - Biofeedback Federation of Europe" className="h-8 md:h-10 w-auto opacity-80 hover:opacity-100 transition-opacity" />
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-lg px-6 py-3 border border-white/10">
                <img src={righettoLogo} alt="Righetto - Partner dispositivi biofeedback" className="h-8 md:h-10 w-auto opacity-80 hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent"></div>
    </section>;
};
export default Hero;