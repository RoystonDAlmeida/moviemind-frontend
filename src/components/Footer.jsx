import React from 'react';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-400 text-center p-4 mt-auto">
      <div className="space-y-1"> {/* Optional: Add spacing if needed */}
        <p>&copy; {currentYear} MovieMind. All rights reserved.</p>
        <p className="text-xs">Made with ❤️ by Royston D'Almeida</p> {/* Add your personalization here */}
      </div>
    </footer>
  );
}

export default Footer;