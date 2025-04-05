

import React from 'react';
import ChatWidget from './ChatWidget';

function App() {
  return (
    <div className="your-website-content">
      {/* Your existing website content */}
      
      {/* Add the chat widget - it will position itself */}
      <ChatWidget />
    </div>
  );
}

export default App;