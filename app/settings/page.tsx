"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Check, X, ExternalLink, Copy, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export default function SettingsPage() {
  const [copied, setCopied] = useState<string | null>(null)

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
    github: {
      configured: typeof process !== "undefined" && !!process.env.NEXT_PUBLIC_GITHUB_CONFIGURED,
      envVars: ["GITHUB_TOKEN", "GITHUB_WEBHOOK_SECRET (optional)"],
    },
    googleSheets: {
      configured: typeof process !== "undefined" && !!process.env.NEXT_PUBLIC_SHEETS_CONFIGURED,
      envVars: ["GOOGLE_SERVICE_ACCOUNT_EMAIL", "GOOGLE_PRIVATE_KEY", "GOOGLE_SHEETS_ID"],
    },
  }

  const webhookBaseUrl = typeof window !== "undefined" ? window.location.origin : "https://your-domain.com"

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Integration Settings</h1>
            <p className="text-muted-foreground">
              Configure Telegram, GitHub, and Google Sheets connections
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Telegram Integration */}
          <Card className="border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-[#0088cc]/10 flex items-center justify-center">
                    <svg className="h-5 w-5 text-[#0088cc]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
                    </svg>
                  </div>
                  <div>
                    <CardTitle className="text-lg">Telegram Bot</CardTitle>
                    <CardDescription>Receive student updates and send feedback</CardDescription>
                  </div>
                </div>
                <Badge variant={integrations.telegram.configured ? "default" : "secondary"}>
                  {integrations.telegram.configured ? (
                    <><Check className="h-3 w-3 mr-1" /> Connected</>
                  ) : (
                    <><X className="h-3 w-3 mr-1" /> Not Configured</>
                  )}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Setup Instructions</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Message <code className="bg-secondary px-1 rounded">@BotFather</code> on Telegram</li>
                  <li>Create a new bot with <code className="bg-secondary px-1 rounded">/newbot</code></li>
                  <li>Copy the bot token and add it to your environment variables</li>
                  <li>Add the bot to your mentorship group</li>
                </ol>
              </div>
              <Separator />
              <div>
                <h4 className="font-medium mb-2">Required Environment Variables</h4>
                <div className="space-y-2">
                  {integrations.telegram.envVars.map((envVar) => (
                    <code key={envVar} className="block bg-secondary px-3 py-2 rounded text-sm">
                      {envVar}
                    </code>
                  ))}
                </div>
              </div>
              <Separator />
              <div>
                <h4 className="font-medium mb-2">Webhook URL</h4>
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
                <p className="text-xs text-muted-foreground mt-1">
                  Set this as your bot&apos;s webhook URL after deployment
                </p>
              </div>
            </CardContent>
          </Card>

          {/* GitHub Integration */}
          <Card className="border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-foreground/10 flex items-center justify-center">
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                    </svg>
                  </div>
                  <div>
                    <CardTitle className="text-lg">GitHub</CardTitle>
                    <CardDescription>Track commits and analyze code quality</CardDescription>
                  </div>
                </div>
                <Badge variant={integrations.github.configured ? "default" : "secondary"}>
                  {integrations.github.configured ? (
                    <><Check className="h-3 w-3 mr-1" /> Connected</>
                  ) : (
                    <><X className="h-3 w-3 mr-1" /> Not Configured</>
                  )}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Setup Instructions</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Go to GitHub Settings → Developer settings → Personal access tokens</li>
                  <li>Generate a new token with <code className="bg-secondary px-1 rounded">repo</code> scope</li>
                  <li>Add the token to your environment variables</li>
                  <li>Optionally set up webhooks for real-time updates</li>
                </ol>
              </div>
              <Separator />
              <div>
                <h4 className="font-medium mb-2">Required Environment Variables</h4>
                <div className="space-y-2">
                  {integrations.github.envVars.map((envVar) => (
                    <code key={envVar} className="block bg-secondary px-3 py-2 rounded text-sm">
                      {envVar}
                    </code>
                  ))}
                </div>
              </div>
              <Separator />
              <div>
                <h4 className="font-medium mb-2">Webhook URL (for each student repo)</h4>
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
              <Button variant="outline" size="sm" asChild>
                <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open GitHub Token Settings
                </a>
              </Button>
            </CardContent>
          </Card>

          {/* Google Sheets Integration */}
          <Card className="border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-[#34a853]/10 flex items-center justify-center">
                    <svg className="h-5 w-5 text-[#34a853]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/>
                      <path d="M7 12h2v5H7zm4-3h2v8h-2zm4-3h2v11h-2z"/>
                    </svg>
                  </div>
                  <div>
                    <CardTitle className="text-lg">Google Sheets</CardTitle>
                    <CardDescription>Student roster and progress tracking</CardDescription>
                  </div>
                </div>
                <Badge variant={integrations.googleSheets.configured ? "default" : "secondary"}>
                  {integrations.googleSheets.configured ? (
                    <><Check className="h-3 w-3 mr-1" /> Connected</>
                  ) : (
                    <><X className="h-3 w-3 mr-1" /> Not Configured</>
                  )}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Setup Instructions</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Go to Google Cloud Console and create a project</li>
                  <li>Enable the Google Sheets API</li>
                  <li>Create a Service Account and download the JSON key</li>
                  <li>Share your spreadsheet with the service account email</li>
                  <li>Add the credentials to your environment variables</li>
                </ol>
              </div>
              <Separator />
              <div>
                <h4 className="font-medium mb-2">Required Environment Variables</h4>
                <div className="space-y-2">
                  {integrations.googleSheets.envVars.map((envVar) => (
                    <code key={envVar} className="block bg-secondary px-3 py-2 rounded text-sm">
                      {envVar}
                    </code>
                  ))}
                </div>
              </div>
              <Separator />
              <div>
                <h4 className="font-medium mb-2">Expected Spreadsheet Structure</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Your spreadsheet should have a &quot;Students&quot; sheet with these columns:
                </p>
                <code className="block bg-secondary px-3 py-2 rounded text-sm">
                  StudentName | TelegramUsername | GitHubUsername | CurrentModule | StartDate | LastUpdate | Status | Notes
                </code>
              </div>
              <Button variant="outline" size="sm" asChild>
                <a href="https://console.cloud.google.com/apis/library/sheets.googleapis.com" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Google Cloud Console
                </a>
              </Button>
            </CardContent>
          </Card>

          {/* Test Connection */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-lg">Test Connections</CardTitle>
              <CardDescription>
                Verify your integrations are working correctly
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Test All Connections
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
