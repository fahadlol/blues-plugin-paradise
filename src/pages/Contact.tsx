import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, ArrowRight, Users, Clock, Headphones } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Contact = () => {
  useEffect(() => {
    document.title = "Contact Us | Blues Marketplace";
  }, []);

  const handleDiscordRedirect = () => {
    window.open("https://discord.gg/YpBvZzDFRm", "_blank");
  };

  const features = [
    {
      icon: MessageCircle,
      title: "Direct Communication",
      description: "Chat directly with our support team and community members"
    },
    {
      icon: Users,
      title: "Active Community",
      description: "Join thousands of server owners sharing tips and experiences"
    },
    {
      icon: Clock,
      title: "Fast Response",
      description: "Get quick answers to your questions from our team"
    },
    {
      icon: Headphones,
      title: "Expert Support",
      description: "Technical assistance from experienced Minecraft developers"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-20 pb-16 bg-gradient-mesh">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-hero bg-clip-text text-transparent">
                Get in Touch
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join our Discord community for support, discussions, and direct access to our team. 
              We're here to help you succeed with your Minecraft server.
            </p>
            
            <Button 
              variant="hero" 
              size="lg" 
              onClick={handleDiscordRedirect}
              className="text-lg px-8 py-6"
            >
              <MessageCircle className="w-6 h-6 mr-2" />
              Join Our Discord
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Why Discord Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Discord?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discord provides the best platform for real-time communication, community building, 
              and instant support for all your plugin needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-glow transition-all duration-300 hover:scale-105">
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-subtle">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Connect?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Our community is waiting for you! Whether you need support, want to showcase your server, 
              or just chat with fellow Minecraft enthusiasts, our Discord is the place to be.
            </p>
            
            <div className="space-y-4">
              <Button 
                variant="hero" 
                size="lg" 
                onClick={handleDiscordRedirect}
                className="text-lg px-8 py-6"
              >
                <MessageCircle className="w-6 h-6 mr-2" />
                Join Discord Community
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              
              <p className="text-sm text-muted-foreground">
                Free to join • No spam • Active moderation • Helpful community
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;