"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "@/_state/hooks/useTheme";
import { useSettings } from "./_hooks/useSettings";
import { usePromptSnippets } from "@/hooks/usePromptSnippets";

export default function SettingsPage() {
  const {
    settings: originalSettings,
    loading,
    error,
    updateSettings,
    initializeSettings,
  } = useSettings();
  const [localSettings, setLocalSettings] = useState(originalSettings);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const { theme, setTheme, setColorVariation, toggleDarkMode } = useTheme();
  const {
    snippets,
    createSnippet,
    loading: snippetsLoading,
  } = usePromptSnippets();
  const [newSnippet, setNewSnippet] = useState({ title: "", insertText: "" });

  // Track if there are unsaved changes
  const hasUnsavedChanges =
    JSON.stringify(originalSettings) !== JSON.stringify(localSettings);

  // Update local settings when original settings change
  useEffect(() => {
    setLocalSettings(originalSettings);
  }, [originalSettings]);

  // Theme changes are now handled by the individual onChange handlers

  const handleSettingChange = (
    category: string,
    setting: string,
    value: any
  ) => {
    // Update only local state (don't save yet)
    setLocalSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [setting]: value,
      },
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setSaveSuccess(false);

      await updateSettings(localSettings);

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to save settings:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleInitialize = async () => {
    try {
      setSaving(true);
      await initializeSettings();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to initialize settings:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleAddSnippet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSnippet.title || !newSnippet.insertText) return;
    try {
      await createSnippet(newSnippet);
      setNewSnippet({ title: "", insertText: "" });
    } catch (err) {
      console.error("Failed to create snippet", err);
    }
  };

  if (loading) {
    return (
      <div className="md:container py-6 space-y-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="md:container py-6 space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Error loading settings: {error}</AlertDescription>
        </Alert>
      )}

      {saveSuccess && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>Settings saved successfully!</AlertDescription>
        </Alert>
      )}

      {hasUnsavedChanges && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You have unsaved changes. Click "Save Changes" to persist them.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold">Settings</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleInitialize}
            disabled={saving}
            className="w-full sm:w-auto"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Initialize Defaults
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || !hasUnsavedChanges}
            className="w-full sm:w-auto"
            variant={hasUnsavedChanges ? "default" : "secondary"}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            {hasUnsavedChanges ? "Save Changes" : "No Changes"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Agent Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Agent Configuration</CardTitle>
            <CardDescription>
              Configure the behavior and capabilities of AI agents
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label className="block mb-2">Default Model</Label>
              <Select
                value={localSettings.agent?.defaultModel || "gpt-4"}
                onValueChange={(value) =>
                  handleSettingChange("agent", "defaultModel", value)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-4">GPT-4</SelectItem>
                  <SelectItem value="gpt-3.5">GPT-3.5</SelectItem>
                  <SelectItem value="claude-3">Claude 3</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="block mb-2">Temperature</Label>
              <Input
                type="number"
                min="0"
                max="1"
                step="0.1"
                value={localSettings.agent?.temperature || 0.7}
                onChange={(e) =>
                  handleSettingChange(
                    "agent",
                    "temperature",
                    parseFloat(e.target.value)
                  )
                }
                className="w-full"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <Label>Auto-save Agent Responses</Label>
              <div className="flex h-6 items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4"
                  checked={localSettings.agent?.autoSave || false}
                  onChange={(e) =>
                    handleSettingChange("agent", "autoSave", e.target.checked)
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Prompt Templates */}
        <Card>
          <CardHeader>
            <CardTitle>Prompt Templates</CardTitle>
            <CardDescription>
              Customize default prompts for common tasks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Code Review Prompt</Label>
              <Textarea
                value={localSettings.prompts?.codeReview || ""}
                onChange={(e) =>
                  handleSettingChange("prompts", "codeReview", e.target.value)
                }
                rows={3}
              />
            </div>
            <Separator />
            <div className="space-y-2">
              <Label>Bug Fix Analysis Prompt</Label>
              <Textarea
                value={localSettings.prompts?.bugFix || ""}
                onChange={(e) =>
                  handleSettingChange("prompts", "bugFix", e.target.value)
                }
                rows={3}
              />
            </div>
            <Separator />
            <div className="space-y-2">
              <Label>Documentation Prompt</Label>
              <Textarea
                value={localSettings.prompts?.documentation || ""}
                onChange={(e) =>
                  handleSettingChange(
                    "prompts",
                    "documentation",
                    e.target.value
                  )
                }
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Prompt Snippets */}
        <Card>
          <CardHeader>
            <CardTitle>Prompt Snippets</CardTitle>
            <CardDescription>
              Select which snippets appear in the editor and create new ones
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {snippetsLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              snippets.map((snip) => (
                <div key={snip.id} className="flex items-start gap-2">
                  <div className="flex-1 space-y-1">
                    <Label>{snip.title}</Label>
                    <Textarea value={snip.insertText} readOnly rows={2} />
                  </div>
                  <input
                    type="checkbox"
                    className="h-4 w-4 mt-6"
                    checked={
                      localSettings.interface?.enabledSnippets?.includes(
                        snip.id
                      ) || false
                    }
                    onChange={(e) => {
                      const current =
                        localSettings.interface?.enabledSnippets || [];
                      const updated = e.target.checked
                        ? [...current, snip.id]
                        : current.filter((id) => id !== snip.id);
                      handleSettingChange(
                        "interface",
                        "enabledSnippets",
                        updated
                      );
                    }}
                  />
                </div>
              ))
            )}
            <Separator />
            <form onSubmit={handleAddSnippet} className="space-y-2">
              <Input
                placeholder="Snippet title"
                value={newSnippet.title}
                onChange={(e) =>
                  setNewSnippet((p) => ({ ...p, title: e.target.value }))
                }
              />
              <Textarea
                placeholder="Insert text"
                value={newSnippet.insertText}
                onChange={(e) =>
                  setNewSnippet((p) => ({ ...p, insertText: e.target.value }))
                }
                rows={2}
              />
              <Button type="submit" variant="secondary" className="w-full">
                Add Snippet
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Interface Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Interface Preferences</CardTitle>
            <CardDescription>
              Customize your experience with TheHorizon
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label>Color Mode</Label>
                <Select
                  value={theme.includes("dark") ? "dark" : "light"}
                  onValueChange={(value) => {
                    console.log(
                      "🎨 Settings - User selected colorMode:",
                      value
                    );

                    // Toggle between light and dark while preserving color variation
                    toggleDarkMode();

                    // Update local state for form consistency
                    handleSettingChange("interface", "colorMode", value);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground mt-1">
                  Choose between light and dark color mode
                </p>
              </div>

              <div>
                <Label>Theme Variation</Label>
                <Select
                  value={
                    theme.includes("sage")
                      ? "sage"
                      : theme.includes("pink")
                      ? "pink"
                      : "default"
                  }
                  onValueChange={(value: "default" | "pink" | "sage") => {
                    console.log(
                      "Settings: User selected theme variation:",
                      value
                    );

                    // Apply theme variation immediately (auto-saves to database)
                    setColorVariation(value);

                    // Update local state for form consistency
                    handleSettingChange("interface", "theme", value);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default Theme</SelectItem>
                    <SelectItem value="pink">Pink Theme</SelectItem>
                    <SelectItem value="sage">Sage Theme</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground mt-1">
                  Select a theme variation that adapts to your chosen color mode
                </p>
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <Label>Code Syntax Highlighting</Label>
              <div className="flex h-6 items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4"
                  checked={localSettings.interface?.codeHighlighting || false}
                  onChange={(e) =>
                    handleSettingChange(
                      "interface",
                      "codeHighlighting",
                      e.target.checked
                    )
                  }
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label>Show Line Numbers</Label>
              <div className="flex h-6 items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4"
                  checked={localSettings.interface?.showLineNumbers || false}
                  onChange={(e) =>
                    handleSettingChange(
                      "interface",
                      "showLineNumbers",
                      e.target.checked
                    )
                  }
                />
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Debug Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Enable additional debug options and information
                </p>
              </div>
              <div className="flex h-6 items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4"
                  checked={localSettings.interface?.debugMode || false}
                  onChange={(e) =>
                    handleSettingChange(
                      "interface",
                      "debugMode",
                      e.target.checked
                    )
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>
              Configure how you want to receive updates and alerts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Enable Notifications</Label>
              <div className="flex h-6 items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4"
                  checked={localSettings.notifications?.enabled || false}
                  onChange={(e) =>
                    handleSettingChange(
                      "notifications",
                      "enabled",
                      e.target.checked
                    )
                  }
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label>Sound Alerts</Label>
              <div className="flex h-6 items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4"
                  checked={localSettings.notifications?.sound || false}
                  onChange={(e) =>
                    handleSettingChange(
                      "notifications",
                      "sound",
                      e.target.checked
                    )
                  }
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label>Desktop Notifications</Label>
              <div className="flex h-6 items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4"
                  checked={localSettings.notifications?.desktop || false}
                  onChange={(e) =>
                    handleSettingChange(
                      "notifications",
                      "desktop",
                      e.target.checked
                    )
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
