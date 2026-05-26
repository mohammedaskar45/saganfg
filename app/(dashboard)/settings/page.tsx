"use client";

import { useState, useEffect } from "react";
import {
  Palette,
  Users,
  Webhook,
  Globe,
  Save,
  Plus,
  UserPlus,
  ShieldCheck,
  Check,
  X,
  Loader2,
} from "lucide-react";

interface TeamMember {
  name: string;
  email: string;
  role: string;
  status: string;
}

interface WebhookItem {
  url: string;
  events: string;
  status: string;
}

interface PermissionMatrix {
  [role: string]: {
    [permission: string]: boolean;
  };
}

const PERMISSION_LABELS: { [key: string]: string } = {
  manage_billing: "Settle Invoices & Billing Settings",
  manage_team: "Invite Staff & Demote Members",
  view_all_projects: "Unrestricted Firm Projects access",
  edit_checklists: "Edit/Generate Client Checklists",
  annotate_workpapers: "Draw stamps/marks on PDF canvases",
  dispatch_k1: "Auto-split & dispatch Partner K-1 links",
  execute_ai: "Converse with Max AI Document RAG",
  access_developer_api: "Configure Developer Webhook triggers",
};

const ROLES_ORDER = ["OWNER/ADMIN", "MANAGER", "PREPARER", "REVIEWER", "ADMIN_STAFF", "AUDITOR"];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"firm" | "users" | "roles" | "webhooks">("firm");

  // Firm branding states
  const [firmName, setFirmName] = useState("Sagan Financial Group");
  const [primaryColor, setPrimaryColor] = useState("#4F46E5");
  const [customDomain, setCustomDomain] = useState("portal.saganfg.com");

  // Webhooks
  const [webhooks, setWebhooks] = useState<WebhookItem[]>([
    { url: "https://api.saganfg.com/webhooks/stripe", events: "invoice.paid", status: "ACTIVE" },
    { url: "https://api.saganfg.com/webhooks/docusign", events: "signature.completed", status: "ACTIVE" },
  ]);
  const [newWebhookUrl, setNewWebhookUrl] = useState("");
  const [newWebhookEvent, setNewWebhookEvent] = useState("invoice.paid");

  // Dynamic team members
  const [users, setUsers] = useState<TeamMember[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [currentUserEmail, setCurrentUserEmail] = useState<string>("");

  // Invite modal states
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("PREPARER");
  const [inviteLoading, setInviteLoading] = useState(false);

  // RBAC Permission Grid states
  const [matrix, setMatrix] = useState<PermissionMatrix>({});
  const [matrixLoading, setMatrixLoading] = useState(true);
  const [matrixSaving, setMatrixSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");

  // Fetch Team & Matrix
  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch current user session
        const sessionRes = await fetch("/api/auth/session");
        if (sessionRes.ok) {
          const sessionData = await sessionRes.json();
          if (sessionData?.user?.email) {
            setCurrentUserEmail(sessionData.user.email);
          }
        }
      } catch (err) {
        console.error("Fetch session error:", err);
      }

      try {
        // Fetch dynamic team members
        const teamRes = await fetch("/api/v1/settings/team");
        if (teamRes.ok) {
          const teamData = await teamRes.json();
          setUsers(teamData);
        }
      } catch (err) {
        console.error("Fetch team members error:", err);
      } finally {
        setUsersLoading(false);
      }

      try {
        // Fetch role permissions matrix
        const rolesRes = await fetch("/api/v1/settings/roles");
        if (rolesRes.ok) {
          const rolesData = await rolesRes.json();
          setMatrix(rolesData);
        }
      } catch (err) {
        console.error("Fetch roles matrix error:", err);
      } finally {
        setMatrixLoading(false);
      }
    }

    fetchData();
  }, []);

  // Submit webhook
  const handleAddWebhook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWebhookUrl.trim()) return;

    setWebhooks([
      ...webhooks,
      { url: newWebhookUrl, events: newWebhookEvent, status: "ACTIVE" },
    ]);
    setNewWebhookUrl("");
  };

  // Submit dynamic team invite
  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName.trim() || !inviteEmail.trim()) return;

    setInviteLoading(true);
    try {
      const res = await fetch("/api/v1/settings/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: inviteName, email: inviteEmail, role: inviteRole }),
      });

      if (res.ok) {
        const newMember = await res.json();
        setUsers([...users, newMember]);
        setShowInviteModal(false);
        setInviteName("");
        setInviteEmail("");
        setInviteRole("PREPARER");
      } else {
        alert(await res.text());
      }
    } catch (err) {
      console.error(err);
      alert("Error sending invitation.");
    } finally {
      setInviteLoading(false);
    }
  };

  // Update staff role
  const handleUpdateRole = async (email: string, newRole: string) => {
    try {
      const res = await fetch("/api/v1/settings/team", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role: newRole }),
      });

      if (res.ok) {
        setUsers(
          users.map((u) => (u.email === email ? { ...u, role: newRole } : u))
        );
      } else {
        alert(await res.text());
      }
    } catch (err) {
      console.error("Update role error:", err);
      alert("Error updating role.");
    }
  };

  // Delete staff member
  const handleDeleteUser = async (email: string) => {
    if (!confirm("Are you sure you want to remove this user from the firm?")) return;

    try {
      const res = await fetch("/api/v1/settings/team", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setUsers(users.filter((u) => u.email !== email));
      } else {
        alert(await res.text());
      }
    } catch (err) {
      console.error("Delete user error:", err);
      alert("Error removing user.");
    }
  };

  // Toggle permission matrix checkbox
  const handlePermissionToggle = async (role: string, permission: string) => {
    if (role === "OWNER" || role === "OWNER/ADMIN") return; // Keep Owner permissions fully immutable for safety

    const updatedMatrix = {
      ...matrix,
      [role]: {
        ...matrix[role],
        [permission]: !matrix[role]?.[permission],
      },
    };

    setMatrix(updatedMatrix);
    setMatrixSaving(true);
    setSaveStatus("idle");

    try {
      const res = await fetch("/api/v1/settings/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedMatrix),
      });

      if (res.ok) {
        setSaveStatus("success");
      } else {
        setSaveStatus("error");
      }
    } catch (err) {
      console.error("Save matrix error:", err);
      setSaveStatus("error");
    } finally {
      setMatrixSaving(false);
      setTimeout(() => setSaveStatus("idle"), 2500);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">
          Configure SaganFG platform defaults, manage firm staff roles, and hook developer APIs.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
        {/* Left Side Navigation Pills */}
        <div className="bg-white border border-gray-200 rounded-2xl p-3 shadow-sm flex flex-col space-y-1">
          <button
            onClick={() => setActiveTab("firm")}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-bold text-xs transition-all text-left ${
              activeTab === "firm"
                ? "bg-indigo-50 border-indigo-100 text-indigo-700"
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <Palette size={16} />
            <span>Firm Branding</span>
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-bold text-xs transition-all text-left ${
              activeTab === "users"
                ? "bg-indigo-50 border-indigo-100 text-indigo-700"
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <Users size={16} />
            <span>Team Members</span>
          </button>
          <button
            onClick={() => setActiveTab("roles")}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-bold text-xs transition-all text-left ${
              activeTab === "roles"
                ? "bg-indigo-50 border-indigo-100 text-indigo-700"
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <ShieldCheck size={16} />
            <span>Role Permissions Matrix</span>
          </button>
          <button
            onClick={() => setActiveTab("webhooks")}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-bold text-xs transition-all text-left ${
              activeTab === "webhooks"
                ? "bg-indigo-50 border-indigo-100 text-indigo-700"
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <Webhook size={16} />
            <span>Developer Webhooks</span>
          </button>
        </div>

        {/* Right Side Settings Viewport */}
        <div className="md:col-span-3 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm min-h-[400px]">
          
          {/* Tab 1: Branding */}
          {activeTab === "firm" && (
            <div className="space-y-6">
              <div className="border-b pb-3">
                <h2 className="font-bold text-gray-800 text-sm">Firm White-Label Branding</h2>
                <p className="text-[10px] text-gray-400 mt-1">
                  Configure your firm colors, logo, and white-label custom domain portals.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">Firm Operating Name</label>
                  <input
                    type="text"
                    value={firmName}
                    onChange={(e) => setFirmName(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-gray-700 bg-gray-50 focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">Primary Palette Accent Color</label>
                  <div className="flex gap-3 items-center">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-10 h-10 border border-gray-200 rounded-lg cursor-pointer bg-white"
                    />
                    <input
                      type="text"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-gray-700 bg-gray-50 focus:bg-white w-28"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">White-Label Custom Domain</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={customDomain}
                      onChange={(e) => setCustomDomain(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-gray-700 bg-gray-50 focus:bg-white transition-all"
                    />
                    <Globe size={16} className="absolute left-3 top-3 text-gray-400" />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1 leading-relaxed">
                    Point a CNAME record from your domain DNS registrar to portals.saganfg.com to finalize activation.
                  </p>
                </div>

                <div className="pt-4 flex justify-end">
                  <button className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm shadow-indigo-100">
                    <Save size={14} />
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Team Members */}
          {activeTab === "users" && (
            <div className="space-y-6">
              <div className="border-b pb-3 flex justify-between items-center">
                <div>
                  <h2 className="font-bold text-gray-800 text-sm">Team Members & Permissions</h2>
                  <p className="text-[10px] text-gray-400 mt-1">Manage firm employee credentials, roles, and status levels.</p>
                </div>
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all shadow-sm shadow-indigo-100"
                >
                  <UserPlus size={14} />
                  Invite User
                </button>
              </div>

              {usersLoading ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <Loader2 className="animate-spin text-indigo-500 mb-2" size={24} />
                  <span className="text-xs font-semibold">Loading team members...</span>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {users.map((u, idx) => (
                    <div key={idx} className="py-3.5 flex items-center justify-between first:pt-0 last:pb-0">
                      <div>
                        <h4 className="text-xs font-bold text-gray-800">{u.name}</h4>
                        <p className="text-[10px] text-gray-400 font-medium mt-0.5">{u.email}</p>
                      </div>

                      <div className="flex items-center gap-3">
                        {u.role === "OWNER" || u.role === "OWNER/ADMIN" ? (
                          <span className="bg-indigo-50 border border-indigo-100 text-indigo-700 text-[9px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider">
                            {u.role}
                          </span>
                        ) : (
                          <select
                            value={u.role}
                            onChange={(e) => handleUpdateRole(u.email, e.target.value)}
                            className="bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer transition-all"
                          >
                            <option value="MANAGER">MANAGER</option>
                            <option value="PREPARER">PREPARER</option>
                            <option value="REVIEWER">REVIEWER</option>
                            <option value="ADMIN_STAFF">ADMIN STAFF</option>
                            <option value="AUDITOR">AUDITOR</option>
                          </select>
                        )}
                        <span className="bg-green-100 text-green-700 text-[9px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">
                          {u.status}
                        </span>
                        {u.role !== "OWNER" && u.role !== "OWNER/ADMIN" && u.email !== currentUserEmail && (
                          <button
                            onClick={() => handleDeleteUser(u.email)}
                            className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                            title="Remove team member"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Invite User Dialog Modal */}
              {showInviteModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
                  <div className="bg-white border border-gray-200 rounded-2xl max-w-sm w-full p-6 shadow-xl space-y-4">
                    <div className="flex justify-between items-center border-b pb-2">
                      <h3 className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
                        <UserPlus size={16} className="text-indigo-600" />
                        Invite Team Member
                      </h3>
                      <button onClick={() => setShowInviteModal(false)} className="text-gray-400 hover:text-gray-600">
                        <X size={16} />
                      </button>
                    </div>

                    <form onSubmit={handleInviteSubmit} className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Full Name</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. John Doe"
                          value={inviteName}
                          onChange={(e) => setInviteName(e.target.value)}
                          className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-gray-700 bg-gray-50 focus:bg-white transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Email Address</label>
                        <input
                          type="email"
                          required
                          placeholder="john@saganfg.com"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                          className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-gray-700 bg-gray-50 focus:bg-white transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Assign Role</label>
                        <select
                          value={inviteRole}
                          onChange={(e) => setInviteRole(e.target.value)}
                          className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-gray-700 bg-gray-50 focus:bg-white cursor-pointer"
                        >
                          <option value="PREPARER">PREPARER</option>
                          <option value="REVIEWER">REVIEWER</option>
                          <option value="MANAGER">MANAGER</option>
                          <option value="ADMIN_STAFF">ADMIN STAFF</option>
                          <option value="AUDITOR">READ-ONLY AUDITOR</option>
                        </select>
                      </div>

                      <button
                        type="submit"
                        disabled={inviteLoading}
                        className="w-full py-2.5 rounded-xl text-white font-bold text-xs bg-indigo-600 hover:bg-indigo-700 transition-all flex items-center justify-center gap-1 shadow-sm shadow-indigo-100 disabled:opacity-50"
                      >
                        {inviteLoading ? <Loader2 className="animate-spin" size={14} /> : null}
                        Send Magic Invite
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Role Permissions Matrix */}
          {activeTab === "roles" && (
            <div className="space-y-6">
              <div className="border-b pb-3 flex justify-between items-center">
                <div>
                  <h2 className="font-bold text-gray-800 text-sm">Role-Based Access Control Matrix</h2>
                  <p className="text-[10px] text-gray-400 mt-1">
                    Customize platform capability filters across SaganFG's 6 operational roles.
                  </p>
                </div>

                {/* Auto-save status feedback */}
                <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-400">
                  {matrixSaving ? (
                    <span className="flex items-center gap-1 text-[10px] text-indigo-600 animate-pulse">
                      <Loader2 className="animate-spin" size={12} /> Auto-saving...
                    </span>
                  ) : saveStatus === "success" ? (
                    <span className="flex items-center gap-1 text-[10px] text-green-600">
                      <Check size={12} /> Matrix Updated
                    </span>
                  ) : saveStatus === "error" ? (
                    <span className="flex items-center gap-1 text-[10px] text-red-500">
                      Error saving permissions
                    </span>
                  ) : (
                    <span className="text-[9px] uppercase tracking-wider text-gray-300 font-bold">Grid Dynamic</span>
                  )}
                </div>
              </div>

              {matrixLoading ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <Loader2 className="animate-spin text-indigo-500 mb-2" size={24} />
                  <span className="text-xs font-semibold">Loading permissions grid...</span>
                </div>
              ) : (
                <div className="overflow-x-auto border border-gray-100 rounded-2xl bg-gray-50/50 p-1.5">
                  <table className="min-w-full text-xs text-left divide-y divide-gray-100">
                    <thead className="bg-gray-100/50 rounded-xl">
                      <tr>
                        <th className="p-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider w-1/3">Core Features</th>
                        {ROLES_ORDER.map((role) => (
                          <th key={role} className="p-3 text-[9px] font-bold text-gray-600 uppercase text-center tracking-wider">
                            {role.replace("OWNER/", "")}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-semibold bg-white">
                      {Object.keys(PERMISSION_LABELS).map((permission) => (
                        <tr key={permission} className="hover:bg-gray-50/30 transition-colors">
                          <td className="p-3 font-semibold text-gray-800 text-[11px]">{PERMISSION_LABELS[permission]}</td>
                          {ROLES_ORDER.map((role) => {
                            const isOwner = role === "OWNER/ADMIN";
                            const isChecked = matrix[role]?.[permission] ?? false;
                            return (
                              <td key={role} className="p-3 text-center">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  disabled={isOwner || matrixSaving}
                                  onChange={() => handlePermissionToggle(role, permission)}
                                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer disabled:opacity-50"
                                />
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Tab 4: Webhooks */}
          {activeTab === "webhooks" && (
            <div className="space-y-6">
              <div className="border-b pb-3">
                <h2 className="font-bold text-gray-800 text-sm">Developer Webhooks Integration</h2>
                <p className="text-[10px] text-gray-400 mt-1">Configure endpoints to receive real-time JSON webhooks when actions occur.</p>
              </div>

              {/* Add Webhook Form */}
              <form onSubmit={handleAddWebhook} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="sm:col-span-2">
                  <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-2">Endpoint URL</label>
                  <input
                    type="url"
                    required
                    placeholder="https://api.yourdomain.com/webhook"
                    value={newWebhookUrl}
                    onChange={(e) => setNewWebhookUrl(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white transition-all font-medium text-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-2">Trigger Event</label>
                  <select
                    value={newWebhookEvent}
                    onChange={(e) => setNewWebhookEvent(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white transition-all text-gray-700 font-bold cursor-pointer"
                  >
                    <option value="invoice.paid">invoice.paid</option>
                    <option value="signature.completed">signature.completed</option>
                    <option value="document.uploaded">document.uploaded</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="sm:col-span-3 py-2 px-4 rounded-xl text-white font-bold text-xs bg-indigo-600 hover:bg-indigo-700 transition-all flex items-center justify-center gap-1 shadow-sm shadow-indigo-100"
                >
                  <Plus size={12} />
                  Add Webhook Endpoint
                </button>
              </form>

              {/* Webhooks table list */}
              <div className="space-y-3 pt-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Configured endpoints</span>
                {webhooks.map((w, idx) => (
                  <div key={idx} className="p-4 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-between text-xs font-semibold">
                    <div className="space-y-0.5 max-w-xs sm:max-w-md truncate font-medium">
                      <p className="text-gray-800 truncate font-mono text-[11px]">{w.url}</p>
                      <p className="text-[9px] text-gray-400 uppercase tracking-wider font-bold">Event: {w.events}</p>
                    </div>
                    <span className="bg-green-100 text-green-700 text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                      {w.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
