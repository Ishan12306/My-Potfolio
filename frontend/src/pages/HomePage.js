import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import PropertyCard from "@/components/PropertyCard";
import SearchBar from "@/components/SearchBar";
import { 
  Building2, 
  Key, 
  FileText, 
  Shield, 
  CheckCircle, 
  Users, 
  Phone,
  MessageCircle,
  ArrowRight,
  Star,
  MapPin
} from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function HomePage() {
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [rentProperties, setRentProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Seed data first
      await axios.post(`${API}/seed`).catch(() => {});
      
      const [featuredRes, rentRes] = await Promise.all([
        axios.get(`${API}/properties/featured?limit=4`),
        axios.get(`${API}/properties?listing_type=rent&limit=4`)
      ]);
      setFeaturedProperties(featuredRes.data);
      setRentProperties(rentRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const localities = [
    { name: "Sector 8", count: 45 },
    { name: "Sector 9", count: 32 },
    { name: "Airoli", count: 120 },
    { name: "Ghansoli", count: 78 },
    { name: "Vashi", count: 95 },
    { name: "Thane", count: 150 },
  ];

  const trustPoints = [
    { icon: Shield, title: "Verified Listings", desc: "Every property is verified by our team" },
    { icon: CheckCircle, title: "Transparent Dealing", desc: "No hidden charges or commissions" },
    { icon: Users, title: "Expert Guidance", desc: "Professional support throughout the process" },
  ];

  const testimonials = [
    {
      name: "Rajesh Sharma",
      location: "Airoli Sector 8",
      text: "Found my dream 2BHK through TM Real Estate. The team was extremely helpful and professional. Highly recommended!",
      rating: 5
    },
    {
      name: "Priya Patel",
      location: "Vashi",
      text: "Excellent service! They helped us find the perfect rental property within our budget. Very responsive and trustworthy.",
      rating: 5
    },
    {
      name: "Amit Desai",
      location: "Ghansoli",
      text: "Best real estate agency in Navi Mumbai. Their knowledge of the local market is unmatched. Got a great deal on my flat.",
      rating: 5
    }
  ];

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section 
        className="relative min-h-[600px] flex items-center justify-center py-20"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.5), rgba(0,0,0,0.7)), url('https://images.unsplash.com/photo-1638454795595-0a0abf68614d?crop=entropy&cs=srgb&fm=jpg&q=85')`,
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      >
        <div className="container-main relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4 tracking-tight">
            Search properties in Airoli,<br />Navi Mumbai
          </h1>
          <p className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Buy or rent verified listings with TM Real Estate (टीम रियल एस्टेट)
          </p>
          
          <SearchBar variant="hero" />

          {/* Quick Locality Chips */}
          <div className="flex flex-wrap justify-center gap-2 mt-8">
            {["Sector 8", "Sector 9", "Airoli", "Ghansoli", "Vashi", "Thane", "Navi Mumbai"].map((loc) => (
              <Link 
                key={loc} 
                to={`/buy?location=${encodeURIComponent(loc)}`}
                className="px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-full text-sm hover:bg-white/20 transition-colors"
              >
                {loc}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Action Cards */}
      <section className="section-spacing bg-muted">
        <div className="container-main">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link to="/buy" data-testid="action-buy">
              <Card className="card-premium hover-lift h-full group">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <Building2 className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Buy a Home</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Find your perfect property from our verified listings
                  </p>
                  <span className="text-primary font-medium inline-flex items-center gap-1">
                    Browse Properties <ArrowRight className="w-4 h-4" />
                  </span>
                </CardContent>
              </Card>
            </Link>

            <Link to="/rentals" data-testid="action-rent">
              <Card className="card-premium hover-lift h-full group">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <Key className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Rent a Home</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Explore rental options that fit your budget
                  </p>
                  <span className="text-primary font-medium inline-flex items-center gap-1">
                    View Rentals <ArrowRight className="w-4 h-4" />
                  </span>
                </CardContent>
              </Card>
            </Link>

            <Link to="/request-listing" data-testid="action-request">
              <Card className="card-premium hover-lift h-full group">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-orange-500/10 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-orange-500/20 transition-colors">
                    <FileText className="w-8 h-8 text-orange-500" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Request Listing</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Want to sell or rent? Request TM Real Estate to add your property
                  </p>
                  <span className="text-orange-500 font-medium inline-flex items-center gap-1">
                    Request Now <ArrowRight className="w-4 h-4" />
                  </span>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="section-spacing">
        <div className="container-main">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">Featured Properties</h2>
              <p className="text-muted-foreground">Handpicked properties by TM Real Estate</p>
            </div>
            <Link to="/buy?is_featured=true">
              <Button variant="outline" className="rounded-full hidden md:flex">
                View All <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="property-grid">
              {[1,2,3,4].map((i) => (
                <div key={i} className="aspect-[4/3] rounded-2xl shimmer" />
              ))}
            </div>
          ) : (
            <div className="property-grid">
              {featuredProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* New Rentals */}
      <section className="section-spacing bg-muted">
        <div className="container-main">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">New Rentals Near You</h2>
              <p className="text-muted-foreground">Latest rental properties in Airoli & Navi Mumbai</p>
            </div>
            <Link to="/rentals">
              <Button variant="outline" className="rounded-full hidden md:flex">
                View All <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="property-grid">
              {[1,2,3,4].map((i) => (
                <div key={i} className="aspect-[4/3] rounded-2xl shimmer" />
              ))}
            </div>
          ) : (
            <div className="property-grid">
              {rentProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Top Localities */}
      <section className="section-spacing">
        <div className="container-main">
          <h2 className="text-3xl md:text-4xl font-bold mb-2 text-center">Top Localities</h2>
          <p className="text-muted-foreground text-center mb-8">
            Explore properties in popular areas
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {localities.map((loc) => (
              <Link 
                key={loc.name} 
                to={`/buy?location=${encodeURIComponent(loc.name)}`}
                className="p-4 bg-card rounded-xl border border-border hover:border-primary hover:shadow-lg transition-all text-center group"
              >
                <MapPin className="w-6 h-6 text-primary mx-auto mb-2" />
                <div className="font-semibold group-hover:text-primary transition-colors">{loc.name}</div>
                <div className="text-sm text-muted-foreground">{loc.count}+ properties</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why TM Real Estate */}
      <section className="section-spacing bg-primary text-primary-foreground">
        <div className="container-main">
          <h2 className="text-3xl md:text-4xl font-bold mb-2 text-center">
            Why TM Real Estate?
          </h2>
          <p className="text-primary-foreground/80 text-center mb-12">
            Your trusted partner for property dealings in Navi Mumbai
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {trustPoints.map((point, idx) => (
              <div key={idx} className="text-center">
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <point.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{point.title}</h3>
                <p className="text-primary-foreground/80">{point.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section-spacing">
        <div className="container-main">
          <h2 className="text-3xl md:text-4xl font-bold mb-2 text-center">
            What Our Clients Say
          </h2>
          <p className="text-muted-foreground text-center mb-12">
            Hear from our satisfied customers
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, idx) => (
              <Card key={idx} className="card-premium">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 italic">"{t.text}"</p>
                  <div className="font-semibold">{t.name}</div>
                  <div className="text-sm text-muted-foreground">{t.location}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-muted">
        <div className="container-main">
          <Card className="card-premium overflow-hidden">
            <div className="grid md:grid-cols-2">
              <div className="p-8 md:p-12">
                <h2 className="text-3xl font-bold mb-4">
                  Ready to find your dream property?
                </h2>
                <p className="text-muted-foreground mb-6">
                  Contact TM Real Estate today and let us help you find the perfect home in Airoli & Navi Mumbai.
                </p>
                <div className="flex flex-wrap gap-3">
                  <a href="tel:09820351929">
                    <Button className="rounded-full" size="lg" data-testid="cta-call">
                      <Phone className="w-5 h-5 mr-2" />
                      Call Now
                    </Button>
                  </a>
                  <a 
                    href="https://wa.me/919820351929?text=Hi%20TM%20Real%20Estate%2C%20I%20am%20looking%20for%20a%20property"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" className="rounded-full bg-green-600 text-white border-green-600 hover:bg-green-700" size="lg" data-testid="cta-whatsapp">
                      <MessageCircle className="w-5 h-5 mr-2" />
                      WhatsApp
                    </Button>
                  </a>
                </div>
              </div>
              <div 
                className="hidden md:block bg-cover bg-center min-h-[300px]"
                style={{
                  backgroundImage: `url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800')`
                }}
              />
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
