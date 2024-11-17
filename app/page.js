'use client'

import Link from 'next/link'
import Head from 'next/head'
import Image from 'next/image'
import { motion, useScroll, useAnimation } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { Button, Card, CardBody, Tooltip } from '@nextui-org/react'
import { ArrowRight, CheckCircle, Users, Calendar, Clock } from 'lucide-react'
import {  Outfit, Plus_Jakarta_Sans } from 'next/font/google'

// Primary font - Modern and clean
const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-plusjakarta',
})

// Secondary font - Elegant headlines
const outfit = Outfit({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-outfit',
})
export default function Home() {
  const controls = useAnimation()
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["0 1", "1.33 1"],
  })

  useEffect(() => {
    scrollYProgress.on("change", (latest) => {
      if (latest > 0) {
        controls.start("visible")
      }
    })
  }, [controls, scrollYProgress])

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  const stagger = {
    visible: {
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  return (
    <div className={`min-h-screen  font-sans`}>
    <Head>
        <title>Savitribai Phule Shikshan Prasarak Mandal&apos;s SKN Sinhgad College of Engineering</title>
        <meta name="description" content="Student Attendance Management System - SKN Sinhgad College of Engineering, Pandharpur" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <header className="bg-white/70 backdrop-blur-md border-b sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-6"
              >
                <Image 
                  src="/logoschool.jpeg" 
                  height={120} 
                  width={120} 
                  alt="College Logo"
                  className="rounded-lg shadow-sm hover:shadow-md transition-shadow" 
                />
                <div className="space-y-1">
                  <h1 className="text-xl font-outfit font-bold text-gray-900 leading-tight tracking-tight">
                    Savitribai Phule Shikshan Prasarak Mandal&apos;s
                    <span className="block text-primary font-semibold">SKN Sinhgad College of Engineering</span>
                  </h1>
                  <p className="text-sm text-gray-500 tracking-wide">At Post: Korti, Tal: Pandharpur, Dist: Solapur, Maharashtra 413304</p>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Button 
                  as={Link}
                  href="/login"
                  variant="shadow"
                  endContent={<ArrowRight className="h-4 w-4" />}
                  className="font-medium bg-gradient-to-r from-primary to-primary/90 text-white"
                >
                  Login
                </Button>
              </motion.div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4">
          <section className="py-20 md:py-32">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial="hidden"
                animate="visible"
                variants={stagger}
                className="space-y-8"
              >
                <motion.h2 
                  variants={fadeInUp}
                  className="text-5xl md:text-6xl p-2 font-outfit font-bold text-gray-900 tracking-tight"
                >
                  Smart Attendance
                  <span className="block p-2 text-primary bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                    Management System
                  </span>
                </motion.h2>
                <motion.p 
                  variants={fadeInUp}
                  className="text-xl text-gray-600 leading-relaxed"
                >
                  Streamline attendance tracking with our advanced digital solution. 
                  Designed specifically for educational institutions to save time and improve accuracy.
                </motion.p>
                
                <motion.div 
                  variants={fadeInUp}
                  className="flex flex-col sm:flex-row gap-4"
                >
                  <Button
                    as={Link}
                    href="/login"
                    color="primary"
                    size="lg"
                    className="font-medium bg-gradient-to-r from-primary to-primary/90 shadow-lg shadow-primary/20"
                    endContent={<ArrowRight className="h-5 w-5" />}
                  >
                    Get Started
                  </Button>
                  <Button
                    variant="bordered"
                    size="lg"
                    className="font-medium border-2"
                  >
                    Learn More
                  </Button>
                </motion.div>

                <div className="grid sm:grid-cols-3 gap-6 pt-8">
                  {[
                    { icon: CheckCircle, text: "99.9% Accuracy", desc: "Precise attendance tracking" },
                    { icon: Users, text: "Easy to Use", desc: "Intuitive interface" },
                    { icon: Clock, text: "Real-time Tracking", desc: "Instant updates" },
                  ].map((feature, index) => (
                    <Card 
                      key={index}
                      className="border-none bg-white/50 hover:bg-white hover:shadow-lg transition-all duration-300"
                    >
                      <CardBody className="p-6">
                        <feature.icon className="h-8 w-8 text-primary mb-4" />
                        <h3 className="font-outfit font-semibold text-lg mb-2">{feature.text}</h3>
                        <p className="text-sm text-gray-500">{feature.desc}</p>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5 rounded-3xl transform rotate-3"></div>
                <Image 
                  src="/5155462_2689047.svg" 
                  width={800} 
                  height={800} 
                  alt="Attendance System Illustration" 
                  className="relative rounded-3xl shadow-xl hover:shadow-2xl transition-shadow"
                />
              </motion.div>
            </div>
          </section>

          <section className="py-20 md:py-32">
            <motion.div 
              variants={fadeInUp}
              className="text-center max-w-3xl mx-auto space-y-6 mb-20"
            >
              <h2 className="text-4xl font-outfit font-bold text-gray-900">Key Features</h2>
              <p className="text-xl text-gray-600">
                Our system comes packed with powerful features to make attendance management effortless
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: "Automated Tracking",
                  description: "Save time with our automated attendance marking system",
                  icon: Clock,
                  gradient: "from-blue-500/10 via-indigo-500/10 to-purple-500/10"
                },
                {
                  title: "Detailed Reports",
                  description: "Generate comprehensive attendance reports with just a few clicks",
                  icon: Calendar,
                  gradient: "from-emerald-500/10 via-green-500/10 to-teal-500/10"
                },
                {
                  title: "Easy Integration",
                  description: "Seamlessly integrates with existing college management systems",
                  icon: Users,
                  gradient: "from-orange-500/10 via-amber-500/10 to-yellow-500/10"
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.2 }}
                >
                  <Card 
                    className="h-full hover:shadow-xl transition-all duration-300"
                    isPressable
                  >
                    <CardBody className="p-8 space-y-4">
                      <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-60`} />
                      <div className="relative z-10">
                        <feature.icon className="h-12 w-12 text-primary mb-6" />
                        <h3 className="text-2xl font-outfit font-semibold mb-4">{feature.title}</h3>
                        <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                      </div>
                    </CardBody>
                  </Card>
                </motion.div>
              ))}
            </div>
          </section>
        </main>

        <footer className="border-t bg-gray-50/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-12">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <p className="text-sm text-gray-500">
                © 2024 UnityTech Solutions. All rights reserved.
              </p>
              <div className="flex gap-8">
                {['Privacy Policy', 'Terms of Service', 'Contact'].map((item) => (
                  <Link 
                    key={item}
                    href="#" 
                    className="text-sm text-gray-500 hover:text-primary transition-colors font-medium"
                  >
                    {item}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}