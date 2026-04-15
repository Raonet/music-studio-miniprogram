import { createBrowserRouter } from "react-router";
import Home from "./pages/Home";
import Schedule from "./pages/Schedule";
import LessonHistory from "./pages/LessonHistory";
import LeaveRequest from "./pages/LeaveRequest";
import Messages from "./pages/Messages";
import Profile from "./pages/Profile";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Home,
  },
  {
    path: "/schedule",
    Component: Schedule,
  },
  {
    path: "/history",
    Component: LessonHistory,
  },
  {
    path: "/leave",
    Component: LeaveRequest,
  },
  {
    path: "/messages",
    Component: Messages,
  },
  {
    path: "/profile",
    Component: Profile,
  },
]);