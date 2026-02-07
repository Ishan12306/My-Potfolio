import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import axios from "axios";
import {
  Phone,
  MessageCircle,
  MapPin,
  Clock,
  Mail,
  Send,
  Loader2
} from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    message: ""
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone || !formData.message) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(`${API}/enquiries`, {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        message: formData.message,
        source: "contact"
      });
      toast.success("Message sent successfully! We'll get back to you soon.");
      setFormData({ name: "", phone: "", email: "", message: "" });
    } catch (error) {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const contactMethods = [
    {
      icon: Phone,
      title: "Call Us",
      value: "09820351929",
      href: "tel:09820351929",
      color: "bg-blue-500/10 text-blue-500"
    },
    {
      icon: MessageCircle,
      title: "WhatsApp",
      value: "09820351929",
      href: "https://wa.me/919820351929?text=Hi%20TM%20Real%20Estate%2C%20I%20need%20help%20with%20a%20property",
      color: "bg-green-500/10 text-green-500"
    },
    {
      icon: MapPin,
      title: "Visit Us",
      value: "Get Directions",
      href: "https://maps.google.com/?q=Maruti+Enclave,+Sector+8,+Airoli,+Navi+Mumbai",
      color: "bg-red-500/10 text-red-500"
    }
  ];

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container-main text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
          <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto">
            Have a question or need assistance? We're here to help you find 
            your perfect property in Navi Mumbai.
          </p>
        </div>
      </section>

      {/* Quick Contact */}
      <section className="py-12 bg-muted">
        <div className="container-main">
          <div className="grid md:grid-cols-3 gap-6">
            {contactMethods.map((method, idx) => (
              <a 
                key={idx}
                href={method.href}
                target={method.href.startsWith("http") ? "_blank" : undefined}
                rel={method.href.startsWith("http") ? "noopener noreferrer" : undefined}
                data-testid={`contact-${method.title.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <Card className="card-premium hover-lift h-full">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${method.color}`}>
                      <method.icon className="w-7 h-7" />
                    </div>
                    <div>
                      <div className="font-semibold text-lg">{method.title}</div>
                      <div className="text-muted-foreground">{method.value}</div>
                    </div>
                  </CardContent>
                </Card>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="section-spacing">
        <div className="container-main">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-6">Send us a Message</h2>
              <Card className="card-premium">
                <CardContent className="p-6 md:p-8">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Your Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter your full name"
                        className="mt-1"
                        data-testid="contact-form-name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="Enter your phone number"
                        className="mt-1"
                        data-testid="contact-form-phone"
                      />
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
                        data-testid="contact-form-email"
                      />
                    </div>
                    <div>
                      <Label htmlFor="message">Message *</Label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="How can we help you?"
                        rows={5}
                        className="mt-1"
                        data-testid="contact-form-message"
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full rounded-full" 
                      size="lg"
                      disabled={submitting}
                      data-testid="contact-form-submit"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5 mr-2" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Office Info */}
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-6">Office Information</h2>
              <Card className="card-premium mb-6">
                <CardContent className="p-6 md:p-8">
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-lg mb-1">TM Real Estate</h3>
                      <p className="text-muted-foreground">टीम रियल एस्टेट</p>
                    </div>

                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                      <div>
                        <div className="font-medium mb-1">Office Address</div>
                        <div className="text-muted-foreground">
                          Shop No.16, Maruti Enclave, Plot No.9,<br />
                          Opposite Yash Paradise Main Gate,<br />
                          Sector 8, Airoli, Navi Mumbai,<br />
                          Maharashtra 400701
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                      <div>
                        <div className="font-medium mb-1">Business Hours</div>
                        <div className="text-muted-foreground">
                          Monday - Sunday<br />
                          Open from 9:30 AM
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Phone className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                      <div>
                        <div className="font-medium mb-1">Phone</div>
                        <a href="tel:09820351929" className="text-primary hover:underline">
                          09820351929
                        </a>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Map */}
              <Card className="card-premium overflow-hidden">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3768.4!2d72.9979!3d19.1518!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTnCsDA5JzA2LjUiTiA3MsKwNTknNTIuNCJF!5e0!3m2!1sen!2sin!4v1234567890"
                  width="100%"
                  height="300"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  title="TM Real Estate Location"
                />
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 bg-muted">
        <div className="container-main text-center">
          <h2 className="text-2xl font-bold mb-4">Need Immediate Assistance?</h2>
          <p className="text-muted-foreground mb-6">
            Our team is ready to help you find your perfect property
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="tel:09820351929">
              <Button size="lg" className="rounded-full" data-testid="cta-call">
                <Phone className="w-5 h-5 mr-2" />
                Call Now
              </Button>
            </a>
            <a
              href="https://wa.me/919820351929?text=Hi%20TM%20Real%20Estate%2C%20I%20need%20help%20with%20a%20property"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="lg" variant="outline" className="rounded-full bg-green-600 text-white border-green-600 hover:bg-green-700" data-testid="cta-whatsapp">
                <MessageCircle className="w-5 h-5 mr-2" />
                WhatsApp
              </Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
