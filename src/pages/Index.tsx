import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Solution from "@/components/Solution";
import ClinicalScenarios from "@/components/ClinicalScenarios";
import Testimonials from "@/components/Testimonials";
import Program from "@/components/Program";
import Instructor from "@/components/Instructor";
import Pricing from "@/components/Pricing";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <Features />
      <Solution />
      <ClinicalScenarios />
      <Testimonials />
      <Program />
      <Instructor />
      <Pricing />
      <Footer />
    </div>
  );
};

export default Index;
