import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import EventCard from '../components/EventCard';
import useGeolocation from '../hooks/useGeolocation';
import { mockEvents, mockUser, getNearbyEvents } from '../data/mockData';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Star, 
  Users, 
  Heart, 
  Share2, 
  DollarSign,
  ExternalLink,
  Send,
  Map,
  Navigation,
  Phone,
  Mail,
  ArrowLeft
} from 'lucide-react';

const EventDetailsPage = () => {
  const { id } = useParams();
  const { location: userLocation } = useGeolocation();
  const [event, setEvent] = useState(null);
  const [isRsvped, setIsRsvped] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [newReview, setNewReview] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [similarEvents, setSimilarEvents] = useState([]);

  useEffect(() => {
    // Find the event by ID
    const foundEvent = mockEvents.find(e => e.id === id);
    if (foundEvent && userLocation) {
      const eventWithDistance = {
        ...foundEvent,
        distance: calculateDistance(
          userLocation.lat, userLocation.lng,
          foundEvent.location.lat, foundEvent.location.lng
        ).toFixed(1)
      };
      setEvent(eventWithDistance);

      // Check if user has saved this event
      setIsSaved(mockUser.savedEvents.includes(id));

      // Get similar events (same category, different event)
      const similar = getNearbyEvents(userLocation.lat, userLocation.lng, 50)
        .filter(e => e.category === foundEvent.category && e.id !== id)
        .slice(0, 3);
      setSimilarEvents(similar);
    }
  }, [id, userLocation]);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const handleRSVP = () => {
    setIsRsvped(!isRsvped);
    // In real app, would make API call
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    // In real app, would make API call
  };

  const handleAddToCalendar = () => {
    // Create calendar event (mock implementation)
    const startDate = new Date(`${event.date}T${event.time}`);
    const endDate = new Date(startDate.getTime() + 3 * 60 * 60 * 1000); // 3 hours later
    
    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location.address)}`;
    
    window.open(calendarUrl, '_blank');
  };

  const handleSubmitReview = () => {
    if (newReview.trim()) {
      // In real app, would make API call to submit review
      console.log('Submitting review:', { rating: newRating, comment: newReview });
      setNewReview('');
      setNewRating(5);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric',
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatPrice = (price) => {
    if (price.min === 0 && price.max === 0) {
      return 'Free';
    } else if (price.min === price.max) {
      return `$${price.min}`;
    } else {
      return `$${price.min} - $${price.max}`;
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
      />
    ));
  };

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading event details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Back Navigation */}
        <div className="mb-6">
          <Link to="/events">
            <Button variant="ghost" className="text-purple-600 hover:text-purple-700 hover:bg-purple-50">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Events
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Event Header */}
            <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-sm overflow-hidden">
              <div className="relative h-80">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                
                <div className="absolute bottom-6 left-6 text-white">
                  <Badge className="mb-4 bg-white/20 text-white border-white/30">
                    {event.category}
                  </Badge>
                  <h1 className="text-4xl font-bold mb-2">{event.title}</h1>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <Star className="h-5 w-5 mr-1 text-yellow-400 fill-current" />
                      <span className="font-medium">{event.rating}</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="h-5 w-5 mr-1" />
                      <span>{event.attendees} attending</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-5 w-5 mr-1" />
                      <span>{event.distance} mi away</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="absolute top-6 right-6 flex space-x-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={handleSave}
                    className={`rounded-full p-2 shadow-lg ${
                      isSaved ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-white/90 hover:bg-white'
                    }`}
                  >
                    <Heart className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
                  </Button>
                  <Button size="sm" variant="secondary" className="rounded-full p-2 bg-white/90 hover:bg-white shadow-lg">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  
                  {/* Date & Time */}
                  <div className="flex items-start space-x-3">
                    <div className="p-2 rounded-lg bg-purple-100">
                      <Calendar className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Date & Time</p>
                      <p className="text-gray-600">{formatDate(event.date)}</p>
                      <p className="text-gray-600">{event.time}</p>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-start space-x-3">
                    <div className="p-2 rounded-lg bg-blue-100">
                      <MapPin className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Location</p>
                      <p className="text-gray-600">{event.location.name}</p>
                      <p className="text-gray-600 text-sm">{event.location.address}</p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="flex items-start space-x-3">
                    <div className="p-2 rounded-lg bg-green-100">
                      <DollarSign className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Price</p>
                      <p className="text-gray-600 text-lg font-semibold">{formatPrice(event.price)}</p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">About This Event</h3>
                  <p className="text-gray-600 leading-relaxed">{event.description}</p>
                </div>
              </CardContent>
            </Card>

            {/* Map Section */}
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <h3 className="text-xl font-semibold text-gray-900">Location & Directions</h3>
              </CardHeader>
              <CardContent>
                <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg h-64 flex items-center justify-center mb-4">
                  <div className="text-center">
                    <Map className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-600 mb-2">Interactive Map</h4>
                    <p className="text-gray-500 text-sm">
                      Map integration with Google Maps will be available in the full version
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{event.location.name}</p>
                    <p className="text-gray-600">{event.location.address}</p>
                    <p className="text-sm text-purple-600 font-medium">{event.distance} miles from your location</p>
                  </div>
                  <Button className="bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600">
                    <Navigation className="h-4 w-4 mr-2" />
                    Get Directions
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Reviews Section */}
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900">Reviews & Ratings</h3>
                  <div className="flex items-center space-x-2">
                    <div className="flex">{renderStars(Math.round(event.rating))}</div>
                    <span className="font-medium text-gray-700">{event.rating} ({event.reviews.length} reviews)</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Add Review */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6">
                  <h4 className="font-medium text-gray-900 mb-4">Add Your Review</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                      <Select value={newRating.toString()} onValueChange={(value) => setNewRating(parseInt(value))}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[5, 4, 3, 2, 1].map((rating) => (
                            <SelectItem key={rating} value={rating.toString()}>
                              <div className="flex items-center space-x-1">
                                <span>{rating}</span>
                                <div className="flex">{renderStars(rating)}</div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Your Review</label>
                      <Textarea
                        placeholder="Share your experience..."
                        value={newReview}
                        onChange={(e) => setNewReview(e.target.value)}
                        className="resize-none"
                        rows={3}
                      />
                    </div>
                    <Button 
                      onClick={handleSubmitReview}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Submit Review
                    </Button>
                  </div>
                </div>

                {/* Existing Reviews */}
                <div className="space-y-4">
                  {event.reviews.length > 0 ? (
                    event.reviews.map((review) => (
                      <div key={review.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                        <div className="flex items-start space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                              {review.user.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="font-medium text-gray-900">{review.user}</span>
                              <div className="flex">{renderStars(review.rating)}</div>
                              <span className="text-sm text-gray-500">{review.date}</span>
                            </div>
                            <p className="text-gray-600">{review.comment}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-8">No reviews yet. Be the first to review this event!</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* RSVP Card */}
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm sticky top-24">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <p className="text-3xl font-bold text-gray-900 mb-2">{formatPrice(event.price)}</p>
                  <p className="text-gray-600">per person</p>
                </div>

                <div className="space-y-3 mb-6">
                  <Button 
                    onClick={handleRSVP}
                    className={`w-full py-3 text-lg font-medium transition-all duration-300 ${
                      isRsvped 
                        ? 'bg-green-500 hover:bg-green-600 text-white' 
                        : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white'
                    }`}
                  >
                    {isRsvped ? 'RSVP\'d ✓' : 'RSVP Now'}
                  </Button>
                  
                  <Button 
                    onClick={handleAddToCalendar}
                    variant="outline" 
                    className="w-full border-purple-200 text-purple-600 hover:bg-purple-50"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Add to Calendar
                  </Button>
                </div>

                <div className="text-center text-sm text-gray-500">
                  <p className="flex items-center justify-center">
                    <Users className="h-4 w-4 mr-1" />
                    {event.attendees} people are attending
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Organizer Card */}
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">Event Organizer</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={event.organizer.photo} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                      {event.organizer.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-gray-900">{event.organizer.name}</p>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 mr-1 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600">{event.organizer.rating} rating</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    <Mail className="h-4 w-4 mr-1" />
                    Contact
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Similar Events */}
        {similarEvents.length > 0 && (
          <section className="mt-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Similar Events Near You
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {similarEvents.map((similarEvent) => (
                <EventCard key={similarEvent.id} event={similarEvent} showDistance={true} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default EventDetailsPage;