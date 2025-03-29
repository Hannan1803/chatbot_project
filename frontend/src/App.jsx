import { useEffect, useState } from "react";
import { Bot, User, Send, CircleUserRound, Youtube, Moon, Sun, Link, Lightbulb,LoaderCircle  } from "lucide-react";

function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]); // Stores chat history
  const [loading, setLoading] = useState(false); // Tracks response loading state
  const [option, setOption] = useState(false); // Tracks selected option
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle("dark");
  };

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
          const botMessage = {
            role: "bot",
            videos: data.map((video) => ({
              title: video.title,
              // timestamps: video.timestamps || "No timestamps available",
              video_url: video.video_url,
            })),
          };
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
      try{
        console.log("Websites kula vanthachu");
        const respone = await fetch("http://localhost:5003/website", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ questions: trimmedInput }),
        });
        const data = await respone.json();
        if (data) {
          const botMessage = {
            role: "bot",
            websites: data.map((site) => ({
              title: site.title,
              link: site.link,
            })),
          };
          setMessages((prev) => [...prev, botMessage]);
        } else {
          setMessages((prev) => [...prev, { role: "bot", text: "No website information found." }]);
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
      const response = await fetch("http://localhost:5002/ask", {
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
    <>
    <div className={`flex flex-col min-h-screen  ${darkMode ? "bg-gray-900 text-white" : "bg-white text-black"}`}>
      {/* Header */}
      <div className={`p-4 font-[poppins]  shadow-lg mx-auto w-full flex justify-between items-center ${darkMode ? "bg-gray-800" : "bg-gray-200"}`}>
        <ul className="flex items-center  gap-2">
          <li><Bot /></li>
          <li className="md:text-2xl">StudyBot</li>
        </ul>
        <button onClick={toggleDarkMode} id="darkbtn"
        className="p-2 hover:scale-120 hover:cursor-pointer transition-transform hover:rotate-360 duration-600 ease-in-out"
        >
          {darkMode ? <Sun id="darkIcon" className="text-yellow-400" /> : <Moon id="darkIcon" className="text-gray-600" />}
        </button>
      </div>

      {/* Chat Section */}

      {messages.length === 0 && (
       <div
          className={`flex flex-col items-center justify-center mx-auto p-4 border border-gray-300 rounded-lg shadow-lg w-[90%] sm:w-[50%] h-[50%] sm:h-auto mt-16 ${darkMode ? "bg-gray-800 text-white" : "bg-white text-black"}`}
        >
          <div className="flex mt-2 mb-2 flex-col items-center">
            <div className="flex items-center gap-2 mb-4">
              <h1 className="text-3xl">StudyBot</h1>
              <Bot className="text-gray-500 text-2xl" />
            </div>
            <div className="w-[70%]">
              <p className="text-xl text-center sm:block hidden">
                I'm here to help you with all your study-related questions. Whether you're struggling with a topic, need resources, or want to explore new learning materials, I'm ready to assist.
              </p>
            </div>
        
            {/* This part is for smaller screens */}
            <div className="flex justify-center items-center mt-4 sm:hidden">
              <p className="text-2xl font-semibold">How can I help you today?</p>
            </div>
        
            {/* The 3 boxes will be hidden on smaller screens */}
            <div className="flex items-center gap-4 mt-4 sm:flex hidden">
              <div className="flex flex-col hover:scale-105 duration-300 items-center gap-2 mt-4 border border-gray-300 rounded-lg p-4 shadow-lg">
                <Youtube size={40} />
                <p>Youtube Videos!</p>
              </div>
        
              <div className="flex flex-col hover:scale-105 duration-300 items-center gap-2 mt-4 border border-gray-300 rounded-lg p-4 shadow-lg">
                <Link size={40} />
                <p>Websites links!</p>
              </div>
        
              <div className="flex flex-col hover:scale-105 duration-300 items-center gap-2 mt-4 border border-gray-300 rounded-lg p-4 shadow-lg">
                <Lightbulb size={40} />
                <p>Conducts Quizzes</p>
              </div>
            </div>
          </div>
        </div>
      )}
        <div className="flex-1 chat-section p-4 space-y-2 overflow-auto">
          {messages.map((msg, index) => (
            <div key={index} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "bot" && <Bot className="text-gray-500" />} {/* Bot icon on the left */}
              <div className={`p-3 rounded-lg w-fit max-w-lg ${
                msg.role === "user"
                  ? "bg-blue-500 text-white self-end ml-auto"
                  : "bg-gray-300 text-black self-start mr-auto"
              }`}>
                {/* Render video links if available */}
          {msg.videos ? (
            <ol>
              {msg.videos.map((video, index) => (
                <li key={index}>
                  <strong>Title:</strong> {video.title}
                  <br />
                  {/* <strong>Timestamps:</strong> {video.timestamps} */}
                  {/* <br /> */}
                  <strong>Video Link:</strong>{" "}
                  <a href={video.video_url} target="_blank" rel="noopener noreferrer" className="text-blue-500">
                    Watch Video
                  </a>
                </li>
              ))}
            </ol>
          ) : msg.websites ? ( 
            /* Render website links if available */
            <ul>
              The below are some of the top websites :
              {msg.websites.map((site, idx) => (
                <li key={idx} className="mb-2">
                  <a href={site.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                    {site.title} 
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            /* If no videos or websites, render only text */
            <p>{msg.text}</p>
          )}
              </div>
              {msg.role === "user" && <CircleUserRound className="text-blue-500" />} {/* User icon on the right */}
            </div>
          ))}

          {/* Loading state */}
          {loading && (
            <div className="flex gap-2 justify-start">
              <Bot className="text-gray-500" />
              <div className="p-3 rounded-lg w-fit max-w-xs bg-gray-300 text-black self-start mr-auto">
                <LoaderCircle className="spinner" />
              </div>
            </div>
            
          )}
          
        </div>

      {/* Input Field */}
      <div className="flex flex-col justify-center p-8 font-[poppins] shadow-lg w-full sticky bottom-0 left-0">
        <div className="flex justify-center items-center gap-10 mb-4">
          <button className={`relative text-md font-semibold ${input.length === 0 ? "cursor-not-allowed" : `hover:text-red-600 transition-colors duration-300
                before:absolute before:left-0 before:-bottom-1 before:w-0 before:h-[2px] before:bg-red-600 before:transition-all before:duration-300
                hover:before:w-full hover:cursor-pointer`}`}
                onClick={function(){ 
                  optionbtn('Youtube')
                  document.getElementById("inputBox").value = "";
                }}
                disabled={input.length === 0}
                  >
            Youtube
          </button>

          <button className={`relative text-md font-semibold ${input.length === 0 ? "cursor-not-allowed" : `hover:text-blue-600 transition-colors duration-300
                before:absolute before:left-0 before:-bottom-1 before:w-0 before:h-[2px] before:bg-blue-600 before:transition-all before:duration-300
                hover:before:w-full hover:cursor-pointer`}`}
                onClick={function(){ 
                  optionbtn('Websites')
                  document.getElementById("inputBox").value = "";
                }}
                disabled={input.length === 0}
                   >
            Websites
          </button>

          <button className={`relative text-md font-semibold ${input.length === 0 ? "cursor-not-allowed" : `hover:text-green-600 transition-colors duration-300
                before:absolute before:left-0 before:-bottom-1 before:w-0 before:h-[2px] before:bg-green-600 before:transition-all before:duration-300
                hover:before:w-full hover:cursor-pointer`}`}
                onClick={function(){ 
                  optionbtn('Quiz');
                  document.getElementById("inputBox").value = "";
                }}
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
                className={`border border-gray-400 p-6 pr-12 rounded-lg w-full shadow-lg ${darkMode ? "bg-gray-800 text-white" : "bg-gray-200 text-black"}`}
                type="text"
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter question"
              />
              <button
                className={`absolute right-4 top-1/2 transform -translate-y-1/2 
                  ${input.length === 0 ? "cursor-not-allowed" : "transition-transform duration-300 hover:text-green-500 hover:cursor-pointer hover:scale-115"}`
                }
                type="submit"
                onClick={()=>{
                  document.getElementById("inputBox").value = "";
                }}
                disabled={input.length === 0}
              >
                <Send className={`text-black ${darkMode ? `text-white` : `text-black`}`}/>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    </>
  );
}

export default App;