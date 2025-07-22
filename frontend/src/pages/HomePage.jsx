import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import EventCard from '../components/EventCard';
import OrganizerCard from '../components/OrganizerCard';
import useGeolocation from '../hooks/useGeolocation';
import apiService from '../services/api';
import { eventCategories } from '../data/mockData';
import { 
  Search, 
  MapPin, 
  Calendar, 
  Users, 
  ArrowRight, 
  Sparkles,
  TrendingUp,
  Clock
} from 'lucide-react';

const HomePage = () => {
  const { location, loading, error } = useGeolocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [nearbyOrganizers, setNearbyOrganizers] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    if (location) {
      loadData();
    }
  }, [location]);

  const loadData = async () => {
    try {
      setIsLoadingData(true);

      // Load featured events
      const eventsResponse = await apiService.getEvents({
        user_lat: location.lat,
        user_lng: location.lng,
        max_distance: 25,
        sort_by: 'rating',
        limit: 3
      });

      if (eventsResponse.success) {
        setFeaturedEvents(eventsResponse.data);
      }

      // Load nearby organizers
      const organizersResponse = await apiService.getTopNearbyOrganizers(
        location.lat,
        location.lng,
        25,
        3
      );

      if (organizersResponse.success) {
        setNearbyOrganizers(organizersResponse.data);
      }

    } catch (error) {
      console.error('Error loading data:', error);
      // Fallback to mock data if API fails
      const { getNearbyEvents, getNearbyOrganizers } = await import('../data/mockData');
      setFeaturedEvents(getNearbyEvents(location.lat, location.lng, 25).slice(0, 3));
      setNearbyOrganizers(getNearbyOrganizers(location.lat, location.lng, 25).slice(0, 3));
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleSearch = () => {
    // Navigate to events page with search query
    window.location.href = `/events?search=${encodeURIComponent(searchQuery)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            {/* Location Status */}
            <div className="flex justify-center mb-8">
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border border-purple-100">
                <MapPin className="h-4 w-4 text-purple-500" />
                <span className="text-sm text-gray-600">
                  {loading ? 'Detecting location...' : 
                   error ? 'Using default location' : 
                   `Events near ${location.city}, ${location.state}`}
                </span>
                {!loading && !error && (
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                )}
              </div>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Discover Amazing
              <span className="block bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent animate-pulse">
                Events Near You
              </span>
            </h1>

            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
              Connect with your community through local events, meet amazing organizers, 
              and create unforgettable memories right in your neighborhood.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-12">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur-xl opacity-25 group-hover:opacity-40 transition-opacity duration-300" />
                <div className="relative flex bg-white rounded-2xl shadow-2xl border border-purple-100 overflow-hidden">
                  <div className="flex-1 relative">
                    <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      type="text"
                      placeholder="Search events, venues, or categories..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      className="pl-14 pr-6 py-6 text-lg border-0 focus:ring-0 bg-transparent"
                    />
                  </div>
                  <Button
                    onClick={handleSearch}
                    className="m-2 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105 rounded-xl"
                  >
                    <Search className="h-5 w-5 mr-2" />
                    Search
                  </Button>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap justify-center gap-4 mb-16">
              <Link to="/events">
                <Button variant="outline" className="border-purple-200 text-purple-600 hover:bg-purple-50 transition-all duration-300 hover:scale-105 rounded-xl px-6 py-3">
                  <Calendar className="h-4 w-4 mr-2" />
                  Browse All Events
                </Button>
              </Link>
              <Link to="/organizers">
                <Button variant="outline" className="border-pink-200 text-pink-600 hover:bg-pink-50 transition-all duration-300 hover:scale-105 rounded-xl px-6 py-3">
                  <Users className="h-4 w-4 mr-2" />
                  Find Organizers Nearby
                </Button>
              </Link>
              <Link to="/create-event">
                <Button variant="outline" className="border-orange-200 text-orange-600 hover:bg-orange-50 transition-all duration-300 hover:scale-105 rounded-xl px-6 py-3">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Create Event
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full opacity-20 animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }} />
        <div className="absolute top-40 right-20 w-16 h-16 bg-gradient-to-br from-pink-400 to-orange-400 rounded-full opacity-20 animate-bounce" style={{ animationDelay: '1s', animationDuration: '4s' }} />
        <div className="absolute top-60 left-1/4 w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full opacity-20 animate-bounce" style={{ animationDelay: '2s', animationDuration: '3.5s' }} />
      </section>

      {/* Featured Events */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                <TrendingUp className="inline h-8 w-8 mr-3 text-purple-500" />
                Featured Events
              </h2>
              <p className="text-gray-600">Popular events happening near you this week</p>
            </div>
            <Link to="/events">
              <Button variant="ghost" className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 transition-all duration-300">
                View All
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>

          {isLoadingData ? (
            <div className="flex justify-center items-center py-16">
              <div className="flex space-x-2">
                <div className="w-4 h-4 bg-purple-500 rounded-full animate-bounce" />
                <div className="w-4 h-4 bg-pink-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}} />
                <div className="w-4 h-4 bg-orange-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}} />
              </div>
            </div>
          ) : featuredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredEvents.map((event) => (
                <EventCard key={event.id} event={event} showDistance={true} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
                <Calendar className="h-12 w-12 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No events found nearby
              </h3>
              <p className="text-gray-500 mb-4">
                Try expanding your search area or check back later for new events
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Explore by Category
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Find events that match your interests from music and food to networking and wellness
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {eventCategories.map((category, index) => (
              <Link 
                key={category} 
                to={`/events?category=${encodeURIComponent(category)}`}
              >
                <Badge 
                  variant="outline" 
                  className="px-6 py-3 text-sm font-medium border-purple-200 text-purple-700 bg-purple-50 hover:bg-purple-100 hover:border-purple-300 transition-all duration-300 hover:scale-105 cursor-pointer rounded-xl"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {category}
                </Badge>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Nearby Organizers */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                <Users className="inline h-8 w-8 mr-3 text-blue-500" />
                Top Organizers Near You
              </h2>
              <p className="text-gray-600">Connect with the best event organizers in your area</p>
            </div>
            <Link to="/organizers">
              <Button variant="ghost" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-all duration-300">
                View All
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>

          {isLoadingData ? (
            <div className="flex justify-center items-center py-16">
              <div className="flex space-x-2">
                <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce" />
                <div className="w-4 h-4 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}} />
                <div className="w-4 h-4 bg-pink-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}} />
              </div>
            </div>
          ) : nearbyOrganizers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {nearbyOrganizers.map((organizer) => (
                <OrganizerCard key={organizer.id} organizer={organizer} showDistance={true} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                <Users className="h-12 w-12 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No organizers found nearby
              </h3>
              <p className="text-gray-500 mb-4">
                Try expanding your search area or check back later
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='white' fill-opacity='0.1'%3E%3Cpath d='m0 40l40-40h-40z'/%3E%3C/g%3E%3C/svg%3E")`
          }} />
        </div>
        
        <div className="relative max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Create Something Amazing?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of event organizers who trust NearMe to connect with their community
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/create-event">
              <Button className="bg-white text-purple-600 hover:bg-gray-100 shadow-lg hover:shadow-white/25 transition-all duration-300 hover:scale-105 px-8 py-4 text-lg rounded-xl">
                <Sparkles className="h-5 w-5 mr-2" />
                Create Your First Event
              </Button>
            </Link>
            <Link to="/signup">
              <Button variant="outline" className="border-white text-white hover:bg-white/10 transition-all duration-300 hover:scale-105 px-8 py-4 text-lg rounded-xl">
                Join the Community
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;



export default HomePage;