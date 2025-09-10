import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, LogOut } from 'lucide-react';
import { OrdersManager } from '@/components/admin/OrdersManager';
import { PrebuiltsManager } from '@/components/admin/PrebuiltsManager';
import PluginsManager from '@/components/admin/PluginsManager';
import { BundlesManager } from '@/components/admin/BundlesManager';
import { DiscountsManager } from '@/components/admin/DiscountsManager';
import { TicketsManager } from '@/components/admin/TicketsManager';
import { FAQManager } from '@/components/admin/FAQManager';
import { CustomPluginRequestsManager } from '@/components/admin/CustomPluginRequestsManager';
import { SiteSettingsManager } from '@/components/admin/SiteSettingsManager';
import PoliciesManager from '@/components/admin/PoliciesManager';

export default function AdminDashboard() {
  const { user, userRole, signOut, loading } = useAuth();
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    totalPrebuilts: 0,
    activePrebuilts: 0,
  });

  useEffect(() => {
    if (user && (userRole === 'admin' || userRole === 'staff')) {
      fetchStats();
    }
  }, [user, userRole]);

  const fetchStats = async () => {
    try {
      const [ordersResult, prebuiltsResult] = await Promise.all([
        supabase.from('orders').select('status', { count: 'exact' }),
        supabase.from('custom_prebuilts').select('is_active', { count: 'exact' })
      ]);

      const totalOrders = ordersResult.count || 0;
      const pendingOrders = ordersResult.data?.filter(o => o.status === 'pending').length || 0;
      const totalPrebuilts = prebuiltsResult.count || 0;
      const activePrebuilts = prebuiltsResult.data?.filter(p => p.is_active).length || 0;

      setStats({
        totalOrders,
        pendingOrders,
        totalPrebuilts,
        activePrebuilts,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (userRole !== 'admin' && userRole !== 'staff') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don't have permission to access the admin dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.href = '/'} className="w-full">
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Welcome back, {user.email} <Badge variant="secondary">{userRole}</Badge>
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button variant="outline" size="sm" onClick={() => window.location.href = '/'}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Back to Site</span>
                <span className="sm:hidden">Home</span>
              </Button>
              <Button variant="outline" size="sm" onClick={signOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 sm:py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <Card className="hover:shadow-glow transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Total Orders</CardTitle>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="text-lg sm:text-2xl font-bold">{stats.totalOrders}</div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-glow transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Pending Orders</CardTitle>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="text-lg sm:text-2xl font-bold text-orange-600">{stats.pendingOrders}</div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-glow transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Total Prebuilts</CardTitle>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="text-lg sm:text-2xl font-bold">{stats.totalPrebuilts}</div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-glow transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Active Prebuilts</CardTitle>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="text-lg sm:text-2xl font-bold text-green-600">{stats.activePrebuilts}</div>
            </CardContent>
          </Card>
        </div>

        {/* Management Tabs */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Management</CardTitle>
            <CardDescription>
              Manage orders, plugins, and custom prebuilts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="orders" className="space-y-4">
              <div className="overflow-x-auto">
                <TabsList className="grid grid-cols-5 sm:grid-cols-10 h-auto p-1 bg-muted/50 min-w-full">
                  <TabsTrigger value="orders" className="text-xs py-2 px-1">Orders</TabsTrigger>
                  <TabsTrigger value="plugins" className="text-xs py-2 px-1">Plugins</TabsTrigger>
                  <TabsTrigger value="prebuilts" className="text-xs py-2 px-1">Prebuilts</TabsTrigger>
                  <TabsTrigger value="policies" className="text-xs py-2 px-1">Policies</TabsTrigger>
                  <TabsTrigger value="bundles" className="text-xs py-2 px-1">Bundles</TabsTrigger>
                  <TabsTrigger value="discounts" className="text-xs py-2 px-1">Discounts</TabsTrigger>
                  <TabsTrigger value="tickets" className="text-xs py-2 px-1">Tickets</TabsTrigger>
                  <TabsTrigger value="faqs" className="text-xs py-2 px-1">FAQs</TabsTrigger>
                  <TabsTrigger value="requests" className="text-xs py-2 px-1">Requests</TabsTrigger>
                  <TabsTrigger value="settings" className="text-xs py-2 px-1">Settings</TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="orders" className="space-y-4">
                <OrdersManager onStatsUpdate={fetchStats} />
              </TabsContent>

              <TabsContent value="plugins" className="space-y-4">
                <PluginsManager onStatsUpdate={fetchStats} />
              </TabsContent>
              
              <TabsContent value="prebuilts" className="space-y-4">
                <PrebuiltsManager onStatsUpdate={fetchStats} />
              </TabsContent>
              
              <TabsContent value="policies" className="space-y-4">
                <PoliciesManager onStatsUpdate={fetchStats} />
              </TabsContent>

              <TabsContent value="bundles" className="space-y-4">
                <BundlesManager onStatsUpdate={fetchStats} />
              </TabsContent>

              <TabsContent value="discounts" className="space-y-4">
                <DiscountsManager onStatsUpdate={fetchStats} />
              </TabsContent>

              <TabsContent value="tickets" className="space-y-4">
                <TicketsManager onStatsUpdate={fetchStats} />
              </TabsContent>

              <TabsContent value="faqs" className="space-y-4">
                <FAQManager onStatsUpdate={fetchStats} />
              </TabsContent>

              <TabsContent value="requests" className="space-y-4">
                <CustomPluginRequestsManager onStatsUpdate={fetchStats} />
              </TabsContent>

              <TabsContent value="settings" className="space-y-4">
                <SiteSettingsManager onStatsUpdate={fetchStats} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}