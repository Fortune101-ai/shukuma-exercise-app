import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <div style={{ padding: "20px" }}>
              <h1>Shukuma Exercise App - Coming Soon</h1>
              <p>Your fitness friend is being built</p>
            </div>
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
