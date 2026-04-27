import { lazy, Suspense } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";

// Above-the-fold: load eagerly (Header + Hero)
// Below-the-fold: lazy load to reduce initial bundle and TBT
const Features = lazy(() => import("@/components/Features"));
const InstrumentationObjection = lazy(() => import("@/components/InstrumentationObjection"));
const Solution = lazy(() => import("@/components/Solution"));
const ClinicalScenarios = lazy(() => import("@/components/ClinicalScenarios"));
const Testimonials = lazy(() => import("@/components/Testimonials"));
const Program = lazy(() => import("@/components/Program"));
const CourseIncludes = lazy(() => import("@/components/CourseIncludes"));
const Instructor = lazy(() => import("@/components/Instructor"));
const Pricing = lazy(() => import("@/components/Pricing"));
const FAQ = lazy(() => import("@/components/FAQ"));
const Footer = lazy(() => import("@/components/Footer"));
const WhatsAppButton = lazy(() => import("@/components/WhatsAppButton"));

const SectionFallback = () => <div className="min-h-[200px]" />;

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <Suspense fallback={<SectionFallback />}>
        <Features />
        <Testimonials />
        <InstrumentationObjection />
        <Solution />
        <ClinicalScenarios />
        <Program />
        <CourseIncludes />
        <Instructor />
        <Pricing />
        <FAQ />
        <Footer />
        <WhatsAppButton />
      </Suspense>
    </div>
  );
};

export default Index;
