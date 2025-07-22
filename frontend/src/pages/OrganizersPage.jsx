import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card, CardContent } from '../components/ui/card';
import { Checkbox } from '../components/ui/checkbox';
import { Slider } from '../components/ui/slider';
import OrganizerCard from '../components/OrganizerCard';
import useGeolocation from '../hooks/useGeolocation';
import { 
  mockOrganizers, 
  getNearbyOrganizers, 
  eventCategories 
} from '../data/mockData';
import { 
  Search, 
  Filter, 
  MapPin, 
  Star, 
  Users, 
  Map,
  List,
  X,
  Award,
  TrendingUp
} from 'lucide-react';

const OrganizersPage = () => {
  const { location: userLocation } = useGeolocation();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // State
  const [organizers, setOrganizers] = useState([]);
  const [filteredOrganizers, setFilteredOrganizers] = useState([]);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [distanceRange, setDistanceRange] = useState([25]);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('distance');
  const [viewMode, setViewMode] = useState('list');
  const [showFilters, setShowFilters] = useState(false);

  // Initialize organizers
  useEffect(() => {
    if (userLocation) {
      const nearby = getNearbyOrganizers(userLocation.lat, userLocation.lng, 50);
      setOrganizers(nearby);
      setFilteredOrganizers(nearby);
    }
  }, [userLocation]);

  // Apply filters
  useEffect(() => {
    let filtered = [...organizers];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(organizer => 
        organizer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        organizer.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        organizer.categories.some(cat => cat.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(organizer => 
        organizer.categories.some(cat => selectedCategories.includes(cat))
      );
    }

    // Distance filter
    filtered = filtered.filter(organizer => 
      parseFloat(organizer.distance) <= distanceRange[0]
    );

    // Rating filter
    filtered = filtered.filter(organizer => organizer.rating >= minRating);

    // Sort
    switch (sortBy) {
      case 'distance':
        filtered.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'events':
        filtered.sort((a, b) => b.totalEvents - a.totalEvents);
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }

    setFilteredOrganizers(filtered);
  }, [organizers, searchQuery, selectedCategories, distanceRange, minRating, sortBy]);

  const handleCategoryToggle = (category) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setDistanceRange([25]);
    setMinRating(0);
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            <Users className="inline h-10 w-10 mr-3 text-blue-500" />
            Event Organizers Near You
          </h1>
          <p className="text-gray-600">
            Found {filteredOrganizers.length} talented organizers within {distanceRange[0]} miles of your location
          </p>
        </div>

        {/* Search and Controls */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Search organizers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-3 border-blue-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="distance">Distance</SelectItem>
                <SelectItem value="rating">Rating</SelectItem>
                <SelectItem value="events">Events Hosted</SelectItem>
                <SelectItem value="name">Name</SelectItem>
              </SelectContent>
            </Select>

            {/* View Toggle */}
            <div className="flex rounded-lg border border-blue-200 p-1">
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-md"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'map' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('map')}
                className="rounded-md"
              >
                <Map className="h-4 w-4" />
              </Button>
            </div>

            {/* Filter Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden border-blue-200 text-blue-600"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <div className={`${showFilters ? 'block' : 'hidden'} lg:block w-80 space-y-6`}>
            <Card className="p-6 border-blue-100 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg text-gray-900">Filters</h3>
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear All
                </Button>
              </div>

              {/* Distance Filter */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-blue-500" />
                  <span className="font-medium text-gray-700">Distance: {distanceRange[0]} miles</span>
                </div>
                <Slider
                  value={distanceRange}
                  onValueChange={setDistanceRange}
                  max={50}
                  min={1}
                  step={1}
                  className="w-full"
                />
              </div>

              <hr className="border-gray-200" />

              {/* Category Filter */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Award className="h-4 w-4 text-blue-500" />
                  <span className="font-medium text-gray-700">Specialties</span>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {eventCategories.map((category) => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox
                        id={`org-${category}`}
                        checked={selectedCategories.includes(category)}
                        onCheckedChange={() => handleCategoryToggle(category)}
                      />
                      <label htmlFor={`org-${category}`} className="text-sm text-gray-600 cursor-pointer">
                        {category}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <hr className="border-gray-200" />

              {/* Rating Filter */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Star className="h-4 w-4 text-blue-500" />
                  <span className="font-medium text-gray-700">Minimum Rating: {minRating}</span>
                </div>
                <Slider
                  value={[minRating]}
                  onValueChange={([value]) => setMinRating(value)}
                  max={5}
                  min={0}
                  step={0.5}
                  className="w-full"
                />
              </div>

              {/* Stats */}
              <div className="pt-4 border-t border-gray-200">
                <h4 className="font-medium text-gray-700 mb-3">Quick Stats</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Top Rated (4.5+)</span>
                    <span className="font-medium text-blue-600">
                      {organizers.filter(o => o.rating >= 4.5).length}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Highly Active (20+ events)</span>
                    <span className="font-medium text-blue-600">
                      {organizers.filter(o => o.totalEvents >= 20).length}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Within 10 miles</span>
                    <span className="font-medium text-blue-600">
                      {organizers.filter(o => parseFloat(o.distance) <= 10).length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Active Filters */}
              {(selectedCategories.length > 0 || minRating > 0) && (
                <div className="space-y-2 pt-4 border-t border-gray-200">
                  <span className="text-sm font-medium text-gray-700">Active Filters:</span>
                  <div className="flex flex-wrap gap-2">
                    {selectedCategories.map((category) => (
                      <Badge 
                        key={category} 
                        variant="secondary" 
                        className="bg-blue-100 text-blue-700 hover:bg-blue-200 cursor-pointer"
                        onClick={() => handleCategoryToggle(category)}
                      >
                        {category}
                        <X className="h-3 w-3 ml-1" />
                      </Badge>
                    ))}
                    {minRating > 0 && (
                      <Badge 
                        variant="secondary" 
                        className="bg-blue-100 text-blue-700 hover:bg-blue-200 cursor-pointer"
                        onClick={() => setMinRating(0)}
                      >
                        {minRating}+ stars
                        <X className="h-3 w-3 ml-1" />
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {viewMode === 'list' ? (
              <div>
                {/* Top Organizers Section */}
                {filteredOrganizers.length > 0 && (
                  <div className="mb-8">
                    <div className="flex items-center mb-6">
                      <TrendingUp className="h-6 w-6 text-blue-500 mr-2" />
                      <h2 className="text-2xl font-semibold text-gray-900">
                        {sortBy === 'rating' ? 'Highest Rated' : 
                         sortBy === 'events' ? 'Most Active' :
                         sortBy === 'distance' ? 'Closest to You' : 'Featured'} Organizers
                      </h2>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                      {filteredOrganizers.map((organizer) => (
                        <OrganizerCard key={organizer.id} organizer={organizer} showDistance={true} />
                      ))}
                    </div>
                  </div>
                )}

                {/* No Results */}
                {filteredOrganizers.length === 0 && (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                      <Users className="h-12 w-12 text-blue-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">
                      No organizers found
                    </h3>
                    <p className="text-gray-500 mb-4 max-w-md mx-auto">
                      Try adjusting your search criteria or expanding your distance range to find more organizers
                    </p>
                    <Button onClick={clearFilters} variant="outline">
                      Clear All Filters
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg border border-blue-100 h-[600px] flex items-center justify-center">
                <div className="text-center">
                  <Map className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    Map View Coming Soon
                  </h3>
                  <p className="text-gray-500">
                    Interactive map showing organizer locations will be available in the full version
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CTA Section */}
        {filteredOrganizers.length > 0 && (
          <section className="mt-16 py-12 px-8 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl text-white text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-black/20" />
            <div className="relative">
              <h2 className="text-3xl font-bold mb-4">
                Ready to Host Your Own Event?
              </h2>
              <p className="text-xl mb-6 opacity-90 max-w-2xl mx-auto">
                Join these amazing organizers and start building your community today
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button className="bg-white text-blue-600 hover:bg-gray-100 shadow-lg px-8 py-3 text-lg rounded-xl">
                  <Award className="h-5 w-5 mr-2" />
                  Become an Organizer
                </Button>
                <Button variant="outline" className="border-white text-white hover:bg-white/10 px-8 py-3 text-lg rounded-xl">
                  Learn More
                </Button>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default OrganizersPage;