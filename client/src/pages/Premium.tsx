import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";

export default function Premium() {
  const { user } = useAuth();

  const premiumFeatures = [
    "Compress IMAGE",
    "Resize IMAGE", 
    "Crop IMAGE",
    "Convert to JPG",
    "Convert from JPG",
    "Convert IMAGE",
    "Rotate IMAGE",
    "Watermark IMAGE",
    "IMAGE Editor",
    "Meme generator",
    "HTML to image",
    "Upscale image",
    "Blur face",
    "Remove background",
  ];

  const benefits = [
    {
      icon: "fas fa-infinity",
      title: "Unlimited document processing",
      description: "Process as many images as you need without restrictions"
    },
    {
      icon: "fas fa-ad",
      title: "No Ads",
      description: "Enjoy a clean, distraction-free experience"
    },
    {
      icon: "fas fa-headset",
      title: "Customer support",
      description: "Priority email support from our team"
    },
    {
      icon: "fas fa-layer-group",
      title: "Batch processing",
      description: "Upload and process up to 40 images at once"
    },
    {
      icon: "fas fa-hd-video",
      title: "High resolution output",
      description: "Export images in the highest quality possible"
    },
    {
      icon: "fas fa-robot",
      title: "Advanced AI features",
      description: "Access to cutting-edge AI-powered tools"
    },
  ];

  if (user?.isPremium) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-crown text-yellow-500 text-3xl"></i>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">You're Premium!</h1>
            <p className="text-xl text-gray-600">
              Thank you for being a premium subscriber. Enjoy all the benefits!
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <i className="fas fa-tools text-blue-600 mr-2"></i>
                  Available Tools
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {premiumFeatures.map((feature) => (
                    <div key={feature} className="flex items-center text-sm">
                      <i className="fas fa-check text-green-600 mr-2"></i>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <i className="fas fa-star text-yellow-500 mr-2"></i>
                  Premium Benefits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {benefits.map((benefit) => (
                    <div key={benefit.title} className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mt-1">
                        <i className={`${benefit.icon} text-blue-600 text-sm`}></i>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{benefit.title}</h4>
                        <p className="text-sm text-gray-600">{benefit.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <Link href="/">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                <i className="fas fa-arrow-left mr-2"></i>
                Start Using Premium Tools
              </Button>
            </Link>
          </div>
        </div>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Get more with <span className="text-yellow-500">Premium</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Edit multiple images faster with batch file processing, convert to several image formats 
            in high resolution and enjoy a web experience free of ads.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Free Plan */}
          <Card className="relative">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-2xl font-bold text-gray-900">Free</CardTitle>
              <div className="text-4xl font-bold text-gray-900 mt-4">
                $0<span className="text-lg font-normal text-gray-600">/month</span>
              </div>
              <p className="text-gray-600 mt-2">Perfect for occasional use</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center">
                  <i className="fas fa-check text-green-600 mr-3"></i>
                  <span>Basic image tools</span>
                </div>
                <div className="flex items-center">
                  <i className="fas fa-check text-green-600 mr-3"></i>
                  <span>1 image at a time</span>
                </div>
                <div className="flex items-center">
                  <i className="fas fa-check text-green-600 mr-3"></i>
                  <span>Standard quality</span>
                </div>
                <div className="flex items-center text-gray-400">
                  <i className="fas fa-times text-gray-400 mr-3"></i>
                  <span>Contains ads</span>
                </div>
                <div className="flex items-center text-gray-400">
                  <i className="fas fa-times text-gray-400 mr-3"></i>
                  <span>Limited features</span>
                </div>
              </div>
              
              <Button variant="outline" className="w-full" disabled>
                Current Plan
              </Button>
            </CardContent>
          </Card>

          {/* Premium Plan */}
          <Card className="relative border-2 border-yellow-300 bg-gradient-to-br from-yellow-50 to-orange-50">
            <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-white">
              Most Popular
            </Badge>
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-2xl font-bold text-gray-900">Premium</CardTitle>
              <div className="text-4xl font-bold text-gray-900 mt-4">
                $9.99<span className="text-lg font-normal text-gray-600">/month</span>
              </div>
              <p className="text-gray-600 mt-2">For professionals and power users</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                {benefits.map((benefit) => (
                  <div key={benefit.title} className="flex items-center">
                    <i className="fas fa-check text-green-600 mr-3"></i>
                    <span>{benefit.title}</span>
                  </div>
                ))}
              </div>
              
              <Link href="/subscribe">
                <Button className="w-full bg-yellow-500 hover:bg-yellow-600" size="lg">
                  <i className="fas fa-crown mr-2"></i>
                  Upgrade to Premium
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Premium Tools Grid */}
        <Card className="mb-16">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">All Premium Tools</CardTitle>
            <p className="text-gray-600">Full access to our complete image processing suite</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {premiumFeatures.map((feature) => (
                <div key={feature} className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <i className="fas fa-check text-blue-600 text-sm"></i>
                  </div>
                  <p className="text-xs font-medium text-gray-700">{feature}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Can I cancel anytime?</h3>
                  <p className="text-gray-600 text-sm">Yes, you can cancel your subscription at any time. No commitments or cancellation fees.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">What payment methods do you accept?</h3>
                  <p className="text-gray-600 text-sm">We accept all major credit cards, PayPal, and other secure payment methods via Stripe.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Is my data secure?</h3>
                  <p className="text-gray-600 text-sm">Absolutely. All images are processed securely and deleted after 24 hours. We never store or share your files.</p>
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">How many images can I process?</h3>
                  <p className="text-gray-600 text-sm">Premium users have unlimited image processing with batch uploads of up to 40 images at once.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Do you offer refunds?</h3>
                  <p className="text-gray-600 text-sm">We offer a 30-day money-back guarantee if you're not satisfied with our premium features.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Can I use it for commercial projects?</h3>
                  <p className="text-gray-600 text-sm">Yes, Premium subscribers can use all tools for personal and commercial projects without restrictions.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}
