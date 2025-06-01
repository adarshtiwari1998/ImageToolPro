import { useEffect, useState } from 'react';
import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const SubscribeForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + '/premium',
      },
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Welcome to Premium!",
        description: "Your subscription is now active. Enjoy unlimited access!",
      });
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Complete Your Subscription</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <PaymentElement />
            <Button 
              type="submit" 
              disabled={!stripe} 
              className="w-full bg-yellow-500 hover:bg-yellow-600"
              size="lg"
            >
              <i className="fas fa-crown mr-2"></i>
              Subscribe to Premium - $9.99/month
            </Button>
          </form>
          
          <div className="mt-6 text-center text-sm text-gray-600">
            <p>Cancel anytime. No commitments.</p>
            <p className="mt-2">🔒 Secure payment processed by Stripe</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default function Subscribe() {
  const [clientSecret, setClientSecret] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    // Create subscription as soon as the page loads
    apiRequest("POST", "/api/create-subscription")
      .then((res) => res.json())
      .then((data) => {
        setClientSecret(data.clientSecret);
      })
      .catch((error) => {
        toast({
          title: "Setup Error",
          description: "Failed to initialize payment. Please try again.",
          variant: "destructive",
        });
      });
  }, [toast]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Upgrade to Premium
            </h1>
            <p className="text-lg text-gray-600">
              Join thousands of users who trust our premium image processing tools
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Payment Form */}
            <div>
              {!clientSecret ? (
                <Card>
                  <CardContent className="py-16 text-center">
                    <div className="animate-spin w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-600">Setting up your subscription...</p>
                  </CardContent>
                </Card>
              ) : (
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <SubscribeForm />
                </Elements>
              )}
            </div>

            {/* Benefits Summary */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <i className="fas fa-star text-yellow-500 mr-2"></i>
                    What's Included
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                        <i className="fas fa-check text-green-600 text-xs"></i>
                      </div>
                      <div>
                        <h4 className="font-medium">Unlimited Processing</h4>
                        <p className="text-sm text-gray-600">Process unlimited images with no restrictions</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                        <i className="fas fa-check text-green-600 text-xs"></i>
                      </div>
                      <div>
                        <h4 className="font-medium">Batch Processing</h4>
                        <p className="text-sm text-gray-600">Upload and process up to 40 images at once</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                        <i className="fas fa-check text-green-600 text-xs"></i>
                      </div>
                      <div>
                        <h4 className="font-medium">Ad-Free Experience</h4>
                        <p className="text-sm text-gray-600">Clean interface without any distractions</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                        <i className="fas fa-check text-green-600 text-xs"></i>
                      </div>
                      <div>
                        <h4 className="font-medium">Premium Tools</h4>
                        <p className="text-sm text-gray-600">Access to advanced AI-powered features</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                        <i className="fas fa-check text-green-600 text-xs"></i>
                      </div>
                      <div>
                        <h4 className="font-medium">Priority Support</h4>
                        <p className="text-sm text-gray-600">Get help from our team when you need it</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                        <i className="fas fa-check text-green-600 text-xs"></i>
                      </div>
                      <div>
                        <h4 className="font-medium">High Resolution</h4>
                        <p className="text-sm text-gray-600">Export in the highest quality available</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center text-blue-800 text-sm">
                      <i className="fas fa-shield-alt mr-2"></i>
                      <span className="font-medium">30-day money-back guarantee</span>
                    </div>
                    <p className="text-blue-700 text-sm mt-1">
                      Not satisfied? Get a full refund within 30 days.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
