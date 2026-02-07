import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import {
  Send,
  Loader2,
  CheckCircle,
  Clock,
  Phone,
  MessageCircle,
  User,
  Home,
  MapPin,
  FileText,
  HelpCircle,
  XCircle
} from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function EnquiryPage() {
  const [searchParams] = useSearchParams();
  const { isAuthenticated, token, user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [myEnquiries, setMyEnquiries] = useState([]);
  const [loadingEnquiries, setLoadingEnquiries] = useState(false);

  const propertyId = searchParams.get("property_id");
  const propertyTitle = searchParams.get("property_title");

  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    email: "",
    enquiry_type: propertyId ? "property" : "general",
    property_id: propertyId || "",
    property_interest: "",
    budget_min: "",
    budget_max: "",
    preferred_location: "",
    bedrooms: "",
    message: propertyTitle ? `I am interested in: ${propertyTitle}` : "",
    preferred_contact_time: "",
  });

  useEffect(() => {
    if (isAuthenticated) {
      fetchMyEnquiries();
    }
  }, [isAuthenticated]);

  const fetchMyEnquiries = async () => {
    setLoadingEnquiries(true);
    try {
      const response = await axios.get(`${API}/my-enquiries`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyEnquiries(response.data);
    } catch (error) {
      console.error("Error fetching enquiries:", error);
    } finally {
      setLoadingEnquiries(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name?.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (!formData.phone?.trim()) {
      toast.error("Please enter your phone number");
      return;
    }
    if (!formData.message?.trim()) {
      toast.error("Please enter your enquiry message");
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(`${API}/enquiries`, {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        message: buildEnquiryMessage(),
        property_id: formData.property_id || null,
        source: formData.enquiry_type,
        enquiry_type: formData.enquiry_type,
        budget_min: formData.budget_min ? parseInt(formData.budget_min) : null,
        budget_max: formData.budget_max ? parseInt(formData.budget_max) : null,
        preferred_location: formData.preferred_location,
        bedrooms: formData.bedrooms,
        preferred_contact_time: formData.preferred_contact_time,
      }, isAuthenticated ? { headers: { Authorization: `Bearer ${token}` } } : {});

      setSubmitted(true);
      toast.success("Enquiry submitted successfully! TM Real Estate will contact you soon.");
      
      if (isAuthenticated) {
        fetchMyEnquiries();
      }
    } catch (error) {
      toast.error("Failed to submit enquiry. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const buildEnquiryMessage = () => {
    let message = formData.message;
    
    if (formData.property_interest && formData.enquiry_type !== "property") {
      message += `\n\nInterested in: ${formData.property_interest}`;
    }
    if (formData.budget_min || formData.budget_max) {
      message += `\nBudget: ₹${formData.budget_min || "0"} - ₹${formData.budget_max || "Any"}`;
    }
    if (formData.preferred_location) {
      message += `\nPreferred Location: ${formData.preferred_location}`;
    }
    if (formData.bedrooms) {
      message += `\nBedrooms: ${formData.bedrooms} BHK`;
    }
    if (formData.preferred_contact_time) {
      message += `\nPreferred Contact Time: ${formData.preferred_contact_time}`;
    }
    
    return message;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "new":
        return <Badge className="bg-blue-500"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case "accepted":
        return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Accepted</Badge>;
      case "rejected":
        return <Badge className="bg-red-500"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      case "contacted":
        return <Badge className="bg-orange-500"><Phone className="w-3 h-3 mr-1" />Contacted</Badge>;
      case "closed":
        return <Badge className="bg-gray-500"><CheckCircle className="w-3 h-3 mr-1" />Closed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const enquiryTypes = [
    { value: "general", label: "General Enquiry", icon: HelpCircle },
    { value: "buy", label: "Want to Buy Property", icon: Home },
    { value: "rent", label: "Want to Rent Property", icon: Home },
    { value: "property", label: "Enquiry about Specific Property", icon: FileText },
    { value: "sell", label: "Want to Sell/List Property", icon: FileText },
  ];

  const locations = [
    "Airoli Sector 8", "Airoli Sector 9", "Airoli", "Ghansoli", 
    "Vashi", "Kopar Khairane", "Nerul", "Kharghar", "Panvel", "Thane"
  ];

  const contactTimes = [
    "Morning (9 AM - 12 PM)",
    "Afternoon (12 PM - 4 PM)",
    "Evening (4 PM - 7 PM)",
    "Anytime"
  ];

  if (submitted) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-muted py-12 animate-fade-in">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Enquiry Submitted!</h2>
            <p className="text-muted-foreground mb-6">
              Thank you for your interest. Our team at TM Real Estate will review your enquiry and contact you soon.
            </p>
            <div className="flex flex-col gap-3">
              <a href="tel:09820351929">
                <Button className="w-full rounded-full" variant="outline">
                  <Phone className="w-4 h-4 mr-2" />
                  Call Now: 09820351929
                </Button>
              </a>
              <a
                href="https://wa.me/919820351929?text=Hi%20TM%20Real%20Estate%2C%20I%20just%20submitted%20an%20enquiry"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button className="w-full rounded-full bg-green-600 hover:bg-green-700">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  WhatsApp Us
                </Button>
              </a>
              <Button 
                variant="ghost" 
                className="rounded-full"
                onClick={() => {
                  setSubmitted(false);
                  setFormData({
                    name: user?.name || "",
                    phone: user?.phone || "",
                    email: "",
                    enquiry_type: "general",
                    property_id: "",
                    property_interest: "",
                    budget_min: "",
                    budget_max: "",
                    preferred_location: "",
                    bedrooms: "",
                    message: "",
                    preferred_contact_time: "",
                  });
                }}
              >
                Submit Another Enquiry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted py-8 animate-fade-in">
      <div className="container-main max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Send className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Submit an Enquiry</h1>
          <p className="text-muted-foreground">
            Tell us what you're looking for and our team will get back to you
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Enquiry Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6 md:p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Enquiry Type */}
                  <div>
                    <Label className="text-base font-semibold mb-3 block">What can we help you with?</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {enquiryTypes.map((type) => (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, enquiry_type: type.value })}
                          className={`p-4 rounded-xl border text-left transition-all ${
                            formData.enquiry_type === type.value
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          }`}
                          data-testid={`enquiry-type-${type.value}`}
                        >
                          <type.icon className={`w-5 h-5 mb-2 ${
                            formData.enquiry_type === type.value ? "text-primary" : "text-muted-foreground"
                          }`} />
                          <div className="font-medium">{type.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Contact Details */}
                  <div className="space-y-4">
                    <h3 className="font-semibold border-b pb-2">Your Contact Details</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Enter your name"
                          className="mt-1"
                          data-testid="enquiry-name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="Enter your phone"
                          className="mt-1"
                          data-testid="enquiry-phone"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="email">Email (Optional)</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="Enter your email"
                        className="mt-1"
                        data-testid="enquiry-email"
                      />
                    </div>
                  </div>

                  {/* Property Requirements (if buying/renting) */}
                  {(formData.enquiry_type === "buy" || formData.enquiry_type === "rent") && (
                    <div className="space-y-4">
                      <h3 className="font-semibold border-b pb-2">Property Requirements</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label>Preferred Location</Label>
                          <Select
                            value={formData.preferred_location}
                            onValueChange={(val) => setFormData({ ...formData, preferred_location: val })}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select area" />
                            </SelectTrigger>
                            <SelectContent>
                              {locations.map((loc) => (
                                <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Bedrooms (BHK)</Label>
                          <Select
                            value={formData.bedrooms}
                            onValueChange={(val) => setFormData({ ...formData, bedrooms: val })}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select BHK" />
                            </SelectTrigger>
                            <SelectContent>
                              {["1", "2", "3", "4", "5+"].map((n) => (
                                <SelectItem key={n} value={n}>{n} BHK</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="budget_min">
                            {formData.enquiry_type === "buy" ? "Min Budget (₹)" : "Min Rent (₹/month)"}
                          </Label>
                          <Input
                            id="budget_min"
                            type="number"
                            value={formData.budget_min}
                            onChange={(e) => setFormData({ ...formData, budget_min: e.target.value })}
                            placeholder={formData.enquiry_type === "buy" ? "e.g., 5000000" : "e.g., 15000"}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="budget_max">
                            {formData.enquiry_type === "buy" ? "Max Budget (₹)" : "Max Rent (₹/month)"}
                          </Label>
                          <Input
                            id="budget_max"
                            type="number"
                            value={formData.budget_max}
                            onChange={(e) => setFormData({ ...formData, budget_max: e.target.value })}
                            placeholder={formData.enquiry_type === "buy" ? "e.g., 10000000" : "e.g., 30000"}
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Message */}
                  <div>
                    <Label htmlFor="message">Your Message / Requirements *</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Tell us more about what you're looking for..."
                      rows={4}
                      className="mt-1"
                      data-testid="enquiry-message"
                    />
                  </div>

                  {/* Preferred Contact Time */}
                  <div>
                    <Label>Preferred Contact Time</Label>
                    <Select
                      value={formData.preferred_contact_time}
                      onValueChange={(val) => setFormData({ ...formData, preferred_contact_time: val })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent>
                        {contactTimes.map((time) => (
                          <SelectItem key={time} value={time}>{time}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Submit */}
                  <Button
                    type="submit"
                    className="w-full rounded-full h-12 text-lg"
                    disabled={submitting}
                    data-testid="submit-enquiry"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        Submit Enquiry
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Contact Card */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Need Immediate Help?</h3>
                <div className="space-y-3">
                  <a href="tel:09820351929" className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Phone className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">Call Us</div>
                      <div className="text-sm text-muted-foreground">09820351929</div>
                    </div>
                  </a>
                  <a
                    href="https://wa.me/919820351929"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                      <MessageCircle className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                      <div className="font-medium">WhatsApp</div>
                      <div className="text-sm text-muted-foreground">Quick response</div>
                    </div>
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* My Enquiries (if logged in) */}
            {isAuthenticated && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">My Enquiries</h3>
                  {loadingEnquiries ? (
                    <div className="text-center py-4">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                    </div>
                  ) : myEnquiries.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No enquiries yet
                    </p>
                  ) : (
                    <div className="space-y-3 max-h-[300px] overflow-y-auto">
                      {myEnquiries.map((enquiry) => (
                        <div key={enquiry.id} className="p-3 rounded-lg bg-muted">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-muted-foreground">
                              {new Date(enquiry.created_at).toLocaleDateString()}
                            </span>
                            {getStatusBadge(enquiry.status)}
                          </div>
                          <p className="text-sm line-clamp-2">{enquiry.message}</p>
                          {enquiry.admin_response && (
                            <p className="text-xs text-muted-foreground mt-2 italic">
                              Response: {enquiry.admin_response}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Info Card */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-3">What happens next?</h3>
                <ol className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 text-xs font-bold">1</span>
                    <span>Our team reviews your enquiry</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 text-xs font-bold">2</span>
                    <span>We accept and assign an agent to help you</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 text-xs font-bold">3</span>
                    <span>Agent contacts you at your preferred time</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 text-xs font-bold">4</span>
                    <span>We help you find your perfect property!</span>
                  </li>
                </ol>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
