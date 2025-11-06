import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Instructor from "@/components/Instructor";
import Program from "@/components/Program";
import Pricing from "@/components/Pricing";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <Features />
      <Instructor />
      <Program />
      <Pricing />
      <Footer />
    </div>
  );
};

export default Index;
