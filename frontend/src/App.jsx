import { Routes, Route, Navigate } from "react-router-dom";
import Notes from "./pages/Notes";
import PrivateRoute from "./components/PrivateRoute";
import Login from "./pages/Login";
import { Toaster } from "sonner";

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/notes"
          element={
            <PrivateRoute>
              <Notes />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster position="bottom-right" expand={false} richColors />
    </>
  );
}
