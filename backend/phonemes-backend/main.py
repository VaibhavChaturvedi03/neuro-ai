from flask import Flask, jsonify, request
import wave
from flask_cors import CORS
from dotenv import load_dotenv
import os
from groq import Groq
import io

# Initialize Flask app
app = Flask(__name__)

# Configure CORS
CORS(app, 
     origins=["http://localhost:5173", "http://localhost:3000"],
     supports_credentials=True,
     methods=["GET", "POST", "OPTIONS"],
     allow_headers=["Content-Type", "Authorization"])

# Load environment variables
load_dotenv()
OPEN_API_KEY = os.getenv('OPEN_API_KEY')

# Validate API key
if not OPEN_API_KEY:
    print("WARNING: OPEN_API_KEY not found in environment variables!")
COUPLED = ""
SOUND_REFERENCE = {
    'S': 'SH',
    'F': 'TH',
    'L': 'R',
    'B': 'V',
    'P': 'F',
    'T': 'D',
    'A': 'E',  # Added
    'Z': 'S'   # Added
}

IMAGE ={
     'S': 'https://cdn-icons-png.flaticon.com/512/1995/1995471.png',  # Sun
     'F': 'https://cdn-icons-png.flaticon.com/512/2917/2917995.png',  # Freedom/flag
     'L': 'https://cdn-icons-png.flaticon.com/512/1077/1077035.png',  # Love/heart
     'B': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Soccerball.svg/500px-Soccerball.svg.png',  # Ball
     'P': 'https://cdn-icons-png.flaticon.com/512/2541/2541979.png',  # Pen
     'T': 'https://cdn-icons-png.flaticon.com/512/628/628283.png',  # Tree
     'A': 'https://png.pngtree.com/png-vector/20231017/ourmid/pngtree-fresh-apple-fruit-red-png-image_10203073.png',
     'Z': 'https://pngimg.com/uploads/zebra/zebra_PNG95977.png'
}

PRONUNCIATION = {
    "sunday": "sʌn.deɪ",
    "free": "friː",
    "love": "lʌv",
    "boat": "boʊt",
    "pen": "pen",
    "tree": "triː",
    "apple": "ˈæp.əl",   # Added
    "ball": "bɔːl",      # This is already included
    "zebra": "ˈziː.brə"  # Added
}


LETTERS = ['S', 'F', 'L', 'B', 'P', 'T', 'A', 'Z']  # Added 'A', 'Z'

EXAMPLE = {
    'S': 'sunday',
    'F': 'free',
    'L': 'love',
    'B': 'boat',
    'B2':'ball',
    'P': 'pen',
    'T': 'tree',
    'A': 'apple',  # Added
    'Z': 'zebra'   # Added
}


REMEDY = {
    'P': ['Put your lips together to make the sound. Vocal cords don’t vibrate for voiceless sounds.'],
    'B': ['Put your lips together to make the sound.'],
    'B2': ['Put your lips together to make the sound.'],
    'M': ['Put your lips together to make the sound. Air flows through your nose.'],
    'W': ['Put your lips together and shape your mouth like you are saying "oo".'],
    'F': ['Place your bottom lip against your upper front teeth. Top teeth may be on your bottom lip.'],
    'V': ['Place your bottom lip against your upper front teeth. Top teeth may be on your bottom lip.'],
    'S': ["Keep your teeth close together to make the sound. The ridge right behind your two front teeth is involved. The front of your tongue is used. Vocal cords don’t vibrate for voiceless sounds."],
    'Z': ['Keep your teeth close together to make the sound. The ridge right behind your two front teeth is involved. The front of your tongue is used.'],
    'th': ['Place your top teeth on your bottom lip and let your tongue go between your teeth for the sound. The front of your tongue is involved.'],
    'TH': ['Place your top teeth on your bottom lip and let your tongue go between your teeth for the sound (as in thin). The front of your tongue is involved. The front of your tongue is used.'],
    'NG': ['Air flows through your nose.'],
    'SING': ['Air flows through your nose.'],
    'L': ['The ridge right behind your two front teeth is involved. The front of your tongue is used.'],
    'T': ["The ridge right behind your two front teeth is involved. The front of your tongue is used. Vocal cords don’t vibrate for voiceless sounds."],
    'D': ['The ridge right behind your two front teeth is involved. The front of your tongue is used.'],
    'CH': ['The front-roof of your mouth is the right spot for the sound. The front of your tongue is used.'],
    'J': ['The front-roof of your mouth is the right spot for the sound. The front of your tongue is used.'],
    'SH': ['The front-roof of your mouth is the right spot for the sound. The front of your tongue is used.'],
    'ZH': ['The front-roof of your mouth is the right spot for the sound. The front of your tongue is used.'],
    'K': ["The back-roof of your mouth is the right spot for the sound. The back of your tongue is used. Vocal cords don’t vibrate for voiceless sounds."],
    'G': ['The back-roof of your mouth is the right spot for the sound. The back of your tongue is used.'],
    'R': ['The back-roof of your mouth is the right spot for the sound. The back of your tongue is used.'],
    'Y': ['The front of your tongue is used.'],
    'H': ['Your lungs provide the airflow for every sound, especially this one.'],
    'A': [
        'Open your mouth wide with your tongue flat at the bottom, as in "apple".',
        'Open your mouth wide and pull your tongue back slightly, as in "father".'
    ]  # Added remedies for 'A'
}



def check(word_given, word_recieved, check_for):
    """
    Calculate accuracy percentage based on how well the received word matches the given word.
    Uses a simple word matching algorithm with fuzzy matching.
    """
    # Clean up the received word
    k = 0
    while k < len(word_recieved) and word_recieved[k] == ' ':
        k += 1
    word_recieved = word_recieved[k:]
    
    # Remove punctuation and extra spaces
    for i in range(len(word_recieved)):
        if word_recieved[i] in ['.', '\n', ' ', '!', '?', ',']:
            word_recieved = word_recieved[0:i]
            break
    
    word_recieved = word_recieved.strip().lower()
    word_given = word_given.strip().lower()
    
    print(f"Comparing - Given: '{word_given}', Received: '{word_recieved}', Letter: '{check_for}'")
    
    # Exact match = 100%
    if word_recieved == word_given:
        return 100
    
    # Calculate similarity using Levenshtein-like approach
    # If words are completely different, return 0
    if len(word_recieved) == 0 or len(word_given) == 0:
        return 0
    
    # Check if it's a partial match (contains the word)
    if word_given in word_recieved or word_recieved in word_given:
        # Calculate based on length difference
        len_diff = abs(len(word_given) - len(word_recieved))
        similarity = max(0, 100 - (len_diff * 10))
        return min(90, similarity)  # Cap at 90% for partial matches
    
    # Calculate character-by-character similarity
    matches = 0
    max_len = max(len(word_given), len(word_recieved))
    min_len = min(len(word_given), len(word_recieved))
    
    for i in range(min_len):
        if word_given[i] == word_recieved[i]:
            matches += 1
    
    # Penalize length difference
    len_penalty = abs(len(word_given) - len(word_recieved)) * 5
    similarity = (matches / max_len * 100) - len_penalty
    
    # If similarity is too low (less than 30%), likely wrong word
    if similarity < 30:
        return 0
    
    return max(0, min(95, int(similarity)))  # Cap at 95% for fuzzy matches


# import os




# with open(filename, "rb") as file:
#     transcription = client.audio.transcriptions.create(
#       file=(filename, file.read()),
#       model="whisper-large-v3",
#       response_format="verbose_json",
#     )
#     print(transcription.text)
      
@app.route('/record', methods=["POST"])
def record():
    try:
        if not COUPLED:
            return jsonify({"error": "No letter selected. Please call /test/<letter> first"}), 400
        
        # Check if audio file is in the request
        if 'audio' not in request.files:
            return jsonify({"error": "No audio file provided"}), 400
        
        audio_file = request.files['audio']
        
        if audio_file.filename == '':
            return jsonify({"error": "No audio file selected"}), 400
        
        # Save the uploaded audio file
        filename = "output.wav"
        audio_file.save(filename)
        
        print('Audio file received and saved')

        # Initialize Groq client
        if not OPEN_API_KEY:
            return jsonify({"error": "API key not configured"}), 500
            
        client = Groq(api_key=OPEN_API_KEY)

        # Transcribe audio
        with open("output.wav", "rb") as file:
            transcription = client.audio.transcriptions.create(
                file=(filename, file.read()),
                model="whisper-large-v3",
                response_format="verbose_json",
            )
        
        print(f"Transcription: {transcription.text}")
        
        # Calculate percentage
        percentage = check(EXAMPLE[COUPLED].upper(), transcription.text.upper(), COUPLED.upper())

        print(f"Percentage: {percentage}")
        
        word_percentage = {
            "transcript": transcription.text,
            "percentage": percentage
        }
        
        return jsonify(word_percentage)
        
    except Exception as e:
        print(f"Error in record endpoint: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/remedy/<int:averagePercentage>", methods=["GET", "POST"])
def remedy(averagePercentage):
    try:
        if not COUPLED:
            return jsonify({"error": "No letter selected"}), 400
            
        if averagePercentage <= 50:
            remedy_text = REMEDY.get(COUPLED, ["Practice the pronunciation more carefully."])
            result = {
                "remedy": remedy_text
            }
        else:
            result = {
                "remedy": ""
            }

        return jsonify(result)
    except Exception as e:
        print(f"Error in remedy endpoint: {e}")
        return jsonify({"error": str(e)}), 500


# Health check endpoint
@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "healthy",
        "service": "phonemes-backend",
        "port": 5002,
        "api_key_configured": bool(OPEN_API_KEY)
    })


# Get all available letters
@app.route("/letters", methods=["GET"])
def get_letters():
    return jsonify({
        "letters": LETTERS,
        "examples": EXAMPLE
    })


@app.route("/test/<lettergiven>")
def test(lettergiven):
    print(lettergiven)
    global COUPLED
    COUPLED = ""
    COUPLED = lettergiven
    
    try:
        # Get the example word for this letter
        example_word = EXAMPLE.get(COUPLED)
        if not example_word:
            return jsonify({"error": f"No example found for letter {COUPLED}"}), 404
        
        word_data = {
            "word1": example_word,
            "letter": COUPLED,
            "pronunciation": PRONUNCIATION.get(example_word, ""),
            "image_link": IMAGE.get(COUPLED, "")
        }
        
        print(COUPLED)
        return jsonify(word_data)
    except Exception as e:
        print(f"Error in test endpoint: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/generate_word/<lettergiven>")
def generate_word(lettergiven):
    print(lettergiven)
    global COUPLED
    COUPLED = ""
    COUPLED = lettergiven
    
    try:
        # Get the example word for this letter
        example_word = EXAMPLE.get(COUPLED)
        if not example_word:
            return jsonify({"error": f"No example found for letter {COUPLED}"}), 404
        
        word_data = {
            "word1": example_word,
            "letter": COUPLED,
            "pronunciation": PRONUNCIATION.get(example_word, "")
        }
        
        print(COUPLED)
        return jsonify(word_data)
    except Exception as e:
        print(f"Error in generate_word endpoint: {e}")
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5002))  # Use PORT from Render or default to 5002
    app.run(host="0.0.0.0", port=port, debug=False)  # Bind to 0.0.0.0 for production