import React from 'react';
import { useTranslation } from 'react-i18next';
import ArticleSection from '../components/ArticleSection';
import { Article, NewsletterSubscription } from '../types/article';

const Home: React.FC = () => {
  const { t } = useTranslation();

  // Article handlers
  const handleArticleClick = (article: Article) => {
    console.log('Article clicked:', article);
    // TODO: Navigate to article detail page
    // window.location.href = `/articles/${article.slug}`;
  };

  const handleNewsletterSubscribe = async (data: NewsletterSubscription) => {
    console.log('Newsletter subscription:', data);
    // TODO: Implement actual API call
    // await subscribeToNewsletter(data.email);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="container mx-auto px-4 py-16 max-w-7xl">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          {/* Text Content */}
          <div className="flex-1 text-center lg:text-left">
            <div className="space-y-4">
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold leading-tight">
                <span className="text-white block">FULL STACK</span>
                <span className="text-green-500 block">DEVELOPER</span>
              </h1>
              <p className="text-gray-300 text-lg md:text-xl max-w-2xl mt-6">
                {t('description')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mt-8">
                <button className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105">
                  {t('view_project')}
                </button>
                <button className="border-2 border-green-500 text-green-500 hover:bg-green-500 hover:text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300">
                  {t('download_cv')}
                </button>
              </div>
            </div>
          </div>
          
          {/* Image Content */}
          <div className="flex-1 flex justify-center lg:justify-end">
            <div className="relative">
              <div className="absolute inset-0 bg-green-500/20 rounded-full blur-3xl"></div>
              <img 
                src="sabas.png" 
                alt="Full Stack Developer" 
                className="relative z-10 w-80 h-80 md:w-96 md:h-96 lg:w-[500px] lg:h-[500px] object-cover rounded-full shadow-2xl border-4 border-green-500/50"
              />
            </div>
          </div>
        </div>

        {/* Additional Section */}
        <div className="mt-20 text-center">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <div className="bg-gray-800/50 p-6 rounded-lg backdrop-blur-sm border border-gray-700">
              <h3 className="text-green-500 font-bold text-xl mb-2">Mobile</h3>
              <p className="text-gray-300">React Native, Kotlin Multi Platform, SwiftUI</p>
            </div>
            <div className="bg-gray-800/50 p-6 rounded-lg backdrop-blur-sm border border-gray-700">
              <h3 className="text-green-500 font-bold text-xl mb-2">Frontend</h3>
              <p className="text-gray-300">Nextjs, React, TypeScript, Tailwind CSS</p>
            </div>
            <div className="bg-gray-800/50 p-6 rounded-lg backdrop-blur-sm border border-gray-700">
              <h3 className="text-green-500 font-bold text-xl mb-2">Backend</h3>
              <p className="text-gray-300">Laravel, Go, Node.js, PostgreSQL, MySQL</p>
            </div>
            <div className="bg-gray-800/50 p-6 rounded-lg backdrop-blur-sm border border-gray-700">
              <h3 className="text-green-500 font-bold text-xl mb-2">DevOps</h3>
              <p className="text-gray-300">Docker, AWS, CI/CD</p>
            </div>
          </div>
        </div>
        
        {/* About Me Section */}
        <section className="mt-32 relative">
          {/* Background decoration */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-green-500/10 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            {/* Section Header */}
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
                About <span className="text-green-500">Me</span>
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-green-500 to-green-400 mx-auto rounded-full"></div>
            </div>

            {/* Content Container */}
            <div className="flex flex-col lg:flex-row items-center gap-16">
              {/* Text Content */}
              <div className="flex-1 space-y-8">
                {/* Introduction */}
                <div className="bg-gray-800/40 backdrop-blur-lg p-8 rounded-2xl border border-gray-700/50 shadow-2xl transform transition-all duration-700 hover:scale-105 hover:bg-gray-800/60">
                  <div className="flex items-start gap-4">
                    <div className="w-2 h-16 bg-gradient-to-b from-green-500 to-green-400 rounded-full flex-shrink-0 mt-2"></div>
                    <div>
                      <h3 className="text-xl font-semibold text-green-400 mb-3">Hi, I'm Asep Jumadi</h3>
                      <p className="text-gray-300 leading-relaxed text-lg">
                        A passionate <span className="text-green-400 font-medium">Full Stack Developer</span> dedicated to building 
                        seamless digital experiences across platforms. With expertise in React Native, Next.js, Golang, and Laravel, 
                        I help turn complex ideas into user-friendly applications that drive real value.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Philosophy */}
                <div className="bg-gray-800/40 backdrop-blur-lg p-8 rounded-2xl border border-gray-700/50 shadow-2xl transform transition-all duration-700 hover:scale-105 hover:bg-gray-800/60">
                  <div className="flex items-start gap-4">
                    <div className="w-2 h-20 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full flex-shrink-0 mt-2"></div>
                    <div>
                      <h3 className="text-xl font-semibold text-blue-400 mb-3">My Philosophy</h3>
                      <p className="text-gray-300 leading-relaxed text-lg">
                        Inspired by timeless principles from <span className="text-blue-400 font-medium">"How to Win Friends and Influence People"</span>, 
                        I believe that genuine connection and collaboration fuel success. Combining this with insights from 
                        <span className="text-purple-400 font-medium"> Atomic Habits</span>, I continuously refine my skills through 
                        consistent, purposeful improvement.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Call to Action */}
                <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 backdrop-blur-lg p-8 rounded-2xl border border-green-500/30 shadow-2xl transform transition-all duration-700 hover:scale-105">
                  <div className="flex items-start gap-4">
                    <div className="w-2 h-16 bg-gradient-to-b from-green-500 to-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-3">Let's Build Something Amazing</h3>
                      <p className="text-gray-300 leading-relaxed text-lg mb-6">
                        If you're looking for a dedicated developer who values meaningful relationships and relentless progress, 
                        let's connect and create something impactful together.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-4">
                        <button className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-green-500/25">
                          Let's Connect
                        </button>
                        <button className="border border-green-500 text-green-500 hover:bg-green-500 hover:text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300">
                          View Resume
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Image Content */}
              <div className="flex-1 flex justify-center">
                <div className="relative group">
                  {/* Floating animation container */}
                  <div className="relative transform transition-transform duration-1000 hover:scale-105">
                    {/* Background glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-green-500/30 to-blue-500/30 rounded-3xl blur-2xl transform rotate-6 group-hover:rotate-12 transition-transform duration-700"></div>
                    
                    {/* Main image container */}
                    <div className="relative bg-gray-800/50 backdrop-blur-sm p-6 rounded-3xl border border-gray-700/50 shadow-2xl">
                      <img 
                        src="aboutme.png" 
                        alt="About Asep Jumadi - Full Stack Developer" 
                        className="w-full max-w-lg rounded-2xl shadow-2xl transform transition-transform duration-500 group-hover:scale-105"
                      />
                      
                      {/* Floating badges */}
                      <div className="absolute -top-4 -right-4 bg-green-500 text-white px-4 py-2 rounded-full font-semibold text-sm shadow-lg transform rotate-12 animate-pulse">
                        5+ Years
                      </div>
                      <div className="absolute -bottom-4 -left-4 bg-blue-500 text-white px-4 py-2 rounded-full font-semibold text-sm shadow-lg transform -rotate-12 animate-pulse">
                        100+ Projects
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* My Recent Works Section */}
        <section className="mt-32 relative">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="w-full h-full bg-repeat bg-center" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2310b981' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}></div>
          </div>

          <div className="relative z-10">
            {/* Section Header */}
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                My recent <span className="text-green-500">works</span>
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-green-500 to-green-400 mx-auto rounded-full mb-8"></div>
              
              {/* Filter Tabs */}
              <div className="flex flex-wrap justify-center gap-4 mb-12">
                <button className="bg-green-500 text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg">
                  All
                </button>
                <button className="bg-gray-800/50 backdrop-blur-sm text-gray-300 px-8 py-3 rounded-full font-semibold transition-all duration-300 hover:bg-gray-700/50 hover:text-white border border-gray-700">
                  Mobile
                </button>
                <button className="bg-gray-800/50 backdrop-blur-sm text-gray-300 px-8 py-3 rounded-full font-semibold transition-all duration-300 hover:bg-gray-700/50 hover:text-white border border-gray-700">
                  Website
                </button>
                <button className="bg-gray-800/50 backdrop-blur-sm text-gray-300 px-8 py-3 rounded-full font-semibold transition-all duration-300 hover:bg-gray-700/50 hover:text-white border border-gray-700">
                  Games
                </button>
              </div>
            </div>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {/* Project 1 - Web App */}
              <div className="group relative bg-gray-800/40 backdrop-blur-lg rounded-2xl overflow-hidden border border-gray-700/50 shadow-2xl transition-all duration-500 hover:scale-105 hover:shadow-3xl hover:shadow-green-500/10">
                <div className="relative overflow-hidden">
                  <div className="bg-gradient-to-br from-purple-600 to-blue-600 aspect-video p-8 flex items-center justify-center">
                    {/* Mockup Design */}
                    <div className="bg-white rounded-lg p-4 w-full max-w-xs shadow-2xl transform group-hover:scale-105 transition-transform duration-500">
                      <div className="flex gap-2 mb-4">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      </div>
                      <div className="space-y-3">
                        <div className="h-4 bg-purple-200 rounded"></div>
                        <div className="h-4 bg-purple-100 rounded w-3/4"></div>
                        <div className="h-16 bg-purple-600 rounded text-white flex items-center justify-center text-xs font-bold">
                          LEARN LIVE SESSION
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute bottom-4 left-4 right-4 transform translate-y-8 group-hover:translate-y-0 transition-transform duration-300 opacity-0 group-hover:opacity-100">
                    <div className="flex gap-2">
                      <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors duration-300">
                        View Live
                      </button>
                      <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors duration-300">
                        Code
                      </button>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2">Learning Platform</h3>
                  <p className="text-gray-400 text-sm mb-4">A modern e-learning platform with live sessions and interactive features</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-xs font-medium">React</span>
                    <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-xs font-medium">TypeScript</span>
                    <span className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-xs font-medium">Node.js</span>
                  </div>
                </div>
              </div>

              {/* Project 2 - Business Website */}
              <div className="group relative bg-gray-800/40 backdrop-blur-lg rounded-2xl overflow-hidden border border-gray-700/50 shadow-2xl transition-all duration-500 hover:scale-105 hover:shadow-3xl hover:shadow-green-500/10">
                <div className="relative overflow-hidden">
                  <div className="bg-gradient-to-br from-gray-600 to-gray-800 aspect-video p-8 flex items-center justify-center">
                    {/* Business Card Mockup */}
                    <div className="relative">
                      <div className="bg-white rounded-lg shadow-2xl transform rotate-12 group-hover:rotate-6 transition-transform duration-500 w-48 h-32 p-4 flex flex-col justify-between">
                        <div>
                          <div className="w-8 h-2 bg-blue-500 rounded mb-2"></div>
                          <div className="text-xs font-bold text-gray-800">Best Working</div>
                          <div className="text-xs text-gray-600">COMPANY PROFILE</div>
                        </div>
                        <div className="space-y-1">
                          <div className="h-1 bg-gray-200 rounded"></div>
                          <div className="h-1 bg-gray-200 rounded w-3/4"></div>
                        </div>
                      </div>
                      <div className="bg-gray-200 rounded-lg shadow-xl transform -rotate-6 group-hover:-rotate-12 transition-transform duration-500 w-48 h-32 absolute top-2 -left-2 -z-10"></div>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute bottom-4 left-4 right-4 transform translate-y-8 group-hover:translate-y-0 transition-transform duration-300 opacity-0 group-hover:opacity-100">
                    <div className="flex gap-2">
                      <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors duration-300">
                        View Live
                      </button>
                      <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors duration-300">
                        Code
                      </button>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2">Business Website</h3>
                  <p className="text-gray-400 text-sm mb-4">Professional company profile website with modern design and SEO optimization</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-xs font-medium">Next.js</span>
                    <span className="bg-gray-500/20 text-gray-300 px-3 py-1 rounded-full text-xs font-medium">Tailwind</span>
                    <span className="bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded-full text-xs font-medium">SEO</span>
                  </div>
                </div>
              </div>

              {/* Project 3 - Mobile App */}
              <div className="group relative bg-gray-800/40 backdrop-blur-lg rounded-2xl overflow-hidden border border-gray-700/50 shadow-2xl transition-all duration-500 hover:scale-105 hover:shadow-3xl hover:shadow-green-500/10">
                <div className="relative overflow-hidden">
                  <div className="bg-gradient-to-br from-teal-600 to-cyan-600 aspect-video p-8 flex items-center justify-center gap-4">
                    {/* Mobile App Mockups */}
                    <div className="flex gap-2">
                      <div className="bg-gray-900 rounded-2xl p-2 w-20 h-36 shadow-2xl transform group-hover:scale-105 transition-transform duration-500">
                        <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl h-full p-2 relative">
                          <div className="w-full h-2 bg-teal-500 rounded mb-2"></div>
                          <div className="space-y-2">
                            <div className="h-2 bg-gray-700 rounded"></div>
                            <div className="h-2 bg-gray-700 rounded w-3/4"></div>
                          </div>
                          <div className="absolute bottom-2 left-2 right-2 h-8 bg-teal-500 rounded-lg"></div>
                        </div>
                      </div>
                      <div className="bg-gradient-to-b from-teal-500 to-cyan-500 rounded-2xl p-2 w-20 h-36 shadow-2xl transform group-hover:scale-110 transition-transform duration-500">
                        <div className="bg-white rounded-xl h-full p-2 relative">
                          <div className="w-full h-4 bg-gray-100 rounded mb-2"></div>
                          <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-full mx-auto mb-2"></div>
                          <div className="space-y-1">
                            <div className="h-1 bg-gray-200 rounded"></div>
                            <div className="h-1 bg-gray-200 rounded w-3/4"></div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-red-500 rounded-2xl p-2 w-20 h-36 shadow-2xl transform group-hover:scale-105 transition-transform duration-500">
                        <div className="bg-white rounded-xl h-full p-2 relative">
                          <div className="w-full h-3 bg-red-100 rounded mb-2"></div>
                          <div className="w-6 h-6 bg-red-500 rounded-full mx-auto mb-2"></div>
                          <div className="space-y-1">
                            <div className="h-1 bg-gray-200 rounded"></div>
                            <div className="h-1 bg-gray-200 rounded w-2/3"></div>
                          </div>
                          <div className="absolute bottom-2 left-2 right-2 h-6 bg-gradient-to-r from-red-500 to-pink-500 rounded"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute bottom-4 left-4 right-4 transform translate-y-8 group-hover:translate-y-0 transition-transform duration-300 opacity-0 group-hover:opacity-100">
                    <div className="flex gap-2">
                      <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors duration-300 text-sm">
                        Download
                      </button>
                      <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors duration-300 text-sm">
                        GitHub
                      </button>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2">Mobile App Suite</h3>
                  <p className="text-gray-400 text-sm mb-4">Cross-platform mobile applications with native performance and beautiful UI</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-cyan-500/20 text-cyan-300 px-3 py-1 rounded-full text-xs font-medium">React Native</span>
                    <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-xs font-medium">Kotlin</span>
                    <span className="bg-red-500/20 text-red-300 px-3 py-1 rounded-full text-xs font-medium">Swift</span>
                  </div>
                </div>
              </div>
            </div>

            {/* View All Projects Button */}
            <div className="text-center mt-16">
              <button className="group bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-4 px-8 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl hover:shadow-green-500/25">
                <span className="flex items-center gap-2">
                  View All Projects
                  <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </button>
            </div>
          </div>
        </section>
        
        {/* My Key Notes Article Section - Extracted to reusable components */}
        <ArticleSection 
          onArticleClick={handleArticleClick}
          onNewsletterSubscribe={handleNewsletterSubscribe}
          showNewsletter={true}
        />
      </div>
    </div>
  );
};

export default Home;