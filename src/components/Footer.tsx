import { useSchool } from '@/contexts/SchoolContext';
import { MapPin, Phone, Mail, MapPinIcon } from 'lucide-react';

const Footer = () => {
  const { state } = useSchool();

  const contactInfo = state?.data?.contactInfo || {};

  const defaultAddress = 'Raghavendra Nagar, Turkayamjal, Hyderabad, Telangana - 501510';
  const defaultEmail = 'info@prerakaschools.com';

  const contactNumbers = contactInfo?.contactNumbers || [];
  const address = contactInfo?.address || defaultAddress;
  const email = contactInfo?.email || defaultEmail;

  const handleMapClick = () => {
    const query = encodeURIComponent(address);
    const mapUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;
    window.open(mapUrl, '_blank');
  };

  return (
    <footer className="bg-gradient-to-r from-blue-600 to-orange-500 text-white py-12">

      <div className="container mx-auto px-4">

        <div className="grid md:grid-cols-4 gap-8">

          {/* Address */}
          <div>
            <div className="flex items-start space-x-3 mb-4">
              <MapPin className="h-6 w-6 mt-1 text-orange-300" />
              <div>
                <h4 className="font-semibold text-lg mb-2">Address</h4>
                <p className="text-sm opacity-90">
                  {address}
                </p>
              </div>
            </div>
          </div>

          {/* Phone */}
          <div>
            <div className="flex items-start space-x-3 mb-4">
              <Phone className="h-6 w-6 mt-1 text-orange-300" />
              <div>
                <h4 className="font-semibold text-lg mb-2">Phone</h4>
                {contactNumbers.length > 0 ? (
                  contactNumbers.map((contact) => (
                    <p key={contact.id} className="text-sm opacity-90">
                      {contact.number}
                    </p>
                  ))
                ) : (
                  <p className="text-sm opacity-90">+91 98765 43210</p>
                )}
              </div>
            </div>
          </div>

          {/* Email */}
          <div>
            <div className="flex items-start space-x-3 mb-4">
              <Mail className="h-6 w-6 mt-1 text-orange-300" />
              <div>
                <h4 className="font-semibold text-lg mb-2">Email</h4>
                <a href={`mailto:${email}`} className="text-sm opacity-90 hover:text-orange-200">
                  {email}
                </a>
              </div>
            </div>
          </div>

          {/* Map */}
          <div>
            <div className="flex items-start space-x-3 mb-4">
              <MapPinIcon className="h-6 w-6 mt-1 text-orange-300" />
              <div>
                <h4 className="font-semibold text-lg mb-2">Location</h4>
                <button
                  onClick={handleMapClick}
                  className="bg-white text-blue-600 px-6 py-2 rounded font-bold text-sm hover:bg-orange-100 transition"
                >
                  View Map
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Copyright */}
        <div className="text-center mt-12 pt-6 border-t border-white/20">
          <p className="text-sm opacity-80">
            © {new Date().getFullYear()} Preraka Schools. All rights reserved.
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;