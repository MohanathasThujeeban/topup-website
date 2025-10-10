import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter, Zap } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-300 relative overflow-hidden">
      {/* Animated Background Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/3 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="particle" style={{ left: '10%', animationDelay: '0s' }}></div>
        <div className="particle" style={{ left: '25%', animationDelay: '2s' }}></div>
        <div className="particle" style={{ left: '40%', animationDelay: '4s' }}></div>
        <div className="particle" style={{ left: '60%', animationDelay: '1s' }}></div>
        <div className="particle" style={{ left: '75%', animationDelay: '3s' }}></div>
        <div className="particle" style={{ left: '90%', animationDelay: '5s' }}></div>
      </div>

      <div className="container-custom px-4 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="group">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 relative overflow-hidden">
                {/* Animated glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-teal-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
                <Zap className="w-6 h-6 text-white relative z-10" fill="currentColor" />
              </div>
              <span className="text-xl font-bold text-white font-display group-hover:text-cyan-400 transition-colors duration-300">EasyTopup.no</span>
            </div>
            <p className="text-sm mb-4 text-gray-400 font-body">
              Instant Lycamobile ePIN and eSIM delivery. Fast, secure, and reliable.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-gradient-to-br hover:from-teal-500 hover:to-cyan-500 rounded-lg flex items-center justify-center hover:scale-110 hover:rotate-6 transition-all duration-300 group shadow-lg">
                <Facebook size={20} className="group-hover:text-white transition-colors" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-gradient-to-br hover:from-teal-500 hover:to-cyan-500 rounded-lg flex items-center justify-center hover:scale-110 hover:rotate-6 transition-all duration-300 group shadow-lg">
                <Instagram size={20} className="group-hover:text-white transition-colors" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-gradient-to-br hover:from-teal-500 hover:to-cyan-500 rounded-lg flex items-center justify-center hover:scale-110 hover:rotate-6 transition-all duration-300 group shadow-lg">
                <Twitter size={20} className="group-hover:text-white transition-colors" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4 font-heading">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/bundles" className="group inline-flex items-center gap-2 hover:text-cyan-400 transition-all duration-300 font-body">
                  <span className="w-0 h-0.5 bg-gradient-to-r from-teal-500 to-cyan-500 group-hover:w-4 transition-all duration-300"></span>
                  Bundles
                </Link>
              </li>
              <li>
                <Link to="/help" className="group inline-flex items-center gap-2 hover:text-cyan-400 transition-all duration-300 font-body">
                  <span className="w-0 h-0.5 bg-gradient-to-r from-teal-500 to-cyan-500 group-hover:w-4 transition-all duration-300"></span>
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/about" className="group inline-flex items-center gap-2 hover:text-cyan-400 transition-all duration-300 font-body">
                  <span className="w-0 h-0.5 bg-gradient-to-r from-teal-500 to-cyan-500 group-hover:w-4 transition-all duration-300"></span>
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="group inline-flex items-center gap-2 hover:text-cyan-400 transition-all duration-300 font-body">
                  <span className="w-0 h-0.5 bg-gradient-to-r from-teal-500 to-cyan-500 group-hover:w-4 transition-all duration-300"></span>
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-semibold mb-4 font-heading">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/terms" className="group inline-flex items-center gap-2 hover:text-cyan-400 transition-all duration-300 font-body">
                  <span className="w-0 h-0.5 bg-gradient-to-r from-teal-500 to-cyan-500 group-hover:w-4 transition-all duration-300"></span>
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="group inline-flex items-center gap-2 hover:text-cyan-400 transition-all duration-300 font-body">
                  <span className="w-0 h-0.5 bg-gradient-to-r from-teal-500 to-cyan-500 group-hover:w-4 transition-all duration-300"></span>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/refund" className="group inline-flex items-center gap-2 hover:text-cyan-400 transition-all duration-300 font-body">
                  <span className="w-0 h-0.5 bg-gradient-to-r from-teal-500 to-cyan-500 group-hover:w-4 transition-all duration-300"></span>
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link to="/cookies" className="group inline-flex items-center gap-2 hover:text-cyan-400 transition-all duration-300 font-body">
                  <span className="w-0 h-0.5 bg-gradient-to-r from-teal-500 to-cyan-500 group-hover:w-4 transition-all duration-300"></span>
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-semibold mb-4 font-heading">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 group hover:translate-x-2 transition-transform duration-300">
                <div className="w-8 h-8 bg-gray-800 group-hover:bg-gradient-to-br group-hover:from-teal-500 group-hover:to-cyan-500 rounded-lg flex items-center justify-center transition-all duration-300">
                  <Mail size={16} className="group-hover:text-white transition-colors" />
                </div>
                <span className="text-sm font-body group-hover:text-cyan-400 transition-colors">support@easytopup.no</span>
              </li>
              <li className="flex items-center gap-3 group hover:translate-x-2 transition-transform duration-300">
                <div className="w-8 h-8 bg-gray-800 group-hover:bg-gradient-to-br group-hover:from-teal-500 group-hover:to-cyan-500 rounded-lg flex items-center justify-center transition-all duration-300">
                  <Phone size={16} className="group-hover:text-white transition-colors" />
                </div>
                <span className="text-sm font-body group-hover:text-cyan-400 transition-colors">+47 12 134656</span>
              </li>
              <li className="flex items-start gap-3 group hover:translate-x-2 transition-transform duration-300">
                <div className="w-8 h-8 bg-gray-800 group-hover:bg-gradient-to-br group-hover:from-teal-500 group-hover:to-cyan-500 rounded-lg flex items-center justify-center transition-all duration-300 mt-0.5">
                  <MapPin size={16} className="group-hover:text-white transition-colors" />
                </div>
                <span className="text-sm font-body group-hover:text-cyan-400 transition-colors">
                  Oslo, Norway
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800/50 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 backdrop-blur-sm">
          <p className="text-sm text-center md:text-left text-gray-400 font-body">
            © {new Date().getFullYear()} EasyTopup.no. All rights reserved. | Org. Nr: XXXXXXXXX
          </p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 px-4 py-2 bg-gray-800/50 rounded-lg backdrop-blur-sm border border-gray-700/50 hover:border-cyan-500/50 transition-all duration-300">
              <span className="text-xs text-gray-400 font-accent">Powered by</span>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gradient-to-br from-teal-500 to-cyan-500 rounded flex items-center justify-center">
                  <span className="text-white text-xs font-bold">T</span>
                </div>
                <span className="text-sm font-semibold text-white font-accent">TopUp Pro</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
