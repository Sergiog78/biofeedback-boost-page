import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Solution from "@/components/Solution";
import Program from "@/components/Program";
import Instructor from "@/components/Instructor";
import Pricing from "@/components/Pricing";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <Features />
      <Solution />
      <Program />
      <Instructor />
      <Pricing />
      <Footer />
    </div>
  );
};

export default Index;
