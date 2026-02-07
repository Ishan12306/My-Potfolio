import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  FileText,
  User,
  Home,
  MapPin,
  IndianRupee,
  Phone,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  MessageCircle,
  Copy,
  Camera
} from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function RequestListingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    // Step 1: Who are you?
    requester_type: "",
    // Step 2: What do you want?
    intent: "",
    // Step 3: Property Basics
    property_type: "",
    city: "Navi Mumbai",
    area: "",
    sector: "",
    society: "",
    // Step 4: Extra Details
    bedrooms: "",
    bathrooms: "",
    area_sqft: "",
    furnishing: "",
    availability: "",
    // Step 5: Pricing
    expected_price: "",
    rent_amount: "",
    deposit_amount: "",
    is_negotiable: false,
    // Step 6: Contact
    contact_name: "",
    contact_phone: "",
    additional_notes: "",
    images: []
  });

  const totalSteps = 6;

  const updateFormData = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const calculateQualityScore = () => {
    let score = 0;
    
    // Basic info (40 points)
    if (formData.property_type) score += 10;
    if (formData.city) score += 5;
    if (formData.area) score += 10;
    if (formData.sector) score += 5;
    if (formData.contact_name) score += 5;
    if (formData.contact_phone) score += 5;
    
    // Details (30 points)
    if (formData.bedrooms) score += 5;
    if (formData.bathrooms) score += 5;
    if (formData.area_sqft) score += 10;
    if (formData.furnishing) score += 5;
    if (formData.availability) score += 5;
    
    // Pricing (15 points)
    if (formData.expected_price || formData.rent_amount) score += 10;
    if (formData.deposit_amount) score += 5;
    
    // Photos (15 points)
    if (formData.images.length >= 5) score += 15;
    else if (formData.images.length >= 3) score += 10;
    else if (formData.images.length >= 1) score += 5;
    
    return Math.min(score, 100);
  };

  const getQualityLabel = (score) => {
    if (score >= 90) return { label: "Excellent", color: "text-green-600" };
    if (score >= 70) return { label: "Great", color: "text-blue-600" };
    if (score >= 40) return { label: "Good", color: "text-yellow-600" };
    return { label: "Low", color: "text-red-500" };
  };

  const getMissingFields = () => {
    const missing = [];
    if (!formData.property_type) missing.push("Property Type");
    if (!formData.area) missing.push("Area/Location");
    if (!formData.contact_name) missing.push("Your Name");
    if (!formData.contact_phone) missing.push("Phone Number");
    if (!formData.expected_price && !formData.rent_amount) missing.push("Expected Price/Rent");
    if (formData.images.length < 5) missing.push("5+ Photos");
    return missing;
  };

  const qualityScore = calculateQualityScore();
  const qualityInfo = getQualityLabel(qualityScore);
  const missingFields = getMissingFields();

  const nextStep = () => {
    // Validation
    if (step === 1 && !formData.requester_type) {
      toast.error("Please select who you are");
      return;
    }
    if (step === 2 && !formData.intent) {
      toast.error("Please select what you want to do");
      return;
    }
    if (step === 3 && (!formData.property_type || !formData.area)) {
      toast.error("Please fill in property type and area");
      return;
    }
    if (step === 6 && (!formData.contact_name || !formData.contact_phone)) {
      toast.error("Please fill in your contact details");
      return;
    }
    
    if (step < totalSteps) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const generateWhatsAppMessage = () => {
    const lines = [
      "🏠 *New Listing Request for TM Real Estate*",
      "",
      `*Requester:* ${formData.requester_type}`,
      `*Intent:* ${formData.intent}`,
      "",
      "*Property Details:*",
      `• Type: ${formData.property_type}`,
      `• Location: ${formData.area}, ${formData.sector}, ${formData.city}`,
      formData.society ? `• Society: ${formData.society}` : "",
      formData.bedrooms ? `• BHK: ${formData.bedrooms}` : "",
      formData.bathrooms ? `• Bathrooms: ${formData.bathrooms}` : "",
      formData.area_sqft ? `• Area: ${formData.area_sqft} sqft` : "",
      formData.furnishing ? `• Furnishing: ${formData.furnishing}` : "",
      formData.availability ? `• Availability: ${formData.availability}` : "",
      "",
      "*Pricing:*",
      formData.expected_price ? `• Expected Price: ₹${formData.expected_price}` : "",
      formData.rent_amount ? `• Rent: ₹${formData.rent_amount}/month` : "",
      formData.deposit_amount ? `• Deposit: ₹${formData.deposit_amount}` : "",
      formData.is_negotiable ? "• Negotiable: Yes" : "",
      "",
      "*Contact:*",
      `• Name: ${formData.contact_name}`,
      `• Phone: ${formData.contact_phone}`,
      formData.additional_notes ? `\n*Notes:* ${formData.additional_notes}` : "",
      "",
      `*Quality Score:* ${qualityScore}% (${qualityInfo.label})`
    ].filter(line => line !== "").join("\n");
    
    return lines;
  };

  const handleWhatsAppSubmit = () => {
    const message = generateWhatsAppMessage();
    window.open(`https://wa.me/919820351929?text=${encodeURIComponent(message)}`, "_blank");
  };

  const handleCopyMessage = () => {
    const message = generateWhatsAppMessage();
    navigator.clipboard.writeText(message);
    toast.success("Message copied to clipboard!");
  };

  const handleCall = () => {
    window.open("tel:09820351929", "_self");
  };

  const requesterTypes = [
    { value: "owner", label: "Property Owner", desc: "I own this property" },
    { value: "agent", label: "Agent/Broker", desc: "I represent the owner" },
    { value: "builder", label: "Builder/Developer", desc: "I built this property" },
    { value: "buyer-tenant", label: "Buyer/Tenant", desc: "I want to buy/rent a property" },
  ];

  const intentTypes = [
    { value: "sell", label: "Sell", desc: "I want to sell this property" },
    { value: "rent-lease", label: "Rent / Lease", desc: "I want to rent out this property" },
    { value: "pg", label: "PG / Paying Guest", desc: "I offer PG accommodation" },
  ];

  const propertyTypes = [
    "Flat/Apartment",
    "House/Villa",
    "Plot/Land",
    "Shop",
    "Office Space",
    "PG/Hostel",
    "Warehouse",
    "Other"
  ];

  const areas = [
    "Airoli",
    "Ghansoli", 
    "Vashi",
    "Kopar Khairane",
    "Turbhe",
    "Sanpada",
    "Nerul",
    "Seawoods",
    "Kharghar",
    "Panvel",
    "Thane",
    "Other"
  ];

  return (
    <div className="min-h-screen bg-muted py-8 animate-fade-in">
      <div className="container-main max-w-3xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Request a Listing</h1>
          <p className="text-muted-foreground">
            Submit your property details and TM Real Estate will add it to the listings
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-sm mb-2">
            <span>Step {step} of {totalSteps}</span>
            <span className={qualityInfo.color}>{qualityScore}% Complete</span>
          </div>
          <Progress value={(step / totalSteps) * 100} className="h-2" />
        </div>

        {/* Quality Meter */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Request Quality</div>
                <div className={`text-lg font-semibold ${qualityInfo.color}`}>
                  {qualityInfo.label} ({qualityScore}%)
                </div>
              </div>
              <div className="text-right">
                {missingFields.length > 0 && (
                  <div className="text-xs text-muted-foreground">
                    Missing: {missingFields.slice(0, 2).join(", ")}
                    {missingFields.length > 2 && ` +${missingFields.length - 2} more`}
                  </div>
                )}
                {qualityScore < 70 && (
                  <div className="text-xs text-primary mt-1">
                    Tip: Add 5+ photos for faster approval
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form Steps */}
        <Card>
          <CardContent className="p-6 md:p-8">
            {/* Step 1: Who are you? */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <User className="w-6 h-6 text-primary" />
                  <h2 className="text-xl font-semibold">Who are you?</h2>
                </div>
                <RadioGroup
                  value={formData.requester_type}
                  onValueChange={(val) => updateFormData("requester_type", val)}
                  className="space-y-3"
                >
                  {requesterTypes.map((type) => (
                    <Label
                      key={type.value}
                      htmlFor={type.value}
                      className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-colors ${
                        formData.requester_type === type.value
                          ? "border-primary bg-primary/5"
                          : "hover:border-primary/50"
                      }`}
                    >
                      <RadioGroupItem value={type.value} id={type.value} />
                      <div>
                        <div className="font-medium">{type.label}</div>
                        <div className="text-sm text-muted-foreground">{type.desc}</div>
                      </div>
                    </Label>
                  ))}
                </RadioGroup>
              </div>
            )}

            {/* Step 2: What do you want? */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <Home className="w-6 h-6 text-primary" />
                  <h2 className="text-xl font-semibold">What do you want to do?</h2>
                </div>
                <RadioGroup
                  value={formData.intent}
                  onValueChange={(val) => updateFormData("intent", val)}
                  className="space-y-3"
                >
                  {intentTypes.map((type) => (
                    <Label
                      key={type.value}
                      htmlFor={`intent-${type.value}`}
                      className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-colors ${
                        formData.intent === type.value
                          ? "border-primary bg-primary/5"
                          : "hover:border-primary/50"
                      }`}
                    >
                      <RadioGroupItem value={type.value} id={`intent-${type.value}`} />
                      <div>
                        <div className="font-medium">{type.label}</div>
                        <div className="text-sm text-muted-foreground">{type.desc}</div>
                      </div>
                    </Label>
                  ))}
                </RadioGroup>
              </div>
            )}

            {/* Step 3: Property Basics */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <MapPin className="w-6 h-6 text-primary" />
                  <h2 className="text-xl font-semibold">Property Basics</h2>
                </div>
                
                <div>
                  <Label>Property Type *</Label>
                  <Select
                    value={formData.property_type}
                    onValueChange={(val) => updateFormData("property_type", val)}
                  >
                    <SelectTrigger className="mt-1" data-testid="property-type">
                      <SelectValue placeholder="Select property type" />
                    </SelectTrigger>
                    <SelectContent>
                      {propertyTypes.map((type) => (
                        <SelectItem key={type} value={type.toLowerCase().replace(/\//g, "-")}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>City</Label>
                    <Select
                      value={formData.city}
                      onValueChange={(val) => updateFormData("city", val)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select city" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Navi Mumbai">Navi Mumbai</SelectItem>
                        <SelectItem value="Mumbai">Mumbai</SelectItem>
                        <SelectItem value="Thane">Thane</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Area *</Label>
                    <Select
                      value={formData.area}
                      onValueChange={(val) => updateFormData("area", val)}
                    >
                      <SelectTrigger className="mt-1" data-testid="area">
                        <SelectValue placeholder="Select area" />
                      </SelectTrigger>
                      <SelectContent>
                        {areas.map((area) => (
                          <SelectItem key={area} value={area}>
                            {area}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Sector (optional)</Label>
                    <Input
                      value={formData.sector}
                      onChange={(e) => updateFormData("sector", e.target.value)}
                      placeholder="e.g., Sector 8"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Society/Building (optional)</Label>
                    <Input
                      value={formData.society}
                      onChange={(e) => updateFormData("society", e.target.value)}
                      placeholder="e.g., Maruti Enclave"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Extra Details */}
            {step === 4 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <Home className="w-6 h-6 text-primary" />
                  <h2 className="text-xl font-semibold">Extra Details</h2>
                </div>
                
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label>Bedrooms (BHK)</Label>
                    <Select
                      value={formData.bedrooms}
                      onValueChange={(val) => updateFormData("bedrooms", val)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {["1", "2", "3", "4", "5+"].map((n) => (
                          <SelectItem key={n} value={n}>{n} BHK</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Bathrooms</Label>
                    <Select
                      value={formData.bathrooms}
                      onValueChange={(val) => updateFormData("bathrooms", val)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {["1", "2", "3", "4", "5+"].map((n) => (
                          <SelectItem key={n} value={n}>{n}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Area (sqft)</Label>
                    <Input
                      type="number"
                      value={formData.area_sqft}
                      onChange={(e) => updateFormData("area_sqft", e.target.value)}
                      placeholder="e.g., 950"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Furnishing</Label>
                    <Select
                      value={formData.furnishing}
                      onValueChange={(val) => updateFormData("furnishing", val)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unfurnished">Unfurnished</SelectItem>
                        <SelectItem value="semi-furnished">Semi-Furnished</SelectItem>
                        <SelectItem value="fully-furnished">Fully-Furnished</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Availability</Label>
                    <Select
                      value={formData.availability}
                      onValueChange={(val) => updateFormData("availability", val)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Immediate">Immediate</SelectItem>
                        <SelectItem value="Within 15 days">Within 15 days</SelectItem>
                        <SelectItem value="Within 30 days">Within 30 days</SelectItem>
                        <SelectItem value="Within 3 months">Within 3 months</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Pricing */}
            {step === 5 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <IndianRupee className="w-6 h-6 text-primary" />
                  <h2 className="text-xl font-semibold">Pricing</h2>
                </div>

                {formData.intent === "sell" ? (
                  <div>
                    <Label>Expected Price (₹)</Label>
                    <Input
                      type="number"
                      value={formData.expected_price}
                      onChange={(e) => updateFormData("expected_price", e.target.value)}
                      placeholder="e.g., 8500000"
                      className="mt-1"
                      data-testid="expected-price"
                    />
                    <p className="text-sm text-muted-foreground mt-1">Enter full amount without commas</p>
                  </div>
                ) : (
                  <>
                    <div>
                      <Label>Monthly Rent (₹)</Label>
                      <Input
                        type="number"
                        value={formData.rent_amount}
                        onChange={(e) => updateFormData("rent_amount", e.target.value)}
                        placeholder="e.g., 25000"
                        className="mt-1"
                        data-testid="rent-amount"
                      />
                    </div>
                    <div>
                      <Label>Security Deposit (₹)</Label>
                      <Input
                        type="number"
                        value={formData.deposit_amount}
                        onChange={(e) => updateFormData("deposit_amount", e.target.value)}
                        placeholder="e.g., 100000"
                        className="mt-1"
                      />
                    </div>
                  </>
                )}

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="negotiable"
                    checked={formData.is_negotiable}
                    onChange={(e) => updateFormData("is_negotiable", e.target.checked)}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="negotiable" className="cursor-pointer">Price is negotiable</Label>
                </div>
              </div>
            )}

            {/* Step 6: Contact */}
            {step === 6 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <Phone className="w-6 h-6 text-primary" />
                  <h2 className="text-xl font-semibold">Contact Details</h2>
                </div>

                <div>
                  <Label>Your Name *</Label>
                  <Input
                    value={formData.contact_name}
                    onChange={(e) => updateFormData("contact_name", e.target.value)}
                    placeholder="Enter your full name"
                    className="mt-1"
                    data-testid="contact-name"
                  />
                </div>

                <div>
                  <Label>Phone Number *</Label>
                  <Input
                    value={formData.contact_phone}
                    onChange={(e) => updateFormData("contact_phone", e.target.value)}
                    placeholder="e.g., 9820351929"
                    className="mt-1"
                    data-testid="contact-phone"
                  />
                </div>

                <div>
                  <Label>Additional Notes (optional)</Label>
                  <Textarea
                    value={formData.additional_notes}
                    onChange={(e) => updateFormData("additional_notes", e.target.value)}
                    placeholder="Any additional information about the property..."
                    className="mt-1"
                    rows={3}
                  />
                </div>

                {/* Review Summary */}
                <Card className="bg-muted">
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-primary" />
                      Request Summary
                    </h3>
                    <div className="grid md:grid-cols-2 gap-2 text-sm">
                      <div><span className="text-muted-foreground">Type:</span> {formData.property_type}</div>
                      <div><span className="text-muted-foreground">Location:</span> {formData.area}, {formData.city}</div>
                      <div><span className="text-muted-foreground">Intent:</span> {formData.intent}</div>
                      {formData.bedrooms && <div><span className="text-muted-foreground">BHK:</span> {formData.bedrooms}</div>}
                      {formData.expected_price && <div><span className="text-muted-foreground">Price:</span> ₹{formData.expected_price}</div>}
                      {formData.rent_amount && <div><span className="text-muted-foreground">Rent:</span> ₹{formData.rent_amount}/month</div>}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={step === 1}
                className="rounded-full"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>

              {step < totalSteps ? (
                <Button onClick={nextStep} className="rounded-full" data-testid="next-step">
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleCopyMessage}
                    className="rounded-full"
                    data-testid="copy-message"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                  <Button
                    onClick={handleCall}
                    variant="outline"
                    className="rounded-full"
                    data-testid="call-btn"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Call
                  </Button>
                  <Button
                    onClick={handleWhatsAppSubmit}
                    className="rounded-full bg-green-600 hover:bg-green-700"
                    data-testid="whatsapp-submit"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Send on WhatsApp
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Help Text */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Your request will be reviewed by TM Real Estate and added to listings if approved.
          <br />
          For immediate assistance, call <a href="tel:09820351929" className="text-primary font-medium">09820351929</a>
        </p>
      </div>
    </div>
  );
}
