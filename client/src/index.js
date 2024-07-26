import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { SocketProvider } from "./Providers/SocketProvider";
import Room from "./Room";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: (
      <div>
        <h1>404 - Page Not Found.</h1>
      </div>
    ),
  },
  {
    path: "/room/:roomId",
    element: <Room />,
  },
]);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <SocketProvider>
      <RouterProvider router={router} />
    </SocketProvider>
);
