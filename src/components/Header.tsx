import { useSchool } from '@/contexts/SchoolContext';

const Header = () => {
  const { state } = useSchool();
  const { schoolLogo, schoolNameImage, schoolName } = state.data;

  return (
    <header className="bg-gradient-to-r from-school-blue via-school-blue to-school-orange text-white py-6 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center space-x-4">

          {/* ✅ FIXED LOGO */}
          {schoolLogo ? (
            <img 
              src={schoolLogo} 
              alt="School Logo" 
              className="h-16 w-16 object-contain bg-white rounded-full p-1 shadow-md"
            />
          ) : (
            <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center text-blue-600 font-bold text-xl shadow-md">
              PS
            </div>
          )}

          {/* School Name */}
          <div className="text-center">
            {schoolNameImage ? (
              <img 
                src={schoolNameImage} 
                alt={schoolName || "School Name"} 
                className="h-12 md:h-16 max-w-md object-contain mx-auto"
              />
            ) : (
              <h1 className="text-3xl md:text-4xl font-bold tracking-wide">
                {schoolName || "Preraka Schools"}
              </h1>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};

export default Header;