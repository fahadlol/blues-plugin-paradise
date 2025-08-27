import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, Download, Star } from "lucide-react";
import { Link } from "react-router-dom";

interface PluginCardProps {
  id?: string;
  title: string;
  description: string;
  price: string | number;
  rating: number;
  downloads: string | number;
  thumbnail: string;
  category: string;
}

const PluginCard = ({ 
  id,
  title, 
  description, 
  price, 
  rating, 
  downloads, 
  thumbnail, 
  category 
}: PluginCardProps) => {
  const formatPrice = (price: string | number) => {
    if (typeof price === 'number') {
      return `$${price.toFixed(2)}`;
    }
    return price;
  };

  const formatDownloads = (downloads: string | number) => {
    if (typeof downloads === 'number') {
      return downloads >= 1000 ? `${Math.floor(downloads / 1000)}k+` : `${downloads}`;
    }
    return downloads;
  };
  const cardContent = (
    <Card className="group bg-gradient-card border-border hover:border-primary/50 transition-all duration-300 hover:scale-105 hover:shadow-glow overflow-hidden cursor-pointer">
      {/* Thumbnail */}
      <div className="relative h-48 bg-muted overflow-hidden">
        <img 
          src={thumbnail} 
          alt={title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span className="bg-primary/90 text-primary-foreground text-xs px-2 py-1 rounded-full font-medium">
            {category}
          </span>
        </div>
        {/* Play Button Overlay */}
        <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <Button variant="hero" size="sm">
            <Play className="w-4 h-4 mr-2" />
            Preview
          </Button>
        </div>
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg group-hover:text-primary transition-colors duration-300">
            {title}
          </CardTitle>
          <div className="flex items-center space-x-1 text-gaming-orange">
            <Star className="w-4 h-4 fill-current" />
            <span className="text-sm font-medium">{rating}</span>
          </div>
        </div>
        <CardDescription className="text-muted-foreground line-clamp-2">
          {description}
        </CardDescription>
      </CardHeader>

      <CardContent className="py-0">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Download className="w-4 h-4" />
            <span>{formatDownloads(downloads)} downloads</span>
          </div>
          <span className="text-2xl font-bold text-foreground">{formatPrice(price)}</span>
        </div>
      </CardContent>

      <CardFooter className="pt-4">
        <Button variant="hero" className="w-full">
          Buy Now
        </Button>
      </CardFooter>
    </Card>
  );

  if (id) {
    return (
      <Link to={`/plugin/${id}`} className="block">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
};

export default PluginCard;