import re
import requests
from flask_cors import CORS
from googleapiclient.discovery import build
from youtube_transcript_api import YouTubeTranscriptApi
import os
from flask import Flask, jsonify, request

# Replace with your YouTube API Key
app = Flask(__name__)

CORS(app) 

API_KEY = os.getenv('YOUTUBE_API_KEY')

def search_youtube(query):
    youtube = build("youtube", "v3", developerKey=API_KEY)
    request = youtube.search().list(
        q=query,
        part="id,snippet",
        maxResults=5,
        type="video"
    )
    response = request.execute()
    videos = []
    
    for item in response["items"]:
        video_id = item["id"]["videoId"]
        title = item["snippet"]["title"]
        score = get_video_details(video_id)  # Get engagement score
        videos.append((video_id, title, score))
    
    videos.sort(key=lambda x: x[2], reverse=True)  # Sort by score (Descending)
    
    return videos

def get_video_details(video_id):
    youtube = build("youtube", "v3", developerKey=API_KEY)
    request = youtube.videos().list(
        part="statistics",
        id=video_id
    )
    response = request.execute()
    
    stats = response["items"][0]["statistics"]
    
    views = int(stats.get("viewCount", 0))
    likes = int(stats.get("likeCount", 0))
    comments = int(stats.get("commentCount", 0))

    score = (likes * 0.7) + (comments * 0.2) + (views * 0.1)  # Custom ranking formula
    
    return score

def get_chapters(video_id):
    url = f"https://www.youtube.com/watch?v={video_id}"
    response = requests.get(url).text
    chapters = re.findall(r'(\d{1,2}:\d{2}) - (.+?)<', response)  # Extract chapters
    
    return [f"{time} - {title}" for time, title in chapters]

def format_timestamp(seconds):
    """Convert seconds to MM:SS format"""
    minutes = int(seconds // 60)
    seconds = int(seconds % 60)
    return f"{minutes:02}:{seconds:02}"

def get_best_transcript(video_id):
    try:
        transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)
        try:
            transcript = transcript_list.find_transcript(["en"]).fetch()  # Get English transcript
        except:
            transcript = transcript_list.find_transcript(["auto"]).fetch()  # Get auto-generated
        
        return [(format_timestamp(entry['start']), entry['text']) for entry in transcript[:5]]  # Convert time
    except:
        return None  # No transcript available

def get_best_videos_with_timestamps(query):
    videos = search_youtube(query)
    results = []
    
    for video_id, title, _ in videos:
        chapters = get_chapters(video_id)
        transcript = get_best_transcript(video_id)

        timestamp = None
        if chapters:
            timestamp = chapters
        elif transcript:
            timestamp = [f"{time} - {text}" for time, text in transcript]

        results.append({
            "title": title,
            "video_url": f"https://www.youtube.com/watch?v={video_id}",
            "timestamps": timestamp if timestamp else "No timestamps available"
        })
    print(results)
    return results

@app.route('/youtube', methods=['POST'])
def youtube():
    data = request.get_json()
    query = data.get('questions')
    print("this is the dataa " , data)
    if not query:
        return jsonify({"error": "Query is required"}), 400
    
    videos_info = get_best_videos_with_timestamps(query)
    
    return jsonify(videos_info)


if __name__ == '__main__':
    app.run(debug=True,port=5001)
