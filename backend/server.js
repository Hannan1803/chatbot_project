require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors')
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(express.json());
app.use(cors())

// Set up Google Gemini API
const GEMINI_API_KEY = process.env.GEM_API;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Function to get relevant links based on keywords
const getRelevantLinks = async (baseUrl, keywords, visited = new Set()) => {
    const relevantLinks = new Set();
    try {
        const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.5735.90 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.5'
        };
        
        const response = await axios.get(baseUrl, { headers, timeout: 10000 });
        const $ = cheerio.load(response.data);

        $('a').each((_, element) => {
            let url = new URL($(element).attr('href'), baseUrl).href;
            if (url.startsWith(baseUrl) && !visited.has(url)) {
                visited.add(url);
                const linkText = $(element).text().toLowerCase();
                if ([...keywords].some(keyword => linkText.includes(keyword))) {
                    relevantLinks.add(url);
                }
            }
        });
    } catch (error) {
        console.error(`Error fetching links from ${baseUrl}:`, error.message);
    }
    return Array.from(relevantLinks);
};

// Function to extract text from a given URL
const extractTextFromUrl = async (url) => {
    try {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Sleep 1 sec
        const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.5735.90 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.5'
        };

        const response = await axios.get(url, { headers, timeout: 10000 });
        const $ = cheerio.load(response.data);
        return $('p').map((_, el) => $(el).text()).get().join('\n');
    } catch (error) {
        console.error(`Error extracting text from ${url}:`, error.message);
        return '';
    }
};

// Function to get answers from Gemini API
const getAnswersFromGemini = async (content, questions) => {
    if (!content.trim()) return "No relevant content found on the websites.";
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `Here is some text data:\n${content}\n\nAnswer the following questions:\n${questions.join("\n")}`;
        const result = await model.generateContent(prompt);
        return result.response.text() || "No response from Gemini API";
    } catch (error) {
        console.error("Error with Gemini API:", error.message);
        return "Gemini API failed to respond.";
    }
};

// Express route to handle the /ask endpoint
const stopwords = new Set(["what", "is", "how", "why", "the", "a", "an", "of", "to", "in", "for", "on", "with", "at", "by", "about", "as", "into", "like", "through", "after", "over", "between", "out", "against", "during", "without", "before", "under", "around", "among","give","me","explain","detail","brief","more","can","some"]);

// Function to extract keywords from the question
const extractKeywords = (question) => {
    return question
        .toLowerCase()
        .split(/\s+/) // Split by whitespace
        .filter(word => !stopwords.has(word)) // Remove stopwords
        .join(" "); // Join back into a cleaned phrase
};

app.post('/ask', async (req, res) => {
    try {
        const websites = ["https://www.geeksforgeeks.org/"];
        const questions = req.body.questions || [];

        if (!questions.length) {
            return res.status(400).json({ error: "Questions are required" });
        }

        // Extract meaningful keywords from each question
        const cleanedQuestions = questions.map(extractKeywords);
        console.log("Extracted Keywords:", cleanedQuestions);

        const keywords = new Set(cleanedQuestions.join(" ").split(" "));
        let allContent = "";

        for (let site of websites) {
            const relevantLinks = await getRelevantLinks(site, keywords);
            if (!relevantLinks.length) {
                allContent += await extractTextFromUrl(site) + "\n";
            } else {
                for (let link of relevantLinks) {
                    allContent += await extractTextFromUrl(link) + "\n";
                }
            }
        }

        const answers = await getAnswersFromGemini(allContent, questions);
        console.log(answers);
        res.json({ answers });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start the server
const PORT = 5001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
