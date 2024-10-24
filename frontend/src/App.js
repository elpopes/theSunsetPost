import React from "react";
import StoriesList from "./components/StoriesList";
import LanguageSwitcher from "./components/LanguageSwitcher";

function App() {
  return (
    <div className="App">
      <LanguageSwitcher />
      <StoriesList />
    </div>
  );
}

export default App;
