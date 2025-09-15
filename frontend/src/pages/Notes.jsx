import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import {
  logoutUser,
  upgradePlan,
  fetchTenantMeta,
} from "../features/authSlice";
import { useNavigate,Link } from "react-router-dom";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";


function Notes() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeLoading, setUpgradeLoading] = useState(false);

  const token = useSelector((state) => state.auth.token);
  const user = useSelector((state) => state.auth.user);
  const tenant = useSelector((state) => state.auth.tenant);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      fetchNotes();
      dispatch(fetchTenantMeta());
    }
  }, [token]);

  const fetchNotes = async () => {
    try {
      const res = await axios.get("/api/notes", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotes(res.data);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to load notes");
    }
  };

  const addNote = async () => {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    try {
      await axios.post(
        "/api/notes",
        { title, content },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setTitle("");
      setContent("");
      fetchNotes();
      toast.success("Note added successfully");
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Could not add note";
      toast.error(errorMsg);

      if (errorMsg.includes("Free plan limit") && user?.role === "ADMIN") {
        setShowUpgradeModal(true);
      }
    }
  };

  const updateNote = async () => {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    try {
      await axios.put(
        `/api/notes/${editingId}`,
        { title, content },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setTitle("");
      setContent("");
      setIsEditing(false);
      setEditingId(null);
      fetchNotes();
      toast.success("Note updated successfully");
    } catch (err) {
      toast.error(err.response?.data?.error || "Could not update note");
    }
  };

  const deleteNote = async (id) => {
    try {
      await axios.delete(`/api/notes/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotes((prev) => prev.filter((n) => n._id !== id));
      toast.success("Note deleted successfully");
    } catch {
      toast.error("Could not delete note");
    }
  };

  const startEditing = (note) => {
    setTitle(note.title);
    setContent(note.content || "");
    setIsEditing(true);
    setEditingId(note._id);
  };

  const cancelEditing = () => {
    setTitle("");
    setContent("");
    setIsEditing(false);
    setEditingId(null);
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate("/");
    toast.success("Logged out successfully");
  };

  const handleUpgrade = async () => {
    if (!tenant) return;

    setUpgradeLoading(true);
    try {
      await dispatch(upgradePlan(tenant.slug)).unwrap();
      toast.success("Workspace upgraded to Pro plan successfully!");
      setShowUpgradeModal(false);
      dispatch(fetchTenantMeta());
    } catch (err) {
      toast.error(err.error || "Could not upgrade workspace");
    } finally {
      setUpgradeLoading(false);
    }
  };

  const canAddNote = () => {
    if (!tenant) return true;
    if (tenant.plan === "PRO") return true;
    return notes.length < 3;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center">
            <div className="bg-blue-600 p-2 rounded-lg mr-3">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-blue-800">NotesKeeper</h1>
            <span className="ml-4 px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
              {tenant?.slug || "Workspace"}
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-sm font-medium text-gray-900">
                {user?.email}
              </span>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 font-medium capitalize">
                  {user?.role?.toLowerCase()}
                </span>
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${
                    tenant?.plan === "PRO"
                      ? "bg-purple-100 text-purple-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {tenant?.plan === "PRO" ? "Pro Plan" : "Free Plan"}
                </span>
              </div>
            </div>
            {user?.role === "ADMIN" && tenant?.plan !== "PRO" && (
              <button
                onClick={() => setShowUpgradeModal(true)}
                className="hidden md:inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                Upgrade to Pro
              </button>
            )}
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </header>

       {showUpgradeModal && (
  <AnimatePresence>
    <motion.div
      className="fixed inset-0 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div
        className="absolute inset-0 backdrop-blur-sm bg-white/30"
        onClick={() => setShowUpgradeModal(false)}
      ></div>

      <motion.div
        className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 z-50"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -50, opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-purple-100">
            <svg
              className="h-6 w-6 text-purple-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <h3 className="mt-2 text-lg font-medium text-gray-900">
            Upgrade to Pro Plan
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            Upgrade your workspace to unlock unlimited notes and premium features.
          </p>
          <ul className="mt-4 text-sm text-left text-gray-600 space-y-2">
            {["Unlimited notes", "Priority support", "Advanced collaboration features"].map((item) => (
              <li key={item} className="flex items-center">
                <svg
                  className="h-5 w-5 text-green-500 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-5 sm:mt-6 flex space-x-3">
          <button
            type="button"
            className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
            onClick={() => setShowUpgradeModal(false)}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={upgradeLoading}
            className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-purple-600 text-base font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-75 sm:text-sm"
            onClick={handleUpgrade}
          >
            {upgradeLoading ? "Upgrading..." : "Upgrade Now"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  </AnimatePresence>
)}

      <main className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm mb-8 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {isEditing ? "Edit Note" : "Add New Note"}
          </h2>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700"
              >
                Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Note title"
              />
            </div>
            <div>
              <label
                htmlFor="content"
                className="block text-sm font-medium text-gray-700"
              >
                Content
              </label>
              <textarea
                id="content"
                rows={4}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Note content (optional)"
              />
            </div>
            <div className="flex space-x-3">
              <button
                onClick={isEditing ? updateNote : addNote}
                disabled={!canAddNote() && !isEditing}
                className="inline-flex items-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg
                  className="-ml-1 mr-2 h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                {isEditing ? "Update Note" : "Add Note"}
              </button>
              {isEditing && (
                <button
                  onClick={cancelEditing}
                  className="inline-flex items-center px-4 py-2.5 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
              )}
            </div>
            {!canAddNote() && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-yellow-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      You've reached the limit of 3 notes on the Free plan.
                      {user?.role === "ADMIN"
                        ? " Upgrade to Pro to add more notes."
                        : " Contact your admin to upgrade."}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Your Notes</h2>
            <span className="text-sm text-gray-600">
              {notes.length} {notes.length === 1 ? "note" : "notes"}
              {tenant?.plan !== "PRO" && (
                <span className="ml-2 text-blue-600">
                  ({3 - notes.length} remaining on Free plan)
                </span>
              )}
            </span>
          </div>

          {notes.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl shadow-sm text-center border border-gray-100">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                No notes yet
              </h3>
              <p className="mt-2 text-gray-600">
                Get started by creating your first note.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {notes.map((note) => (
                <div
                  key={note._id}
                  className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-all duration-200 transform hover:-translate-y-1"
                >
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {note.title}
                      </h3>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => startEditing(note)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5h2m2 0h2m-6 0h2m-6 0H5m6 0h2M7 9l10-10 4 4-10 10H7v-4z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => deleteNote(note._id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-600 mt-2 whitespace-pre-line">
                      {note.content}
                    </p>
                  </div>
                  <div className="bg-gray-50 px-5 py-3 flex justify-between items-center text-sm text-gray-500">
                    <span>
                      Created: {new Date(note.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Notes;
