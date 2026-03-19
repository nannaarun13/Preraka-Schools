import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSchool } from "@/contexts/SchoolContext";
import { Button } from "@/components/ui/button";
import { Menu, GraduationCap } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const Navigation = () => {
  const { state } = useSchool();

  // ✅ DEFAULT MENU
  const defaultItems = [
    { name: "Home", path: "/", visible: true },
    { name: "About", path: "/about", visible: true },
    { name: "Admissions", path: "/admissions", visible: true },
    { name: "Gallery", path: "/gallery", visible: true },
    { name: "Notice Board", path: "/notice-board", visible: true },
    { name: "Contact", path: "/contact", visible: true },
    { name: "Login", path: "/login", visible: true },
  ];

  const navigationItems =
    state?.data?.navigationItems?.length > 0
      ? state.data.navigationItems
      : defaultItems;

  const schoolName = state?.data?.schoolName || "Preraka Schools";

  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const visibleItems = navigationItems.filter((item) => item?.visible);

  // ✅ FIX: HashRouter safe path
  const currentPath = location.pathname + location.hash;

  const isActive = (path: string) => {
    if (path === "/") return currentPath === "/" || currentPath.includes("#/");
    return currentPath.includes(path);
  };

  const NavLinks = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      {visibleItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={`px-4 py-2 rounded-md font-medium transition-all duration-200 ${
            isActive(item.path)
              ? "bg-blue-600 text-white shadow-sm"
              : "text-blue-600 hover:bg-blue-100 hover:text-blue-600"
          } ${
            mobile
              ? "block w-full text-lg py-3 border-b border-gray-100 last:border-0"
              : ""
          }`}
          onClick={() => mobile && setIsOpen(false)}
        >
          {item.name}
        </Link>
      ))}
    </>
  );

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">

        {/* DESKTOP */}
        <div className="hidden md:flex items-center justify-center space-x-2 py-4">
          <NavLinks />
        </div>

        {/* MOBILE */}
        <div className="md:hidden flex items-center justify-between py-3">
          <Link
            to="/"
            className="flex items-center space-x-2 text-blue-600 font-bold text-lg truncate max-w-[70%]"
          >
            <GraduationCap className="h-6 w-6 flex-shrink-0" />
            <span className="truncate">{schoolName}</span>
          </Link>

          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-blue-600 hover:bg-blue-100"
              >
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>

            <SheetContent side="right" className="w-[300px]">
              <SheetHeader className="text-left border-b pb-4 mb-4">
                <SheetTitle className="text-blue-600 flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Menu
                </SheetTitle>
              </SheetHeader>

              <div className="flex flex-col space-y-1">
                <NavLinks mobile />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;