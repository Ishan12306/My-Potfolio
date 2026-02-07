import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import PropertyCard from "@/components/PropertyCard";
import { Button } from "@/components/ui/button";
import { Heart, Loader2 } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function FavoritesPage() {
  const { isAuthenticated, token, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, authLoading, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchFavorites();
    }
  }, [isAuthenticated]);

  const fetchFavorites = async () => {
    try {
      const response = await axios.get(`${API}/favorites`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFavorites(response.data);
    } catch (error) {
      console.error("Error fetching favorites:", error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      {/* Header */}
      <div className="bg-muted border-b">
        <div className="container-main py-6">
          <div className="flex items-center gap-3">
            <Heart className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">My Favorites</h1>
              <p className="text-muted-foreground">
                Properties you've saved for later
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container-main py-8">
        {loading ? (
          <div className="property-grid">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-[4/3] rounded-2xl shimmer" />
            ))}
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">No favorites yet</h2>
            <p className="text-muted-foreground mb-6">
              Start exploring properties and save the ones you like!
            </p>
            <Button onClick={() => navigate("/buy")} className="rounded-full">
              Browse Properties
            </Button>
          </div>
        ) : (
          <>
            <p className="text-muted-foreground mb-6">
              {favorites.length} properties saved
            </p>
            <div className="property-grid">
              {favorites.map((property) => (
                <PropertyCard 
                  key={property.id} 
                  property={property} 
                  onFavoriteToggle={fetchFavorites}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
