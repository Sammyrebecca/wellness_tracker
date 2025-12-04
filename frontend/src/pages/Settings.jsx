import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import Card from "../components/Card";
import Button from "../components/Button";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";

export default function Settings() {
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [reminderTime, setReminderTime] = useState(
    user?.preferences?.reminderTime || ""
  );
  const [remindersEnabled, setRemindersEnabled] = useState(
    user?.preferences?.remindersEnabled ?? true
  );
  const [aiSuggestionsEnabled, setAiSuggestionsEnabled] = useState(
    user?.preferences?.aiSuggestionsEnabled ?? true
  );
  const [focusArea, setFocusArea] = useState(
    user?.preferences?.focusArea || ""
  );
  const [notificationFreq, setNotificationFreq] = useState(
    user?.preferences?.notificationFrequency || "daily"
  );
  const [darkModePref, setDarkModePref] = useState(
    !!user?.preferences?.darkMode
  );
  const [stepGoal, setStepGoal] = useState(
    user?.preferences?.stepGoal ?? 10000
  );
  const [waterGoal, setWaterGoal] = useState(user?.preferences?.waterGoal ?? 3);
  const [sleepGoal, setSleepGoal] = useState(user?.preferences?.sleepGoal ?? 7);
  const [syncedDevices, setSyncedDevices] = useState([]);
  const [syncStatus, setSyncStatus] = useState(null);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    setName(user?.name || "");
    setReminderTime(user?.preferences?.reminderTime || "");
    setRemindersEnabled(user?.preferences?.remindersEnabled ?? true);
    setAiSuggestionsEnabled(user?.preferences?.aiSuggestionsEnabled ?? true);
    setFocusArea(user?.preferences?.focusArea || "");
    setNotificationFreq(user?.preferences?.notificationFrequency || "daily");
    setDarkModePref(!!user?.preferences?.darkMode);
    setStepGoal(user?.preferences?.stepGoal ?? 10000);
    setWaterGoal(user?.preferences?.waterGoal ?? 3);
    setSleepGoal(user?.preferences?.sleepGoal ?? 7);

    // Load cloud sync info
    api
      .get("/sync/devices")
      .then((res) => setSyncedDevices(res.data.devices || []));
    api.get("/sync/status").then((res) => setSyncStatus(res.data));
  }, [user]);

  const save = async (e) => {
    e.preventDefault();
    const payload = {
      name,
      preferences: {
        reminderTime,
        remindersEnabled,
        aiSuggestionsEnabled,
        focusArea,
        darkMode: darkModePref,
        stepGoal: Number(stepGoal),
        waterGoal: Number(waterGoal),
        sleepGoal: Number(sleepGoal),
        notificationFrequency: notificationFreq,
      },
    };
    const { data } = await api.put("/me", payload);
    setUser(data.user);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  const registerDevice = async () => {
    try {
      const deviceName = prompt("Device name (e.g., iPhone, Laptop):");
      if (!deviceName) return;

      const res = await api.post("/sync/devices", {
        deviceName,
        platform: navigator.userAgent.includes("Mobile") ? "mobile" : "web",
      });
      setSyncedDevices([...syncedDevices, res.data]);
    } catch (err) {
      alert("Failed to register device");
    }
  };

  const removeDevice = async (deviceId) => {
    if (!confirm("Remove this device from sync?")) return;
    try {
      await api.delete(`/sync/devices/${deviceId}`);
      setSyncedDevices(syncedDevices.filter((d) => d.id !== deviceId));
    } catch (err) {
      alert("Failed to remove device");
    }
  };

  const exportData = async (format) => {
    try {
      const res = await api.get(`/sync/export?format=${format}`);
      if (format === "json") {
        const blob = new Blob([JSON.stringify(res.data, null, 2)], {
          type: "application/json",
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `wellness-export-${
          new Date().toISOString().split("T")[0]
        }.json`;
        a.click();
      }
    } catch (err) {
      alert("Failed to export data");
    }
  };

  const toggleDark = () => {
    const c = document.documentElement.classList;
    c.toggle("dark");
    const isDark = c.contains("dark");
    localStorage.setItem("theme", isDark ? "dark" : "light");
    setDarkModePref(isDark);
  };

  useEffect(() => {
    const t = localStorage.getItem("theme");
    if (t === "dark") document.documentElement.classList.add("dark");
  }, []);

  return (
    <Layout title="Settings">
      <div className="grid gap-6 max-w-4xl">
        <div
          className="relative overflow-hidden rounded-2xl p-6 sm:p-8 text-slate-900 dark:text-slate-100"
          style={{
            backgroundImage:
              "linear-gradient(135deg, rgba(56,189,248,0.15), rgba(167,139,250,0.15)), url('/hero-settings.svg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="backdrop-blur-sm bg-white/40 dark:bg-slate-800/40 rounded-xl p-4 sm:p-6 max-w-2xl">
            <div className="font-heading text-2xl">Settings</div>
            <div className="text-sm text-coolGray mt-1">
              Manage your preferences, reminders, and data sync.
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700">
          {["profile", "reminders", "sync"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 border-b-2 transition-colors capitalize ${
                activeTab === tab
                  ? "border-sky-500 text-sky-600 dark:text-sky-400"
                  : "border-transparent text-coolGray hover:text-slate-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <Card>
            <form onSubmit={save} className="space-y-6">
              <div>
                <div className="font-medium mb-2">👤 Profile</div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <label className="block">
                    <span className="label">Name</span>
                    <input
                      className="input"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </label>
                  <div>
                    <div className="label">Email</div>
                    <div className="input bg-white/60 dark:bg-slate-800/50">
                      {user?.email}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="font-medium mb-3">Wellness Goals</div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <label className="block">
                    <span className="label">Daily Steps</span>
                    <input
                      type="number"
                      className="input"
                      value={stepGoal}
                      onChange={(e) => setStepGoal(e.target.value)}
                    />
                  </label>
                  <label className="block">
                    <span className="label">Water Goal (L)</span>
                    <input
                      type="number"
                      step="0.1"
                      className="input"
                      value={waterGoal}
                      onChange={(e) => setWaterGoal(e.target.value)}
                    />
                  </label>
                  <label className="block">
                    <span className="label">Sleep Goal (hours)</span>
                    <input
                      type="number"
                      step="0.5"
                      className="input"
                      value={sleepGoal}
                      onChange={(e) => setSleepGoal(e.target.value)}
                    />
                  </label>
                </div>
              </div>

              <div>
                <div className="font-medium mb-3">🎯 Preferences</div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <label className="block">
                    <span className="label">Focus Area</span>
                    <select
                      className="input"
                      value={focusArea}
                      onChange={(e) => setFocusArea(e.target.value)}
                    >
                      <option value="">None</option>
                      <option value="sleep">Sleep Quality</option>
                      <option value="mood">Mood & Wellbeing</option>
                      <option value="activity">Activity & Steps</option>
                      <option value="hydration">Hydration</option>
                    </select>
                  </label>
                </div>
              </div>

              <div>
                <div className="font-medium mb-3">🎨 Appearance</div>
                <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                  <div>
                    <div className="font-medium">Dark Mode</div>
                    <div className="text-sm text-coolGray">
                      Toggle theme preference
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={toggleDark}
                    className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${
                      darkModePref
                        ? "bg-sky-500"
                        : "bg-slate-300 dark:bg-slate-600"
                    }`}
                  >
                    <span
                      className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                        darkModePref ? "translate-x-7" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>

              <Button>✓ Save Changes</Button>
              {saved && (
                <div className="text-emerald-600 text-sm">
                  ✓ Saved successfully
                </div>
              )}
            </form>
          </Card>
        )}

        {/* Reminders Tab */}
        {activeTab === "reminders" && (
          <Card>
            <form onSubmit={save} className="space-y-6">
              <div>
                <div className="font-medium mb-3">🔔 Smart Reminders</div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div>
                      <div className="font-medium">Enable Reminders</div>
                      <div className="text-sm text-coolGray">
                        Get daily check-in reminders
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setRemindersEnabled(!remindersEnabled)}
                      className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${
                        remindersEnabled
                          ? "bg-emerald-500"
                          : "bg-slate-300 dark:bg-slate-600"
                      }`}
                    >
                      <span
                        className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                          remindersEnabled ? "translate-x-7" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  {remindersEnabled && (
                    <>
                      <label className="block">
                        <span className="label">⏰ Reminder Time</span>
                        <input
                          type="time"
                          className="input"
                          value={reminderTime}
                          onChange={(e) => setReminderTime(e.target.value)}
                        />
                        <div className="text-xs text-coolGray mt-1">
                          When should we remind you to check in?
                        </div>
                      </label>

                      <label className="block">
                        <span className="label">📬 Notification Frequency</span>
                        <select
                          className="input"
                          value={notificationFreq}
                          onChange={(e) => setNotificationFreq(e.target.value)}
                        >
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="none">None</option>
                        </select>
                      </label>
                    </>
                  )}
                </div>
              </div>

              <div>
                <div className="font-medium mb-3">AI Features</div>
                <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                  <div>
                    <div className="font-medium">AI Suggestions</div>
                    <div className="text-sm text-coolGray">
                      Personalized wellness tips powered by AI
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setAiSuggestionsEnabled(!aiSuggestionsEnabled)
                    }
                    className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${
                      aiSuggestionsEnabled
                        ? "bg-purple-500"
                        : "bg-slate-300 dark:bg-slate-600"
                    }`}
                  >
                    <span
                      className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                        aiSuggestionsEnabled ? "translate-x-7" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>

              <Button>✓ Save Reminder Settings</Button>
              {saved && (
                <div className="text-emerald-600 text-sm">
                  ✓ Settings updated
                </div>
              )}
            </form>
          </Card>
        )}

        {/* Cloud Sync Tab */}
        {activeTab === "sync" && (
          <>
            <Card>
              <div className="font-medium mb-3">☁️ Cloud Sync Status</div>
              {syncStatus && (
                <div className="grid sm:grid-cols-3 gap-4 mb-4">
                  <div className="glass-card p-3">
                    <div className="text-sm text-coolGray">Last Synced</div>
                    <div className="font-medium text-sm mt-1">
                      {syncStatus.lastSyncedAt
                        ? new Date(syncStatus.lastSyncedAt).toLocaleDateString()
                        : "Never"}
                    </div>
                  </div>
                  <div className="glass-card p-3">
                    <div className="text-sm text-coolGray">Data Points</div>
                    <div className="font-medium text-sm mt-1">
                      {syncStatus.totalDataPoints}
                    </div>
                  </div>
                  <div className="glass-card p-3">
                    <div className="text-sm text-coolGray">Devices</div>
                    <div className="font-medium text-sm mt-1">
                      {syncStatus.devicesConnected}
                    </div>
                  </div>
                </div>
              )}
            </Card>

            <Card>
              <div className="font-medium mb-3">📱 Synced Devices</div>
              {syncedDevices.length > 0 ? (
                <div className="space-y-2">
                  {syncedDevices.map((device) => (
                    <div
                      key={device.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700"
                    >
                      <div>
                        <div className="font-medium">{device.name}</div>
                        <div className="text-xs text-coolGray">
                          {device.platform} •{" "}
                          {new Date(device.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeDevice(device.id)}
                        className="text-rose-500 hover:text-rose-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-coolGray text-sm">
                  No devices synced yet.
                </div>
              )}
              <button
                type="button"
                onClick={registerDevice}
                className="btn-pill border border-slate-200 dark:border-slate-700 mt-4 w-full"
              >
                + Add Device
              </button>
            </Card>

            <Card>
              <div className="font-medium mb-3">📥 Export Data</div>
              <p className="text-sm text-coolGray mb-4">
                Download your wellness data in standard formats
              </p>
              <div className="flex gap-3 flex-wrap">
                <button
                  type="button"
                  onClick={() => exportData("json")}
                  className="btn-pill border border-slate-200 dark:border-slate-700"
                >
                  Export JSON
                </button>
                <button
                  type="button"
                  onClick={() => exportData("csv")}
                  className="btn-pill border border-slate-200 dark:border-slate-700"
                >
                  Export CSV
                </button>
              </div>
            </Card>
          </>
        )}
      </div>
    </Layout>
  );
}
