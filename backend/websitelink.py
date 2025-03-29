from flask import Flask, request, jsonify
from serpapi import GoogleSearch
from flask_cors import CORS
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

CORS(app)

def search_google(questions):
    """Fetch top 5 Google search results using SerpAPI"""
    params = {
        "q": questions,
        "api_key": os.getenv("api_key"),
    }
    
    try:
        search = GoogleSearch(params)
        results = search.get_dict()
        print("search is - ",search)
        if "error" in results:
            return {"error": f"❌ Error: {results['error']}"}

        top_results = []
        if "organic_results" in results:
            for i, result in enumerate(results["organic_results"][:5], start=1):
                top_results.append({
                    "title": result["title"],
                    "link": result["link"]
                })
        return top_results if top_results else {"message": "No results found."}
    except Exception as e:
        return {"error": f"⚠️ An error occurred: {e}"}

@app.route('/website', methods=['POST'])
def search():
    """Handle search requests from frontend"""
    data = request.json
    query = data.get("questions")
    print(data)
    if query:
        results = search_google(query)
        return jsonify(results)
    else:
        return jsonify({"error": "Query not provided."}), 400

if __name__ == '__main__':
    app.run(debug=True , port=5003)
