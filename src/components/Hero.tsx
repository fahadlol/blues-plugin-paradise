import { Button } from "@/components/ui/button";
import { Play, Zap, Shield, Star } from "lucide-react";
import heroImage from "@/assets/hero-bg.jpg";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const Hero = () => {
  const { getSetting } = useSiteSettings();
  const videoUrl = getSetting('hero_video_url', '');

  const handleWatchDemo = () => {
    if (videoUrl) {
      window.open(videoUrl, '_blank');
    } else {
      // Fallback to demo section
      document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section 
      id="home" 
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{
        backgroundImage: `url(${heroImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-mesh opacity-90"></div>
      <div className="absolute inset-0 bg-background/60"></div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 bg-card/50 backdrop-blur-sm border border-border rounded-full px-6 py-2 mb-8">
            <Star className="w-4 h-4 text-accent" />
            <span className="text-sm text-muted-foreground">
              Premium Minecraft Plugins & Custom Development
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-hero bg-clip-text text-transparent">
              Blues Marketplace
            </span>
            <br />
            <span className="text-foreground">
              Your Plugin Paradise
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Discover premium Minecraft plugins, request custom development, 
            and transform your server with our curated collection of high-quality tools.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Button 
              variant="hero" 
              size="lg" 
              className="text-lg px-8 py-6"
              onClick={() => document.getElementById('prebuilt')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <Zap className="w-5 h-5 mr-2" />
              Shop Plugins Now
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="text-lg px-8 py-6"
              onClick={handleWatchDemo}
            >
              <Play className="w-5 h-5 mr-2" />
              Watch Demo
            </Button>
          </div>

          {/* Stats/Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="flex flex-col items-center space-y-2">
              <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center shadow-glow">
                <Zap className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-semibold">Lightning Fast</h3>
              <p className="text-sm text-muted-foreground">Instant downloads and deployment</p>
            </div>
            
            <div className="flex flex-col items-center space-y-2">
              <div className="w-12 h-12 bg-gradient-card border border-border rounded-lg flex items-center justify-center shadow-card">
                <Shield className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-lg font-semibold">Trusted Quality</h3>
              <p className="text-sm text-muted-foreground">Tested and verified plugins</p>
            </div>
            
            <div className="flex flex-col items-center space-y-2">
              <div className="w-12 h-12 bg-secondary/50 border border-border rounded-lg flex items-center justify-center">
                <Star className="w-6 h-6 text-gaming-orange" />
              </div>
              <h3 className="text-lg font-semibold">Custom Made</h3>
              <p className="text-sm text-muted-foreground">Tailored to your needs</p>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-xl"></div>
      <div className="absolute bottom-20 right-10 w-48 h-48 bg-accent/10 rounded-full blur-xl"></div>
    </section>
  );
};

export default Hero;