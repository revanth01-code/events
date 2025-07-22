import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navigation from "./components/Navigation";
import HomePage from "./pages/HomePage";
import EventsPage from "./pages/EventsPage";
import EventDetailsPage from "./pages/EventDetailsPage";
import LoginPage from "./pages/LoginPage";
import { Toaster } from "./components/ui/sonner";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          {/* Auth routes without navigation */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<LoginPage />} />
          
          {/* Main app routes with navigation */}
          <Route path="/*" element={
            <div>
              <Navigation />
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/events" element={<EventsPage />} />
                <Route path="/events/:id" element={<EventDetailsPage />} />
                <Route path="/organizers" element={<div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center"><div className="text-center"><h1 className="text-4xl font-bold text-gray-900 mb-4">Organizers Page</h1><p className="text-gray-600">Coming soon in the full version!</p></div></div>} />
                <Route path="/calendar" element={<div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center"><div className="text-center"><h1 className="text-4xl font-bold text-gray-900 mb-4">Calendar Integration</h1><p className="text-gray-600">Google Calendar sync coming soon!</p></div></div>} />
                <Route path="/create-event" element={<div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center"><div className="text-center"><h1 className="text-4xl font-bold text-gray-900 mb-4">Create Event</h1><p className="text-gray-600">Event creation form coming soon!</p></div></div>} />
                <Route path="/profile" element={<div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center"><div className="text-center"><h1 className="text-4xl font-bold text-gray-900 mb-4">User Profile</h1><p className="text-gray-600">Profile page coming soon!</p></div></div>} />
                <Route path="*" element={
                  <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center">
                    <div className="text-center max-w-md mx-auto px-4">
                      <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
                        <svg className="w-16 h-16 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 8h6m6-20a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h1 className="text-4xl font-bold text-gray-900 mb-4">Oops! We couldn't find any events near you</h1>
                      <p className="text-gray-600 mb-8">The page you're looking for seems to have wandered off like a confused map icon!</p>
                      <div className="space-y-3">
                        <a href="/" className="block w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium py-3 px-6 rounded-lg transition-all duration-300 hover:scale-105">
                          Return to Homepage
                        </a>
                        <a href="/events" className="block w-full border-2 border-purple-300 text-purple-600 hover:bg-purple-50 font-medium py-3 px-6 rounded-lg transition-all duration-300 hover:scale-105">
                          View Nearby Events
                        </a>
                      </div>
                    </div>
                  </div>
                } />
              </Routes>
            </div>
          } />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </div>
  );
}

export default App;