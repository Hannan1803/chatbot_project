import { useEffect, useState } from "react";
import { Bot, User, Send, CircleUserRound,Youtube  } from "lucide-react";

function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]); // Stores chat history
  const [loading, setLoading] = useState(false); // Tracks response loading state

  async function handleSubmit(e) {
    e.preventDefault();
    
    const trimmedInput = input.trim();
    if (!trimmedInput) return; // Prevent empty submissions

    const userMessage = { role: "user", text: trimmedInput };
    setMessages((prev) => [...prev, userMessage]); // Update chat history
    setLoading(true); // Start loading state
    

    try {
      const response = await fetch("http://localhost:5001/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questions: [trimmedInput] }),
      });
      
      const data = await response.json();
      console.log("Received data:", data.answers);

      const botMessage = { role: "bot", text: data.answers.trim() };
      setMessages((prev) => [...prev, botMessage]); // Store bot's response
    } catch (error) {
      console.error("Error communicating with Python:", error.message);
    } finally {
      setLoading(false); // Stop loading state
    }

    setInput(""); // Clear input field
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="bg-gray-200 p-4 font-[poppins] shadow-lg mx-auto w-full">
        <ul className="flex justify-center items-center gap-2">
          <li className="md:h-auto"><Bot /></li>
          <li className="md:text-2xl">CHATBOT</li>
        </ul>
      </div>

      {/* Chat Section */}
      <div className="flex-1 chat-section p-4 space-y-2 overflow-auto">
        {messages.map((msg, index) => (
          <div key={index} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "bot" && <Bot className="text-gray-500" />} {/* Bot icon on the left */}
            <div className={`p-3 rounded-lg w-fit max-w-lg ${
              msg.role === "user" 
                ? "bg-blue-500 text-white self-end ml-auto" 
                : "bg-gray-300 text-black self-start mr-auto"
            }`}>
              {msg.text}
            </div>
            {msg.role === "user" && <CircleUserRound className="text-blue-500" />} {/* User icon on the right */}
          </div>
        ))}

        {/* Loading state */}
        {loading && (
          <div className="flex gap-2 justify-start">
            <Bot className="text-gray-500" />
            <div className="p-3 rounded-lg w-fit max-w-xs bg-gray-300 text-black self-start mr-auto">
              Loading...
            </div>
          </div>
        )}
      </div>

      {/* Input Field */}
      <div className="bg-gray-200 p-4 font-[poppins] shadow-lg w-full sticky bottom-0 left-0">
        <form className="flex justify-center items-center gap-2 " onSubmit={handleSubmit}>
          <div className="relative flex flex-col w-full max-w-lg">
            <input
              id="inputBox"
              className="border border-gray-400 p-6 pr-12 rounded-full w-full shadow-lg bg-white"
              type="text"
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message"
            />
            <button
              className={`absolute right-4 top-1/2 transform -translate-y-1/2 
                ${input.length === 0 ? "cursor-not-allowed" : "transition-transform duration-300 hover:text-green-500 hover:cursor-pointer hover:scale-115"}`}
              type="submit"
              onClick={()=>{
                document.getElementById("inputBox").value = "";
              }}
              disabled={input.length === 0}
            >
              <Send />
            </button>
            <button
              className={`
                ${input.length === 0 ? "cursor-not-allowed" : "transition-transform duration-300 hover:text-green-500 hover:cursor-pointer hover:scale-115"}`}
              type="submit"
              onClick={()=>{
                document.getElementById("inputBox").value = "";
              }}
              disabled={input.length === 0}
            >
              <Youtube />
            </button>

          </div>
        </form>
      </div>
    </div>
  );
}

export default App;