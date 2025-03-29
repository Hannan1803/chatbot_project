import { useEffect, useState } from "react";
import { Bot, User, Send, CircleUserRound,Youtube  } from "lucide-react";

function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]); // Stores chat history
  const [loading, setLoading] = useState(false); // Tracks response loading state
  const [option, setOption] = useState(false); // Tracks selected option

  async function optionbtn(e){
    setOption(true);
    const trimmedInput = input.trim();
    if (!trimmedInput) return; // Prevent empty submissions
    const arr = [e , trimmedInput]
    console.log(arr);
    const userMessage = { role: "user", text: trimmedInput };
    setMessages((prev) => [...prev, userMessage]); // Update chat history
    setLoading(true); // Start loading state
    if(arr[0] === 'Youtube'){
      try{
        console.log("Youtube kula vanthachu");
        const respone = await fetch("http://localhost:5001/youtube", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ questions: trimmedInput }),
        });
        const data = await respone.json();
        console.log("Received data for utube:", data);
        if (data) {
          // Create a list from the response
          const videoList = data.map((video, index) => (
            `<li key=${index}>
              <strong>Title:</strong> ${video.title}<br/>
              <strong>Timestamps:</strong> ${video.timestamps}<br/>
              <strong>Video Link:</strong> <a href="${video.video_url}" target="_blank">Watch Video</a>
            </li>`
          )).join(""); // Join the list into a single string
  
          const botMessage = { role: "bot", text: `<ol>${videoList}</ol>` }; // Wrap in an ordered list
          setMessages((prev) => [...prev, botMessage]); // Store bot's response
        } else {
          const botMessage = { role: "bot", text: "No video information found." };
          setMessages((prev) => [...prev, botMessage]); // No data case
        }
      }
      catch(error){
        console.error("Error communicating with Python:", error.message);
      }
      finally {
        setLoading(false); // Stop loading state
        setOption(false);
      }
    }
    else if(arr[0] === 'Websites'){
      console.log("Selected websites");
    }
    else if(arr[0] === 'Quiz'){
      console.log("Selected quiz");
    }
    else{
      console.error("Invalid option selected");
    }
    setInput(""); // Clear input field
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    if(option == false){
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
      <div className="bg-gray-200 flex flex-col justify-center p-8 font-[poppins] shadow-lg w-full sticky bottom-0 left-0">
        <div className="flex justify-center items-center gap-10 mb-4">
          <button className={`relative text-md font-semibold ${input.length === 0 ? "cursor-not-allowed" : `hover:text-red-600 transition-colors duration-300
                before:absolute before:left-0 before:-bottom-1 before:w-0 before:h-[2px] before:bg-red-600 before:transition-all before:duration-300
                hover:before:w-full hover:cursor-pointer`}`}
                onClick={() => optionbtn('Youtube')}
                disabled={input.length === 0}
                  >
            Youtube
          </button>

          <button className={`relative text-md font-semibold ${input.length === 0 ? "cursor-not-allowed" : `hover:text-blue-600 transition-colors duration-300
                before:absolute before:left-0 before:-bottom-1 before:w-0 before:h-[2px] before:bg-blue-600 before:transition-all before:duration-300
                hover:before:w-full hover:cursor-pointer`}`}
                onClick={() => optionbtn('Websites')}
                disabled={input.length === 0}
                   >
            Websites
          </button>

          <button className={`relative text-md font-semibold ${input.length === 0 ? "cursor-not-allowed" : `hover:text-green-600 transition-colors duration-300
                before:absolute before:left-0 before:-bottom-1 before:w-0 before:h-[2px] before:bg-green-600 before:transition-all before:duration-300
                hover:before:w-full hover:cursor-pointer`}`}
                onClick={() => optionbtn('Quiz')}
                disabled={input.length === 0}
                >
                   
            Quiz
          </button>

        </div>

        <div className="justify-center items-center mb-4">
          <form className="flex justify-center items-center gap-2 " onSubmit={handleSubmit}>
            <div className="relative flex flex-col w-full max-w-lg">
              <input
                id="inputBox"
                className="border border-gray-400 p-6 pr-12 rounded-lg w-full shadow-lg bg-white"
                type="text"
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter question"
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
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default App;