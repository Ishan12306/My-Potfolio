import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Building2,
  Users,
  Shield,
  Award,
  Target,
  Heart,
  Phone,
  MessageCircle,
  MapPin,
  Clock,
  CheckCircle,
  ArrowRight
} from "lucide-react";

export default function AboutPage() {
  const values = [
    {
      icon: Shield,
      title: "Trust & Transparency",
      desc: "Every property listing is verified by our team. No hidden charges, no surprises."
    },
    {
      icon: Users,
      title: "Customer First",
      desc: "We prioritize your needs and work tirelessly to find the perfect property for you."
    },
    {
      icon: Target,
      title: "Local Expertise",
      desc: "Deep knowledge of Airoli and Navi Mumbai real estate market since 2010."
    },
    {
      icon: Award,
      title: "Quality Service",
      desc: "Professional guidance throughout your property journey, from search to closing."
    }
  ];

  const stats = [
    { value: "500+", label: "Properties Sold" },
    { value: "1000+", label: "Happy Customers" },
    { value: "14+", label: "Years Experience" },
    { value: "50+", label: "Localities Covered" }
  ];

  const services = [
    "Residential Property Sales",
    "Rental Property Services",
    "Commercial Real Estate",
    "Property Documentation",
    "Home Loan Assistance",
    "Legal Consultation"
  ];

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground py-16 md:py-24">
        <div className="container-main">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              About TM Real Estate
            </h1>
            <p className="text-xl text-primary-foreground/80 mb-2">
              टीम रियल एस्टेट
            </p>
            <p className="text-lg text-primary-foreground/80 leading-relaxed">
              Your trusted partner for buying, selling, and renting properties in 
              Airoli and Navi Mumbai since 2010. We believe in building relationships, 
              not just transactions.
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-muted">
        <div className="container-main">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-1">
                  {stat.value}
                </div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="section-spacing">
        <div className="container-main">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Our Story</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  TM Real Estate was founded with a simple mission: to make property 
                  transactions transparent, hassle-free, and customer-centric. What 
                  started as a small office in Airoli Sector 8 has grown into one of 
                  the most trusted real estate agencies in Navi Mumbai.
                </p>
                <p>
                  Over the years, we have helped thousands of families find their 
                  dream homes and investors discover lucrative opportunities. Our 
                  deep understanding of the local market, combined with our commitment 
                  to ethical practices, sets us apart.
                </p>
                <p>
                  Today, we continue to uphold the same values that defined us from 
                  day one – integrity, transparency, and unwavering dedication to 
                  our clients' success.
                </p>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800"
                alt="TM Real Estate Office"
                className="rounded-2xl shadow-xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-primary text-primary-foreground p-6 rounded-xl shadow-lg">
                <div className="text-3xl font-bold">Since 2010</div>
                <div>Serving Navi Mumbai</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="section-spacing bg-muted">
        <div className="container-main">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Values</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              These core values guide everything we do at TM Real Estate
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, idx) => (
              <Card key={idx} className="card-premium hover-lift">
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <value.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{value.title}</h3>
                  <p className="text-muted-foreground text-sm">{value.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="section-spacing">
        <div className="container-main">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Our Services</h2>
              <p className="text-muted-foreground mb-6">
                We offer comprehensive real estate services to meet all your property needs.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {services.map((service, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span>{service}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <img
                src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800"
                alt="Our Services"
                className="rounded-2xl shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container-main text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Find Your Dream Property?
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Contact TM Real Estate today and let our experts guide you through 
            your property journey.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="tel:09820351929">
              <Button size="lg" variant="secondary" className="rounded-full">
                <Phone className="w-5 h-5 mr-2" />
                Call Now: 09820351929
              </Button>
            </a>
            <a
              href="https://wa.me/919820351929?text=Hi%20TM%20Real%20Estate%2C%20I%20want%20to%20know%20more%20about%20your%20services"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="lg" className="rounded-full bg-green-600 hover:bg-green-700 text-white">
                <MessageCircle className="w-5 h-5 mr-2" />
                WhatsApp Us
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Office Location */}
      <section className="section-spacing">
        <div className="container-main">
          <Card className="card-premium overflow-hidden">
            <div className="grid md:grid-cols-2">
              <div className="p-8 md:p-12">
                <h2 className="text-2xl font-bold mb-6">Visit Our Office</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-primary mt-1" />
                    <div>
                      <div className="font-medium">Address</div>
                      <div className="text-muted-foreground">
                        Shop No.16, Maruti Enclave, Plot No.9,<br />
                        Opposite Yash Paradise Main Gate,<br />
                        Sector 8, Airoli, Navi Mumbai,<br />
                        Maharashtra 400701
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-primary mt-1" />
                    <div>
                      <div className="font-medium">Business Hours</div>
                      <div className="text-muted-foreground">Open from 9:30 AM</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-primary mt-1" />
                    <div>
                      <div className="font-medium">Phone</div>
                      <a href="tel:09820351929" className="text-primary hover:underline">
                        09820351929
                      </a>
                    </div>
                  </div>
                </div>
                <div className="mt-6">
                  <a
                    href="https://maps.google.com/?q=Maruti+Enclave,+Sector+8,+Airoli,+Navi+Mumbai"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button className="rounded-full">
                      <MapPin className="w-4 h-4 mr-2" />
                      Get Directions
                    </Button>
                  </a>
                </div>
              </div>
              <div className="bg-muted min-h-[300px] flex items-center justify-center">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3768.4!2d72.9979!3d19.1518!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTnCsDA5JzA2LjUiTiA3MsKwNTknNTIuNCJF!5e0!3m2!1sen!2sin!4v1234567890"
                  width="100%"
                  height="100%"
                  style={{ border: 0, minHeight: "300px" }}
                  allowFullScreen=""
                  loading="lazy"
                  title="TM Real Estate Location"
                />
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
