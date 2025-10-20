import { AnimatePresence, motion } from 'framer-motion';
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import useWelcomeScreen from '../hooks/useWelcomeScreen';
import LoginModal from './LoginModal';
import ProfileDropdown from './ProfileDropdown';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { getItemCount } = useCart();
  const { isAuthenticated, user } = useAuth();
  const { showWelcomeAgain } = useWelcomeScreen();
  const location = useLocation();
  const itemCount = getItemCount();

  console.log('🛒 Navbar - itemCount:', itemCount);
  console.log('🛒 Navbar - getItemCount function:', getItemCount);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Menu', path: '/menu' },
    { name: 'Customize', path: '/customize' },
    { name: 'My Orders', path: '/orders' },
  ];

  // Add admin links if user is admin
  const adminLinks = [
    // Removed: Dashboard, Orders, History, Inventory, Customers
  ];

  return (
    <>
      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 flex-shrink-0">
              <div className="w-10 h-10 bg-gradient-to-br from-sweetbite-500 to-sweetbite-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <span className="text-2xl font-bold text-gray-800">SweetBite</span>
            </Link>

            {/* Medium Screen Navigation */}
            <div className="hidden md:flex lg:hidden items-center space-x-6 absolute left-1/2 transform -translate-x-1/2">
              {navLinks.slice(0, 3).map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`text-gray-700 hover:text-sweetbite-600 font-medium transition-colors whitespace-nowrap px-2 py-1 text-sm ${location.pathname === link.path ? 'text-sweetbite-600' : ''
                    }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Large Screen Navigation */}
            <div className="hidden lg:flex items-center space-x-8 absolute left-1/2 transform -translate-x-1/2">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`text-gray-700 hover:text-sweetbite-600 font-medium transition-colors whitespace-nowrap px-3 py-2 ${location.pathname === link.path ? 'text-sweetbite-600' : ''
                    }`}
                >
                  {link.name}
                </Link>
              ))}

              {/* Admin Navigation */}
              {user && (user.user_type === 'admin' || user.user_type === 'inventory_manager') && (
                <div className="flex items-center space-x-4 border-l border-gray-200 pl-4 ml-4">
                  {adminLinks.map((link) => (
                    <Link
                      key={link.name}
                      to={link.path}
                      className={`text-gray-700 hover:text-sweetbite-600 font-medium transition-colors text-sm whitespace-nowrap px-2 py-1 ${location.pathname === link.path ? 'text-sweetbite-600' : ''
                        }`}
                    >
                      {link.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Right side - Auth and Cart */}
            <div className="flex items-center space-x-3 flex-shrink-0">
              {/* Authentication */}
              {isAuthenticated ? (
                <>
                  <button
                    onClick={showWelcomeAgain}
                    className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-3 py-2 rounded-lg font-medium hover:from-pink-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl text-sm"
                  >
                    🎉 Welcome
                  </button>
                  <ProfileDropdown />
                </>
              ) : (
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="bg-sweetbite-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-sweetbite-700 transition-colors text-sm"
                >
                  Sign In
                </button>
              )}

              {/* Cart Icon */}
              <Link to="/cart" className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="relative"
                >
                  <svg
                    className="w-6 h-6 text-gray-700 hover:text-sweetbite-600 transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l-1 7a2 2 0 01-2 2H8a2 2 0 01-2-2L5 9z"
                    />
                  </svg>
                  {itemCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 bg-sweetbite-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold"
                    >
                      {itemCount > 99 ? '99+' : itemCount}
                    </motion.span>
                  )}
                </motion.div>
              </Link>

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2 rounded-lg text-gray-700 hover:text-sweetbite-600 hover:bg-gray-100 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {isMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="lg:hidden border-t border-gray-200"
              >
                <div className="py-4 space-y-2">
                  {navLinks.map((link) => (
                    <Link
                      key={link.name}
                      to={link.path}
                      onClick={() => setIsMenuOpen(false)}
                      className={`block px-4 py-2 text-gray-700 hover:text-sweetbite-600 hover:bg-gray-50 transition-colors ${location.pathname === link.path ? 'text-sweetbite-600 bg-sweetbite-50' : ''
                        }`}
                    >
                      {link.name}
                    </Link>
                  ))}

                  {/* Admin Links in Mobile Menu */}
                  {user && (user.user_type === 'admin' || user.user_type === 'inventory_manager') && (
                    <>
                      <div className="border-t border-gray-200 my-2"></div>
                      <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Admin
                      </div>
                      {adminLinks.map((link) => (
                        <Link
                          key={link.name}
                          to={link.path}
                          onClick={() => setIsMenuOpen(false)}
                          className={`block px-4 py-2 text-gray-700 hover:text-sweetbite-600 hover:bg-gray-50 transition-colors text-sm ${location.pathname === link.path ? 'text-sweetbite-600 bg-sweetbite-50' : ''
                            }`}
                        >
                          {link.name}
                        </Link>
                      ))}
                    </>
                  )}

                  {!isAuthenticated && (
                    <button
                      onClick={() => {
                        setShowLoginModal(true);
                        setIsMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sweetbite-600 hover:bg-sweetbite-50 transition-colors"
                    >
                      Sign In
                    </button>
                  )}
                  {isAuthenticated && (
                    <button
                      onClick={() => {
                        showWelcomeAgain();
                        setIsMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-purple-600 hover:bg-purple-50 transition-colors"
                    >
                      🎉 Welcome Screen
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* Login Modal */}
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </>
  );
};

export default Navbar;
