import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ToolGrid from "@/components/ToolGrid";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function Home() {
  const { user } = useAuth();

  const { data: myImages } = useQuery({
    queryKey: ['/api/my-images'],
    enabled: !!user,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.firstName || 'User'}!
          </h1>
          <p className="text-gray-600">
            {user?.isPremium ? 'Premium Member' : 'Free Account'} • Ready to process your images
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Tools Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Image Processing Tools</CardTitle>
              </CardHeader>
              <CardContent>
                <ToolGrid />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Account Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  {user?.isPremium ? (
                    <>
                      <i className="fas fa-crown text-yellow-500 mr-2"></i>
                      Premium Account
                    </>
                  ) : (
                    <>
                      <i className="fas fa-user text-gray-500 mr-2"></i>
                      Free Account
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {user?.isPremium ? (
                  <div className="space-y-2">
                    <div className="flex items-center text-green-600">
                      <i className="fas fa-check mr-2"></i>
                      <span>Unlimited processing</span>
                    </div>
                    <div className="flex items-center text-green-600">
                      <i className="fas fa-check mr-2"></i>
                      <span>Batch uploads</span>
                    </div>
                    <div className="flex items-center text-green-600">
                      <i className="fas fa-check mr-2"></i>
                      <span>No ads</span>
                    </div>
                    <div className="flex items-center text-green-600">
                      <i className="fas fa-check mr-2"></i>
                      <span>Priority support</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center text-gray-600">
                        <i className="fas fa-times text-red-500 mr-2"></i>
                        <span>1 image at a time</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <i className="fas fa-times text-red-500 mr-2"></i>
                        <span>Contains ads</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <i className="fas fa-times text-red-500 mr-2"></i>
                        <span>Limited features</span>
                      </div>
                    </div>
                    <Link href="/premium">
                      <Button className="w-full bg-yellow-500 hover:bg-yellow-600">
                        <i className="fas fa-crown mr-2"></i>
                        Upgrade to Premium
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Images */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Images</CardTitle>
              </CardHeader>
              <CardContent>
                {myImages && myImages.length > 0 ? (
                  <div className="space-y-3">
                    {myImages.slice(0, 5).map((image: any) => (
                      <div key={image.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{image.fileName}</p>
                          <p className="text-xs text-gray-600">{image.toolType}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-600">
                            {image.compressionRatio && `${Math.round(image.compressionRatio)}% smaller`}
                          </p>
                          {image.downloadUrl && (
                            <a href={image.downloadUrl} className="text-blue-600 text-xs hover:underline">
                              Download
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 text-sm">No images processed yet</p>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Your Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Images Processed</span>
                    <span className="font-semibold">{myImages?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Savings</span>
                    <span className="font-semibold text-green-600">
                      {myImages?.reduce((acc: number, img: any) => acc + (img.compressionRatio || 0), 0).toFixed(1) || 0}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Account Type</span>
                    <span className={`font-semibold ${user?.isPremium ? 'text-yellow-600' : 'text-gray-600'}`}>
                      {user?.isPremium ? 'Premium' : 'Free'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
