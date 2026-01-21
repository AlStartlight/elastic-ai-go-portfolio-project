import React from 'react';
import { useTranslation } from 'react-i18next';
import SEO from '../components/SEO';
import RecentWorks from '../components/RecentWorks';
import KeyNotesArticles from '../components/KeyNotesArticles';
import NewsletterSubscription from '../components/NewsletterSubscription';
import { NewsletterSubscription as NewsletterData } from '../types/article';
import { useHomepageContent, useTechStacks } from '../hooks/useHomepage';

const Home: React.FC = () => {
  const { t } = useTranslation();
  const { content: heroContent, loading: heroLoading, error: heroError } = useHomepageContent('hero');
  const { stacks, loading: stacksLoading, error: stacksError } = useTechStacks();

  // Newsletter handler
  const handleNewsletterSubscribe = async (data: NewsletterData) => {
    console.log('Newsletter subscription:', data);
    // TODO: Implement actual API call
    // await subscribeToNewsletter(data.email);
  };

  if (heroLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (heroError) {
    console.error('Error loading homepage:', heroError);
    // Fallback to default content
  }

  return (
    <>
      <SEO 
        title={heroContent?.title ? heroContent.title.replace('\n', ' ') : "Asep Jumadi - Full Stack Developer"}
        description={heroContent?.description || t('description')}
        keywords="full stack developer, react developer, golang developer, typescript, nextjs, tailwind css, postgresql, web development, software engineer, asep jumadi"
        ogType="website"
      />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="container mx-auto px-4 py-16 max-w-7xl">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          {/* Dynamic Text Content */}
          <div className="flex-1 text-center lg:text-left">
            <div className="space-y-4">
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold leading-tight">
                {heroContent?.title ? (
                  heroContent.title.split('\n').map((line, i) => (
                    <span 
                      key={i} 
                      className={i === 0 ? "text-white block" : "text-green-500 block"}
                    >
                      {line}
                    </span>
                  ))
                ) : (
                  <>
                    <span className="text-white block">FULL STACK</span>
                    <span className="text-green-500 block">DEVELOPER</span>
                  </>
                )}
              </h1>
              <p className="text-gray-300 text-lg md:text-xl max-w-2xl mt-6">
                {heroContent?.description || t('description')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mt-8">
                {heroContent?.ctaPrimaryText && (
                  <button 
                    onClick={() => window.location.href = heroContent.ctaPrimaryLink}
                    className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105"
                  >
                    {heroContent.ctaPrimaryText}
                  </button>
                )}
                {!heroContent?.ctaPrimaryText && (
                  <button className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105">
                    {t('view_project')}
                  </button>
                )}
                {heroContent?.ctaSecondaryText && (
                  <button 
                    onClick={() => window.location.href = heroContent.ctaSecondaryLink}
                    className="border-2 border-green-500 text-green-500 hover:bg-green-500 hover:text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300"
                  >
                    {heroContent.ctaSecondaryText}
                  </button>
                )}
                {!heroContent?.ctaSecondaryText && (
                  <button className="border-2 border-green-500 text-green-500 hover:bg-green-500 hover:text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300">
                    {t('download_cv')}
                  </button>
                )}
              </div>
            </div>
          </div>
          
          {/* Dynamic Image Content */}
          <div className="flex-1 flex justify-center lg:justify-end">
            <div className="relative">
              <div className="absolute inset-0 bg-green-500/20 rounded-full blur-3xl"></div>
              <img 
                src={heroContent?.imageUrl || "sabas.png"} 
                alt={heroContent?.title || "Full Stack Developer"} 
                className="relative z-10 w-80 h-80 md:w-96 md:h-96 lg:w-[500px] lg:h-[500px] object-cover rounded-full shadow-2xl border-4 border-green-500/50"
              />
            </div>
          </div>
        </div>

        {/* Dynamic Tech Stacks Section */}
        <div className="mt-20 text-center">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {!stacksLoading && stacks.length > 0 ? (
              stacks.map((stack) => (
                <div 
                  key={stack.id}
                  className="bg-gray-800/50 p-6 rounded-lg backdrop-blur-sm border border-gray-700"
                >
                  <h3 className="text-green-500 font-bold text-xl mb-2">
                    {stack.icon && <span className="mr-2">{stack.icon}</span>}
                    {stack.title}
                  </h3>
                  <p className="text-gray-300">{stack.description}</p>
                </div>
              ))
            ) : (
              // Fallback to default content if no dynamic stacks
              <>
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
              </>
            )}
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
        
        {/* My Recent Works Section - Dynamic from API */}
        <RecentWorks limit={6} />
        
        {/* My Key Notes Article Section - Dynamic from API */}
        <KeyNotesArticles limit={3} />
        
        {/* Newsletter Section */}
        <section className="mt-32 relative">
          <NewsletterSubscription onSubscribe={handleNewsletterSubscribe} />
        </section>
      </div>
    </div>
    </>
  );
};

export default Home;