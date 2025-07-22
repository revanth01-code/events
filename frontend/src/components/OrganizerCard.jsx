import React from 'react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { 
  MapPin, 
  Star, 
  Calendar, 
  Mail, 
  Phone,
  ExternalLink
} from 'lucide-react';

const OrganizerCard = ({ organizer, showDistance = false }) => {
  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <Card className="group hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 hover:scale-[1.02] border-0 shadow-lg bg-white/80 backdrop-blur-sm overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-start space-x-4">
          <Avatar className="h-16 w-16 ring-4 ring-blue-100 group-hover:ring-blue-200 transition-all duration-300">
            <AvatarImage src={organizer.photo} alt={organizer.name} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-lg font-bold">
              {getInitials(organizer.name)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
              {organizer.name}
            </h3>
            
            <div className="flex items-center mt-1 space-x-3">
              <div className="flex items-center">
                <Star className="h-4 w-4 mr-1 text-yellow-400 fill-current" />
                <span className="text-sm font-medium text-gray-700">{organizer.rating}</span>
              </div>
              
              {showDistance && organizer.distance && (
                <div className="flex items-center text-sm text-gray-500">
                  <MapPin className="h-3 w-3 mr-1" />
                  <span>{organizer.distance} mi away</span>
                </div>
              )}
            </div>

            <div className="flex items-center mt-2 text-sm text-gray-500">
              <Calendar className="h-4 w-4 mr-1" />
              <span>{organizer.totalEvents} events hosted</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
          {organizer.description}
        </p>

        {/* Categories */}
        <div className="flex flex-wrap gap-1">
          {organizer.categories.slice(0, 3).map((category, index) => (
            <Badge 
              key={index} 
              variant="outline" 
              className="border-blue-200 text-blue-700 bg-blue-50 text-xs"
            >
              {category}
            </Badge>
          ))}
          {organizer.categories.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{organizer.categories.length - 3} more
            </Badge>
          )}
        </div>

        {/* Recent Events */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Recent Events</h4>
          <div className="space-y-1">
            {organizer.recentEvents.slice(0, 2).map((event, index) => (
              <div key={index} className="text-xs text-gray-500 flex items-center">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2" />
                {event}
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-2">
          <Button className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105">
            <ExternalLink className="h-4 w-4 mr-2" />
            View Profile
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            className="border-blue-200 text-blue-600 hover:bg-blue-50 transition-all duration-300 hover:scale-105"
          >
            <Mail className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrganizerCard;