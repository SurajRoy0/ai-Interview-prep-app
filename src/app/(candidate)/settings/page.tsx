import { requireSession } from "@/lib/auth-server"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { UserAvatar } from "@/components/shared/user-avatar"
import { AlertCircle, User, Settings as SettingsIcon, Bell } from "lucide-react"

export default async function SettingsPage() {
  const session = await requireSession()
  const user = session.user

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-500 max-w-3xl">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="border-b border-border/50 pb-6">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your account settings and preferences.
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-8">
        <TabsList className="bg-surface-1 border border-border/50 p-1 rounded-xl h-auto">
          <TabsTrigger value="profile" className="rounded-lg px-4 py-2 text-xs font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground">
            <User className="h-3.5 w-3.5 mr-1.5" /> Profile
          </TabsTrigger>
          <TabsTrigger value="preferences" className="rounded-lg px-4 py-2 text-xs font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground">
            <SettingsIcon className="h-3.5 w-3.5 mr-1.5" /> Preferences
          </TabsTrigger>
          <TabsTrigger value="notifications" className="rounded-lg px-4 py-2 text-xs font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground">
            <Bell className="h-3.5 w-3.5 mr-1.5" /> Notifications
          </TabsTrigger>
        </TabsList>

        {/* ── Profile Tab ────────────────────────────────────────────────────── */}
        <TabsContent value="profile" className="space-y-6 focus-visible:outline-none">
          <div className="bg-surface-1 border border-border/50 rounded-2xl p-6 md:p-8 space-y-8">

            <div className="flex items-center gap-6">
              <div className="relative">
                <UserAvatar name={user.name} email={user.email} image={user.image} className="h-20 w-20 text-xl border-4 border-background shadow-sm" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Profile Picture</h3>
                <p className="text-xs text-muted-foreground mt-1 mb-3">Syncs automatically from your Google account.</p>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-border/40">
              <div className="grid gap-2">
                <Label htmlFor="name" className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Full Name</Label>
                <Input id="name" defaultValue={user.name || ""} className="max-w-md bg-background border-border/60" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Email Address</Label>
                <Input id="email" defaultValue={user.email} disabled className="max-w-md bg-muted/30 text-muted-foreground" />
                <p className="text-[10px] text-muted-foreground mt-1">Email cannot be changed since you signed in with Google.</p>
              </div>
            </div>

            <div className="pt-4 border-t border-border/40 flex justify-end">
              <Button size="sm" className="rounded-full px-6 shadow-primary-glow font-semibold" disabled>
                Save Changes
              </Button>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="border border-destructive/20 bg-destructive/5 rounded-2xl p-6 space-y-4 mt-8">
            <h3 className="text-sm font-bold text-destructive flex items-center gap-2">
              <AlertCircle className="h-4 w-4" /> Danger Zone
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-xl">
              Permanently delete your account and all associated data, including job profiles, resumes, and interview reports. This action cannot be undone.
            </p>
            <Button variant="destructive" size="sm" className="rounded-full px-5 font-semibold mt-2" disabled>
              Delete Account
            </Button>
          </div>
        </TabsContent>

        {/* ── Preferences Tab ────────────────────────────────────────────────── */}
        <TabsContent value="preferences" className="space-y-6 focus-visible:outline-none">
          <div className="bg-surface-1 border border-border/50 rounded-2xl p-6 md:p-8 space-y-6">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground border-b border-border/40 pb-3">Appearance</h3>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Theme Preference</Label>
                <p className="text-xs text-muted-foreground mt-1">Select your preferred color scheme.</p>
              </div>
              <div className="flex bg-background border border-border/50 rounded-full p-1">
                {/* Dummy toggles */}
                <span className="px-4 py-1.5 rounded-full text-xs font-semibold bg-surface-2 shadow-sm text-foreground">System</span>
                <span className="px-4 py-1.5 rounded-full text-xs font-semibold text-muted-foreground cursor-not-allowed">Light</span>
                <span className="px-4 py-1.5 rounded-full text-xs font-semibold text-muted-foreground cursor-not-allowed">Dark</span>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ── Notifications Tab ──────────────────────────────────────────────── */}
        <TabsContent value="notifications" className="space-y-6 focus-visible:outline-none">
          <div className="bg-surface-1 border border-border/50 rounded-2xl p-6 md:p-8 space-y-6">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground border-b border-border/40 pb-3">Email Notifications</h3>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Interview Reports</Label>
                  <p className="text-xs text-muted-foreground mt-1">Receive an email when your interview analysis is ready.</p>
                </div>
                <Switch checked={true} disabled />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Product Updates</Label>
                  <p className="text-xs text-muted-foreground mt-1">Occasional emails about new features and improvements.</p>
                </div>
                <Switch checked={false} disabled />
              </div>
            </div>
          </div>
        </TabsContent>

      </Tabs>
    </div>
  )
}
