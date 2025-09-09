import { Github, Twitter, MessageCircle, Mail } from "lucide-react";

const Footer = () => {
  const footerLinks = {
    product: [
      { label: "Prebuilt Plugins", href: "#prebuilt" },
      { label: "Custom Development", href: "#custom" },
      { label: "Plugin Bundles", href: "#bundles" },
      { label: "Pricing", href: "#pricing" }
    ],
    support: [
      { label: "Documentation", href: "/support" },
      { label: "Contact Support", href: "/contact" },
      { label: "Community", href: "/contact" },
      { label: "Status", href: "/support" }
    ],
    company: [
      { label: "About Us", href: "#about" },
      { label: "Blog", href: "#blog" },
      { label: "Careers", href: "#careers" },
      { label: "Press", href: "#press" }
    ],
    legal: [
      { label: "Privacy Policy", href: "/policies/privacy_policy" },
      { label: "Terms of Service", href: "/policies/terms_of_service" },
      { label: "Refund Policy", href: "/policies/refund_policy" },
      { label: "License", href: "#license" }
    ]
  };

  const socialLinks = [
    { icon: MessageCircle, href: "https://discord.gg/YpBvZzDFRm", label: "Discord" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Github, href: "#", label: "GitHub" },
    { icon: Mail, href: "/contact", label: "Email" }
  ];

  return (
    <footer id="contact" className="bg-gradient-card border-t border-border">
      <div className="container mx-auto px-4 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                <div className="w-5 h-5 bg-background rounded-sm"></div>
              </div>
              <span className="text-2xl font-bold bg-gradient-hero bg-clip-text text-transparent">
                Blues Marketplace
              </span>
            </div>
            <p className="text-muted-foreground mb-6 max-w-md">
              Your trusted destination for premium Minecraft plugins and custom development services. 
              Transform your server with our carefully curated collection of high-quality tools.
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => {
                const IconComponent = social.icon;
                return (
                  <a
                    key={index}
                    href={social.href}
                    className="w-10 h-10 bg-muted/50 hover:bg-primary/20 rounded-lg flex items-center justify-center transition-colors duration-300 group"
                    aria-label={social.label}
                  >
                    <IconComponent className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Links Sections */}
          <div>
            <h3 className="font-semibold mb-6 text-foreground">Product</h3>
            <ul className="space-y-4">
              {footerLinks.product.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors duration-300"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-6 text-foreground">Support</h3>
            <ul className="space-y-4">
              {footerLinks.support.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors duration-300"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-6 text-foreground">Legal</h3>
            <ul className="space-y-4">
              {footerLinks.legal.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors duration-300"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-border pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <p className="text-sm text-muted-foreground mb-4 md:mb-0">
              © 2024 Blues Marketplace. All rights reserved.
            </p>
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <span>Made with ❤️ for the Minecraft community</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;