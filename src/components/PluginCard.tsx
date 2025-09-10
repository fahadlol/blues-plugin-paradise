import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, Download, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "@/hooks/useCart";
import { CartNotification } from "@/components/CartNotification";
import { useState } from "react";

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
  const { addItem, isInCart } = useCart();
  const [showNotification, setShowNotification] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!id) return;

    const numericPrice = typeof price === 'string' ? parseFloat(price.replace('$', '')) : price;
    
    addItem({
      id,
      title,
      price: numericPrice,
      thumbnail,
      category
    });
    
    setShowNotification(true);
  };
  const formatPrice = (price: string | number) => {
    if (typeof price === 'number') {
      return `$${price.toFixed(2)}`;
    }
    return price;
  };

  const formatDownloads = (downloads: string | number) => {
    if (typeof downloads === 'number') {
      if (downloads === 0) return 'No downloads';
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
            <span className="text-sm font-medium">
              {rating > 0 ? rating.toFixed(1) : 'No ratings'}
            </span>
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

      <CardFooter className="pt-4 space-y-2">
        {id && isInCart(id) ? (
          <Link to="/cart" className="w-full">
            <Button variant="outline" className="w-full">
              View in Cart
            </Button>
          </Link>
        ) : (
          <Button 
            variant="hero" 
            className="w-full"
            onClick={handleAddToCart}
            disabled={!id}
          >
            Add to Cart
          </Button>
        )}
        {id && (
          <Link to={`/plugin/${id}`} className="w-full">
            <Button variant="outline" className="w-full">
              View Details
            </Button>
          </Link>
        )}
      </CardFooter>
    </Card>
  );

  if (id) {
    return (
      <>
        <Link to={`/plugin/${id}`} className="block">
          {cardContent}
        </Link>
        <CartNotification 
          show={showNotification} 
          onClose={() => setShowNotification(false)} 
        />
      </>
    );
  }

  return (
    <>
      {cardContent}
      <CartNotification 
        show={showNotification} 
        onClose={() => setShowNotification(false)} 
      />
    </>
  );
};

export default PluginCard;