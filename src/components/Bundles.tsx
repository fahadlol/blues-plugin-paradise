import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Package } from "lucide-react";

const Bundles = () => {
  const bundles = [
    {
      title: "SMP Starter Pack",
      description: "Everything you need to launch a successful Survival Multiplayer server",
      originalPrice: "$124.99",
      bundlePrice: "$79.99",
      savings: "$45",
      rating: 4.9,
      plugins: [
        "EssentialsX Enhanced",
        "Economy Plus", 
        "Land Protection Pro",
        "Chat Manager",
        "Teleport System"
      ],
      features: [
        "Complete server management",
        "Economy system with shops",
        "Land claiming & protection", 
        "Advanced chat features",
        "Teleportation commands"
      ],
      popular: true
    },
    {
      title: "PvP Arena Bundle",
      description: "Complete PvP setup with arenas, tournaments, and competitive features",
      originalPrice: "$159.99", 
      bundlePrice: "$99.99",
      savings: "$60",
      rating: 4.8,
      plugins: [
        "PvP Arena Pro",
        "Tournament Manager",
        "Kill Streaks",
        "Custom Kits",
        "Leaderboards"
      ],
      features: [
        "Multiple arena types",
        "Automated tournaments",
        "Kill streak rewards",
        "Pre-built PvP kits",
        "Competitive rankings"
      ],
      popular: false
    },
    {
      title: "Minigames Master",
      description: "Collection of popular minigames to keep your players entertained",
      originalPrice: "$199.99",
      bundlePrice: "$129.99", 
      savings: "$70",
      rating: 4.7,
      plugins: [
        "Bed Wars Pro",
        "Sky Wars",
        "Hide and Seek",
        "Parkour Challenge",
        "Build Battle"
      ],
      features: [
        "5 complete minigames",
        "Lobby management",
        "Player statistics",
        "Reward systems",
        "Custom game modes"
      ],
      popular: false
    },
    {
      title: "Ultimate Server Pack",
      description: "The complete solution for professional Minecraft servers",
      originalPrice: "$399.99",
      bundlePrice: "$249.99",
      savings: "$150", 
      rating: 5.0,
      plugins: [
        "All SMP Starter plugins",
        "All PvP Arena plugins", 
        "All Minigames plugins",
        "Advanced Anti-Cheat",
        "Custom Enchants",
        "World Generator",
        "Backup System"
      ],
      features: [
        "Everything from other bundles",
        "Advanced security features",
        "Custom world generation",
        "Automated backups",
        "Premium support included"
      ],
      popular: false
    }
  ];

  return (
    <section id="bundles" className="py-20 bg-gradient-mesh">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-hero bg-clip-text text-transparent">
              Plugin Bundles
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Save big with our carefully curated plugin bundles. Get everything you need 
            for your server type at a fraction of the individual cost.
          </p>
        </div>

        {/* Bundles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {bundles.map((bundle, index) => (
            <Card 
              key={index} 
              className={`relative bg-gradient-card border-border hover:border-primary/50 transition-all duration-300 hover:scale-105 hover:shadow-glow ${
                bundle.popular ? 'ring-2 ring-primary/50' : ''
              }`}
            >
              {bundle.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-primary text-primary-foreground px-4 py-1">
                    <Star className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl mb-2">{bundle.title}</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      {bundle.description}
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-1 text-gaming-orange">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-sm font-medium">{bundle.rating}</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Pricing */}
                <div className="text-center py-4 bg-muted/20 rounded-lg">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <span className="text-2xl font-bold text-foreground">{bundle.bundlePrice}</span>
                    <span className="text-lg text-muted-foreground line-through">{bundle.originalPrice}</span>
                  </div>
                  <div className="text-sm text-gaming-green font-medium">
                    Save {bundle.savings}!
                  </div>
                </div>

                {/* Included Plugins */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center">
                    <Package className="w-4 h-4 mr-2 text-primary" />
                    Included Plugins ({bundle.plugins.length})
                  </h4>
                  <div className="space-y-2">
                    {bundle.plugins.slice(0, 4).map((plugin, pluginIndex) => (
                      <div key={pluginIndex} className="flex items-center space-x-2 text-sm">
                        <Check className="w-3 h-3 text-gaming-green flex-shrink-0" />
                        <span className="text-muted-foreground">{plugin}</span>
                      </div>
                    ))}
                    {bundle.plugins.length > 4 && (
                      <div className="text-sm text-primary">
                        + {bundle.plugins.length - 4} more plugins...
                      </div>
                    )}
                  </div>
                </div>

                {/* Key Features */}
                <div>
                  <h4 className="font-semibold mb-3">Key Features</h4>
                  <div className="space-y-2">
                    {bundle.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center space-x-2 text-sm">
                        <Check className="w-3 h-3 text-accent flex-shrink-0" />
                        <span className="text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>

              <CardFooter>
                <Button 
                  variant={bundle.popular ? "hero" : "default"} 
                  size="lg" 
                  className="w-full"
                >
                  Get Bundle Now
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="bg-gradient-card border border-border rounded-xl p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-semibold mb-4">Need a Custom Bundle?</h3>
            <p className="text-muted-foreground mb-6">
              Can't find the perfect combination? We can create a custom bundle 
              tailored to your specific server needs and budget.
            </p>
            <Button variant="outline" size="lg">
              Request Custom Bundle
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Bundles;