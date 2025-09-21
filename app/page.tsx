"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useSession, signIn, signOut } from "next-auth/react"
import AuthButtons from "@/components/AuthButtons"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RatingCircles } from "@/components/RatingCircles"
import BreathingMeditation from "@/components/BreathingMeditation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { AlertTriangle, Heart, MessageCircle, BookOpen, Home, Phone, TrendingUp, Calendar, Smile, Activity, ScrollText, Flame, Quote, User, Settings as SettingsIcon, LogOut } from "lucide-react"

// --- TYPE DEFINITIONS ---
type Page = "welcome" | "auth" | "dashboard" | "chat" | "articles" | "stories" | "activities"

type MoodEntry = {
    date: string
    mood: number
    energy: number
    stress: number
    notes: string
}

type DailyQuizAnswers = {
    mood: number
    energy: number
    stress: number
    gratitude: string
    challenge: string
}

type ChatMessage = {
    id: string
    content: string
    sender: "user" | "ai"
    timestamp: Date
}

type Article = {
    id: string
    title: string
    description: string
    content: string
    category: string
    readTime: string
    author: string
}

// --- MAIN APP COMPONENT ---
export default function MindspaceApp() {
    const [currentPage, setCurrentPage] = useState<Page>("welcome")
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [showEmergencyModal, setShowEmergencyModal] = useState(false)
    const [authMode, setAuthMode] = useState<"signin" | "signup">("signin")
    const [canShowAppNav, setCanShowAppNav] = useState(false)
    const [storyLoading, setStoryLoading] = useState(false)
    const [storyData, setStoryData] = useState<{ title: string; story: string } | null>(null)
    const [showOnboardingQuiz, setShowOnboardingQuiz] = useState(false)
    const [onboardingAnswers, setOnboardingAnswers] = useState<string[]>(Array(12).fill(""))
    const [onboardingSubmitting, setOnboardingSubmitting] = useState(false)
    const [onboardingResult, setOnboardingResult] = useState<{ observation: string; suggestions: string[]; category: 'ab' | 'stress' | 'moodSocial' | 'widespread' } | null>(null)

    const { data: session } = useSession()
    useEffect(() => {
        // Immediately update login state based on session
        setIsLoggedIn(!!session)
        
        if (session) {
            // Show dashboard UI immediately to reduce perceived loading time
            setCurrentPage('dashboard')
            
            // Then check profile in background
            ;(async () => {
                try {
                    // Use absolute URL for API calls in production
                    const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL 
                        ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` 
                        : '';
                    const res = await fetch(`${baseUrl}/api/profile`, { 
                        cache: 'no-store',
                        // Add credentials to ensure cookies are sent
                        credentials: 'include'
                    })
                    
                    if (res.ok) {
                        const data = await res.json()
                        if (!data?.profile || !data?.profile?.termsAccepted) {
                            // Redirect to profile only if terms not accepted
                            window.location.href = '/profile'
                        } else {
                            setCanShowAppNav(true)
                        }
                    } else {
                        // Still show nav on error, better UX than blank screen
                        setCanShowAppNav(true)
                    }
                } catch (e) {
                    // Still show nav on error
                    setCanShowAppNav(true)
                }
            })()
        } else {
            setCanShowAppNav(false)
            setCurrentPage('welcome')
        }
    }, [session])

    // Show onboarding quiz on first visit to dashboard if not completed
    useEffect(() => {
        if (currentPage === 'dashboard' && isLoggedIn) {
            try {
                const done = localStorage.getItem('hasCompletedOnboarding')
                if (!done) {
                    // Small delay to ensure components are properly mounted
                    setTimeout(() => {
                        setShowOnboardingQuiz(true)
                    }, 500)
                }
            } catch {}
        }
    }, [currentPage, isLoggedIn])

    const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([
        { date: "2024-01-15", mood: 7, energy: 6, stress: 4, notes: "Good day overall" },
        { date: "2024-01-16", mood: 5, energy: 4, stress: 7, notes: "Stressful work day" },
        { date: "2024-01-17", mood: 8, energy: 8, stress: 3, notes: "Great weekend!" },
    ])
    const [todayQuiz, setTodayQuiz] = useState<DailyQuizAnswers>({
        mood: 5,
        energy: 5,
        stress: 5,
        gratitude: "",
        challenge: "",
    })
    const [quizCompleted, setQuizCompleted] = useState(false)

    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
        {
            id: "1",
            content:
                "Hello! I'm your AI wellness companion. I'm here to listen and support you on your mental health journey. How are you feeling today?",
            sender: "ai",
            timestamp: new Date(),
        },
    ])
    const [currentMessage, setCurrentMessage] = useState("")
    const [isAiTyping, setIsAiTyping] = useState(false)
    const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
    const [selectedCategory, setSelectedCategory] = useState("All")

    const articles: Article[] = [
        {
            id: "1",
            title: "Understanding Anxiety in Indian Youth",
            description:
                "Learn about the common signs of anxiety and how cultural factors in India can influence mental health experiences.",
            content:
                "Anxiety is one of the most common mental health challenges faced by young people in India today. With increasing academic pressure, career uncertainties, and social expectations, it's important to recognize the signs and seek appropriate help. This article explores culturally sensitive approaches to managing anxiety, including traditional practices like yoga and meditation alongside modern therapeutic techniques.",
            category: "Mental Health Basics",
            readTime: "5 min read",
            author: "Dr. Priya Sharma",
        },
        {
            id: "2",
            title: "Building Resilience Through Mindfulness",
            description:
                "Discover practical mindfulness techniques rooted in Indian traditions that can help build emotional resilience.",
            content:
                "Mindfulness, deeply rooted in Indian philosophy and practices, offers powerful tools for building emotional resilience. This article explores how to integrate ancient practices like pranayama (breathing exercises), dhyana (meditation), and mindful awareness into daily life to manage stress, improve focus, and enhance overall well-being. Learn practical techniques that you can start implementing today.",
            category: "Mindfulness & Meditation",
            readTime: "7 min read",
            author: "Swami Ananda",
        },
        {
            id: "3",
            title: "Dealing with Academic Pressure",
            description: "Strategies for managing the intense academic expectations common in Indian educational systems.",
            content:
                "The Indian education system is known for its competitive nature, which can create significant stress for students. This article provides practical strategies for managing academic pressure, including time management techniques, stress reduction methods, and ways to maintain a healthy work-life balance. Learn how to excel academically while preserving your mental health.",
            category: "Student Life",
            readTime: "6 min read",
            author: "Prof. Rajesh Kumar",
        },
        {
            id: "4",
            title: "Family Dynamics and Mental Health",
            description:
                "Navigating family expectations while maintaining your mental well-being in Indian cultural contexts.",
            content:
                "Family plays a central role in Indian culture, but sometimes family expectations can create stress and conflict. This article explores how to maintain healthy boundaries, communicate effectively with family members about mental health, and balance respect for tradition with personal well-being. Learn strategies for having difficult conversations and building understanding.",
            category: "Family & Relationships",
            readTime: "8 min read",
            author: "Dr. Meera Nair",
        },
        {
            id: "5",
            title: "Breaking the Stigma Around Mental Health",
            description: "Understanding and addressing mental health stigma in Indian society.",
            content:
                "Mental health stigma remains a significant barrier to seeking help in Indian society. This article examines the roots of this stigma, its impact on individuals and families, and practical ways to challenge misconceptions. Learn how to advocate for mental health awareness in your community and support others who may be struggling.",
            category: "Awareness & Advocacy",
            readTime: "6 min read",
            author: "Dr. Arjun Patel",
        },
        {
            id: "6",
            title: "Self-Care Practices for Daily Life",
            description: "Simple, culturally relevant self-care practices that can be easily integrated into your routine.",
            content:
                "Self-care isn't selfish—it's essential for maintaining good mental health. This article presents practical self-care strategies that align with Indian values and lifestyle, including morning routines inspired by Ayurveda, the importance of community connection, and simple practices like journaling and gratitude that can make a significant difference in your daily well-being.",
            category: "Self-Care",
            readTime: "5 min read",
            author: "Dr. Kavya Reddy",
        },
    ]
    const categories = [ "All", "Mental Health Basics", "Mindfulness & Meditation", "Student Life", "Family & Relationships", "Awareness & Advocacy", "Self-Care"]
    const filteredArticles = selectedCategory === "All" ? articles : articles.filter((article) => article.category === selectedCategory)

    const emergencyContacts = [
        { name: "Sneha Foundation", phone: "+91-44-2464-0050", available: "24/7" },
        { name: "Aasra", phone: "+91-22-2754-6669", available: "24/7" },
        { name: "iCall", phone: "+91-22-2556-3291", available: "10 AM - 8 PM" },
        { name: "Vandrevala Foundation", phone: "+91-99996-66555", available: "24/7" },
    ]

    const MOTIVATION_QUOTES: string[] = ["Small steps every day lead to big changes.", "Your feelings are valid. It’s okay to take it slow.", "Breathe. You’ve handled hard things before.", "Progress, not perfection.", "Rest is productive.", "You are not your thoughts; you are the observer of them.", "One day at a time.", "Self-kindness is a superpower.", "Asking for help is a sign of strength.", "You’re doing better than you think."]

    // Onboarding 12-question Mental Wellness Check-in
    const ONBOARDING_INTRO = "Welcome! This is a safe and private space for you to check in with yourself. There are no right or wrong answers. Just be honest. This will help us understand how you're feeling so we can suggest the best ways to support you. Your responses are completely confidential."
    const ONBOARDING_OPTIONS = [
        { key: 'A', label: 'Not at all / Rarely' },
        { key: 'B', label: 'Some of the time' },
        { key: 'C', label: 'Often' },
        { key: 'D', label: 'Almost always' },
    ] as const
    const QUESTIONS: { text: string; section: 'mood' | 'stress' | 'energy' | 'social' }[] = [
        // Mood & Emotions (1-3)
        { text: 'In the last two weeks, how often have you felt low, sad, or down?', section: 'mood' },
        { text: 'How often have you found it difficult to find joy or interest in activities you usually like?', section: 'mood' },
        { text: 'How often have you felt irritable, on edge, or easily annoyed?', section: 'mood' },
        // Stress & Pressure (4-6)
        { text: 'How often do you feel overwhelmed by pressure from your studies, exams, or career expectations?', section: 'stress' },
        { text: 'How often have you found yourself worrying constantly about the future or about things you can\'t control?', section: 'stress' },
        { text: 'How often do you feel tense, restless, or unable to relax?', section: 'stress' },
        // Energy & Daily Functioning (7-9)
        { text: 'How would you describe your energy lately? Have you been feeling tired or drained most of the time?', section: 'energy' },
        { text: 'How has your sleep been overall?', section: 'energy' },
        { text: 'Have you noticed significant changes in your appetite?', section: 'energy' },
        // Social Connection & Support (10-12)
        { text: 'How often have you felt lonely or isolated, even around other people?', section: 'social' },
        { text: 'How often do you feel like you have someone you can talk to honestly without fear of being judged?', section: 'social' },
        { text: 'When thinking about discussing your feelings, how comfortable do you feel about reaching out for help?', section: 'social' },
    ]

    // --- HANDLER FUNCTIONS ---
    const handleAuth = (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoggedIn(true)
        setCurrentPage("dashboard")
    }

    const handleQuizSubmit = async () => {
        const today = new Date().toISOString().split("T")[0]
        const newEntry: MoodEntry = {
            date: today,
            mood: todayQuiz.mood,
            energy: todayQuiz.energy,
            stress: todayQuiz.stress,
            notes: `Grateful for: ${todayQuiz.gratitude}. Challenge: ${todayQuiz.challenge}`,
        }
        
        // Save check-in data to user's account
        try {
            const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL 
                ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` 
                : '';
            await fetch(`${baseUrl}/api/chat/checkin`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(newEntry)
            });
        } catch (e) {
            console.error("Failed to save check-in data", e);
        }
        
        setMoodHistory((prev) => {
            const filtered = prev.filter((entry) => entry.date !== today)
            return [...filtered, newEntry].sort((a, b) => a.date.localeCompare(b.date))
        })
        setQuizCompleted(true)
        // Generate a personalized story using Gemini
        setStoryData(null)
        setStoryLoading(true)
        try {
            let scenarioPrompt = ""
            if (todayQuiz.stress >= 7) {
                scenarioPrompt = "The user is a young person feeling immense pressure and anxiety. They feel overwhelmed, tense, and their mind is always racing with worries about the future. Their struggle feels like being caught in a relentless storm."
            } else if (todayQuiz.mood <= 3) {
                scenarioPrompt = "The user is a young person experiencing a persistent low mood and a loss of joy. They feel disconnected, isolated, and lonely, as if the world's color has faded to grey and they are invisible to everyone."
            } else if (todayQuiz.energy <= 3) {
                scenarioPrompt = "The user is a young person feeling completely drained of energy, both mentally and physically. Daily tasks feel like monumental efforts, and they feel stuck in a state of deep exhaustion, like they are trying to walk through thick mud."
            } else {
                scenarioPrompt = "The user is a young person going through a very difficult time with a mix of sadness, stress, and exhaustion. They feel lost, overwhelmed, and isolated, and their energy is too low to see a clear path forward. It feels like they are lost in a cold, dense fog on a steep mountain."
            }
            const res = await fetch('/api/story', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ scenarioPrompt })
            })
            if (res.ok) {
                const data = await res.json()
                if (data?.title || data?.story) {
                    setStoryData({ title: data.title || 'A Gentle Story', story: data.story || '' })
                }
            }
        } catch (e) {
            // Silent fail; keep UX smooth
        } finally {
            setStoryLoading(false)
        }
    }

    const handleSendMessage = async () => {
        if (!currentMessage.trim()) return
        const userMessage: ChatMessage = { id: Date.now().toString(), content: currentMessage, sender: "user", timestamp: new Date() }
        setChatMessages((prev) => [...prev, userMessage])
        setCurrentMessage("")
        setIsAiTyping(true)
        try {
            const historyPayload = [...chatMessages, userMessage]
                .slice(-10)
                .map((m) => ({ sender: m.sender, content: m.content }))
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMessage.content, history: historyPayload })
            })
            if (!res.ok) throw new Error('Chat API error')
            const data = await res.json()
            const replyText: string = data?.reply || "I'm here with you. Would you like to share a bit more about how you're feeling right now?"
            const aiMessage: ChatMessage = { id: (Date.now() + 1).toString(), content: replyText, sender: "ai", timestamp: new Date() }
            setChatMessages((prev) => [...prev, aiMessage])
        } catch (e) {
            const fallback = "I'm here with you. Perhaps take three slow breaths with me. What feels heaviest right now?"
            const aiMessage: ChatMessage = { id: (Date.now() + 1).toString(), content: fallback, sender: "ai", timestamp: new Date() }
            setChatMessages((prev) => [...prev, aiMessage])
        } finally {
            setIsAiTyping(false)
        }
    }

    // --- UTILITY FUNCTIONS ---
    const getMoodEmoji = (mood: number) => {
        if (mood <= 2) return "😢"; if (mood <= 4) return "😕"; if (mood <= 6) return "😐"; if (mood <= 8) return "🙂"; return "😊"
    }
    const getAverageMood = () => {
        if (moodHistory.length === 0) return 0
        return Math.round(moodHistory.reduce((sum, entry) => sum + entry.mood, 0) / moodHistory.length)
    }
    const calculateStreak = () => {
        const toIso = (dt: Date) => dt.toISOString().split("T")[0]; const dates = new Set(moodHistory.map((e) => e.date)); let streak = 0; const d = new Date(); while (dates.has(toIso(d))) { streak++; d.setDate(d.getDate() - 1) } return streak
    }
    const getQuoteOfTheDay = () => {
        const dayIndex = Math.floor(new Date().getTime() / (1000 * 60 * 60 * 24)); return MOTIVATION_QUOTES[dayIndex % MOTIVATION_QUOTES.length]
    }

    const renderCurrentPage = () => {
        switch (currentPage) {
            case "welcome": return <WelcomePage setCurrentPage={setCurrentPage} />
            case "auth": return <AuthPage authMode={authMode} setAuthMode={setAuthMode} handleAuth={handleAuth} />
            case "dashboard": return <DashboardPage todayQuiz={todayQuiz} setTodayQuiz={setTodayQuiz} quizCompleted={quizCompleted} setQuizCompleted={setQuizCompleted} handleQuizSubmit={handleQuizSubmit} moodHistory={moodHistory} getMoodEmoji={getMoodEmoji} getAverageMood={getAverageMood} calculateStreak={calculateStreak} getQuoteOfTheDay={getQuoteOfTheDay} storyLoading={storyLoading} storyData={storyData} />
            case "chat": return <ChatPage chatMessages={chatMessages} isAiTyping={isAiTyping} currentMessage={currentMessage} setCurrentMessage={setCurrentMessage} handleSendMessage={handleSendMessage} />
            case "articles": return <ArticlesPage articles={articles} categories={categories} filteredArticles={filteredArticles} selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} selectedArticle={selectedArticle} setSelectedArticle={setSelectedArticle} setCurrentPage={setCurrentPage} setShowEmergencyModal={setShowEmergencyModal} />
            case "stories": return <StoriesPage />
            case "activities": return <ActivitiesPage />
            default: return <WelcomePage setCurrentPage={setCurrentPage} />
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-100 via-green-50 to-lime-200 flex flex-col">
            <Navbar isLoggedIn={isLoggedIn} canShowAppNav={canShowAppNav} currentPage={currentPage} setCurrentPage={setCurrentPage} setIsLoggedIn={setIsLoggedIn} setShowEmergencyModal={setShowEmergencyModal} />
            <main className="flex-1">{renderCurrentPage()}</main>
            <Footer setShowEmergencyModal={setShowEmergencyModal} />
            <EmergencyModal showEmergencyModal={showEmergencyModal} setShowEmergencyModal={setShowEmergencyModal} emergencyContacts={emergencyContacts} />
            {showOnboardingQuiz && (
                <OnboardingQuizModal
                    intro={ONBOARDING_INTRO}
                    questions={QUESTIONS}
                    options={ONBOARDING_OPTIONS}
                    answers={onboardingAnswers}
                    setAnswers={setOnboardingAnswers}
                    submitting={onboardingSubmitting}
                    result={onboardingResult}
                    storyLoading={storyLoading}
                    storyData={storyData}
                    onClose={() => setShowOnboardingQuiz(false)}
                    onSubmit={async () => {
                        // Validate
                        if (onboardingAnswers.some((a) => !a)) {
                            alert('Please answer all questions before submitting.')
                            return
                        }
                        setOnboardingSubmitting(true)
                        const res = analyzeOnboardingAnswers(onboardingAnswers)
                        setOnboardingResult(res)
                        // Build scenario prompt based on category
                        let scenarioPrompt = ''
                        if (res.category === 'ab') {
                            scenarioPrompt = 'A young person walking through a gentle garden, noticing small blooms and learning simple ways to care for their inner world.'
                        } else if (res.category === 'stress') {
                            scenarioPrompt = 'A traveler caught in strong winds on a steep path, learning to take steady breaths and find shelter beneath a banyan tree.'
                        } else if (res.category === 'moodSocial') {
                            scenarioPrompt = 'Someone moving through a grey, quiet town, finding a single bright flower and a friendly nod from a passing firefly.'
                        } else {
                            scenarioPrompt = 'A wanderer carrying a heavy backpack through misty hills, pausing by a quiet stream to rest and breathe as fireflies begin to glow.'
                        }
                        try {
                            setStoryData(null)
                            setStoryLoading(true)
                            const resp = await fetch('/api/story', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ scenarioPrompt }) })
                            if (resp.ok) {
                                const data = await resp.json()
                                setStoryData({ title: data.title || 'A Gentle Story', story: data.story || '' })
                                // persist
                                const payload = { answers: onboardingAnswers, observation: res.observation, suggestions: res.suggestions, category: res.category, story: { title: data.title, story: data.story }, timestamp: Date.now() }
                                try { localStorage.setItem('knowYourselfLatest', JSON.stringify(payload)); localStorage.setItem('hasCompletedOnboarding', 'true') } catch {}
                            }
                        } catch {}
                        finally {
                            setStoryLoading(false)
                            setOnboardingSubmitting(false)
                        }
                    }}
                />
            )}
        </div>
    )
}

// --- EXTRACTED COMPONENTS ---

const Navbar = ({ isLoggedIn, canShowAppNav, currentPage, setCurrentPage, setIsLoggedIn, setShowEmergencyModal }) => (
    <nav className="fixed z-50 inset-x-0 top-3 flex justify-center animate-in fade-in slide-in-from-top-2">
        <div className="w-[95%] sm:w-[90%] md:max-w-5xl lg:max-w-6xl">
            <div className={`rounded-full px-3 sm:px-4 ${isLoggedIn ? "py-3 border border-white/30 bg-[#FDFAF6]/70 backdrop-blur-xl shadow-lg" : "py-2 bg-white"} flex items-center justify-between`}>
                <div className="flex items-center gap-2 sm:gap-3">
                    <img src="/mindspacelogo.png" alt="Mindspace" className="h-7 w-7 sm:h-8 sm:w-8 rounded-md" />
                    <span className="hidden sm:inline text-base sm:text-lg font-semibold text-[#99BC85] tracking-wide">Mindspace</span>
                </div>
                {isLoggedIn && canShowAppNav && (
                    <div className="hidden md:flex items-center gap-2 md:gap-3">
                        <Button variant={currentPage === "dashboard" ? "default" : "ghost"} onClick={() => setCurrentPage("dashboard")} className="rounded-full px-4"><Home className="h-4 w-4 mr-2" /> Dashboard</Button>
                        <Button variant={currentPage === "chat" ? "default" : "ghost"} onClick={() => setCurrentPage("chat")} className="rounded-full px-4"><MessageCircle className="h-4 w-4 mr-2" /> Chat</Button>
                        <Button variant={currentPage === "articles" ? "default" : "ghost"} onClick={() => setCurrentPage("articles")} className="rounded-full px-4"><BookOpen className="h-4 w-4 mr-2" /> Articles</Button>
                        <Button variant={currentPage === "stories" ? "default" : "ghost"} onClick={() => setCurrentPage("stories")} className="rounded-full px-4"><ScrollText className="h-4 w-4 mr-2" /> Stories</Button>
                        <Button variant={currentPage === "activities" ? "default" : "ghost"} onClick={() => setCurrentPage("activities")} className="rounded-full px-4"><Activity className="h-4 w-4 mr-2" /> Activities</Button>
                        <Button variant="ghost" className="rounded-full px-4" asChild><a href="/know-yourself"><Smile className="h-4 w-4 mr-2" /> Know Yourself</a></Button>
                    </div>
                )}
                <div className="flex items-center gap-2 sm:gap-3">
                    {isLoggedIn ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="outline-none rounded-full ring-0">
                                    <Avatar className="size-8">
                                        <AvatarImage src="/mindspacelogo.png" alt="User" />
                                        <AvatarFallback>MS</AvatarFallback>
                                    </Avatar>
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="min-w-44 bg-[#FDFAF6]/90 backdrop-blur-xl border-[#E4EFE7]">
                                <DropdownMenuLabel className="text-[#99BC85]">My Account</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => (window.location.href = "/profile")}>
                                    <User className="mr-2 h-4 w-4" /> Profile
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setCurrentPage("dashboard")}>
                                    <SettingsIcon className="mr-2 h-4 w-4" /> Settings
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => { signOut() }}>
                                    <LogOut className="mr-2 h-4 w-4" /> Logout
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <AuthButtons />
                    )}
                </div>
            </div>
        </div>
    </nav>
)

const Footer = ({ setShowEmergencyModal }) => (
    <footer className="bg-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-[#2f6a3a]">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                <div>
                    <div className="flex items-center gap-3 mb-4"><img src="/mindspacelogo.png" alt="Mindspace" className="h-7 w-7 rounded-md" /><span className="text-lg font-semibold">Mindspace</span></div>
                    <p className="text-sm opacity-90">Your safe space for mental wellness and growth.</p>
                </div>
                <div>
                    <h3 className="font-semibold mb-4">Quick Links</h3>
                    <div className="space-y-2 text-sm">
                        <button className="block hover:text-[#86A976]">Terms & Conditions</button>
                        <button className="block hover:text-[#86A976]">Privacy Policy</button>
                        <button className="block hover:text-[#86A976]">About Us</button>
                    </div>
                </div>
                <div>
                    <h3 className="font-semibold mb-4">Emergency Support</h3>
                    <Button onClick={() => setShowEmergencyModal(true)} className="bg-[#ff6b6b] hover:bg-[#e85d5d] text-white w-full flex items-center justify-center gap-2 rounded-full"><Phone className="h-4 w-4" /><span>Get Help Now</span></Button>
                </div>
            </div>
            <div className="border-t border-[#E4EFE7] mt-8 pt-8 text-center text-sm opacity-90"><p>&copy; {new Date().getFullYear()} Mindspace. All rights reserved. Made with ❤️ for mental wellness.</p></div>
        </div>
    </footer>
)

const EmergencyModal = ({ showEmergencyModal, setShowEmergencyModal, emergencyContacts }) => showEmergencyModal && (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
            <CardHeader><CardTitle className="flex items-center space-x-2 text-red-600"><AlertTriangle className="h-5 w-5" /><span>Emergency Mental Health Support</span></CardTitle><CardDescription>If you're in crisis, please reach out to these 24/7 helplines immediately.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
                {emergencyContacts.map((contact, index) => (<div key={index} className="p-3 bg-red-50 rounded-lg border border-red-200"><div className="font-semibold text-red-800">{contact.name}</div><div className="text-lg font-mono text-red-700">{contact.phone}</div><div className="text-sm text-red-600">Available: {contact.available}</div></div>))}
                <div className="flex space-x-2 pt-4"><Button onClick={() => setShowEmergencyModal(false)} variant="outline" className="flex-1">Close</Button><Button onClick={() => window.open("tel:+91-44-2464-0050")} className="flex-1 bg-red-600 hover:bg-red-700">Call Now</Button></div>
            </CardContent>
        </Card>
    </div>
)

const WelcomePage = ({ setCurrentPage }) => (
    <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-4xl mx-auto text-center">
            <div className="mb-8"><Heart className="h-20 w-20 text-green-600 mx-auto mb-6" /><h1 className="text-5xl md:text-6xl font-bold text-green-800 mb-6">Welcome to Mindspace</h1><p className="text-xl md:text-2xl text-green-700 mb-8 max-w-2xl mx-auto">Your safe, confidential space for mental wellness. Connect with AI-powered support designed specifically for Indian youth.</p></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <Card className="bg-white/40 backdrop-blur-sm border-white/50 transition-transform duration-300 hover:scale-105 hover:shadow-xl"><CardContent className="p-6 text-center"><MessageCircle className="h-12 w-12 text-green-600 mx-auto mb-4" /><h3 className="text-lg font-semibold text-green-800 mb-2">AI Companion</h3><p className="text-green-700">Chat with our empathetic AI for 24/7 support</p></CardContent></Card>
                <Card className="bg-white/40 backdrop-blur-sm border-white/50 transition-transform duration-300 hover:scale-105 hover:shadow-xl"><CardContent className="p-6 text-center"><Heart className="h-12 w-12 text-green-600 mx-auto mb-4" /><h3 className="text-lg font-semibold text-green-800 mb-2">Mood Tracking</h3><p className="text-green-700">Monitor your emotional journey with daily check-ins</p></CardContent></Card>
                <Card className="bg-white/40 backdrop-blur-sm border-white/50 transition-transform duration-300 hover:scale-105 hover:shadow-xl"><CardContent className="p-6 text-center"><BookOpen className="h-12 w-12 text-green-600 mx-auto mb-4" /><h3 className="text-lg font-semibold text-green-800 mb-2">Wellness Articles</h3><p className="text-green-700">Access curated content for mental health awareness</p></CardContent></Card>
            </div>
            <Button onClick={() => signIn('google')} size="lg" className="bg-[#99BC85] hover:bg-[#86A976] text-white px-8 py-4 text-lg rounded-full shadow-md">Get Started with Google</Button>
        </div>
    </div>
)

const AuthPage = ({ authMode, setAuthMode, handleAuth }) => (
    <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="w-full max-w-md bg-white/30 backdrop-blur-sm border-white/50">
            <CardHeader className="text-center"><CardTitle className="text-2xl text-green-800">{authMode === "signin" ? "Welcome Back" : "Join Mindspace"}</CardTitle><CardDescription>{authMode === "signin" ? "Sign in to continue your wellness journey" : "Create your account to get started"}</CardDescription></CardHeader>
            <CardContent>
                <form onSubmit={handleAuth} className="space-y-4">
                    <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" placeholder="your@email.com" required /></div>
                    <div className="space-y-2"><Label htmlFor="password">Password</Label><Input id="password" type="password" placeholder="••••••••" required /></div>
                    {authMode === "signup" && (<div className="space-y-2"><Label htmlFor="confirmPassword">Confirm Password</Label><Input id="confirmPassword" type="password" placeholder="••••••••" required /></div>)}
                    <Button type="submit" className="w-full bg-[#99BC85] hover:bg-[#86A976] rounded-full">{authMode === "signin" ? "Sign In" : "Create Account"}</Button>
                </form>
                <div className="mt-4 text-center"><button onClick={() => setAuthMode(authMode === "signin" ? "signup" : "signin")} className="text-green-600 hover:text-green-700 text-sm">{authMode === "signin" ? "Don't have an account? Sign up" : "Already have an account? Sign in"}</button></div>
            </CardContent>
        </Card>
    </div>
)

const DashboardPage = ({ todayQuiz, setTodayQuiz, quizCompleted, setQuizCompleted, handleQuizSubmit, moodHistory, getMoodEmoji, getAverageMood, calculateStreak, getQuoteOfTheDay, storyLoading, storyData }) => (
    <div className="pt-20 pb-8 px-4 max-w-6xl mx-auto">
        <div className="mb-8"><h1 className="text-3xl font-bold text-green-800 mb-2">Your Wellness Dashboard</h1><p className="text-green-600">Track your mental wellness journey and daily progress</p></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <Card className="lg:col-span-2 bg-white/30 backdrop-blur-sm border-white/50">
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2"><Smile className="h-5 w-5 text-green-600" /><span>Daily Check-in</span></CardTitle><CardDescription>{quizCompleted ? "Great job! You've completed today's check-in." : "How are you feeling today?"}</CardDescription>
                    <div className="mt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 text-orange-700 px-3 py-1 text-xs font-medium border border-orange-200 w-fit"><Flame className="h-4 w-4 text-orange-600" /><span>{calculateStreak()} day{calculateStreak() === 1 ? "" : "s"} streak</span></div>
                        <div className="flex items-start gap-2 text-sm text-green-800 bg-green-50 border border-green-200 rounded-md p-2"><Quote className="h-4 w-4 text-green-600 mt-0.5" /><span>{getQuoteOfTheDay()}</span></div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {!quizCompleted ? (<>
                        <div className="space-y-4">
                            <div><Label className="text-sm font-medium mb-2 block">Mood: {getMoodEmoji(todayQuiz.mood)} ({todayQuiz.mood}/10)</Label><RatingCircles value={todayQuiz.mood} onChange={(val) => setTodayQuiz((prev) => ({ ...prev, mood: val }))} max={10} min={1} /></div>
                            <div><Label className="text-sm font-medium mb-2 block">Energy Level: ({todayQuiz.energy}/10)</Label><RatingCircles value={todayQuiz.energy} onChange={(val) => setTodayQuiz((prev) => ({ ...prev, energy: val }))} max={10} min={1} /></div>
                            <div><Label className="text-sm font-medium mb-2 block">Stress Level: ({todayQuiz.stress}/10)</Label><RatingCircles value={todayQuiz.stress} onChange={(val) => setTodayQuiz((prev) => ({ ...prev, stress: val }))} max={10} min={1} /></div>
                            <div><Label htmlFor="gratitude" className="text-sm font-medium mb-2 block">What are you grateful for today?</Label><Input id="gratitude" value={todayQuiz.gratitude} onChange={(e) => setTodayQuiz((prev) => ({ ...prev, gratitude: e.target.value }))} placeholder="Something you're thankful for..." autoComplete="off" enterKeyHint="done" /></div>
                            <div><Label htmlFor="challenge" className="text-sm font-medium mb-2 block">What's your biggest challenge today?</Label><Input id="challenge" value={todayQuiz.challenge} onChange={(e) => setTodayQuiz((prev) => ({ ...prev, challenge: e.target.value }))} placeholder="Something you're working through..." /></div>
                        </div>
                        <Button onClick={handleQuizSubmit} className="w-full bg-[#99BC85] hover:bg-[#86A976] rounded-full">Complete Check-in</Button>
                    </>) : (
                        <div className="text-center py-8"><div className="text-4xl mb-4">{getMoodEmoji(todayQuiz.mood)}</div><p className="text-green-700 mb-4">Check-in completed for today!</p><Button onClick={() => setQuizCompleted(false)} variant="outline" className="border-green-300 text-green-700 hover:bg-green-50">Update Check-in</Button></div>
                    )}
                </CardContent>
            </Card>
            <Card className="bg-white/30 backdrop-blur-sm border-white/50">
                <CardHeader><CardTitle className="flex items-center space-x-2"><TrendingUp className="h-5 w-5 text-green-600" /><span>Mood Summary</span></CardTitle></CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="text-center"><div className="text-3xl mb-2">{getMoodEmoji(getAverageMood())}</div><p className="text-sm text-green-600">Average Mood</p><p className="text-2xl font-bold text-green-800">{getAverageMood()}/10</p></div>
                        <div className="space-y-2"><div className="flex justify-between text-sm"><span className="text-green-600">Total Entries:</span><span className="font-medium">{moodHistory.length}</span></div><div className="flex justify-between text-sm"><span className="text-green-600">This Week:</span><span className="font-medium">3 days</span></div></div>
                    </div>
                </CardContent>
            </Card>
        </div>
        <Card className="bg-white/30 backdrop-blur-sm border-white/50">
            <CardHeader><CardTitle className="flex items-center space-x-2"><Calendar className="h-5 w-5 text-green-600" /><span>Mood History</span></CardTitle><CardDescription>Your wellness journey over time</CardDescription></CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {moodHistory.slice(-7).reverse().map((entry) => (<div key={entry.date} className="flex items-center justify-between p-3 bg-white/20 rounded-lg"><div className="flex items-center space-x-3"><div className="text-2xl">{getMoodEmoji(entry.mood)}</div><div><p className="font-medium text-green-800">{new Date(entry.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</p><p className="text-sm text-green-600">{entry.notes}</p></div></div><div className="text-right"><p className="text-lg font-bold text-green-800">{entry.mood}/10</p><p className="text-xs text-green-600">Energy: {entry.energy} | Stress: {entry.stress}</p></div></div>))}
                </div>
            </CardContent>
        </Card>
        {quizCompleted && (
            <Card className="mt-6 bg-white/30 backdrop-blur-sm border-white/50">
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2"><ScrollText className="h-5 w-5 text-green-600" /><span>Your Gentle Story</span></CardTitle>
                    <CardDescription>Created for you based on today’s check-in</CardDescription>
                </CardHeader>
                <CardContent>
                    {storyLoading ? (
                        <div className="text-sm text-green-700">Generating your story...</div>
                    ) : storyData ? (
                        <div>
                            <h3 className="text-lg font-semibold text-green-800 mb-2">{storyData.title}</h3>
                            <p className="text-green-700 leading-relaxed whitespace-pre-wrap">{storyData.story}</p>
                        </div>
                    ) : (
                        <div className="text-sm text-green-700">Your story will appear here after you complete the check-in.</div>
                    )}
                </CardContent>
            </Card>
        )}
    </div>
)

const ChatPage = ({ chatMessages, isAiTyping, currentMessage, setCurrentMessage, handleSendMessage }) => (
    <div className="pt-20 pb-8 px-4 max-w-4xl mx-auto h-screen flex flex-col">
        <div className="mb-6"><h1 className="text-3xl font-bold text-green-800 mb-2">AI Wellness Companion</h1><p className="text-green-600">Your safe space to share thoughts and feelings</p></div>
        <Card className="flex-1 bg-white/30 backdrop-blur-sm border-white/50 flex flex-col">
            <CardContent className="flex-1 p-4 overflow-y-auto">
                <div className="space-y-4">
                    {chatMessages.map((message) => (<div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}><div className={`max-w-[80%] p-3 rounded-lg ${message.sender === "user" ? "bg-[#99BC85] text-white" : "bg-white/50 text-green-800 border border-green-200"}`}><p className="text-sm leading-relaxed">{message.content}</p><p className={`text-xs mt-1 ${message.sender === "user" ? "text-green-100" : "text-green-500"}`}>{message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p></div></div>))}
                    {isAiTyping && (<div className="flex justify-start"><div className="bg-white/50 text-green-800 border border-green-200 p-3 rounded-lg"><div className="flex space-x-1"><div className="w-2 h-2 bg-[#99BC85] rounded-full animate-bounce"></div><div className="w-2 h-2 bg-[#99BC85] rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div><div className="w-2 h-2 bg-[#99BC85] rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div></div></div></div>)}
                </div>
            </CardContent>
            <div className="p-4 border-t border-white/30">
                <div className="flex space-x-2">
                    <Input value={currentMessage} onChange={(e) => setCurrentMessage(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }}} placeholder="Share your thoughts and feelings..." className="flex-1 bg-white/50 border-green-200 focus:border-green-400" />
                    <Button onClick={handleSendMessage} disabled={!currentMessage.trim() || isAiTyping} className="bg-[#99BC85] hover:bg-[#86A976] px-6 rounded-full"><MessageCircle className="h-4 w-4" /></Button>
                </div>
                <p className="text-xs text-green-600 mt-2">Press Enter to send • This is a safe, confidential space</p>
            </div>
        </Card>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
            <Button variant="outline" size="sm" onClick={() => setCurrentMessage("I'm feeling anxious today")} className="text-green-700 border-green-300 hover:bg-green-50">Feeling Anxious</Button>
            <Button variant="outline" size="sm" onClick={() => setCurrentMessage("I need someone to talk to")} className="text-green-700 border-green-300 hover:bg-green-50">Need Support</Button>
            <Button variant="outline" size="sm" onClick={() => setCurrentMessage("I'm having trouble sleeping")} className="text-green-700 border-green-300 hover:bg-green-50">Sleep Issues</Button>
            <Button variant="outline" size="sm" onClick={() => setCurrentMessage("I want to practice mindfulness")} className="text-green-700 border-green-300 hover:bg-green-50">Mindfulness</Button>
        </div>
    </div>
)

const ArticlesPage = ({ articles, categories, filteredArticles, selectedCategory, setSelectedCategory, selectedArticle, setSelectedArticle, setCurrentPage, setShowEmergencyModal }) => (
    <div className="pt-20 pb-8 px-4 max-w-6xl mx-auto">
        <div className="mb-8"><h1 className="text-3xl font-bold text-green-800 mb-2">Wellness Articles</h1><p className="text-green-600">Explore curated content for mental health awareness and personal growth</p></div>
        {selectedArticle && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div><CardTitle className="text-xl text-green-800 mb-2">{selectedArticle.title}</CardTitle><div className="flex items-center space-x-4 text-sm text-green-600"><span>{selectedArticle.category}</span><span>•</span><span>{selectedArticle.readTime}</span><span>•</span><span>By {selectedArticle.author}</span></div></div>
                            <Button variant="ghost" size="sm" onClick={() => setSelectedArticle(null)} className="text-green-600 hover:text-green-800">✕</Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-green-700 leading-relaxed">{selectedArticle.content}</p>
                        <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200"><p className="text-sm text-green-800 font-medium mb-2">Need Support?</p><p className="text-sm text-green-700">If this article resonates with you and you need someone to talk to, our AI companion is available 24/7 in the Chat section.</p><Button onClick={() => { setSelectedArticle(null); setCurrentPage("chat"); }} size="sm" className="mt-2 bg-[#99BC85] hover:bg-[#86A976]">Start Chat</Button></div>
                    </CardContent>
                </Card>
            </div>
        )}
        <div className="mb-6"><div className="flex flex-wrap gap-2">{categories.map((category) => (<Button key={category} variant={selectedCategory === category ? "default" : "outline"} size="sm" onClick={() => setSelectedCategory(category)} className={selectedCategory === category ? "bg-[#99BC85] hover:bg-[#86A976] rounded-full" : "border-[#C5DBC9] text-[#49624a] hover:bg-[#E4EFE7] rounded-full"}>{category}</Button>))}</div></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((article) => (<Card key={article.id} className="bg-white/30 backdrop-blur-sm border-white/50 hover:bg-white/40 transition-all duration-200"><CardHeader><div className="flex items-center justify-between mb-2"><span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">{article.category}</span><span className="text-xs text-green-500">{article.readTime}</span></div><CardTitle className="text-lg text-green-800 leading-tight">{article.title}</CardTitle></CardHeader><CardContent><CardDescription className="text-green-700 mb-4 leading-relaxed">{article.description}</CardDescription><div className="flex items-center justify-between"><span className="text-xs text-green-600">By {article.author}</span><Button onClick={() => setSelectedArticle(article)} size="sm" className="bg-[#99BC85] hover:bg-[#86A976] shadow-sm hover:shadow-md transition-shadow rounded-full">Read More</Button></div></CardContent></Card>))}
        </div>
        <div className="mt-12">
            <h2 className="text-2xl font-bold text-green-800 mb-6">Featured Resources</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white"><CardContent className="p-6"><h3 className="text-xl font-bold mb-2">Crisis Support</h3><p className="mb-4 text-green-100">If you're experiencing a mental health crisis, immediate help is available.</p><Button onClick={() => setShowEmergencyModal(true)} variant="secondary" className="bg-white text-green-600 hover:bg-green-50">Get Help Now</Button></CardContent></Card>
                <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white"><CardContent className="p-6"><h3 className="text-xl font-bold mb-2">AI Companion</h3><p className="mb-4 text-blue-100">Need someone to talk to? Our AI companion is here to listen and support you.</p><Button onClick={() => setCurrentPage("chat")} variant="secondary" className="bg-white text-blue-600 hover:bg-blue-50">Start Conversation</Button></CardContent></Card>
            </div>
        </div>
        <Card className="mt-8 bg-white/30 backdrop-blur-sm border-white/50">
            <CardContent className="p-6 text-center">
                <h3 className="text-xl font-bold text-green-800 mb-2">Stay Updated</h3><p className="text-green-700 mb-4">Get the latest mental wellness articles and resources delivered to your inbox.</p>
                <div className="flex max-w-md mx-auto space-x-2"><Input placeholder="Enter your email" className="bg-white/50 border-green-200 focus:border-green-400" /><Button className="bg-[#99BC85] hover:bg-[#86A976] rounded-full">Subscribe</Button></div>
                <p className="text-xs text-green-600 mt-2">We respect your privacy. Unsubscribe at any time.</p>
            </CardContent>
        </Card>
    </div>
)

const StoriesPage = () => (
    <div className="pt-20 pb-8 px-4 max-w-6xl mx-auto">
        <div className="mb-8"><h1 className="text-3xl font-bold text-green-800 mb-2">Stories</h1><p className="text-green-600">AI-generated stories inspired by common feelings and symptoms</p></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (<Card key={i} className="bg-white/30 backdrop-blur-sm border-white/50 hover:shadow-md transition-shadow"><CardHeader><CardTitle className="text-lg text-green-800">A New Morning, A New Chance</CardTitle><CardDescription className="text-green-700">Hope after a restless night</CardDescription></CardHeader><CardContent><p className="text-sm text-green-700 leading-relaxed">The sun rose softly as Mira sat by the window, her thoughts heavy yet curious. A gentle breath in, a pause, and a breath out. She wasn t trying to fix everything today—just to notice the small moments that still felt kind.</p></CardContent></Card>))}
        </div>
        <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">Upcoming: Stories will adapt to your quiz responses to reflect your current mood and symptoms.</div>
    </div>
)

const ActivitiesPage = () => (
    <div className="pt-20 pb-8 px-4 max-w-6xl mx-auto">
        <div className="mb-8"><h1 className="text-3xl font-bold text-green-800 mb-2">Activities</h1><p className="text-green-600">Mindful exercises and fun challenges to relax and recharge</p></div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white/30 backdrop-blur-sm border-white/50">
                <CardHeader><CardTitle className="text-green-800">Breathing Meditation</CardTitle><CardDescription className="text-green-700">Follow the blue water as you breathe in and out</CardDescription></CardHeader>
                <CardContent><BreathingMeditation /></CardContent>
            </Card>
            <Card className="bg-white/30 backdrop-blur-sm border-white/50">
                <CardHeader><CardTitle className="text-green-800">Brain Teasers</CardTitle><CardDescription className="text-green-700">Short puzzles to shift focus and spark joy</CardDescription></CardHeader>
                <CardContent>
                    <ul className="list-disc pl-5 space-y-2 text-green-800"><li>Word Ladder: Change CALM to PEACE in 4 steps.</li><li>Riddle: What has many keys but can t open a door?</li><li>Observation: Find 5 green objects around you.</li></ul>
                    <p className="text-xs text-green-600 mt-3">Tip: Keep it light—these are for gentle engagement, not pressure.</p>
                </CardContent>
            </Card>
        </div>
    </div>
)

// --- ONBOARDING ANALYSIS & MODAL ---
function analyzeOnboardingAnswers(answers: string[]): { observation: string; suggestions: string[]; category: 'ab' | 'stress' | 'moodSocial' | 'widespread' } {
    const sectionByIndex: ('mood' | 'stress' | 'energy' | 'social')[] = ['mood','mood','mood','stress','stress','stress','energy','energy','energy','social','social','social']
    const counts = { mood: 0, stress: 0, energy: 0, social: 0 }
    let totalCD = 0
    answers.forEach((a, i) => {
        const isCD = a === 'C' || a === 'D'
        if (isCD) { totalCD++; const sec = sectionByIndex[i]; (counts as any)[sec]++ }
    })
    // Mostly A/B
    if (totalCD <= 3) {
        return {
            category: 'ab',
            observation: "Thank you for sharing. It seems like you're navigating life's ups and downs, and it’s great that you’re taking time to check in with yourself. Building emotional awareness is a powerful skill.",
            suggestions: [
                'Explore: Discover articles on building resilience and mindfulness.',
                'Journal: Try our daily gratitude journal to focus on the positives.',
                'Mood Tracker: Keep track of your mood to notice patterns over time.',
            ],
        }
    }
    // Stress concentrated (Q4-6)
    const stressConcentrated = counts.stress >= 2 && counts.stress >= counts.mood && counts.stress >= counts.energy && counts.stress >= counts.social
    if (stressConcentrated) {
        return {
            category: 'stress',
            observation: "It sounds like you might be under a lot of pressure right now. Juggling many expectations is tough, and feeling overwhelmed is a very normal response. Remember to be kind to yourself.",
            suggestions: [
                'Stress Management Tools: Explore guided breathing exercises and meditation to find some calm.',
                'Time Management Guides: Check out resources on managing your workload effectively.',
                'AI Companion Chat: Share your worries—our AI companion listens without judgment.',
            ],
        }
    }
    // Mood & Social concentrated (Q1-3, 10-11)
    const moodSocialCD = answers.map((a, i) => ({ a, i })).filter(({ a, i }) => (a === 'C' || a === 'D') && ([0,1,2,9,10].includes(i))).length
    const moodCD = counts.mood
    const socialCD = counts.social
    const moodSocialConcentrated = moodSocialCD >= 2 && moodCD >= 1 && socialCD >= 1
    if (moodSocialConcentrated) {
        return {
            category: 'moodSocial',
            observation: "It seems like things might be feeling a bit heavy and lonely lately. It takes courage to acknowledge these feelings. Please know that you are not alone, and many people go through similar experiences.",
            suggestions: [
                'AI Companion for Emotional Support: Talk through what’s on your mind with our empathetic AI.',
                'Positive Affirmations: Start your day with gentle, self-compassionate affirmations.',
                'Connect with a Professional: If these feelings continue, consider speaking with a wellness professional.',
            ],
        }
    }
    // Widespread across sections incl. energy
    const multiSections = [counts.mood, counts.stress, counts.energy, counts.social].filter((c) => c >= 2).length >= 2
    if (counts.energy >= 1 && (multiSections || totalCD >= 6)) {
        return {
            category: 'widespread',
            observation: "Thank you for being so honest. It seems like you’re going through a particularly challenging time that might be affecting many parts of your life. It’s brave of you to share this, and we want you to know that support is available.",
            suggestions: [
                'Immediate Support: Here are 24/7 confidential helplines you can connect with right now (see Emergency section).',
                'Urgent AI Chat: Our AI companion is ready to listen if you need to talk immediately.',
                'Connect with a Professional: We strongly encourage connecting with a mental health professional for guidance.',
            ],
        }
    }
    // Default to stress as common case
    return {
        category: 'stress',
        observation: "It sounds like you might be under a lot of pressure right now. Juggling many expectations is tough, and feeling overwhelmed is a very normal response.",
        suggestions: [
            'Stress Management Tools: Explore guided breathing exercises and meditation to find some calm.',
            'Time Management Guides: Check out resources on managing your workload effectively.',
            'AI Companion Chat: Share your worries—our AI companion listens without judgment.',
        ],
    }
}

function OnboardingQuizModal({ intro, questions, options, answers, setAnswers, submitting, result, storyLoading, storyData, onClose, onSubmit }) {
    return (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <CardHeader>
                    <CardTitle className="text-green-800">Mental Wellness Check-in</CardTitle>
                    <CardDescription>Welcome! This is a safe and private space. Be honest—there are no right or wrong answers.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="text-sm text-green-800 bg-green-50 border border-green-200 p-3 rounded-md">{intro}</div>
                    <div className="space-y-4">
                        {questions.map((q, idx) => (
                            <div key={idx} className="p-3 rounded-lg bg-white/50 border border-green-200">
                                <div className="text-sm text-green-900 mb-2">{idx + 1}. {q.text}</div>
                                <div className="flex flex-wrap gap-2">
                                    {options.map((opt) => (
                                        <Button key={opt.key} type="button" variant={answers[idx] === opt.key ? 'default' : 'outline'} className={`rounded-full ${answers[idx] === opt.key ? 'bg-[#99BC85] hover:bg-[#86A976] text-white' : ''}`} onClick={() => {
                                            const next = [...answers]; next[idx] = opt.key; setAnswers(next)
                                        }}>{opt.key}) {opt.label}</Button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                    {result && (
                        <div className="space-y-3 p-3 bg-white/70 border border-green-200 rounded-md">
                            <div className="font-semibold text-green-900">Our gentle observation</div>
                            <div className="text-green-800 text-sm">{result.observation}</div>
                            <ul className="list-disc pl-5 text-sm text-green-800">
                                {result.suggestions.map((s, i) => (<li key={i}>{s}</li>))}
                            </ul>
                        </div>
                    )}
                    <div className="flex items-center gap-2">
                        <Button onClick={onSubmit} disabled={submitting} className="rounded-full bg-[#99BC85] hover:bg-[#86A976]">{submitting ? 'Submitting...' : 'Submit Check-in'}</Button>
                        <Button onClick={onClose} variant="outline" className="rounded-full">{result ? 'Close' : 'Skip for now'}</Button>
                    </div>
                    {(storyLoading || storyData) && (
                        <div className="mt-2 p-3 bg-white/80 border border-green-200 rounded-md">
                            {storyLoading ? (
                                <div className="text-sm text-green-700">Generating your story...</div>
                            ) : storyData ? (
                                <div>
                                    <h3 className="text-lg font-semibold text-green-800 mb-2">{storyData.title}</h3>
                                    <p className="text-green-700 leading-relaxed whitespace-pre-wrap">{storyData.story}</p>
                                </div>
                            ) : null}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
