import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Linkedin, Mail, Twitter, Heart } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-zinc-900 text-gray-300 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About Section */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold text-white mb-4">Asep Jumadi</h3>
            <p className="text-gray-400 mb-4 max-w-md">
              Full-stack developer passionate about building modern web applications 
              with cutting-edge technologies. Specialized in React, TypeScript, and Go.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://github.com/asepjumadi" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-white transition-colors duration-200"
                aria-label="GitHub"
              >
                <Github size={24} />
              </a>
              <a 
                href="https://linkedin.com/in/asepjumadi" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-white transition-colors duration-200"
                aria-label="LinkedIn"
              >
                <Linkedin size={24} />
              </a>
              <a 
                href="https://twitter.com/asepjumadi" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-white transition-colors duration-200"
                aria-label="Twitter"
              >
                <Twitter size={24} />
              </a>
              <a 
                href="mailto:asepjumadi@example.com"
                className="hover:text-white transition-colors duration-200"
                aria-label="Email"
              >
                <Mail size={24} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="hover:text-white transition-colors duration-200">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/projects" className="hover:text-white transition-colors duration-200">
                  Projects
                </Link>
              </li>
              <li>
                <Link to="/projects" className="hover:text-white transition-colors duration-200">
                  Key Notes
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors duration-200">
                  About
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Resources</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="hover:text-white transition-colors duration-200">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors duration-200">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors duration-200">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors duration-200">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-400">
              © {currentYear} Asep Jumadi. All rights reserved.
            </p>
            <p className="text-sm text-gray-400 flex items-center mt-4 md:mt-0">
              Made with <Heart size={16} className="mx-1 text-red-500 fill-current" /> using React & Go
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
