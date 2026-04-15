import { RouterProvider } from "react-router";
import { router } from "./routes";

function App() {
  return (
    <div className="antialiased">
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
