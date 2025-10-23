import logo from "@/assets/logo-nova-mentis.svg";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-primary/95 backdrop-blur-sm">
      <div className="container px-4 py-4">
        <div className="flex justify-center">
          <img 
            src={logo} 
            alt="Nova Mentis" 
            className="h-12 md:h-16 w-auto"
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
