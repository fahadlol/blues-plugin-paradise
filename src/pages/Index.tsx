import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import FeaturedPlugins from "@/components/FeaturedPlugins";
import WhyChooseUs from "@/components/WhyChooseUs";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <FeaturedPlugins />
        <WhyChooseUs />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
