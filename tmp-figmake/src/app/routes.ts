import { createBrowserRouter } from "react-router";
import Login from "./pages/Login";
import Permission from "./pages/Permission";
import PickApps from "./pages/PickApps";
import CreateContract from "./pages/CreateContract";
import Dashboard from "./pages/Dashboard";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Login,
  },
  {
    path: "/permission",
    Component: Permission,
  },
  {
    path: "/pick-apps",
    Component: PickApps,
  },
  {
    path: "/create-contract",
    Component: CreateContract,
  },
  {
    path: "/dashboard",
    Component: Dashboard,
  },
]);
