import { useSchool } from '@/contexts/SchoolContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const { state } = useSchool();
  const navigate = useNavigate();

  const {
    welcomeMessage,
    schoolLogo,
    galleryImages,

    // ✅ NEW
    schoolName,
    schoolNameImage,
    welcomeImage
  } = state.data;

  const latestUpdates = state?.data?.latestUpdates || [];

  return (
    <div className="w-full">

      {/* ✅ HERO UPGRADED */}
      <section className="relative h-[500px] flex items-center justify-center overflow-hidden">

        {/* Background */}
        <div
          className="absolute inset-0 scale-105"
          style={{
            background: welcomeImage
              ? `url(${welcomeImage}) center/cover no-repeat`
              : "linear-gradient(to right, #2563eb, #f97316)",
          }}
        />

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/60"></div>

        {/* Content */}
        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">

          {/* ✅ LOGO IMPROVED */}
          <div className="bg-white rounded-full p-3 mb-5 mx-auto w-28 h-28 flex items-center justify-center shadow-2xl border-4 border-white/30 backdrop-blur">
            {schoolLogo ? (
              <img
                src={schoolLogo}
                alt="School Logo"
                className="w-20 h-20 object-contain"
              />
            ) : (
              <span className="text-blue-600 text-3xl font-bold">PS</span>
            )}
          </div>

          {/* ✅ SCHOOL NAME IMAGE (NEW) */}
          {schoolNameImage ? (
            <img
              src={schoolNameImage}
              alt="School Name"
              className="mx-auto mb-3 h-10 md:h-12"
            />
          ) : (
            <h1 className="text-3xl md:text-4xl font-bold">
              {schoolName}
            </h1>
          )}

          {/* ✅ WELCOME TEXT */}
          <h2 className="text-xl md:text-2xl font-semibold mt-2">
            {welcomeMessage || "Welcome to Preraka Schools"}
          </h2>

        </div>
      </section>

      {/* CONTENT */}
      <div className="container mx-auto px-4 py-16 space-y-16">

        {/* Latest Updates */}
        <section>
          <h3 className="text-4xl font-bold text-gray-800 mb-8 text-center">
            Latest Updates
          </h3>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
            {latestUpdates.map((update) => (
              <Card key={update.id} className="hover:shadow-xl transition bg-white border">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-3">
                    <Badge className="bg-orange-500 text-white px-3 py-1">
                      New
                    </Badge>
                    <div>
                      <p className="text-gray-700 font-medium">
                        {update.content}
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        {update.date}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Gallery */}
        <section>
          <h3 className="text-4xl font-bold text-gray-800 mb-8 text-center">
            Our Gallery
          </h3>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
            {galleryImages?.slice(0, 6)?.map((image) => (
              <Card key={image.id} className="overflow-hidden hover:shadow-xl transition bg-white border">
                <div className="h-48 overflow-hidden">
                  <img
                    src={image.url}
                    alt={image.caption || "Gallery"}
                    className="w-full h-full object-cover hover:scale-110 transition"
                  />
                </div>
                <CardContent className="p-4">
                  <p className="text-sm text-gray-600">
                    {image.caption || "School Activity"}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center bg-gradient-to-r from-blue-600 to-orange-500 text-white py-16 px-8 rounded-xl shadow-xl">
          <h3 className="text-3xl font-bold mb-4">
            Join Our School Community
          </h3>

          <p className="text-xl mb-8 opacity-90">
            Discover excellence in education with our dedicated faculty and modern facilities
          </p>

          <div className="space-x-4">
            <button
              onClick={() => navigate('/admissions')}
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100"
            >
              Apply Now
            </button>

            <button
              onClick={() => navigate('/about')}
              className="border-2 border-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600"
            >
              Learn More
            </button>
          </div>
        </section>

      </div>
    </div>
  );
};

export default Index;
