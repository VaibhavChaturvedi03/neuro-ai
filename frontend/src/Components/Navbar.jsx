import { useState, useEffect, useRef } from "react";
import { Bars3Icon, XMarkIcon, SunIcon, MoonIcon } from "@heroicons/react/24/outline";
import { useAuth0 } from "@auth0/auth0-react";
import Modal from "./LogoutModal";
import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { ThemeAnimationType, useModeAnimation } from 'react-theme-switch-animation';

const navigation = [
  { name: "Home", href: "/", current: false },
  { name: "About Us", href: "/about", current: false },
  { name: "Articles", href: "/articles", current: false },
];

function Example() {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const { loginWithRedirect } = useAuth0();
  const { darkMode, toggleTheme } = useTheme();
  const { ref, toggleSwitchTheme, isDarkMode } = useModeAnimation({
    animationType: ThemeAnimationType.CIRCLE,
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const togglemodal = () => {
    isModalOpen ? closeModal() : openModal();
  };

  const handleThemeToggle = () => {
    toggleSwitchTheme();
    // Sync our context with the animation hook
    setTimeout(() => {
      toggleTheme(isDarkMode);
    }, 0);
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setSidebarOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [sidebarRef]);

  return (
    <div>
      <div className="flex justify-between items-center p-4 mb-12 dark:bg-gray-900 transition-colors">
        <div className="font-spacegroteskbold lg:text-3xl md:text-2xl text-2xl ml-4 dark:text-white">
          <Link to="/" className="cursor-pointer">
            EduSync
          </Link>
        </div>
        <div className="hidden lg:flex space-x-8 mr-24 items-center">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="mt-2 font-spacegroteskregular cursor-pointer dark:text-gray-300 hover:dark:text-white"
              to={item.href}
            >
              {item.name}
            </Link>
          ))}
          {isAuthenticated ? (
            <div className="flex items-center justify-center gap-8">
              <Link
                to="/learning"
                className="mt-2 font-spacegroteskregular cursor-pointer dark:text-gray-300 hover:dark:text-white"
              >
                Learning
              </Link>
              <Link
                to="http://localhost:8501"
                className="mt-2 font-spacegroteskregular cursor-pointer dark:text-gray-300 hover:dark:text-white"
              >
                Conversation
              </Link>
            </div>
          ) : (
            <></>
          )}
          {/* Dark Mode Toggle Button */}
          <button
            ref={ref}
            onClick={handleThemeToggle}
            className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? (
              <SunIcon className="h-5 w-5 text-yellow-500" />
            ) : (
              <MoonIcon className="h-5 w-5 text-gray-700" />
            )}
          </button>
          {isAuthenticated ? (
            <div
              onClick={togglemodal}
              className="absolute right-10 cursor-pointer"
            >
              <img
                className="h-10 w-10 rounded-full"
                src={user.picture}
                alt={user.name}
              />
              {/* <h2>{user.name}</h2>
              <p>{user.email}</p> */}
              <Modal
                className="relative"
                isOpen={isModalOpen}
                onClose={closeModal}
              />
            </div>
          ) : (
            <button
              onClick={() => loginWithRedirect()}
              className="border font-spacegroteskregular rounded-md p-2 border-black hover:bg-black hover:text-white dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-black"
            >
              Sign Up
            </button>
          )}
        </div>
        <div className="lg:hidden mr-4 flex gap-2 items-center">
          {/* Dark Mode Toggle Button for Mobile */}
          <button
            ref={ref}
            onClick={handleThemeToggle}
            className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? (
              <SunIcon className="h-5 w-5 text-yellow-500" />
            ) : (
              <MoonIcon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            )}
          </button>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-md border dark:border-gray-600 dark:text-white"
          >
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
      </div>
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 bg-gray-800 bg-opacity-75 z-10">
          <div
            ref={sidebarRef}
            className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-900 shadow-lg z-20 p-4"
          >
            <div className="flex justify-between items-center mb-4">
              <div className="font-spacegroteskbold text-2xl dark:text-white">Awaaz</div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-md border dark:border-gray-600 dark:text-white"
              >
                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
            <div className="space-y-4">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="block px-4 py-2 text-lg font-spacegroteskregular text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
                >
                  {item.name}
                </a>
              ))}
              <button className="border rounded-md p-2 font-spacegroteskregular border-black hover:bg-black hover:text-white">
                Sign Up
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Example;
