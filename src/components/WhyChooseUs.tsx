import { Zap, Shield, Star, Code, Headphones, Award } from "lucide-react";

const WhyChooseUs = () => {
  const features = [
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Instant downloads and optimized plugins that won't slow down your server performance.",
      color: "text-gaming-orange"
    },
    {
      icon: Shield,
      title: "Tested & Secure",
      description: "Every plugin is thoroughly tested for security vulnerabilities and compatibility issues.",
      color: "text-accent"
    },
    {
      icon: Code,
      title: "Custom Development",
      description: "Need something unique? Our expert developers create tailored solutions for your server.",
      color: "text-primary"
    },
    {
      icon: Star,
      title: "Premium Quality",
      description: "High-quality code, regular updates, and features that set your server apart from others.",
      color: "text-gaming-green"
    },
    {
      icon: Headphones,
      title: "24/7 Support",
      description: "Get help when you need it with our dedicated support team and active community.",
      color: "text-gaming-purple"
    },
    {
      icon: Award,
      title: "Proven Track Record",
      description: "Trusted by thousands of server owners with over 500k+ successful downloads.",
      color: "text-accent-glow"
    }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Why Choose{" "}
            <span className="bg-gradient-hero bg-clip-text text-transparent">
              Blues Marketplace?
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            We're not just another plugin marketplace. We're your trusted partner in creating 
            extraordinary Minecraft server experiences.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={index}
                className="group p-8 bg-gradient-card border border-border rounded-xl hover:border-primary/50 transition-all duration-300 hover:scale-105 hover:shadow-card"
              >
                {/* Icon */}
                <div className="mb-6">
                  <div className="w-16 h-16 bg-muted/50 rounded-xl flex items-center justify-center group-hover:bg-primary/10 transition-colors duration-300">
                    <IconComponent className={`w-8 h-8 ${feature.color} group-hover:scale-110 transition-transform duration-300`} />
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold mb-4 group-hover:text-primary transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Stats Section */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold bg-gradient-hero bg-clip-text text-transparent mb-2">
              500k+
            </div>
            <div className="text-sm text-muted-foreground uppercase tracking-wide">
              Downloads
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold bg-gradient-hero bg-clip-text text-transparent mb-2">
              15k+
            </div>
            <div className="text-sm text-muted-foreground uppercase tracking-wide">
              Happy Customers
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold bg-gradient-hero bg-clip-text text-transparent mb-2">
              150+
            </div>
            <div className="text-sm text-muted-foreground uppercase tracking-wide">
              Premium Plugins
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold bg-gradient-hero bg-clip-text text-transparent mb-2">
              24/7
            </div>
            <div className="text-sm text-muted-foreground uppercase tracking-wide">
              Support
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;