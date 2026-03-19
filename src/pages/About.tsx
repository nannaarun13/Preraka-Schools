import { useSchool } from '@/contexts/SchoolContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const About = () => {

  const { state } = useSchool();

  // ✅ CONNECT ADMIN DATA
  const history = state?.data?.history || "Our school has a proud tradition of excellence.";
  const about = state?.data?.about || "We provide quality education.";
  const mission = state?.data?.mission || "To empower students.";
  const vision = state?.data?.vision || "To be a leading institution.";
  const founders = state?.data?.founders || [];

  return (

    <div className="min-h-screen bg-gray-50">

      <div className="max-w-6xl mx-auto px-4 py-10 space-y-10">

        {/* HEADER */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-blue-700">
            About Our School
          </h1>
          <p className="text-gray-600 mt-2">
            Learn about our history and values
          </p>
        </div>

        {/* HISTORY */}
        <Card className="rounded-xl shadow-md border">
          <CardHeader>
            <CardTitle className="text-2xl text-blue-700">
              Our History
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-gray-700 leading-relaxed">
              {history}
            </p>
          </CardContent>
        </Card>

        {/* ABOUT */}
        <Card className="rounded-xl shadow-md border">
          <CardHeader>
            <CardTitle className="text-2xl text-blue-700">
              About School
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-gray-700 leading-relaxed">
              {about}
            </p>
          </CardContent>
        </Card>

        {/* FOUNDERS */}
        <Card className="rounded-xl shadow-md border">
          <CardHeader>
            <CardTitle className="text-2xl text-blue-700">
              Our Founders
            </CardTitle>
          </CardHeader>

          <CardContent>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

              {founders.length === 0 && (
                <p className="text-gray-500 text-center col-span-full">
                  Founder info coming soon
                </p>
              )}

              {founders.map((f) => (
                <div key={f.id} className="text-center">

                  <img
                    src={f.image}
                    alt={f.name}
                    className="w-28 h-28 object-cover rounded-full mx-auto mb-3 shadow"
                  />

                  <h4 className="font-semibold text-blue-700">
                    {f.name}
                  </h4>

                  <p className="text-sm text-gray-600">
                    {f.details}
                  </p>

                </div>
              ))}

            </div>

          </CardContent>
        </Card>

        {/* MISSION & VISION */}
        <div className="grid md:grid-cols-2 gap-6">

          <Card className="rounded-xl shadow-md border">
            <CardHeader>
              <CardTitle className="text-xl text-blue-700">
                Our Mission
              </CardTitle>
            </CardHeader>

            <CardContent>
              <p className="text-gray-700">
                {mission}
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-xl shadow-md border">
            <CardHeader>
              <CardTitle className="text-xl text-blue-700">
                Our Vision
              </CardTitle>
            </CardHeader>

            <CardContent>
              <p className="text-gray-700">
                {vision}
              </p>
            </CardContent>
          </Card>

        </div>

      </div>

    </div>
  );
};

export default About;
