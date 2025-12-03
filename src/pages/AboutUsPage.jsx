import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Users, Trophy, Award, TrendingUp, MapPin, Phone } from 'lucide-react';

const AboutUsPage = () => {
  return (
    <div className="animate-fadeIn">
      {/* Breadcrumb */}
      <div className="bg-gray-100 py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-sm">
            <Link to="/" className="text-teal-600 hover:underline">Home</Link>
            <ChevronRight size={16} className="text-gray-400" />
            <span className="text-gray-600">About us</span>
          </div>
        </div>
      </div>

      {/* Page Header */}
      <section className="py-16 bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 font-display text-gray-800">
              <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">Om Oss</span>
            </h1>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Main Text Content */}
            <div className="prose prose-lg max-w-none mb-12">
              <div className="text-gray-700 leading-relaxed space-y-6 text-lg">
                <p>
                  Vi er en av Norges ledende distributører av både fysiske og digitale kontant- og ladekort fra Lycamobile, og samarbeider allerede med over 450 uavhengige butikker over hele landet. Vårt fokus er å gjøre det enkelt, lønnsomt og problemfritt for forhandlere å tilby mobilverdier til sine kunder.
                </p>
                
                <p>
                  Med lynraske leveranser, konkurransedyktige priser og et bredt utvalg av populære produkter, sørger vi for løsninger som skaper økt salg, høyere marginer og bedre kundetilfredshet. Lycamobile er spesielt etterspurt av turister, sesongarbeidere og reisende, noe som gir butikkene våre en klar fordel og et stort potensial for ekstra omsetning.
                </p>
                
                <p>
                  Vi setter kvalitet og tilgjengelighet først, og jobber for lange og solide partnerskap. Som forhandler får du brukervennlig bestillingssystem, dedikert support og tilgang til produkter som selger godt – året rundt.
                </p>
              </div>
            </div>

            {/* Feature Highlights */}
            <div className="grid md:grid-cols-2 gap-8 mt-16">
              <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl p-8 border-2 border-teal-100">
                <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center mb-4">
                  <Users className="text-white" size={28} />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">450+ Butikker</h3>
                <p className="text-gray-700">
                  Vi samarbeider med over 450 uavhengige butikker over hele Norge.
                </p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-8 border-2 border-blue-100">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-4">
                  <Trophy className="text-white" size={28} />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">Ledende Distributør</h3>
                <p className="text-gray-700">
                  En av Norges ledende distributører av Lycamobile produkter.
                </p>
              </div>

              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-8 border-2 border-emerald-100">
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mb-4">
                  <TrendingUp className="text-white" size={28} />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">Økt Salg & Marginer</h3>
                <p className="text-gray-700">
                  Konkurransedyktige priser som gir høyere marginer og økt salg.
                </p>
              </div>

              <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl p-8 border-2 border-cyan-100">
                <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center mb-4">
                  <Award className="text-white" size={28} />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">Dedikert Support</h3>
                <p className="text-gray-700">
                  Brukervennlig system og dedikert support for alle våre partnere.
                </p>
              </div>
            </div>

            {/* Call to Action */}
            <div className="mt-16 bg-gradient-to-r from-teal-600 to-cyan-600 rounded-2xl p-10 text-center text-white">
              <h2 className="text-3xl font-bold mb-4">Bli Forhandler</h2>
              <p className="text-lg mb-6 text-white/90">
                Ønsker du å bli en del av vårt nettverk? Kontakt oss i dag!
              </p>
              <Link 
                to="/support" 
                className="inline-block bg-white text-teal-600 px-8 py-4 rounded-xl font-bold hover:bg-gray-50 transition-colors"
              >
                Kontakt Oss
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUsPage;
