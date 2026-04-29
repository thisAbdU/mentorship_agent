"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Check, X, ExternalLink, Copy, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

export default function SettingsPage() {
  const [copied, setCopied] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  // Telegram state
  const [telegramUser, setTelegramUser] = useState<{ username: string } | null>(null)
  const [telegramConnected, setTelegramConnected] = useState<boolean | null>(null)

  // GitHub state
  const [githubUser, setGithubUser] = useState<{ username: string; avatar_url: string } | null>(null)
  const [githubConnected, setGithubConnected] = useState<boolean | null>(null)

  // Google Sheets state
  const [googleConnected, setGoogleConnected] = useState<boolean | null>(null)
  const [files, setFiles] = useState<{ id: string; name: string }[]>([])
  const [selectedFileId, setSelectedFileId] = useState<string>('')
  const [tabs, setTabs] = useState<string[]>([])
  const [selectedTab, setSelectedTab] = useState<string>('')
  const [students, setStudents] = useState<any[]>([])
  const [loadingGoogle, setLoadingGoogle] = useState(false)
  const [loadingGithub, setLoadingGithub] = useState(false)
  const [repoName, setRepoName] = useState('mentorship-project')

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  // Check which environment variables are configured
  const integrations = {
    telegram: {
      configured: typeof process !== "undefined" && !!process.env.NEXT_PUBLIC_TELEGRAM_CONFIGURED,
      envVars: ["TELEGRAM_BOT_TOKEN"],
    },
  }

  const webhookBaseUrl = mounted && typeof window !== "undefined" ? window.location.origin : "https://your-domain.com"

  useEffect(() => {
    setMounted(true)
    checkConnectionStatus()
  }, [])

  // Check if we just returned from OAuth callback
  useEffect(() => {
    if (mounted && typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const hasCode = urlParams.has('code')
      
      if (hasCode) {
        // Clear the URL params
        window.history.replaceState({}, document.title, window.location.pathname)
        // Refresh connection status after OAuth callback
        setTimeout(() => checkConnectionStatus(), 1000)
      }
    }
  }, [mounted])

  const checkConnectionStatus = () => {
    // Check Google Auth Status
    fetch('/api/google/files')
      .then(res => res.json())
      .then(data => {
        if (data.error === 'authentication_required' || data.error === 'not_configured') {
          setGoogleConnected(false)
        } else if (data.files && data.files.length > 0) {
          setGoogleConnected(true)
          setFiles(data.files)
        } else {
          setGoogleConnected(false)
        }
      })
      .catch(() => setGoogleConnected(false))

    // Check GitHub Auth Status
    fetch('/api/github/user')
      .then(res => res.json())
      .then(data => {
        if (data.connected) {
          setGithubConnected(true)
          setGithubUser({ username: data.username, avatar_url: data.avatar_url })
        } else {
          setGithubConnected(false)
        }
      })
      .catch(() => setGithubConnected(false))

    // Check Telegram Status
    fetch('/api/telegram/status')
      .then(res => res.json())
      .then(data => {
        if (data.connected) {
          setTelegramConnected(true)
          setTelegramUser({ username: data.username })
        } else {
          setTelegramConnected(false)
        }
      })
      .catch(() => setTelegramConnected(false))
  }

  const handleGoogleConnect = () => {
    window.location.href = '/api/google/auth'
  }

  const handleGithubConnect = () => {
    window.location.href = '/api/github/auth'
  }

  const handleFileChange = async (fileId: string) => {
    setSelectedFileId(fileId)
    setSelectedTab('')
    setTabs([])
    
    try {
      const res = await fetch(`/api/google/tabs?fileId=${fileId}`)
      const data = await res.json()
      if (data.tabs) setTabs(data.tabs)
    } catch (e) {
      console.error(e)
    }
  }

  const handleGoogleSync = async () => {
    if (!selectedFileId || !selectedTab) return
    setLoadingGoogle(true)
    try {
      const res = await fetch('/api/google/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileId: selectedFileId, tabName: selectedTab }),
      })
      const data = await res.json()
      if (data.students) setStudents(data.students)
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingGoogle(false)
    }
  }

  const handleGithubSync = async () => {
    if (students.length === 0 || !repoName) return
    setLoadingGithub(true)
    try {
      const res = await fetch('/api/github/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ students, repoName }),
      })
      const data = await res.json()
      if (data.students) setStudents(data.students)
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingGithub(false)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted/50 transition-colors">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Integration Settings</h1>
            <p className="text-muted-foreground mt-1">
              Configure Telegram, GitHub, and Google Sheets connections smoothly.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Telegram Integration */}
          <Card className="border-border/60 hover:shadow-md transition-shadow duration-300">
            <CardHeader className="bg-muted/10 border-b border-border/40">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#0088cc]/20 to-[#0088cc]/5 border border-[#0088cc]/20 flex items-center justify-center">
                    <svg className="h-5 w-5 text-[#0088cc]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
                    </svg>
                  </div>
                  <div>
                    <CardTitle className="text-lg">Telegram Bot</CardTitle>
                    <CardDescription>{telegramUser ? `Active as @${telegramUser.username}` : "Receive student updates and send feedback"}</CardDescription>
                  </div>
                </div>
                <Badge variant={telegramConnected ? "default" : "secondary"}>
                  {telegramConnected === null ? "Checking..." : telegramConnected ? (
                    <><Check className="h-3 w-3 mr-1" /> Ready</>
                  ) : (
                    <><X className="h-3 w-3 mr-1" /> Not Configured</>
                  )}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              {!telegramConnected ? (
                <div className="space-y-4">
                  <div className="bg-secondary/30 rounded-xl p-6 border border-border/50">
                    <h4 className="font-semibold text-sm mb-3">Quick Setup</h4>
                    <ol className="list-decimal list-inside space-y-2 text-xs text-muted-foreground">
                       <li>Message <code className="bg-secondary px-1.5 py-0.5 rounded text-foreground font-mono">@BotFather</code> on Telegram</li>
                       <li>Use <code className="bg-secondary px-1.5 py-0.5 rounded text-foreground font-mono">/newbot</code> to create yours</li>
                       <li>Paste the **Token** into your <code className="bg-secondary px-1.5 py-0.5 rounded text-foreground font-mono">.env.local</code> as <code className="text-foreground">TELEGRAM_BOT_TOKEN</code></li>
                    </ol>
                  </div>
                  <div className="flex justify-center text-xs text-muted-foreground animate-pulse">
                     Refresh page after adding token to verify.
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Active Webhook</h4>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 bg-secondary px-3 py-2 rounded text-sm truncate">
                        {webhookBaseUrl}/api/webhooks/telegram
                      </code>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(`${webhookBaseUrl}/api/webhooks/telegram`, "telegram")}
                      >
                        {copied === "telegram" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400 font-medium bg-green-500/5 p-3 rounded-lg border border-green-500/10">
                    <Check className="h-3 w-3" />
                    Your bot is online and ready to receive group updates.
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* GitHub Integration */}
          <Card className="border-border/60 hover:shadow-md transition-shadow duration-300">
            <CardHeader className="bg-muted/10 border-b border-border/40">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-foreground/10 flex items-center justify-center overflow-hidden">
                    {githubUser?.avatar_url ? (
                      <img src={githubUser.avatar_url} alt="GitHub Avatar" className="h-full w-full object-cover" />
                    ) : (
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                      </svg>
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-lg">GitHub Ecosystem</CardTitle>
                    <CardDescription>{githubUser ? `Connected as @${githubUser.username}` : "Track commits and analyze code quality"}</CardDescription>
                  </div>
                </div>
                <Badge variant={githubConnected ? "default" : "secondary"}>
                  {githubConnected === null ? "Checking..." : githubConnected ? (
                    <><Check className="h-3 w-3 mr-1" /> Connected</>
                  ) : (
                    <><X className="h-3 w-3 mr-1" /> Not Connected</>
                  )}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              {!githubConnected ? (
                <div className="bg-muted/20 border border-dashed border-border rounded-xl p-6 text-center space-y-4">
                  <p className="text-sm text-muted-foreground">Authenticate with GitHub to enable real-time commit tracking and repository analysis.</p>
                  <Button onClick={handleGithubConnect} className="w-full sm:w-auto">
                    Connect with GitHub
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                   <div>
                    <h4 className="font-medium mb-2">Webhook URL (for student repos)</h4>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 bg-secondary px-3 py-2 rounded text-sm truncate">
                        {webhookBaseUrl}/api/webhooks/github
                      </code>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(`${webhookBaseUrl}/api/webhooks/github`, "github")}
                      >
                        {copied === "github" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                    <div className="space-y-4 w-full">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Tracking Repository Name</label>
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            value={repoName} 
                            onChange={(e) => setRepoName(e.target.value)}
                            placeholder="e.g. mentorship-delivery"
                            className="flex-1 bg-secondary/50 px-3 py-2 rounded text-sm border border-border"
                          />
                          <Button 
                            variant="default" 
                            size="sm" 
                            onClick={handleGithubSync}
                            disabled={loadingGithub || students.length === 0}
                          >
                            {loadingGithub ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Check Repos"}
                          </Button>
                        </div>
                        <p className="text-[10px] text-muted-foreground whitespace-nowrap">
                          {students.length === 0 ? "⚠️ Sync Google Sheets first to get student list" : "Scans students' profiles for this repo name"}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild className="hover:bg-muted/50">
                          <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Manage Permissions
                          </a>
                        </Button>
                      </div>
                    </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Interactive Google Sheets Integration */}
          <Card className="border-border/60 overflow-hidden relative shadow-md">
            {/* Background decorative blob */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />
            
            <CardHeader className="bg-muted/5 border-b border-border/30 relative z-10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-green-500/20 to-green-500/5 border border-green-500/20 flex items-center justify-center shadow-inner">
                    <svg className="h-5 w-5 text-green-600 dark:text-green-400" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/>
                      <path d="M7 12h2v5H7zm4-3h2v8h-2zm4-3h2v11h-2z"/>
                    </svg>
                  </div>
                  <div>
                    <CardTitle className="text-lg">Google Sheets Engine</CardTitle>
                    <CardDescription>Live sync your dynamic student data</CardDescription>
                  </div>
                </div>
                
                {googleConnected === null ? (
                  <Badge variant="outline" className="animate-pulse">Checking...</Badge>
                ) : googleConnected === true ? (
                  <Badge className="bg-green-500/15 text-green-700 dark:text-green-400 hover:bg-green-500/25 border-0 shadow-none font-semibold gap-1.5 px-3 py-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    Securely Connected
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="border-dashed gap-1">
                    <X className="h-3 w-3" /> Not Connected
                  </Badge>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-6 pt-6 relative z-10">
              {googleConnected === false && (
                 <div className="bg-gradient-to-r from-background to-muted/30 border border-border/50 rounded-2xl p-8 text-center space-y-5">
                   <div className="max-w-md mx-auto space-y-2">
                     <h4 className="text-xl font-semibold text-foreground">Link your Workspace</h4>
                     <p className="text-sm text-muted-foreground leading-relaxed">
                       Connect your Google account to securely explore your Drive. Choose the Spreadsheet and Worksheet housing your student records.
                     </p>
                   </div>
                   <Button onClick={handleGoogleConnect} className="bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] h-11 px-8">
                     Connect with Google
                   </Button>
                 </div>
              )}

              {googleConnected === true && (
                <div className="space-y-6">
                  <div className="grid gap-6 sm:grid-cols-2">
                     <div className="space-y-2.5">
                       <label className="text-sm font-semibold flex items-center gap-2">
                         <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary text-xs">1</span> 
                         Select Spreadsheet
                       </label>
                       <Select onValueChange={handleFileChange} value={selectedFileId}>
                          <SelectTrigger className="w-full bg-background/50 h-10 transition-colors hover:bg-muted/30">
                            <SelectValue placeholder="Browse Drive files..." />
                          </SelectTrigger>
                          <SelectContent>
                            {files.map(file => <SelectItem key={file.id} value={file.id}>{file.name}</SelectItem>)}
                            {files.length === 0 && <SelectItem value="disabled" disabled>No Spreadsheets Found</SelectItem>}
                          </SelectContent>
                        </Select>
                     </div>
                     
                     <div className={cn("space-y-2.5 transition-all duration-500", tabs.length > 0 ? "opacity-100 translate-y-0" : "opacity-40 translate-y-2 pointer-events-none")}>
                       <label className="text-sm font-semibold flex items-center gap-2">
                         <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary text-xs">2</span> 
                         Select Worksheet Tab
                       </label>
                       <Select onValueChange={setSelectedTab} value={selectedTab} disabled={tabs.length === 0}>
                          <SelectTrigger className="w-full bg-background/50 h-10 transition-colors hover:bg-muted/30">
                            <SelectValue placeholder="Choose a tabular view..." />
                          </SelectTrigger>
                          <SelectContent>
                            {tabs.map(tab => <SelectItem key={tab} value={tab}>{tab}</SelectItem>)}
                          </SelectContent>
                        </Select>
                     </div>
                  </div>

                  {selectedTab && (
                    <div className="pt-2 flex justify-end">
                      <Button 
                         onClick={handleGoogleSync} 
                         disabled={loadingGoogle}
                         className="bg-foreground text-background hover:bg-foreground/90 shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
                      >
                         {loadingGoogle ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : null}
                         {loadingGoogle ? "Analyzing Data..." : "Run Sync & Map"}
                      </Button>
                    </div>
                  )}

                  {students.length > 0 && (
                    <div className="mt-8 rounded-xl border border-border overflow-hidden relative shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                       {/* Subtle left border accent */}
                       <div className="absolute top-0 left-0 w-1 bg-gradient-to-b from-green-500 to-green-600 h-full z-10" />
                       
                       <div className="pl-5 pr-4 py-3 border-b border-border bg-muted/30 flex justify-between items-center backdrop-blur-sm">
                         <span className="text-sm font-semibold tracking-wide text-foreground/80">Synced Records Overlay</span>
                         <Badge variant="secondary" className="bg-background shadow-sm border border-border/50">{students.length} Total Matches</Badge>
                       </div>
                       
                       <div className="p-0 overflow-auto max-h-[250px] bg-background">
                         <table className="w-full text-sm text-left">
                            <thead className="bg-muted/10 text-muted-foreground uppercase text-xs sticky top-0 backdrop-blur-md z-10 shadow-sm shadow-black/5">
                               <tr>
                                  <th className="px-5 py-3 font-semibold w-1/4">Name</th>
                                  <th className="px-5 py-3 font-semibold w-1/4">GitHub User</th>
                                  <th className="px-5 py-3 font-semibold w-1/4">GitHub Status</th>
                                  <th className="px-5 py-3 font-semibold w-1/4">Email</th>
                               </tr>
                            </thead>
                            <tbody className="divide-y divide-border/40">
                               {students.map((student, i) => (
                                  <tr key={i} className="hover:bg-muted/30 transition-colors group">
                                     <td className="px-5 py-3.5 font-medium group-hover:text-primary transition-colors">{student.name || '-'}</td>
                                     <td className="px-5 py-3.5 text-muted-foreground font-mono text-xs">{student.githubUsername || '-'}</td>
                                     <td className="px-5 py-3.5">
                                        {student.githubStatus === 'connected' ? (
                                          <Badge className="bg-green-500/10 text-green-600 border-green-500/20 text-[10px]">Found</Badge>
                                        ) : student.githubStatus === 'repo-not-found' ? (
                                          <Badge variant="outline" className="text-orange-500 border-orange-500/20 text-[10px]">Not Found</Badge>
                                        ) : student.githubStatus === 'no-username' ? (
                                          <Badge variant="secondary" className="text-[10px]">Missing Username</Badge>
                                        ) : (
                                          <span className="text-muted-foreground text-xs italic">-</span>
                                        )}
                                     </td>
                                     <td className="px-5 py-3.5 text-muted-foreground truncate max-w-[150px]">{student.email || '-'}</td>
                                  </tr>
                               ))}
                            </tbody>
                         </table>
                       </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
