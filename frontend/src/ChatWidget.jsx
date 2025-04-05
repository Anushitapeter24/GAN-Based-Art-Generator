import React, { useState, useEffect, useRef } from "react";
import "./ChatWidget.css"; // We'll create this file for additional styling

const ChatWidget = () => {
  // State management
  const [isOpen, setIsOpen] = useState(false);
  const [choice, setChoice] = useState("");
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [currentTypingText, setCurrentTypingText] = useState("");
  const [typingIndex, setTypingIndex] = useState(0);
  const [typingMessage, setTypingMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [bgTextIndex, setBgTextIndex] = useState(0);
  const [bgCurrentText, setBgCurrentText] = useState("");
  const [bgIsTyping, setBgIsTyping] = useState(true);
  const [bgTypingIndex, setBgTypingIndex] = useState(0);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Background text phrases
  const bgTexts = [
    "Hi There!! Welcome to GenArtVerse",
    "An Application for Generating Poem and Images",
    "Just enter your prompt and get Content of your choice",
    "Awesome right? 😇 Give it a try"
  ];

  const [recording, setRecording] = useState(false); // State to track recording

const handleVoiceInput = async () => {
  setRecording(true); // Indicate recording
  try {
    const response = await fetch("http://localhost:8000/voice-to-text/", {
      method: "POST",
    });

    if (!response.ok) {
      throw new Error("Voice recognition failed.");
    }

    const data = await response.json();
    console.log("FULL IMAGE",data.result.image_base64.substring(0,100)+"...");
    console.log("FULL TEXT",data.result.image_base64.length);
    setPrompt(data.text); // Set recognized text as prompt
  } catch (error) {
    console.error("Error recognizing voice:", error);
  } finally {
    setRecording(false); // Stop recording
  }
};

  // Color theme based on dark mode
  const theme = {
    background: darkMode ? "#121212" : "#e5ded8",
    header: darkMode ? "#1e1e1e" : "#1C1678",
    primary: darkMode ? "#DD5746" : "#1C1678",
    secondary: darkMode ? "#8B93FF" : "#3572EF",
    paper: darkMode ? "#1e1e1e" : "#ffffff",
    botMessage: darkMode ? "#333" : "#ffffff",
    userMessage: darkMode ? "#1E0342" : "#dcf8c6",
    text: darkMode ? "#ffffff" : "#000000",
    secondaryText: darkMode ? "#aaaaaa" : "#666666",
  };

  // Scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isOpen]);

  // Initialize with loading screen when chat is first opened
  useEffect(() => {
    if (isOpen && initialLoading) {
      setTimeout(() => {
        setInitialLoading(false);
        startTyping("Hello");
      }, 1000);
    }
  }, [isOpen, initialLoading]);

  // Reset states when widget is closed
  useEffect(() => {
    if (!isOpen) {
      // Keep messages but reset typing states
      setIsTyping(false);
      setCurrentTypingText("");
      setTypingIndex(0);
    }
  }, [isOpen]);

  // Background text animation effect
  useEffect(() => {
    if (bgIsTyping) {
      // Type current text
      if (bgTypingIndex < bgTexts[bgTextIndex].length) {
        const timeout = setTimeout(() => {
          setBgCurrentText(prev => prev + bgTexts[bgTextIndex][bgTypingIndex]);
          setBgTypingIndex(prev => prev + 1);
        }, Math.random() * 80 + 50); // Random typing speed
        
        return () => clearTimeout(timeout);
      } else {
        // Finished typing, pause before erasing
        const timeout = setTimeout(() => {
          setBgIsTyping(false);
          setBgTypingIndex(bgTexts[bgTextIndex].length - 1);
        }, 2000);
        
        return () => clearTimeout(timeout);
      }
    } else {
      // Erase text
      if (bgTypingIndex >= 0) {
        const timeout = setTimeout(() => {
          setBgCurrentText(prev => prev.slice(0, -1));
          setBgTypingIndex(prev => prev - 1);
        }, Math.random() * 50 + 30);
        
        return () => clearTimeout(timeout);
      } else {
        // Finished erasing, move to next text
        const nextIndex = (bgTextIndex + 1) % bgTexts.length;
        setBgTextIndex(nextIndex);
        setBgIsTyping(true);
        setBgTypingIndex(0);
        setBgCurrentText("");
      }
    }
  }, [bgIsTyping, bgTypingIndex, bgTextIndex]);

  // Typing effect manager for chat
  useEffect(() => {
    if (isTyping && typingIndex < typingMessage.length) {
      const timeout = setTimeout(() => {
        setCurrentTypingText(prev => prev + typingMessage[typingIndex]);
        setTypingIndex(prev => prev + 1);
      }, Math.random() * 30 + 30); // Random typing speed
      
      return () => clearTimeout(timeout);
    } else if (isTyping && typingIndex >= typingMessage.length) {
      // Typing complete
      setChatMessages(prev => [...prev, { text: currentTypingText, isBot: true }]);
      setIsTyping(false);
      setCurrentTypingText("");
      setTypingIndex(0);
      
      // Start the follow-up "What do you want to do today?" message after first Hello
      if (typingMessage === "Hello" && chatMessages.length === 0) {
        setTimeout(() => {
          startTyping("What do you want to do today?");
        }, 500);
      }
    }
  }, [isTyping, typingIndex, typingMessage, chatMessages, currentTypingText]);

  const startTyping = (message) => {
    setTypingMessage(message);
    setCurrentTypingText("");
    setTypingIndex(0);
    setIsTyping(true);
  };


  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleGenerate = async () => {
    if (!prompt) {
      setChatMessages(prev => [...prev, { text: "Please enter a prompt!", isBot: true }]);
      return;
    }
    
    // Add user message to chat
    setChatMessages(prev => [...prev, { text: prompt, isBot: false }]);
    
    setLoading(true);
    setChatMessages(prev => [...prev, { text: `Generating ${choice}`, isBot: true, isLoading: true }]);
  
    try {
      const response = await fetch("http://localhost:8000/generate/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          choice: choice, 
          prompt: prompt,
        }),
      });
  
      if (!response.ok) {
        throw new Error("Failed to generate result.");
      }
  
      const data = await response.json();
      console.log("DATA RESULT",data)
      setResult(data.result);
      
      // Update chat with result
      setChatMessages(prev => {
        const newMessages = [...prev];
        // Replace the loading message
        const loadingIndex = newMessages.findIndex(msg => msg.isLoading);
        if (loadingIndex !== -1) {
          newMessages.splice(loadingIndex, 1, { 
            text: "Here's your result:",
            isBot: true,
            result: {
              type: choice,
              content: data.result
            }
          });
        }
        console.log("CONTENT",data.result)
        // console.log("IMAGE PATH---------",data.result.image_base64)
        console.log("MESSAGE----",newMessages)
        return newMessages;
      });
      
    } catch (error) {
      console.error("Error generating:", error);
      // Update chat with error message
      setChatMessages(prev => {
        const newMessages = [...prev];
        // Replace the loading message
        const loadingIndex = newMessages.findIndex(msg => msg.isLoading);
        if (loadingIndex !== -1) {
          newMessages.splice(loadingIndex, 1, { 
            text: "Error generating content. Please try again.",
            isBot: true,
            isError: true
          });
        }
        return newMessages;
      });
    } finally {
      setLoading(false);
      setPrompt(""); // Clear prompt field after generation
    }
  };

  const handleOptionSelect = (selectedChoice) => {
    // Clear initial messages
    setChatMessages([]);
    
    // Add user choice as a message
    setChatMessages(prev => [...prev, {
      text: `I want to generate a ${selectedChoice}`,
      isBot: false
    }]);
    
    setLoading(true);
    
    // Show typing effect for response
    setTimeout(() => {
      setLoading(false);
      startTyping(`Great! Please enter a prompt for your ${selectedChoice}:`);
      setChoice(selectedChoice);
    }, 1000);
  };
  

  const handleBack = () => {
    // Reset to initial state
    setChoice("");
    setPrompt("");
    setResult("");
    setChatMessages([]);
    
    // Start chat sequence again
    setTimeout(() => {
      startTyping("Hello again! What do you want to do today?");
    }, 500);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  // Custom toggle switch component
  const ToggleSwitch = ({ checked, onChange }) => (
    <div 
      onClick={onChange}
      style={{
        position: 'relative',
        width: '46px',
        height: '24px',
        backgroundColor: checked ? theme.secondary : '#ccc',
        borderRadius: '12px',
        cursor: 'pointer',
        transition: 'background-color 0.3s'
      }}
    >
      <div 
        style={{
          position: 'absolute',
          left: checked ? '22px' : '2px',
          top: '2px',
          width: '20px',
          height: '20px',
          backgroundColor: '#fff',
          borderRadius: '50%',
          transition: 'left 0.3s',
          boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
        }}
      />
    </div>
  );

  // Check if the last bot message was the greeting so we can show buttons
  const lastBotMessage = [...chatMessages].reverse().find(msg => msg.isBot);
  const shouldShowOptions = !choice && !isTyping && 
    lastBotMessage && 
    (lastBotMessage.text === "What do you want to do today?" || 
     lastBotMessage.text === "Hello again! What do you want to do today?");

  return (
    <div className="chat-widget-container">
      {/* Animated background with typing text */}
      <div className="chat-widget-background">
        <div className="animated-gradient"></div>
        <div className="animated-text">{bgCurrentText}</div>
      </div>
      <div className="chat-design-name">
        GenArtVerse
    </div>

      {/* Chat toggle button */}
      <button 
        className={`chat-widget-button ${isOpen ? 'active' : ''}`}
        onClick={toggleChat}
        style={{
          backgroundColor: theme.primary,
          boxShadow: "0 2px 10px rgba(0,0,0,0.3)"
        }}
      >
        {isOpen ? "×" : "🤖"}
      </button>

      {/* Chat window */}
      <div 
        className={`chat-widget-window ${isOpen ? 'open' : ''}`}
        ref={chatContainerRef}
        style={{
          backgroundColor: theme.paper,
          boxShadow: "0 5px 40px rgba(0,0,0,0.16)"
        }}
      >
        {/* Loading screen */}
        {isOpen && initialLoading && (
          <div className="chat-loading-screen" style={{ 
            background: `linear-gradient(120deg, ${darkMode ? "#232526, #414345" : "#075e54, #1C1678"})`,
          }}>
            <h2>Text to Art Generator</h2>
            <div className="loading-spinner"></div>
          </div>
        )}

        {/* Header */}
        <div className="chat-widget-header" style={{ backgroundColor: theme.header }}>
          {choice && (
            <button 
              onClick={handleBack}
              className="chat-back-button"
            >
              ← Back
            </button>
          )}
          
          <div className="chat-avatar" style={{ backgroundColor: theme.secondary }}>
          🤖
          </div>
          
          <div className="chat-header-title">
            <div className="chat-title">ArtBot</div>
            {isTyping && <div className="chat-status">typing...</div>}
          </div>
          
          <div className="chat-header-actions">
            <label className="theme-toggle-label">
              {darkMode ? "🌙" : "☀️"}
            </label>
            <ToggleSwitch checked={darkMode} onChange={() => setDarkMode(!darkMode)} />
          </div>
        </div>

        {/* Chat area */}
        <div className="chat-messages-container" style={{ 
          backgroundImage: darkMode ? "none" : "url('https://web.whatsapp.com/img/bg-chat-tile-light_04fcacde539c58cca6745483d4858c52.png')",
          backgroundColor: theme.background
        }}>
          <div className="chat-messages">
            {/* Chat messages */}
            {chatMessages.map((message, index) => (
              <div key={index} className={`chat-message ${message.isBot ? 'bot' : 'user'}`}>
                {message.isBot && (
                  <div className="chat-avatar small" style={{ backgroundColor: theme.secondary }}>
                    🤖
                  </div>
                )}
                
                <div className="message-bubble" style={{ 
                  backgroundColor: message.isBot ? theme.botMessage : theme.userMessage,
                  color: theme.text
                }}>
                  {message.isLoading ? (
                    <div className="loading-message">
                      <span>{message.text}</span>
                      <div className="dot-typing"></div>
                    </div>
                  ) : message.result ? (
                    <>
                      <div className="message-text">{message.text}</div>
                      {message.result.type === "poem" ? (
                        
                        <div className="poem-content" style={{ 
                          backgroundColor: darkMode ? "#222" : "#f7f7f7"
                        }}>
                          {message.result.content}
                        </div>

                      ) :  message.result.type === "image" ? (
                        <div style={{padding:"10px"}}>
                            <p>Generated Image</p>
                            {/* <img src={testbaseimage} alt="Test Image" style={{border:"1px solid red"}}/> */}
                            <img
                              src={message.result.image_base64}
                              alt="Generated"
                            //   className="result-image"
                              style={{border:"1px solid red"}}
                            />
                        </div>
                      ) : null}
                    </>
                  ) : (
                    <div>{message.text}</div>
                  )}
                  
                  {/* Message timestamp */}
                  <div className="message-time" style={{ color: theme.secondaryText }}>
                    {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </div>
                </div>
              </div>
            ))}
            
            {/* Typing indicator */}
            {isTyping && (
              <div className="chat-message bot">
                <div className="chat-avatar small" style={{ backgroundColor: theme.secondary }}>
                🤖
                </div>
                
                <div className="message-bubble typing" style={{ 
                  backgroundColor: theme.botMessage,
                  color: theme.text
                }}>
                  {currentTypingText}
                </div>
              </div>
            )}
            
            {/* Options buttons after appropriate messages */}
            {shouldShowOptions && (
              <div className="chat-options">
                <button
                  onClick={() => handleOptionSelect("poem")}
                  className="option-button"
                  style={{ backgroundColor: theme.primary }}
                >
                  Generate Poem
                </button>
                <button
                  onClick={() => handleOptionSelect("image")}
                  className="option-button"
                  style={{ backgroundColor: theme.primary }}
                >
                  Generate Image
                </button>
              </div>
            )}
            
            {/* For auto-scrolling */}
            <div ref={messagesEndRef} />
          </div>
        </div>
        
        {/* Input Area */}
        {choice && !loading && (
  <div
    className="chat-input-container"
    style={{
      backgroundColor: darkMode ? "#1e1e1e" : "#f0f0f0",
      borderTop: `1px solid ${darkMode ? "#333" : "#d0d0d0"}`,
      display: "flex", // Align input and mic button
      alignItems: "center",
      padding: "8px",
    }}
  >
    <textarea
      placeholder={`Enter your ${choice} prompt...`}
      value={prompt}
      onChange={(e) => setPrompt(e.target.value)}
      onKeyPress={handleKeyPress}
      className="chat-input"
      style={{
        flex: 1, // Take available space
        backgroundColor: darkMode ? "#2d2d2d" : "#fff",
        color: theme.text,
        border: "none",
        padding: "10px",
        borderRadius: "5px",
        resize: "none",
      }}
      rows={1}
    />

    {/* Microphone Button */}
    <button
      onClick={handleVoiceInput}
      title="Speak your prompt"
      style={{
        marginRight: "3px",
        backgroundColor: recording ? "#0118D8" : theme.primary,
        color: "#fff",
        borderRadius: "50%",
        padding: "10px",
      }}
    >
      🎙️
    </button>
            <button
              onClick={handleGenerate}
              disabled={!prompt || loading}
              className="send-button"
              style={{
                backgroundColor: theme.primary,
                opacity: prompt && !loading ? 1 : 0.7
              }}
            >
              →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatWidget;