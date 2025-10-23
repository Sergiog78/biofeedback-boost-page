import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import heroImage from "@/assets/biofeedback-hero.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20">
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 8, 49, 0.85), rgba(0, 8, 49, 0.75)), url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      
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
            <Button 
              variant="hero" 
              size="xl"
              className="text-lg"
              onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Iscriviti ora con lo sconto
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            
            <div className="text-white/80">
              <p className="text-sm">
                <span className="line-through opacity-70">500€</span>
                <span className="text-accent font-bold text-2xl ml-3">280€</span>
                <span className="ml-2 text-accent text-sm">fino al 16 novembre</span>
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent"></div>
    </section>
  );
};

export default Hero;
