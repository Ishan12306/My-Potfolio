import { Link } from "react-router-dom";
import { Phone, MessageCircle, MapPin, Clock, Building2, Home } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { href: "/buy", label: "Buy Property" },
    { href: "/rentals", label: "Rent Property" },
    { href: "/request-listing", label: "Request Listing" },
    { href: "/about", label: "About Us" },
    { href: "/contact", label: "Contact" },
  ];

  const propertyTypes = [
    "Flats & Apartments",
    "Independent Houses",
    "Plots & Land",
    "Commercial Shops",
    "Office Spaces",
    "PG Accommodation",
  ];

  const areas = [
    "Airoli Sector 8",
    "Airoli Sector 9",
    "Ghansoli",
    "Vashi",
    "Kopar Khairane",
    "Nerul",
  ];

  return (
    <footer className="bg-slate-900 dark:bg-slate-950 text-slate-300">
      {/* Main Footer */}
      <div className="container-main py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                <Home className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <div className="font-bold text-lg text-white">TM Real Estate</div>
                <div className="text-sm text-slate-400">टीम रियल एस्टेट</div>
              </div>
            </div>
            <p className="text-sm text-slate-400 mb-4 leading-relaxed">
              Your trusted partner for buying, selling, and renting properties in Airoli and Navi Mumbai. 
              Verified listings with transparent dealings.
            </p>
            <div className="flex items-start gap-2 text-sm">
              <MapPin className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
              <span>
                Shop No.16, Maruti Enclave, Plot No.9,<br />
                Opposite Yash Paradise Main Gate,<br />
                Sector 8, Airoli, Navi Mumbai,<br />
                Maharashtra 400701
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link 
                    to={link.href} 
                    className="text-sm hover:text-primary transition-colors"
                    data-testid={`footer-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Property Types */}
          <div>
            <h4 className="font-semibold text-white mb-4">Property Types</h4>
            <ul className="space-y-2">
              {propertyTypes.map((type) => (
                <li key={type} className="text-sm text-slate-400">
                  {type}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold text-white mb-4">Contact Us</h4>
            <div className="space-y-4">
              <a 
                href="tel:09820351929" 
                className="flex items-center gap-3 text-sm hover:text-primary transition-colors group"
                data-testid="footer-phone"
              >
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="font-medium text-white">Call Now</div>
                  <div>09820351929</div>
                </div>
              </a>

              <a 
                href="https://wa.me/919820351929?text=Hi%20TM%20Real%20Estate%2C%20I%20am%20interested%20in%20your%20properties" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm hover:text-green-400 transition-colors group"
                data-testid="footer-whatsapp"
              >
                <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
                  <MessageCircle className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <div className="font-medium text-white">WhatsApp</div>
                  <div>09820351929</div>
                </div>
              </a>

              <div className="flex items-center gap-3 text-sm">
                <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <div className="font-medium text-white">Business Hours</div>
                  <div>Open from 9:30 AM</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800">
        <div className="container-main py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500">
              © {currentYear} TM Real Estate. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-slate-500">
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
