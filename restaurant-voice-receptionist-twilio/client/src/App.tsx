import { Provider } from "react-redux";
import { store } from "./store/store";
import {
  BrowserRouter as Router,
  Navigate,
  Routes,
  Route,
} from "react-router-dom";
import {
  Sidebar,
  SidebarBody,
  SidebarLink,
  SidebarLinkLogout,
  SidebarLogo,
  SidebarLogoIcon,
} from "./components/sidebar";
import {
  IconAdjustmentsQuestion,
  IconChartHistogram,
  IconUser,
  IconLogout,
} from "@tabler/icons-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useState } from "react";
import { cn } from "./utils/cn";
import { AuthListener } from "./hooks/authListner";
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";

import { Insights } from "./pages/insights";
import { Login } from "./pages/login";
import { QA } from "./pages/qa";
import { useAppDispatch, useAppSelector } from "./hooks/useAppDispatch";
import { logOut } from "./store/authSlice";

export default function App() {
  return (
    <Provider store={store}>
      <AuthListener>
        <Content />
      </AuthListener>
    </Provider>
  );
}

const Content = () => {
  const links = [
    {
      label: "Insights",
      href: "/",
      icon: (
        <IconChartHistogram className="text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Question Answers",
      href: "/qa",
      icon: (
        <IconAdjustmentsQuestion className="text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
  ];
  const [open, setOpen] = useState(false);
  const { currentUser } = useAppSelector((state) => state.auth);

  const dispatch = useAppDispatch();

  const handleLogout = async () => {
    try {
      await dispatch(logOut()).unwrap();
      toast.success("Logout successful");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Router>
      <div
        className={cn(
          "flex flex-col md:flex-row dark:bg-red1 w-full flex-1 mx-auto overflow-hidden",
          "h-screen"
        )}
      >
        <Sidebar open={open} setOpen={setOpen}>
          <SidebarBody className="justify-between gap-10 bg-red1">
            <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
              {open ? <SidebarLogo /> : <SidebarLogoIcon />}
              <div className="mt-8 flex flex-col gap-2">
                {links.map((link, idx) => (
                  <SidebarLink key={idx} link={link} disabled={!currentUser} />
                ))}
              </div>
            </div>
            <div>
              {currentUser && (
                <SidebarLinkLogout
                  label={currentUser.email}
                  icon={
                    <IconUser className="text-neutral-200 h-7 w-7 flex-shrink-0" />
                  }
                  onLogout={handleLogout}
                />
              )}
              {!currentUser && (
                <SidebarLink
                  link={{
                    label: "Login",
                    href: "/login",
                    icon: (
                      <IconLogout className="text-neutral-200 h-7 w-7 flex-shrink-0" />
                    ),
                  }}
                />
              )}
            </div>
          </SidebarBody>
        </Sidebar>
        <Routes>
          <Route path="/" element={<ProtectedRoute element={<Insights />} />} />
          <Route path="/qa" element={<ProtectedRoute element={<QA />} />} />
          <Route path="/login" element={<PublicRoute element={<Login />} />} />
          <Route path="*" element={<Navigate to="/qa" />} />
        </Routes>
      </div>
      <ToastContainer
        pauseOnFocusLoss={false}
        position="bottom-right"
        theme="dark"
      />
    </Router>
  );
};
