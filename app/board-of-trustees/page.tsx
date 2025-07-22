"use client"

import Navbar from "@/components/navbar"
import { Card, CardContent } from "@/components/ui/card"
import { Users, History, MessageCircle } from "lucide-react"

export default function BoardOfTrusteesPage() {
  const boardMembers = [
    {
      name: "Ahmad Muhammad",
      position: "Chairman",
      image: "/images/Ahmad_Muhammad.png"
    },
    {
      name: "Mbarak Bameda",
      position: "Trustee",
      image: "/images/Mbarak_Bameda.png"
    },
    {
      name: "Muhammad Abdallah",
      position: "Trustee",
      image: "/images/Muhammad_Abdallah.png"
    },
    {
      name: "Alawi Ali Njama",
      position: "Trustee",
      image: "/images/Alawi_Ali_Njama.png"
    },
    {
      name: "Muhammad Abeid",
      position: "Trustee",
      image: "/images/Muhammad_Abeid.png"
    },
    {
      name: "Ali Baghoth",
      position: "Trustee",
      image: "/images/Ali_Abeid.png"
    },
    {
      name: "Faiz Abeid",
      position: "Trustee",
      image: "/images/Faiz_Abeid.png"
    }
  ]

  return (
    <div className="min-h-screen relative">
      {/* Background Image for Upper Part */}
      <div 
        className="fixed inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/Board of Trustee.jpeg')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-800/80 to-teal-900/90"></div>
      </div>


      {/* Content */}
      <div className="relative z-10">
        <Navbar />
        
        {/* Hero Section */}
        <div className="h-[40vh] w-full flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-4 text-white drop-shadow-lg">
              Board of <span className="text-teal-400">Trustees</span>
            </h1>
            <p className="text-xl text-white max-w-2xl mx-auto drop-shadow-lg">
              Guiding Tanzil Education Centre with Wisdom and Vision
            </p>
          </div>
        </div>

        {/* Board Members Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-20 lg:mb-40">
              <div className="flex items-center justify-center gap-4 mb-6">
                <Users className="h-12 w-12 text-teal-400" />
                <h2 className="text-4xl font-bold text-white">Our Board Members</h2>
              </div>
              <p className="text-white text-lg max-w-3xl mx-auto">
                Meet the distinguished members of our Board of Trustees who provide strategic leadership 
                and guidance to ensure Tanzil Education Centre continues to excel in Islamic education.
              </p>
            </div>
            <div>
              {/* Mobile: Vertical List */}
              <div className="flex flex-col gap-6 lg:hidden">
                {boardMembers.map((member) => (
                  <div key={member.name} className="bg-slate-900/80 rounded-lg p-4 flex items-center gap-4 shadow-lg">
                    <img src={member.image} alt={member.name} className="w-16 h-16 md:w-24 md:h-24 rounded-full object-cover object-top" style={{objectPosition: 'top center'}} />
                    <div>
                      <h4 className="text-lg md:text-2xl font-bold text-white">{member.name}</h4>
                      <p className="text-teal-400 font-medium text-sm md:text-lg">{member.position}</p>
                    </div>
                  </div>
                ))}
              </div>
              {/* Desktop: Circular Arrangement */}
              <div className="relative hidden lg:block h-[700px] w-full max-w-5xl mx-auto">
                {/* Center Logo */}
                <div className="absolute top-1/2 left-1/2 z-20" style={{transform: 'translate(-50%, -50%)'}}>
                  <div className="bg-slate-900/95 backdrop-blur-sm rounded-full p-12 border-8 border-teal-400 shadow-2xl flex flex-col items-center">
                    <img 
                      src="/images/Tanzil Logo.jpeg" 
                      alt="Tanzil Logo" 
                      className="w-56 h-56 rounded-full object-cover mx-auto"
                    />
                    <div className="text-center mt-8">
                      <h3 className="text-4xl font-bold text-white">TANZIL</h3>
                      <p className="text-teal-400 font-semibold text-2xl">Education Centre</p>
                    </div>
                  </div>
                </div>
                {/* Board Members in Circle */}
                {boardMembers.map((member, index) => {
                  const angleStep = 360 / boardMembers.length;
                  const angle = (index * angleStep) - 90; // Start from top
                  const radius = 380; // px, increased for spacing
                  const x = Math.cos((angle * Math.PI) / 180) * radius;
                  const y = Math.sin((angle * Math.PI) / 180) * radius;
                  return (
                    <div
                      key={member.name}
                      className="absolute z-10"
                      style={{
                        left: `calc(50% + ${x}px)` ,
                        top: `calc(50% + ${y}px)` ,
                        transform: 'translate(-50%, -50%)',
                        width: '160px', // reduced for spacing
                      }}
                    >
                      <Card className="bg-slate-900/95 backdrop-blur-sm border-teal-400 border-2 hover:border-teal-300 transition-all duration-300 w-full">
                        <CardContent className="p-5 text-center flex flex-col items-center">
                          <img 
                            src={member.image} 
                            alt={member.name}
                            className={`rounded-full mx-auto object-cover object-top border-4 ${
                              member.position === "Chairman" 
                                ? "w-24 h-24 border-teal-400" 
                                : "w-20 h-20 border-teal-400/20"
                            }`}
                          />
                          <h3 className="text-base font-bold text-white mb-1 leading-tight mt-2">{member.name}</h3>
                          <p className={`text-xs font-semibold ${
                            member.position === "Chairman" ? "text-teal-400" : "text-slate-300"
                          }`}>
                            {member.position}
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Institution History Section */}
        <section className="py-16 bg-slate-900/60">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row items-center gap-12">
              <div className="lg:w-1/2">
                <div className="flex items-center gap-4 mb-8">
                  <History className="h-12 w-12 text-teal-400" />
                  <h2 className="text-4xl font-bold text-white">Our History</h2>
                </div>
                <div className="space-y-6 text-slate-300 text-lg leading-relaxed">
                  <p>
                    Tanzil Education Centre is a project of Tanzil Education & Welfare Trust. The idea came up in 2017 and since then the Trust embarked on a journey of seeking for funds in order to see that the idea becomes a reality. By the grace of the Almighty Allah, then the support of our Muslim brothers and sisters five years down the line the Trust has been able to achieve the following:
                  </p>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <span className="text-teal-400 font-bold text-xl">1.</span>
                      <p>Construction of a grand Masjid</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-teal-400 font-bold text-xl">2.</span>
                      <p>Construction of a fully furnished dormitory</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-teal-400 font-bold text-xl">3.</span>
                      <p>Construction of a fully fledged building consisting of a multipurpose hall, classes, offices, library and computer lab</p>
                    </div>
                  </div>

                  <div className="mt-8">
                    <p className="text-slate-300 text-lg leading-relaxed">
                      The Education Center was officially opened by the Sheikh Al-Qadhwi, <span className="text-teal-400 font-bold">Abdulhalim Hussein</span> - <span className="text-teal-400 font-semibold">رَحِمَهُ اللَّهُ</span>, then the chief Kadhi of the Republic of Kenya, together with <span className="text-teal-400 font-bold">Hon. Nassir, Abdullswamad Shariff Nassir</span>, Governor, Mombasa County, on Sunday 19th Jumadal Awwal 1445 AH in alignment with 3rd December 2023 CE.
                    </p>
                  </div>

                  <div className="mt-8">
                    <h3 className="text-2xl font-bold text-white mb-4">General Objective</h3>
                    <p>
                      The general objective of this centre is to provide an ideal Islamic teaching environment that offers holistic integrated education with a strong foundation of Qur'an memorization and Islamic ethics.
                    </p>
                  </div>

                  <div className="mt-8">
                    <h3 className="text-2xl font-bold text-white mb-4">Structure Of Tanzil Education Centre</h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <span className="text-teal-400 font-bold text-xl">1.</span>
                        <p>Tahfidhul Qur'an - Both day and Boarding</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-teal-400 font-bold text-xl">2.</span>
                        <p>Tahfidhul Qura'an - Integrated with CBE Basics</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-teal-400 font-bold text-xl">3.</span>
                        <p>Ta'lim Day Scholars - Rawdhwa to thanawi Level (day)</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-teal-400 font-bold text-xl">4.</span>
                        <p>Integrated Sessions - Both day and Boarding</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-teal-400 font-bold text-xl">5.</span>
                        <p>Technical Courses – Open for all especially youths in the society</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="lg:w-1/2">
                <div className="aspect-square bg-slate-800/60 rounded-lg backdrop-blur-sm border border-slate-600 flex items-center justify-center">
                  <div className="text-center p-8">
                    <img 
                      src="/images/Tanzil Logo.jpeg" 
                      alt="Tanzil Logo" 
                      className="w-48 h-48 rounded-full object-cover mb-6"
                    />
                    <h3 className="text-3xl font-bold text-white mb-2">TANZIL</h3>
                    <p className="text-teal-400 font-semibold text-xl mb-2">Education Centre</p>
                    <p className="text-slate-300 text-lg">Knowledge and Values</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Chairman's Message Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-4 mb-6">
                <MessageCircle className="h-12 w-12 text-teal-400" />
                <h2 className="text-4xl font-bold text-white">Message from the Chairman</h2>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row items-center gap-12 max-w-6xl mx-auto">
              <div className="lg:w-1/3">
                <div className="relative">
                  <img 
                    src="/images/Ahmad_Muhammad.png" 
                    alt="Chairman Ahmad Muhammad"
                    className="w-80 h-80 rounded-full mx-auto object-cover object-top border-8 border-teal-400/30 shadow-2xl"
                  />
                  <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-teal-400 text-slate-900 px-6 py-2 rounded-full font-bold">
                      Chairman
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="lg:w-2/3">
                <Card className="bg-slate-900/80 backdrop-blur-sm border-slate-600">
                  <CardContent className="p-8">
                    <div className="relative">
                      <div className="absolute -top-4 -left-4 text-6xl text-teal-400 opacity-30">"</div>
                      <div className="relative z-10">
                        <h3 className="text-2xl font-bold text-white mb-6">
                          Ahmad Muhammad
                        </h3>
                        <div className="text-slate-300 text-lg leading-relaxed space-y-4">
                          <p>
                            As the Chairman of Tanzil Education Centre, it gives me great pleasure to 
                            welcome you to our institution. We are committed 
                            to providing excellence in Islamic education while fostering academic 
                            achievement and character development.
                          </p>
                          <p>
                            Our mission is to nurture well-rounded individuals who are not only 
                            academically proficient but also deeply rooted in Islamic values and 
                            ethics. We believe that true education goes beyond textbooks - it shapes 
                            character, builds community, and prepares students for both worldly success 
                            and spiritual fulfillment.
                          </p>
                          <p>
                            The Board of Trustees and I are committed to ensuring that Tanzil Education 
                            Centre continues to be a beacon of Islamic learning and moral excellence. 
                            We work tirelessly to maintain the highest standards of education while 
                            preserving our Islamic identity and values.
                          </p>
                          <p>
                            I invite you to explore our programs and discover how Tanzil Education 
                            Centre can contribute to your child's educational journey and spiritual 
                            growth. Together, let us build a future where Islamic values and academic 
                            excellence go hand in hand.
                          </p>
                        </div>
                        <div className="mt-6 text-right">
                          <p className="text-teal-400 font-semibold">Ahmad Muhammad</p>
                          <p className="text-slate-400">Chairman, Board of Trustees</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
} 