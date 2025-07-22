import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  MapPin, 
  Calendar, 
  Clock, 
  Star, 
  Users, 
  DollarSign,
  Heart,
  Share2
} from 'lucide-react';

const EventCard = ({ event, showDistance = false }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
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

  return (
    <Card className="group hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-500 hover:scale-[1.02] border-0 shadow-lg bg-white/80 backdrop-blur-sm overflow-hidden">
      <div className="relative">
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Floating action buttons */}
        <div className="absolute top-3 right-3 flex space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
          <Button size="sm" variant="secondary" className="rounded-full p-2 bg-white/90 hover:bg-white shadow-lg">
            <Heart className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="secondary" className="rounded-full p-2 bg-white/90 hover:bg-white shadow-lg">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Price badge */}
        <div className="absolute top-3 left-3">
          <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg">
            {formatPrice(event.price)}
          </Badge>
        </div>

        {/* Distance badge */}
        {showDistance && event.distance && (
          <div className="absolute bottom-3 left-3">
            <Badge variant="secondary" className="bg-white/90 text-gray-900 shadow-lg">
              <MapPin className="h-3 w-3 mr-1" />
              {event.distance} mi away
            </Badge>
          </div>
        )}
      </div>

      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <Badge variant="outline" className="border-purple-200 text-purple-700 bg-purple-50 mb-2">
            {event.category}
          </Badge>
        </div>
        <h3 className="font-bold text-lg text-gray-900 line-clamp-2 group-hover:text-purple-600 transition-colors duration-300">
          {event.title}
        </h3>
      </CardHeader>

      <CardContent className="space-y-3">
        <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
          {event.description}
        </p>

        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-500">
            <Calendar className="h-4 w-4 mr-2 text-purple-500" />
            <span>{formatDate(event.date)}</span>
            <Clock className="h-4 w-4 ml-4 mr-1 text-purple-500" />
            <span>{event.time}</span>
          </div>

          <div className="flex items-center text-sm text-gray-500">
            <MapPin className="h-4 w-4 mr-2 text-purple-500" />
            <span className="truncate">{event.location.name}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center">
                <Star className="h-4 w-4 mr-1 text-yellow-400 fill-current" />
                <span>{event.rating}</span>
              </div>
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-1 text-blue-500" />
                <span>{event.attendees}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-3 flex space-x-2">
          <Link to={`/events/${event.id}`} className="flex-1">
            <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105">
              View Details
            </Button>
          </Link>
          <Button 
            variant="outline" 
            className="border-purple-200 text-purple-600 hover:bg-purple-50 transition-all duration-300 hover:scale-105"
          >
            RSVP
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EventCard;