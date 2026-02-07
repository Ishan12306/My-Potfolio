import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import PropertyCard from "@/components/PropertyCard";
import { toast } from "sonner";
import {
  MapPin,
  BedDouble,
  Bath,
  Maximize,
  Car,
  Compass,
  Building,
  Calendar,
  Sofa,
  Phone,
  MessageCircle,
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
  ArrowLeft
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function PropertyDetailsPage() {
  const { id } = useParams();
  const { isAuthenticated, token } = useAuth();
  const [property, setProperty] = useState(null);
  const [similarProperties, setSimilarProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  // Contact form state
  const [contactForm, setContactForm] = useState({
    name: "",
    phone: "",
    message: ""
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProperty();
  }, [id]);

  const fetchProperty = async () => {
    setLoading(true);
    try {
      const [propertyRes, similarRes] = await Promise.all([
        axios.get(`${API}/properties/${id}`),
        axios.get(`${API}/properties/${id}/similar`)
      ]);
      setProperty(propertyRes.data);
      setSimilarProperties(similarRes.data);
      setContactForm(prev => ({
        ...prev,
        message: `Hi, I am interested in this property: ${propertyRes.data.title}`
      }));
    } catch (error) {
      console.error("Error fetching property:", error);
      toast.error("Property not found");
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price, listingType) => {
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(2)} Cr`;
    } else if (price >= 100000) {
      return `₹${(price / 100000).toFixed(2)} L`;
    } else {
      return `₹${price.toLocaleString("en-IN")}`;
    }
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.phone) {
      toast.error("Please fill in your name and phone number");
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(`${API}/enquiries`, {
        property_id: property.id,
        name: contactForm.name,
        phone: contactForm.phone,
        message: contactForm.message,
        source: "property"
      });
      toast.success("Enquiry submitted! TM Real Estate will contact you soon.");
      setContactForm({ name: "", phone: "", message: "" });
    } catch (error) {
      toast.error("Failed to submit enquiry");
    } finally {
      setSubmitting(false);
    }
  };

  const handleWhatsApp = () => {
    const message = `Hi TM Real Estate, I am interested in this property:\n\n${property.title}\nPrice: ${formatPrice(property.price, property.listing_type)}\nLocation: ${property.sector}, ${property.city}\n\nPlease share more details.`;
    window.open(`https://wa.me/919820351929?text=${encodeURIComponent(message)}`, "_blank");
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: property.title,
          text: `Check out this property: ${property.title}`,
          url
        });
      } catch (err) {
        console.error("Share failed:", err);
      }
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    }
  };

  const handleFavorite = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to save favorites");
      return;
    }

    try {
      if (isFavorite) {
        await axios.delete(`${API}/favorites/${property.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setIsFavorite(false);
        toast.success("Removed from favorites");
      } else {
        await axios.post(`${API}/favorites/${property.id}`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setIsFavorite(true);
        toast.success("Added to favorites");
      }
    } catch (error) {
      toast.error("Failed to update favorites");
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === property.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? property.images.length - 1 : prev - 1
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container-main py-8">
          <div className="aspect-[16/9] lg:aspect-[21/9] rounded-2xl shimmer mb-8" />
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <div className="h-10 w-3/4 shimmer rounded" />
              <div className="h-6 w-1/2 shimmer rounded" />
              <div className="h-40 shimmer rounded-xl" />
            </div>
            <div className="h-80 shimmer rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Property not found</h2>
          <Link to="/buy">
            <Button className="rounded-full">Browse Properties</Button>
          </Link>
        </div>
      </div>
    );
  }

  const images = property.images?.length > 0 
    ? property.images 
    : ["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200"];

  const specs = [
    { icon: BedDouble, label: "Bedrooms", value: property.bedrooms ? `${property.bedrooms} BHK` : null },
    { icon: Bath, label: "Bathrooms", value: property.bathrooms },
    { icon: Maximize, label: "Area", value: property.area_sqft ? `${property.area_sqft} sqft` : null },
    { icon: Building, label: "Floor", value: property.floor },
    { icon: Car, label: "Parking", value: property.parking },
    { icon: Compass, label: "Facing", value: property.facing },
    { icon: Sofa, label: "Furnishing", value: property.furnishing?.replace("-", " ") },
    { icon: Calendar, label: "Age", value: property.property_age },
  ].filter(spec => spec.value);

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      {/* Back Button */}
      <div className="container-main pt-4">
        <Link to="/buy" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to listings
        </Link>
      </div>

      {/* Image Gallery */}
      <div className="container-main py-4">
        <div className="relative aspect-[16/9] lg:aspect-[21/9] rounded-2xl overflow-hidden bg-muted">
          <img
            src={images[currentImageIndex]}
            alt={property.title}
            className="w-full h-full object-cover cursor-pointer"
            onClick={() => setLightboxOpen(true)}
          />

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
                data-testid="prev-image"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
                data-testid="next-image"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Image Counter */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/50 text-white text-sm rounded-full">
            {currentImageIndex + 1} / {images.length}
          </div>

          {/* Badges */}
          <div className="absolute top-4 left-4 flex gap-2">
            {property.is_featured && (
              <Badge className="bg-orange-500 text-white border-0">Featured</Badge>
            )}
            <Badge variant="secondary" className="capitalize">
              {property.listing_type === "pg" ? "PG" : `For ${property.listing_type}`}
            </Badge>
          </div>

          {/* Action Buttons */}
          <div className="absolute top-4 right-4 flex gap-2">
            <button
              onClick={handleFavorite}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                isFavorite ? "bg-red-500 text-white" : "bg-white/90 text-slate-600 hover:bg-white"
              }`}
              data-testid="favorite-btn"
            >
              <Heart className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`} />
            </button>
            <button
              onClick={handleShare}
              className="w-10 h-10 bg-white/90 text-slate-600 rounded-full flex items-center justify-center hover:bg-white transition-colors"
              data-testid="share-btn"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Thumbnail Strip */}
        {images.length > 1 && (
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentImageIndex(idx)}
                className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                  idx === currentImageIndex ? "border-primary" : "border-transparent"
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="container-main pb-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Title & Price */}
            <div>
              <div className="flex items-baseline gap-3 mb-2">
                <span className="price-display text-3xl md:text-4xl text-primary">
                  {formatPrice(property.price, property.listing_type)}
                </span>
                {property.listing_type === "rent" && (
                  <span className="text-muted-foreground">/month</span>
                )}
                {property.deposit && (
                  <span className="text-sm text-muted-foreground">
                    + ₹{property.deposit.toLocaleString("en-IN")} deposit
                  </span>
                )}
              </div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">{property.title}</h1>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-5 h-5" />
                <span>{property.location}, {property.sector}, {property.city}</span>
              </div>
            </div>

            {/* Key Specs */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Property Details</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {specs.map((spec, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                        <spec.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">{spec.label}</div>
                        <div className="font-medium capitalize">{spec.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Description</h3>
                <p className="text-muted-foreground whitespace-pre-line">
                  {property.description}
                </p>
              </CardContent>
            </Card>

            {/* Amenities */}
            {property.amenities?.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Amenities</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {property.amenities.map((amenity, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <Check className="w-5 h-5 text-green-500" />
                        <span>{amenity}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Availability */}
            {property.availability && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">Availability</h3>
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    {property.availability}
                  </Badge>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - Contact Card */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Contact TM Real Estate</h3>
                
                {/* Quick Actions */}
                <div className="flex gap-2 mb-6">
                  <a href="tel:09820351929" className="flex-1">
                    <Button className="w-full rounded-full" data-testid="call-btn">
                      <Phone className="w-4 h-4 mr-2" />
                      Call
                    </Button>
                  </a>
                  <Button 
                    onClick={handleWhatsApp} 
                    className="flex-1 rounded-full bg-green-600 hover:bg-green-700"
                    data-testid="whatsapp-btn"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    WhatsApp
                  </Button>
                </div>

                {/* Contact Form */}
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Your Name</Label>
                    <Input
                      id="name"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      placeholder="Enter your name"
                      className="mt-1"
                      data-testid="contact-name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={contactForm.phone}
                      onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                      placeholder="Enter your phone"
                      className="mt-1"
                      data-testid="contact-phone"
                    />
                  </div>
                  <div>
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      placeholder="I am interested in this property..."
                      className="mt-1"
                      rows={3}
                      data-testid="contact-message"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full rounded-full" 
                    disabled={submitting}
                    data-testid="submit-enquiry"
                  >
                    {submitting ? "Sending..." : "Send Enquiry"}
                  </Button>
                </form>

                {/* Business Info */}
                <div className="mt-6 pt-6 border-t text-sm text-muted-foreground">
                  <p className="font-medium text-foreground mb-1">TM Real Estate</p>
                  <p>Sector 8, Airoli, Navi Mumbai</p>
                  <p>Open from 9:30 AM</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Similar Properties */}
        {similarProperties.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Similar Properties</h2>
            <div className="property-grid">
              {similarProperties.map((prop) => (
                <PropertyCard key={prop.id} property={prop} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-5xl p-0 bg-black">
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 z-50 w-10 h-10 bg-white/10 text-white rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="relative aspect-[16/9]">
            <img
              src={images[currentImageIndex]}
              alt={property.title}
              className="w-full h-full object-contain"
            />
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 text-white rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 text-white rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
