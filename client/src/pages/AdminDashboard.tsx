import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default function AdminDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: adminStats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/admin/stats'],
    enabled: !!user?.isPremium,
    retry: false,
  });

  const { data: toolUsageStats, isLoading: usageLoading } = useQuery({
    queryKey: ['/api/admin/tool-usage'],
    enabled: !!user?.isPremium,
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!user?.isPremium) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Card className="text-center">
            <CardContent className="py-16">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-lock text-red-500 text-3xl"></i>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Admin Access Required</h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                This dashboard is only available to premium subscribers with admin privileges.
              </p>
              <Button className="bg-yellow-500 hover:bg-yellow-600" size="lg">
                <i className="fas fa-crown mr-2"></i>
                Upgrade to Premium
              </Button>
            </CardContent>
          </Card>
        </div>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Monitor platform activity and analytics</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tools">Tool Usage</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                  <i className="fas fa-users text-blue-600"></i>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {statsLoading ? (
                      <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                    ) : (
                      adminStats?.activeUsers || 0
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">Last 30 days</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Images Processed</CardTitle>
                  <i className="fas fa-image text-green-600"></i>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {statsLoading ? (
                      <div className="animate-pulse bg-gray-200 h-8 w-20 rounded"></div>
                    ) : (
                      adminStats?.totalImages || 0
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">All time</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Premium Users</CardTitle>
                  <i className="fas fa-crown text-yellow-600"></i>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {statsLoading ? (
                      <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                    ) : (
                      adminStats?.premiumUsers || 0
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">Current subscribers</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                  <i className="fas fa-chart-line text-purple-600"></i>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {statsLoading ? (
                      <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                    ) : (
                      adminStats?.activeUsers && adminStats?.premiumUsers 
                        ? ((adminStats.premiumUsers / adminStats.activeUsers) * 100).toFixed(1) + '%'
                        : '0%'
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">Free to Premium</p>
                </CardContent>
              </Card>
            </div>

            {/* Popular Tools */}
            <Card>
              <CardHeader>
                <CardTitle>Most Popular Tools</CardTitle>
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="animate-pulse bg-gray-200 h-4 w-32 rounded"></div>
                        <div className="animate-pulse bg-gray-200 h-4 w-16 rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : adminStats?.popularTools && adminStats.popularTools.length > 0 ? (
                  <div className="space-y-3">
                    {adminStats.popularTools.map((tool: any, index: number) => (
                      <div key={tool.toolType} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Badge variant="secondary">#{index + 1}</Badge>
                          <span className="font-medium capitalize">{tool.toolType}</span>
                        </div>
                        <span className="text-sm text-gray-600">{tool.count} uses</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 text-center py-8">No tool usage data available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tools" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Tool Usage Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                {usageLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="animate-pulse bg-gray-200 h-4 w-40 rounded"></div>
                        <div className="animate-pulse bg-gray-200 h-4 w-20 rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : toolUsageStats && toolUsageStats.length > 0 ? (
                  <div className="space-y-4">
                    {toolUsageStats.map((stat: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <i className="fas fa-chart-bar text-blue-600"></i>
                          </div>
                          <div>
                            <h4 className="font-medium capitalize">{stat.toolType}</h4>
                            <p className="text-sm text-gray-600">{stat.date}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{stat.count}</div>
                          <div className="text-sm text-gray-600">uses</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 text-center py-8">No usage analytics available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Free Users</span>
                      <span className="font-semibold">
                        {adminStats?.activeUsers && adminStats?.premiumUsers 
                          ? adminStats.activeUsers - adminStats.premiumUsers 
                          : 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Premium Users</span>
                      <span className="font-semibold text-yellow-600">
                        {adminStats?.premiumUsers || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-t pt-4">
                      <span className="font-medium">Total Active</span>
                      <span className="font-bold">
                        {adminStats?.activeUsers || 0}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Growth Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">New Signups</span>
                      <Badge variant="secondary">+12</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Premium Upgrades</span>
                      <Badge variant="secondary">+3</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Churn Rate</span>
                      <Badge variant="outline">2.1%</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>System Health</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">API Status</span>
                      <Badge className="bg-green-100 text-green-800">
                        <i className="fas fa-check mr-1"></i>
                        Healthy
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Database</span>
                      <Badge className="bg-green-100 text-green-800">
                        <i className="fas fa-check mr-1"></i>
                        Connected
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Storage</span>
                      <Badge className="bg-green-100 text-green-800">
                        <i className="fas fa-check mr-1"></i>
                        Available
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Stripe Integration</span>
                      <Badge className="bg-green-100 text-green-800">
                        <i className="fas fa-check mr-1"></i>
                        Active
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Avg Processing Time</span>
                      <span className="font-semibold">2.3s</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Success Rate</span>
                      <span className="font-semibold text-green-600">99.2%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Error Rate</span>
                      <span className="font-semibold text-red-600">0.8%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Uptime</span>
                      <span className="font-semibold text-green-600">99.9%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}
