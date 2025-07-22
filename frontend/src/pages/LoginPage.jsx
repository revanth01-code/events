import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { Checkbox } from '../components/ui/checkbox';
import { MapPin, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [allowLocation, setAllowLocation] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Mock authentication logic
    if (isLogin) {
      console.log('Logging in with:', { email: formData.email, password: formData.password });
      // In real app, would make API call and redirect to dashboard
      alert('Login successful! (This is a mock implementation)');
    } else {
      console.log('Signing up with:', formData, { allowLocation });
      // In real app, would make API call and redirect to dashboard
      alert('Signup successful! (This is a mock implementation)');
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      name: ''
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex">
      
      {/* Left Side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/90 via-pink-600/80 to-orange-500/90" />
        <img
          src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&h=1000&fit=crop"
          alt="Local events and community"
          className="w-full h-full object-cover"
        />
        
        {/* Overlay Content */}
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="text-center text-white">
            <div className="mb-8">
              <div className="inline-flex items-center space-x-2 mb-6">
                <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                  <MapPin className="h-8 w-8" />
                </div>
                <span className="text-2xl font-bold">NearMe</span>
              </div>
              <h1 className="text-5xl font-bold mb-6 leading-tight">
                Discover Amazing Events
                <span className="block text-yellow-300">In Your Neighborhood</span>
              </h1>
              <p className="text-xl opacity-90 mb-8 max-w-md">
                Join thousands of people connecting through local events, workshops, and community gatherings.
              </p>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 max-w-md">
              <div className="text-center">
                <div className="text-3xl font-bold mb-1">10k+</div>
                <div className="text-sm opacity-80">Events</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-1">500+</div>
                <div className="text-sm opacity-80">Organizers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-1">50k+</div>
                <div className="text-sm opacity-80">Members</div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-20 w-16 h-16 bg-white/20 rounded-full animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }} />
        <div className="absolute top-40 right-32 w-12 h-12 bg-white/20 rounded-full animate-bounce" style={{ animationDelay: '1s', animationDuration: '4s' }} />
        <div className="absolute bottom-32 left-32 w-20 h-20 bg-white/20 rounded-full animate-bounce" style={{ animationDelay: '2s', animationDuration: '3.5s' }} />
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center space-x-2 mb-4">
              <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 text-white">
                <MapPin className="h-6 w-6" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                NearMe
              </span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome back!
            </h2>
            <p className="text-gray-600">
              Discover events happening near you
            </p>
          </div>

          <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-2">
              <div className="flex justify-center mb-6">
                <div className="flex p-1 bg-gray-100 rounded-lg">
                  <Button
                    type="button"
                    variant={isLogin ? 'default' : 'ghost'}
                    onClick={() => setIsLogin(true)}
                    className="px-6 py-2 text-sm font-medium transition-all duration-200"
                  >
                    Log In
                  </Button>
                  <Button
                    type="button"
                    variant={!isLogin ? 'default' : 'ghost'}
                    onClick={() => setIsLogin(false)}
                    className="px-6 py-2 text-sm font-medium transition-all duration-200"
                  >
                    Sign Up
                  </Button>
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {isLogin ? 'Welcome back!' : 'Join our community'}
              </h3>
              <p className="text-gray-600">
                {isLogin 
                  ? 'Sign in to discover events near you' 
                  : 'Create an account to get started'
                }
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Name field for signup */}
                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="h-12 border-purple-200 focus:border-purple-500 focus:ring-purple-500"
                      required
                    />
                  </div>
                )}

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="pl-10 h-12 border-purple-200 focus:border-purple-500 focus:ring-purple-500"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="pl-10 pr-10 h-12 border-purple-200 focus:border-purple-500 focus:ring-purple-500"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {/* Confirm Password for signup */}
                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="pl-10 h-12 border-purple-200 focus:border-purple-500 focus:ring-purple-500"
                        required
                      />
                    </div>
                  </div>
                )}

                {/* Location Permission for signup */}
                {!isLogin && (
                  <div className="flex items-center space-x-2 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100">
                    <Checkbox
                      id="location"
                      checked={allowLocation}
                      onCheckedChange={setAllowLocation}
                    />
                    <div className="flex-1">
                      <Label htmlFor="location" className="text-sm font-medium text-gray-900 cursor-pointer">
                        Allow location access for personalized event suggestions
                      </Label>
                      <p className="text-xs text-gray-500 mt-1">
                        We'll use your location to show you relevant events nearby
                      </p>
                    </div>
                    <MapPin className="h-5 w-5 text-purple-500" />
                  </div>
                )}

                {/* Remember me / Forgot password for login */}
                {isLogin && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="remember" />
                      <Label htmlFor="remember" className="text-sm text-gray-600 cursor-pointer">
                        Remember me
                      </Label>
                    </div>
                    <Link to="/forgot-password" className="text-sm text-purple-600 hover:text-purple-700">
                      Forgot password?
                    </Link>
                  </div>
                )}

                {/* Submit Button */}
                <Button 
                  type="submit" 
                  className="w-full h-12 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105"
                >
                  {isLogin ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or continue with</span>
                  </div>
                </div>

                {/* Google Sign In */}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 border-gray-200 hover:bg-gray-50 transition-all duration-300"
                >
                  <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Continue with Google
                </Button>
              </form>

              {/* Toggle Link */}
              <div className="text-center">
                <p className="text-gray-600">
                  {isLogin ? "Don't have an account?" : "Already have an account?"}
                  <Button
                    variant="link"
                    onClick={toggleMode}
                    className="text-purple-600 hover:text-purple-700 font-medium pl-1"
                  >
                    {isLogin ? 'Sign up' : 'Log in'}
                  </Button>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;