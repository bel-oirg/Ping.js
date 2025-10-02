"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useLang } from "@/context/langContext"
import { useAuth } from "@/hooks/useAuth"
import Header from "@/components/layouts/header"
import Galaxy from "@/components/animations/background"
import TextType from "@/components/animations/typing"
import RotatingText from '@/components/animations/rotation'
import en from "@/i18n/en/home"
import fr from "@/i18n/fr/home"
import Image from "next/image"
import Link from "next/link"
import { ExternalLink, ChevronDown, ChevronUp, Share2 } from "lucide-react"

export default function HomePage() {
  const { lang } = useLang()
  const content = lang === "fr" ? fr : en
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const headerRef = useRef<HTMLElement>(null)
  const [headerHeight, setHeaderHeight] = useState(0)
  const [showDescription, setShowDescription] = useState(false)
  const [showButtons, setShowButtons] = useState(false)
  const [titleTyped, setTitleTyped] = useState(false)
  const [descriptionTyped, setDescriptionTyped] = useState(false)
  const [selectedTool, setSelectedTool] = useState<number>(0)
  const [currentSection, setCurrentSection] = useState<number>(0)

  useEffect(() => {
    const preventScroll = (e: WheelEvent) => {
      e.preventDefault()
      return false
    }
    window.addEventListener("wheel", preventScroll, { passive: false })
    return () => window.removeEventListener("wheel", preventScroll)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        const toolsSection = document.getElementById("tools")
        toolsSection?.scrollIntoView({ behavior: "smooth" })
        setCurrentSection(1)
      } else if (e.key === "ArrowUp") {
        const heroSection = document.getElementById("hero")
        heroSection?.scrollIntoView({ behavior: "smooth" })
        setCurrentSection(0)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  useEffect(() => {
    const section = document.getElementById(currentSection === 0 ? "hero" : "tools")
    section?.scrollIntoView({ behavior: "smooth" })
  }, [currentSection])

  useEffect(() => {
    setTitleTyped(false)
    setShowDescription(false)
    setDescriptionTyped(false)
    setShowButtons(false)
  }, [lang])

  useEffect(() => {
    if (headerRef.current) {
      setHeaderHeight(headerRef.current.offsetHeight)
    }
  }, [])

  useEffect(() => {
    if (titleTyped && !showDescription) {
      const timer = setTimeout(() => setShowDescription(true), 500)
      return () => clearTimeout(timer)
    }
    if (descriptionTyped && !showButtons) {
      const timer = setTimeout(() => setShowButtons(true), 500)
      return () => clearTimeout(timer)
    }
  }, [titleTyped, descriptionTyped, showDescription, showButtons])

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  }

  const handleNavigation = () => {
    router.push(isAuthenticated ? "/dashboard" : "/login")
  }

  const handleToolNavigation = (tool: string) => {
    window.open(`https://blackholejs.art/${tool}`, "_blank")
  }

  const handleTitleCharTyped = () => {
    if (!titleTyped) {
      const titleLength = content.title.length
      setTimeout(() => setTitleTyped(true), titleLength * 75 + 300)
    }
  }

  const handleDescriptionCharTyped = () => {
    if (!descriptionTyped && showDescription) {
      const descLength = content.description.length
      setTimeout(() => setDescriptionTyped(true), descLength * 75 + 200)
    }
  }

  const goToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId)
    if (section) {
      section.scrollIntoView({ behavior: "smooth" })
      setCurrentSection(sectionId === "hero" ? 0 : sectionId === "tools" ? 1 : 2)
    }
  }

  const tools = [
    {
      icon: <Image src="/tech/Kibana.svg" alt="Kibana" width={32} height={32} className="rounded" />,
      label: "Kibana",
      category: "Analytics",
      title: content.tools.kibana.title,
      description: content.tools.kibana.description,
      buttonText: content.tools.kibana.button,
      path: "kibana",
      variant: "secondary" as const,
    },
    {
      icon: <Image src="/tech/Grafana.svg" alt="Grafana" width={32} height={32} className="rounded" />,
      label: "Grafana",
      category: "Monitoring",
      title: content.tools.grafana.title,
      description: content.tools.grafana.description,
      buttonText: content.tools.grafana.button,
      path: "grafana",
      variant: "secondary" as const,
    },
    {
      icon: <Image src="/tech/PostgresSQL.svg" alt="pgAdmin" width={32} height={32} className="rounded" />,
      label: "pgAdmin",
      category: "Database",
      title: content.tools.pgadmin.title,
      description: content.tools.pgadmin.description,
      buttonText: content.tools.pgadmin.button,
      path: "pgadmin",
      variant: "secondary" as const,
    },
    {
      icon: <Image src="/tech/Kafka.svg" alt="Kafka UI" width={32} height={32} className="rounded" />,
      label: "Kafka UI",
      category: "Streaming",
      title: content.tools.kafkaui.title,
      description: content.tools.kafkaui.description,
      buttonText: content.tools.kafkaui.button,
      path: "kafkaui",
      variant: "secondary" as const,
    },
    {
      icon: <Image src="/tech/Swagger.svg" alt="Swagger" width={32} height={32} className="rounded" />,
      label: "Swagger",
      category: "API",
      title: "API Documentation",
      description: "Explore and test our APIs with interactive documentation",
      buttonText: "Open Swagger",
      path: "swagger",
      variant: "secondary" as const,
    },
    {
      icon: <Image src="/tech/Redis.svg" alt="Redis" width={32} height={32} className="rounded" />,
      label: "Redis",
      category: "Cache",
      title: "Redis Commander",
      description: "Monitor and manage your Redis instances",
      buttonText: "Open Redis Commander",
      path: "redis",
      variant: "secondary" as const,
    },
  ]

  const langKey = `lang-${lang}`

  return (
    <>
      <Header ref={headerRef} />
      <div className="fixed inset-0 z-0">
        <Galaxy
          mouseRepulsion={true}
          mouseInteraction={false}
          density={3}
          glowIntensity={0.4}
          saturation={0}
          hueShift={360}
          rotationSpeed={0.05}
          twinkleIntensity={0.2}
          repulsionStrength={3.5}
          autoCenterRepulsion={0}
          starSpeed={0.5}
          speed={1}
        />
      </div>

      <main className="flex flex-col items-center min-h-screen overflow-hidden relative z-10">
        {/* Hero Section */}
        <section
          id="hero"
          className="w-full min-h-screen relative pt-16 px-6 flex flex-col items-center justify-center text-center gap-16"
        >
          <motion.div initial="hidden" animate="visible" variants={fadeIn} className="space-y-10 max-w-4xl">
            <h1 className="text-4xl sm:text-6xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent font-playwrite mb-8">
              <TextType
                key={`title-${langKey}`}
                text={content.title}
                typingSpeed={75}
                pauseDuration={1000}
                showCursor={false}
                cursorCharacter="|"
                loop={false}
                as="span"
              />
              {handleTitleCharTyped()}
            </h1>

            {showDescription && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xl md:text-2xl max-w-3xl mx-auto flex flex-wrap items-center justify-center gap-10 mb-8"
              >
                <div className="font-medium flex items-center flex-wrap justify-center gap-x-3 ">
                  <span className=" bg-clip-texttext-transparent font-bold">
				  	This Project is 
                  </span>
                  {/* <div className="h-5 border-l border-muted-foreground/30 mx-2"></div> */}
                  <span className="inline-block overflow-hidden min-w-40">
                    <RotatingText
                      texts={[
                        'Powered By NextJS',
                        'Using FastifyJS',
						'Designed for Scalability',
						'Real-Time Monitoring',
						'Microservices Architecture',
						'User-Friendly Interface'
                      ]}
                      mainClassName="overflow-hidden justify-center"
                      staggerFrom="first"
                      initial={{ y: "100%", opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: "-120%", opacity: 0 }}
                      staggerDuration={0.02}
                      splitLevelClassName="overflow-hidden"
                      elementLevelClassName="text-muted-foreground bg-clip-text bg-gradient-to-r from-primary to-primary/80 font-bold"
                      transition={{ type: "spring", damping: 25, stiffness: 300 }}
                      rotationInterval={3500}
                      loop={true}
                      auto={true}
                      splitBy="words"
                      onAnimationComplete={() => setDescriptionTyped(true)}
                    />
                  </span>
                </div>
              </motion.div>
            )}

            {/* {showButtons && ( */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="pt-2 flex items-center justify-center gap-4"
              >
                <Button size="lg" variant="default" onClick={handleNavigation} className="text-sm px-6 py-6 bg-foreground text-background">
                  {isAuthenticated ? content.dashboard : content.getStarted}
                </Button>
                <Link href="/architecture">
                  <Button size="lg" variant="outline" className="text-sm px-6 py-6">
                    <Share2 className="mr-2 w-5 h-5" />
                    {content.architecture}
                  </Button>
                </Link>
              </motion.div>
            {/* )} */}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="absolute bottom-8 flex flex-col items-center gap-2 cursor-pointer group"
            onClick={() => goToSection("tools")}
          >
            <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
              {content.scrollDown}
            </span>
            <ChevronDown className="w-5 h-5 animate-bounce group-hover:text-primary transition-colors" />
          </motion.div>
        </section>

        {/* Tools Section */}
        <section id="tools" className="w-full min-h-screen py-16 px-6">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                {content.tools.title}
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                {content.api.description}
              </p>
              <Separator className="max-w-24 mx-auto mt-8" />
            </motion.div>

            <div className="grid lg:grid-cols-12 gap-8 items-start">
              {/* Tool Selection */}
              <div className="lg:col-span-5 space-y-6" id="toolSelectionList">
                <div className="text-center lg:text-left">
                  <h3 className="text-2xl font-semibold mb-2">Available Tools</h3>
                  <p className="text-muted-foreground">Select a tool to learn more</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
                  {tools.map((tool, index) => (
                    <Card
                      key={tool.label}
                      className={`cursor-pointer transition-all duration-300 hover:shadow-md ${
                        selectedTool === index ? "ring-2 ring-primary shadow-lg bg-primary/5" : "hover:bg-accent/50"
                      }`}
                      onClick={() => setSelectedTool(index)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="flex-shrink-0 p-2 bg-background rounded-lg shadow-sm border">{tool.icon}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-sm">{tool.label}</h4>
                              <Badge variant="secondary" className="text-xs">
                                {tool.category}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-1">{tool.description}</p>
                          </div>
                          {selectedTool === index && (
                            <div className="flex-shrink-0">
                              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Tool Details */}
              <div className="lg:col-span-7 w-full h-full">
                <div className="lg:sticky lg:top-8 h-full flex">
                  <motion.div
                    key={selectedTool}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4 }}
                    className="w-full"
                  >
                    <Card className="shadow-xl w-full h-full flex flex-col">
                      <CardHeader className="pb-4">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-primary/10 rounded-xl border">
                            <div className="w-12 h-12 flex items-center justify-center">{tools[selectedTool].icon}</div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <CardTitle className="text-3xl">{tools[selectedTool].title}</CardTitle>
                              <Badge variant="secondary">{tools[selectedTool].category}</Badge>
                            </div>
                            <Separator className="w-16" />
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-6 flex-1 flex flex-col">
                        <CardDescription className="text-lg leading-relaxed">
                          {tools[selectedTool].description}
                        </CardDescription>

                        <div className="flex items-center justify-center pt-2 mt-auto">
                          <Button
                            size="md"
                            className="w-full text-xs h-14 bg-foreground text-background"
                            onClick={() => handleToolNavigation(tools[selectedTool].path)}
                          >
                            <span className="flex items-center gap-2">
                              {tools[selectedTool].buttonText}
                              <ExternalLink className="w-4 h-4" />
                            </span>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>

          <motion.div
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2 cursor-pointer flex flex-col items-center gap-2 group"
            onClick={() => goToSection("hero")}
          >
            <ChevronUp className="w-5 h-5 group-hover:text-primary transition-colors" />
            <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
              Back to Top
            </span>
          </motion.div>
        </section>
      </main>
    </>
  )
}
