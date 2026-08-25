"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Bell, LogOut, Search, Settings, User, UserCircle, X, Camera, Shield, BadgeCheck, CheckCheck, RefreshCw, AlertCircle, PhoneCall, CreditCard, Rocket, ExternalLink } from "lucide-react";
import { updateProfileAction, updateWorkspaceAction } from "@/features/profile/actions";
import { getNotificationsAction, NotificationItem } from "@/features/notifications/actions";
import { useRouter } from "next/navigation";

export function Header({ user }: { user: any }) {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<"profile" | "settings" | null>(null);
  
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [notificationFilter, setNotificationFilter] = useState<"all" | "call" | "invoice" | "alert">("all");
  const [isFetchingNotifs, setIsFetchingNotifs] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchNotifications = async () => {
    setIsFetchingNotifs(true);
    const res = await getNotificationsAction();
    if (res.success) {
      const clearedIds = JSON.parse(typeof window !== "undefined" ? localStorage.getItem("cleared_notifications") || "[]" : "[]");
      const activeNotifs = res.notifications.filter((n) => !clearedIds.includes(n.id));
      setNotifications(activeNotifs);
      setUnreadCount(activeNotifs.filter((n) => n.unread).length);
    }
    setIsFetchingNotifs(false);
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 45000); // Auto-refresh every 45s
    return () => clearInterval(interval);
  }, []);

  const handleClearAll = () => {
    const allIds = notifications.map((n) => n.id);
    const clearedIds = JSON.parse(localStorage.getItem("cleared_notifications") || "[]");
    const updatedCleared = Array.from(new Set([...clearedIds, ...allIds]));
    localStorage.setItem("cleared_notifications", JSON.stringify(updatedCleared));
    setNotifications([]);
    setUnreadCount(0);
  };

  const handleDismissNotification = (id: string) => {
    const clearedIds = JSON.parse(localStorage.getItem("cleared_notifications") || "[]");
    clearedIds.push(id);
    localStorage.setItem("cleared_notifications", JSON.stringify(clearedIds));
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  // Local state for immediate updates
  const [orgName, setOrgName] = useState(user?.orgName || "Anavya Infotech");
  const [userName, setUserName] = useState(user?.name || "Admin User");
  const [userImage, setUserImage] = useState(user?.image || "");
  
  const userEmail = user?.email || "admin@anavyainfotech.com";
  const userRole = user?.role || "owner";

  const getRoleLabel = (role: string) => {
    if (role === "owner") return "👑 Founder & Owner";
    if (role === "manager") return "🛡️ Sales Manager";
    if (role === "executive") return "💼 Sales Executive / BD Intern";
    return `👤 ${role}`;
  };

  const handleSignOut = async () => {
    window.location.href = "/api/auth/signout";
  };

  const handleProfileSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await updateProfileAction(formData);
    
    if (result.success) {
      setUserName(formData.get("name") as string);
      setUserImage(formData.get("image") as string);
      setActiveModal(null);
      router.refresh();
    }
    setIsLoading(false);
  };

  const handleSettingsSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await updateWorkspaceAction(formData);
    
    if (result.success) {
      setOrgName(formData.get("orgName") as string);
      setActiveModal(null);
      router.refresh();
    }
    setIsLoading(false);
  };

  return (
    <>
      <header className="flex h-13 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 sm:gap-x-6 sm:px-6">
        <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6 items-center">
          <form className="relative flex flex-1" onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const query = (formData.get("search") as string || "").trim();
            if (query) {
              router.push(`/clients?search=${encodeURIComponent(query)}`);
            }
          }}>
            <label htmlFor="search-field" className="sr-only">Search</label>
            <Search className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-gray-400" aria-hidden="true" />
            <input
              id="search-field"
              className="block h-full w-full border-0 py-0 pl-8 pr-0 text-gray-900 placeholder:text-gray-400 sm:text-sm focus:outline-none focus:ring-0 focus:border-transparent"
              placeholder="Search clients, leads, projects (press Enter)..."
              type="search"
              name="search"
            />
          </form>

          <div className="flex items-center gap-x-4 lg:gap-x-6">
            {/* NOTIFICATION CENTER DROPDOWN */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative -m-2.5 p-2.5 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
                title="Open Notification Center"
              >
                <span className="sr-only">View notifications</span>
                <Bell className="h-5 w-5" aria-hidden="true" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white leading-none">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Center Dropdown Panel */}
              {isNotificationsOpen && (
                <div className="absolute right-0 z-50 mt-2.5 w-80 sm:w-96 rounded-sm bg-white border border-gray-200 shadow-2xl flex flex-col overflow-hidden">
                  {/* Panel Header */}
                  <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-blue-600" />
                      <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                        Notification Center ({notifications.length})
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={fetchNotifications}
                        disabled={isFetchingNotifs}
                        className="text-gray-400 hover:text-blue-600 transition-colors cursor-pointer"
                        title="Refresh Notifications"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isFetchingNotifs ? "animate-spin text-blue-600" : ""}`} />
                      </button>
                      <button
                        onClick={handleClearAll}
                        className="text-[11px] font-semibold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                        title="Clear all notifications"
                      >
                        <CheckCheck className="w-3.5 h-3.5" /> Clear All
                      </button>
                      <button
                        onClick={() => setIsNotificationsOpen(false)}
                        className="text-gray-400 hover:text-gray-600 text-sm font-bold ml-1 cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  {/* Filter Tabs */}
                  <div className="flex items-center gap-1 px-3 py-1.5 bg-gray-50/70 border-b border-gray-100 text-[11px] overflow-x-auto">
                    <button
                      onClick={() => setNotificationFilter("all")}
                      className={`px-2.5 py-0.5 rounded-sm font-semibold cursor-pointer ${
                        notificationFilter === "all" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      All ({notifications.length})
                    </button>
                    <button
                      onClick={() => setNotificationFilter("call")}
                      className={`px-2.5 py-0.5 rounded-sm font-semibold cursor-pointer ${
                        notificationFilter === "call" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      📞 Calls ({notifications.filter((n) => n.category === "call").length})
                    </button>
                    <button
                      onClick={() => setNotificationFilter("invoice")}
                      className={`px-2.5 py-0.5 rounded-sm font-semibold cursor-pointer ${
                        notificationFilter === "invoice" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      ⚠️ Overdue ({notifications.filter((n) => n.category === "invoice").length})
                    </button>
                    <button
                      onClick={() => setNotificationFilter("alert")}
                      className={`px-2.5 py-0.5 rounded-sm font-semibold cursor-pointer ${
                        notificationFilter === "alert" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      🐞 Tasks ({notifications.filter((n) => n.category === "alert").length})
                    </button>
                  </div>

                  {/* Notifications List */}
                  <div className="max-h-80 overflow-y-auto divide-y divide-gray-100 bg-white">
                    {notifications.filter((n) => (notificationFilter === "all" ? true : n.category === notificationFilter)).length === 0 ? (
                      <div className="p-8 text-center text-xs text-gray-400">
                        🎉 Notification center is clean & empty!
                      </div>
                    ) : (
                      notifications
                        .filter((n) => (notificationFilter === "all" ? true : n.category === notificationFilter))
                        .map((notif) => (
                          <div
                            key={notif.id}
                            className={`p-3 transition-colors flex items-start justify-between gap-2.5 hover:bg-gray-50 ${
                              notif.unread ? "bg-blue-50/40" : ""
                            }`}
                          >
                            <div className="flex items-start gap-2.5 flex-1">
                              <div className="shrink-0 mt-0.5">
                                {notif.category === "invoice" && <CreditCard className="w-4 h-4 text-amber-600" />}
                                {notif.category === "call" && <PhoneCall className="w-4 h-4 text-blue-600" />}
                                {notif.category === "alert" && <AlertCircle className="w-4 h-4 text-red-600" />}
                                {notif.category === "system" && <Rocket className="w-4 h-4 text-emerald-600" />}
                              </div>

                              <div className="flex-1 space-y-0.5">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="font-bold text-gray-900 leading-tight">{notif.title}</span>
                                  <span className="text-[10px] text-gray-400 font-mono">{notif.time}</span>
                                </div>
                                <p className="text-[11px] text-gray-600 leading-relaxed whitespace-pre-wrap">
                                  {notif.description}
                                </p>
                                {notif.link && (
                                  <Link
                                    href={notif.link}
                                    onClick={() => {
                                      handleDismissNotification(notif.id);
                                      setIsNotificationsOpen(false);
                                    }}
                                    className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:underline pt-0.5"
                                  >
                                    View Details <ExternalLink className="w-3 h-3" />
                                  </Link>
                                )}
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleDismissNotification(notif.id)}
                              className="text-gray-300 hover:text-gray-500 text-xs font-bold p-0.5 cursor-pointer"
                              title="Dismiss notification"
                            >
                              ✕
                            </button>
                          </div>
                        ))
                    )}
                  </div>

                  {/* Panel Footer */}
                  <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-[11px] text-gray-500 flex justify-between items-center">
                    <span>Auto-sync active (Every 45s)</span>
                    <button
                      onClick={fetchNotifications}
                      className="text-blue-600 font-semibold hover:underline cursor-pointer"
                    >
                      Sync Now
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" aria-hidden="true" />
            
            {/* Prominent Logged-In User Badge */}
            <div className="relative">
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)} 
                type="button" 
                className="-m-1.5 flex items-center p-1.5 hover:bg-gray-50 rounded-sm transition-colors cursor-pointer border border-transparent hover:border-gray-200"
              >
                <span className="sr-only">Open user menu</span>
                <div className="h-8 w-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div className="hidden md:flex md:flex-col md:items-start text-left ml-2.5">
                  <span className="text-xs font-bold text-gray-900 leading-tight">
                    {userName}
                  </span>
                  <span className="text-[10px] text-gray-500 font-medium">
                    {userEmail}
                  </span>
                </div>
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 z-20 mt-2.5 w-60 origin-top-right rounded-sm bg-white py-2 border border-gray-200">
                  <div className="px-4 py-2 border-b border-gray-100 bg-gray-50/50">
                    <p className="text-xs font-bold text-gray-900">{userName}</p>
                    <p className="text-[11px] text-gray-500">{userEmail}</p>
                    <span className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-xs bg-blue-100 text-blue-800">
                      {getRoleLabel(userRole)}
                    </span>
                  </div>

                  <button type="button" className="flex w-full items-center px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 cursor-pointer" onClick={() => { setActiveModal("profile"); setIsDropdownOpen(false); }}>
                    <User className="mr-2 h-3.5 w-3.5 text-gray-400" /> My Profile
                  </button>
                  <button type="button" className="flex w-full items-center px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 cursor-pointer" onClick={() => { setActiveModal("settings"); setIsDropdownOpen(false); }}>
                    <Settings className="mr-2 h-3.5 w-3.5 text-gray-400" /> Workspace Settings
                  </button>
                  <div className="my-1 border-t border-gray-100" />
                  <button type="button" className="flex w-full items-center px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 cursor-pointer" onClick={handleSignOut}>
                    <LogOut className="mr-2 h-3.5 w-3.5" /> Sign out ({userName.split(' ')[0]})
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Profile Modal */}
      {activeModal === "profile" && (
        <div className="relative z-50">
          <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-xs transition-opacity" onClick={() => setActiveModal(null)}></div>
          <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <form onSubmit={handleProfileSubmit} className="relative transform overflow-hidden rounded-sm bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg border border-gray-200">
                <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-xl sm:mx-0">
                      {userName.charAt(0).toUpperCase()}
                    </div>
                    <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                      <h3 className="text-lg font-bold leading-6 text-gray-900">User Profile</h3>
                      <p className="text-xs text-gray-500">Currently logged in account details</p>
                      
                      <div className="mt-4 space-y-4 text-xs">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="col-span-2">
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name</label>
                            <input name="name" type="text" defaultValue={userName} required className="block w-full rounded-sm border border-gray-200 py-1.5 px-3 text-xs text-gray-900 focus:border-blue-500 focus:outline-none" />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Role / Position</label>
                            <div className="py-1.5 font-bold text-blue-700">{getRoleLabel(userRole)}</div>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
                            <div className="py-1.5 font-semibold text-gray-900">{userEmail}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 gap-2 border-t border-gray-200">
                  <button type="submit" disabled={isLoading} className="inline-flex w-full justify-center rounded-sm bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 disabled:opacity-50 sm:ml-3 sm:w-auto cursor-pointer">
                    {isLoading ? "Saving..." : "Save Changes"}
                  </button>
                  <button type="button" onClick={() => setActiveModal(null)} className="mt-3 inline-flex w-full justify-center rounded-sm bg-white px-4 py-2 text-xs font-semibold text-gray-700 shadow-xs ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto cursor-pointer">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {activeModal === "settings" && (
        <div className="relative z-50">
          <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-xs transition-opacity" onClick={() => setActiveModal(null)}></div>
          <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <form onSubmit={handleSettingsSubmit} className="relative transform overflow-hidden rounded-sm bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg border border-gray-200">
                <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 sm:mx-0">
                      <Settings className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                      <h3 className="text-lg font-bold leading-6 text-gray-900">Workspace Settings</h3>
                      
                      <div className="mt-4 space-y-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">Organization Name</label>
                          <input name="orgName" type="text" required defaultValue={orgName} className="block w-full rounded-sm border border-gray-200 py-1.5 px-3 text-xs text-gray-900 focus:border-blue-500 focus:outline-none" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Currency</label>
                            <select className="block w-full rounded-sm border border-gray-200 py-1.5 px-3 text-xs text-gray-900 focus:border-blue-500 focus:outline-none bg-white">
                              <option>INR (₹)</option>
                              <option>USD ($)</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Date Format</label>
                            <select className="block w-full rounded-sm border border-gray-200 py-1.5 px-3 text-xs text-gray-900 focus:border-blue-500 focus:outline-none bg-white">
                              <option>DD/MM/YYYY</option>
                              <option>MM/DD/YYYY</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 gap-2 border-t border-gray-200">
                  <button type="submit" disabled={isLoading} className="inline-flex w-full justify-center rounded-sm bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 disabled:opacity-50 sm:ml-3 sm:w-auto cursor-pointer">
                    {isLoading ? "Saving..." : "Save Changes"}
                  </button>
                  <button type="button" onClick={() => setActiveModal(null)} className="mt-3 inline-flex w-full justify-center rounded-sm bg-white px-4 py-2 text-xs font-semibold text-gray-700 shadow-xs ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto cursor-pointer">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
