import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import InstrumentationObjection from "@/components/InstrumentationObjection";
import Solution from "@/components/Solution";
import ClinicalScenarios from "@/components/ClinicalScenarios";
import Testimonials from "@/components/Testimonials";
import Program from "@/components/Program";
import CourseIncludes from "@/components/CourseIncludes";
import Instructor from "@/components/Instructor";
import Pricing from "@/components/Pricing";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <Features />
      <InstrumentationObjection />
      <Solution />
      <ClinicalScenarios />
      <Testimonials />
          <Program />
          <CourseIncludes />
          <Instructor />
      <Pricing />
      <FAQ />
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default Index;
