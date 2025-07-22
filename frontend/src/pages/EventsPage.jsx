import React, { useState, useEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card, CardContent } from '../components/ui/card';
import { Checkbox } from '../components/ui/checkbox';
import { Slider } from '../components/ui/slider';
import EventCard from '../components/EventCard';
import useGeolocation from '../hooks/useGeolocation';
import { 
  mockEvents, 
  getNearbyEvents, 
  eventCategories, 
  priceRanges 
} from '../data/mockData';
import { 
  Search, 
  Filter, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Star, 
  Map,
  List,
  X
} from 'lucide-react';

const EventsPage = () => {
  const location = useLocation();
  const { location: userLocation } = useGeolocation();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // State
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState('');
  const [distanceRange, setDistanceRange] = useState([25]);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('distance');
  const [viewMode, setViewMode] = useState('list');
  const [showFilters, setShowFilters] = useState(false);

  // Initialize events
  useEffect(() => {
    if (userLocation) {
      const nearby = getNearbyEvents(userLocation.lat, userLocation.lng, 50);
      setEvents(nearby);
      setFilteredEvents(nearby);
    }
  }, [userLocation]);

  // Apply filters
  useEffect(() => {
    let filtered = [...events];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(event => 
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(event => 
        selectedCategories.includes(event.category)
      );
    }

    // Price range filter
    if (selectedPriceRange) {
      const range = priceRanges.find(r => r.label === selectedPriceRange);
      if (range) {
        filtered = filtered.filter(event => 
          event.price.min >= range.min && 
          (range.max === 999999 || event.price.max <= range.max)
        );
      }
    }

    // Distance filter
    filtered = filtered.filter(event => 
      parseFloat(event.distance) <= distanceRange[0]
    );

    // Rating filter
    filtered = filtered.filter(event => event.rating >= minRating);

    // Sort
    switch (sortBy) {
      case 'distance':
        filtered.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
        break;
      case 'date':
        filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'price':
        filtered.sort((a, b) => a.price.min - b.price.min);
        break;
      default:
        break;
    }

    setFilteredEvents(filtered);
  }, [events, searchQuery, selectedCategories, selectedPriceRange, distanceRange, minRating, sortBy]);

  const handleCategoryToggle = (category) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedPriceRange('');
    setDistanceRange([25]);
    setMinRating(0);
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Discover Events Near You
          </h1>
          <p className="text-gray-600">
            Found {filteredEvents.length} events within {distanceRange[0]} miles of your location
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
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-3 border-purple-200 focus:border-purple-500 focus:ring-purple-500"
              />
            </div>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="distance">Distance</SelectItem>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="rating">Rating</SelectItem>
                <SelectItem value="price">Price</SelectItem>
              </SelectContent>
            </Select>

            {/* View Toggle */}
            <div className="flex rounded-lg border border-purple-200 p-1">
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
              className="lg:hidden border-purple-200 text-purple-600"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <div className={`${showFilters ? 'block' : 'hidden'} lg:block w-80 space-y-6`}>
            <Card className="p-6 border-purple-100 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg text-gray-900">Filters</h3>
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear All
                </Button>
              </div>

              {/* Distance Filter */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-purple-500" />
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
                  <Calendar className="h-4 w-4 text-purple-500" />
                  <span className="font-medium text-gray-700">Categories</span>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {eventCategories.map((category) => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox
                        id={category}
                        checked={selectedCategories.includes(category)}
                        onCheckedChange={() => handleCategoryToggle(category)}
                      />
                      <label htmlFor={category} className="text-sm text-gray-600 cursor-pointer">
                        {category}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <hr className="border-gray-200" />

              {/* Price Filter */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-purple-500" />
                  <span className="font-medium text-gray-700">Price Range</span>
                </div>
                <Select value={selectedPriceRange} onValueChange={setSelectedPriceRange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select price range" />
                  </SelectTrigger>
                  <SelectContent>
                    {priceRanges.map((range) => (
                      <SelectItem key={range.label} value={range.label}>
                        {range.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <hr className="border-gray-200" />

              {/* Rating Filter */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Star className="h-4 w-4 text-purple-500" />
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

              {/* Active Filters */}
              {(selectedCategories.length > 0 || selectedPriceRange || minRating > 0) && (
                <div className="space-y-2 pt-4 border-t border-gray-200">
                  <span className="text-sm font-medium text-gray-700">Active Filters:</span>
                  <div className="flex flex-wrap gap-2">
                    {selectedCategories.map((category) => (
                      <Badge 
                        key={category} 
                        variant="secondary" 
                        className="bg-purple-100 text-purple-700 hover:bg-purple-200 cursor-pointer"
                        onClick={() => handleCategoryToggle(category)}
                      >
                        {category}
                        <X className="h-3 w-3 ml-1" />
                      </Badge>
                    ))}
                    {selectedPriceRange && (
                      <Badge 
                        variant="secondary" 
                        className="bg-purple-100 text-purple-700 hover:bg-purple-200 cursor-pointer"
                        onClick={() => setSelectedPriceRange('')}
                      >
                        {selectedPriceRange}
                        <X className="h-3 w-3 ml-1" />
                      </Badge>
                    )}
                    {minRating > 0 && (
                      <Badge 
                        variant="secondary" 
                        className="bg-purple-100 text-purple-700 hover:bg-purple-200 cursor-pointer"
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
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredEvents.length > 0 ? (
                  filteredEvents.map((event) => (
                    <EventCard key={event.id} event={event} showDistance={true} />
                  ))
                ) : (
                  <div className="col-span-full text-center py-16">
                    <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
                      <Search className="h-12 w-12 text-purple-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">
                      No events found
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Try adjusting your search criteria or expanding your distance range
                    </p>
                    <Button onClick={clearFilters} variant="outline">
                      Clear All Filters
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg border border-purple-100 h-[600px] flex items-center justify-center">
                <div className="text-center">
                  <Map className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    Map View Coming Soon
                  </h3>
                  <p className="text-gray-500">
                    Interactive map with event locations will be available in the full version
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventsPage;