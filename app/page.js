'use client'

import Link from 'next/link'
import Head from 'next/head'
import Image from 'next/image'
import { motion, useScroll, useAnimation } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { Button, Card, CardBody, Tooltip } from '@nextui-org/react'
import { ArrowRight, CheckCircle, Users, Calendar, Clock } from 'lucide-react'

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
    <>
      <Head>
        <title>Savitribai Phule Shikshan Prasarak Mandal&apos;s SKN Sinhgad College of Engineering</title>
        <meta name="description" content="Student Attendance Management System - SKN Sinhgad College of Engineering, Pandharpur" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <header className="bg-white border-b">
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
                  className="rounded-lg shadow-sm" 
                />
                <div className="space-y-1">
                  <h1 className="text-xl font-bold text-gray-900 leading-tight">
                    Savitribai Phule Shikshan Prasarak Mandal&apos;s
                    <span className="block text-primary">SKN Sinhgad College of Engineering</span>
                  </h1>
                  <p className="text-sm text-gray-500">At Post: Korti, Tal: Pandharpur, Dist: Solapur, Maharashtra 413304</p>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Button 
                  as={Link}
                  href="/login"
                  variant="bordered"
                  endContent={<ArrowRight className="h-4 w-4" />}
                  className="font-medium"
                >
                  Login
                </Button>
              </motion.div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4">
          <section className="py-16 md:py-24">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial="hidden"
                animate="visible"
                variants={stagger}
                className="space-y-6"
              >
                <motion.h2 
                  variants={fadeInUp}
                  className="text-4xl md:text-5xl font-bold text-gray-900"
                >
                  Smart Attendance
                  <span className="block text-primary">Management System</span>
                </motion.h2>
                <motion.p 
                  variants={fadeInUp}
                  className="text-lg text-gray-500"
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
                    endContent={<ArrowRight className="h-5 w-5" />}
                    className="font-medium"
                  >
                    Get Started
                  </Button>
                  <Button
                    variant="bordered"
                    size="lg"
                    className="font-medium"
                  >
                    Learn More
                  </Button>
                </motion.div>

                <div className="grid sm:grid-cols-3 gap-4 pt-8">
                  {[
                    { icon: CheckCircle, text: "99.9% Accuracy" },
                    { icon: Users, text: "Easy to Use" },
                    { icon: Clock, text: "Real-time Tracking" },
                  ].map((feature, index) => (
                    <Tooltip key={index} content={feature.text} placement="top">
                      <Card 
                        className="border-none shadow-none bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                      >
                        <CardBody className="p-4 flex items-center gap-3">
                          <feature.icon className="h-5 w-5 text-primary" />
                          <span className="text-sm font-medium">{feature.text}</span>
                        </CardBody>
                      </Card>
                    </Tooltip>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                whileHover={{ scale: 1.02 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 rounded-3xl transform rotate-3"></div>
                <Image 
                  src="/5155462_2689047.svg" 
                  width={800} 
                  height={800} 
                  alt="Attendance System Illustration" 
                  className="relative rounded-3xl shadow-xl"
                />
              </motion.div>
            </div>
          </section>

          <section className="py-16 md:py-24">
            <motion.div 
              variants={fadeInUp}
              className="text-center max-w-3xl mx-auto space-y-4 mb-16"
            >
              <h2 className="text-3xl font-bold text-gray-900">Key Features</h2>
              <p className="text-lg text-gray-500">
                Our system comes packed with powerful features to make attendance management effortless
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: "Automated Tracking",
                  description: "Save time with our automated attendance marking system",
                  icon: Clock,
                  gradient: "from-blue-500/20 to-purple-500/20"
                },
                {
                  title: "Detailed Reports",
                  description: "Generate comprehensive attendance reports with just a few clicks",
                  icon: Calendar,
                  gradient: "from-green-500/20 to-emerald-500/20"
                },
                {
                  title: "Easy Integration",
                  description: "Seamlessly integrates with existing college management systems",
                  icon: Users,
                  gradient: "from-orange-500/20 to-red-500/20"
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
                    className="h-full hover:shadow-lg transition-all duration-300 overflow-hidden"
                    isPressable
                  >
                    <CardBody className="p-6 space-y-4 relative">
                      <div className="absolute inset-0 bg-gradient-to-br opacity-50 {feature.gradient}" />
                      <div className="relative z-10">
                        <feature.icon className="h-12 w-12 text-primary" />
                        <h3 className="text-xl font-semibold mt-4">{feature.title}</h3>
                        <p className="text-gray-500">{feature.description}</p>
                      </div>
                    </CardBody>
                  </Card>
                </motion.div>
              ))}
            </div>
          </section>
        </main>

        <footer className="border-t bg-gray-50">
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-gray-500">
                © 2024 UnityTech Solutions. All rights reserved.
              </p>
              <div className="flex gap-6">
                {['Privacy Policy', 'Terms of Service', 'Contact'].map((item) => (
                  <Link 
                    key={item}
                    href="#" 
                    className="text-sm text-gray-500 hover:text-primary transition-colors"
                  >
                    {item}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}