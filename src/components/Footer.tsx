const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground py-12">
      <div className="container px-4">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Nova Mentis</h3>
            <p className="text-primary-foreground/80 leading-relaxed">
              Centro di Psicologia e Neuroscienze - Centro di Eccellenza riconosciuto dalla Biofeedback Federation of Europe (BFE)
            </p>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-4">Corso</h3>
            <ul className="space-y-2 text-primary-foreground/80">
              <li>10 incontri online</li>
              <li>20 ore totali</li>
              <li>Certificazione BFE</li>
              <li>Inizio: 4 dicembre 2024</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-4">Contatti</h3>
            <p className="text-primary-foreground/80">
              Per informazioni sul corso e sulle modalità di iscrizione, contatta il Centro Nova Mentis
            </p>
          </div>
        </div>
        
        <div className="border-t border-primary-foreground/20 pt-8 text-center text-primary-foreground/60">
          <p>© {new Date().getFullYear()} Nova Mentis - Centro di Psicologia e Neuroscienze. Tutti i diritti riservati.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
