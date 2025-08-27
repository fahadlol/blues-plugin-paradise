-- Create plugins table for storing plugin information
CREATE TABLE public.plugins (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    content TEXT, -- Full description/content for the plugin page
    price NUMERIC NOT NULL DEFAULT 0,
    rating NUMERIC NOT NULL DEFAULT 5.0 CHECK (rating >= 0 AND rating <= 5),
    downloads INTEGER NOT NULL DEFAULT 0,
    thumbnail TEXT,
    category TEXT NOT NULL,
    features JSONB DEFAULT '[]'::jsonb, -- Array of features
    requirements JSONB DEFAULT '{}'::jsonb, -- Server requirements
    changelog JSONB DEFAULT '[]'::jsonb, -- Version history
    is_featured BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID REFERENCES auth.users(id)
);

-- Enable Row Level Security
ALTER TABLE public.plugins ENABLE ROW LEVEL SECURITY;

-- Create policies for plugins
CREATE POLICY "Everyone can view active plugins" 
ON public.plugins 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Staff can view all plugins" 
ON public.plugins 
FOR SELECT 
TO authenticated
USING (get_user_role(auth.uid()) = ANY (ARRAY['admin'::app_role, 'staff'::app_role]));

CREATE POLICY "Staff can insert plugins" 
ON public.plugins 
FOR INSERT 
TO authenticated
WITH CHECK (get_user_role(auth.uid()) = ANY (ARRAY['admin'::app_role, 'staff'::app_role]));

CREATE POLICY "Staff can update plugins" 
ON public.plugins 
FOR UPDATE 
TO authenticated
USING (get_user_role(auth.uid()) = ANY (ARRAY['admin'::app_role, 'staff'::app_role]));

CREATE POLICY "Staff can delete plugins" 
ON public.plugins 
FOR DELETE 
TO authenticated
USING (get_user_role(auth.uid()) = ANY (ARRAY['admin'::app_role, 'staff'::app_role]));

-- Create trigger for updated_at
CREATE TRIGGER update_plugins_updated_at
    BEFORE UPDATE ON public.plugins
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data
INSERT INTO public.plugins (title, description, content, price, rating, downloads, thumbnail, category, features, requirements, is_featured) VALUES
('EssentialsX Enhanced', 
 'Complete server management toolkit with advanced features, permissions, and economy integration.',
 'EssentialsX Enhanced is the ultimate server management solution for Minecraft servers. This comprehensive plugin provides everything you need to manage your server efficiently and effectively.\n\n## Key Features\n\n- **Advanced Permission System**: Granular control over player permissions\n- **Economy Integration**: Built-in economy system with shop support\n- **Player Management**: Teleportation, homes, warps, and more\n- **Admin Tools**: Powerful moderation and administration commands\n- **Multi-language Support**: Available in 15+ languages\n\n## Why Choose EssentialsX Enhanced?\n\nOur enhanced version includes premium features not available in the standard EssentialsX, including advanced anti-grief protection, custom GUI interfaces, and priority support.',
 24.99, 4.9, 50000, 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=300&fit=crop',
 'Management',
 '["Advanced Permissions", "Economy System", "Teleportation", "Admin Tools", "Multi-language", "Anti-grief Protection"]'::jsonb,
 '{"minecraft_version": "1.8-1.20+", "server_type": "Spigot/Paper", "ram": "2GB+", "players": "Unlimited"}'::jsonb,
 true),

('PvP Arena Pro', 
 'Advanced PvP arena system with tournaments, rankings, and customizable game modes.',
 'Transform your server into the ultimate PvP destination with PvP Arena Pro. Create custom arenas, host tournaments, and provide players with an unparalleled competitive experience.\n\n## Features\n\n- **Custom Arena Builder**: Easy-to-use arena creation tools\n- **Tournament System**: Automated tournaments with brackets\n- **Ranking System**: ELO-based player rankings\n- **Multiple Game Modes**: 1v1, Team battles, FFA, and more\n- **Spectator Mode**: Advanced spectating with camera controls\n- **Reward System**: Customizable rewards and achievements\n\n## Perfect For\n\n- PvP-focused servers\n- Practice servers\n- Tournament hosting\n- Competitive gameplay',
 39.99, 4.8, 25000, 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=400&h=300&fit=crop',
 'PvP',
 '["Arena Builder", "Tournaments", "Rankings", "Multiple Modes", "Spectator Mode", "Rewards"]'::jsonb,
 '{"minecraft_version": "1.12-1.20+", "server_type": "Paper/Spigot", "ram": "4GB+", "players": "10-500"}'::jsonb,
 true),

('Economy Plus', 
 'Comprehensive economy plugin with shops, auctions, banking, and trading systems.',
 'Create a thriving server economy with Economy Plus. This all-in-one economic solution provides everything needed to establish and maintain a complex server economy.\n\n## Complete Economic Solution\n\n- **Player Shops**: Easy shop creation and management\n- **Auction House**: Server-wide auction system\n- **Banking System**: Player banks with interest\n- **Trading System**: Secure player-to-player trading\n- **Job System**: Custom jobs and salaries\n- **Tax System**: Configurable taxation\n\n## Advanced Features\n\n- **Stock Market**: Virtual trading system\n- **Company System**: Player-owned businesses\n- **Loan System**: Player lending with interest\n- **Analytics**: Detailed economic reports',
 19.99, 4.7, 75000, 'https://images.unsplash.com/photo-1580519542036-c47de6196ba5?w=400&h=300&fit=crop',
 'Economy',
 '["Player Shops", "Auctions", "Banking", "Trading", "Jobs", "Stock Market"]'::jsonb,
 '{"minecraft_version": "1.16-1.20+", "server_type": "Paper", "ram": "3GB+", "players": "20-1000"}'::jsonb,
 true);