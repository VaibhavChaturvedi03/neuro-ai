import phonemeAnalyzer from '../ai/phonemeAnalyzer';
import speechRecognition from '../ai/speechRecognition';

const API_BASE_URL = 'https://neuro-ai-3ipn.onrender.com/api';

// Generate word from backend
export const generateWord = async (letter) => {
  try {
    console.log(`Fetching word for letter: ${letter}`);
    
    const response = await fetch(`${API_BASE_URL}/words/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ letter }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Word data received:', data);
    return data;
  } catch (error) {
    console.error('Error fetching word:', error);
    // Return fallback data
    return {
      word1: 'Apple',
      pronunciation: '/ˈæp.əl/',
      image_link: '🍎'
    };
  }
};

// Test word from backend
export const testWord = async (letter) => {
  try {
    console.log(`Fetching test word for letter: ${letter}`);
    
    const response = await fetch(`${API_BASE_URL}/words/test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ letter }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Test word data received:', data);
    return data;
  } catch (error) {
    console.error('Error fetching test word:', error);
    // Return fallback data
    return {
      word1: 'Apple',
      pronunciation: '/ˈæp.əl/',
      image_link: '🍎'
    };
  }
};

// Record audio and analyze with AI
export const recordAudio = async (expectedWord, targetPhonemes = []) => {
  try {
    console.log('Starting recording for word:', expectedWord);
    
    if (!expectedWord) {
      throw new Error('Expected word is required');
    }

    // Start recording
    await speechRecognition.startRecording();
    
    // Wait for 3 seconds
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Stop and transcribe
    const transcription = await speechRecognition.stopRecordingAndTranscribe();
    console.log('Transcription:', transcription);

    // Analyze with AI
    const analysisResult = await phonemeAnalyzer.analyzePhonemes(
      transcription,
      expectedWord,
      targetPhonemes
    );

    console.log('Analysis result:', analysisResult);

    return {
      transcription: analysisResult.transcription,
      percentage: analysisResult.accuracy,
      feedback: analysisResult.feedback,
      timestamp: analysisResult.timestamp,
    };
  } catch (error) {
    console.error('Error recording audio:', error);
    throw error;
  }
};

// Get AI remedy
export const getRemedy = async (percentage, phoneme1, phoneme2, attempts = []) => {
  try {
    console.log('Getting AI remedy for:', { percentage, phoneme1, phoneme2 });

    const prompt = `You are a speech therapist. A child scored ${percentage}% accuracy on phonemes ${phoneme1} and ${phoneme2}.

Provide:
1. Brief assessment (20 words max)
2. 3 specific practice tips
3. Encouragement

Keep response under 80 words, child-friendly language.`;

    const { RunAnywhere } = await import('@runanywhere/core');
    const result = await RunAnywhere.generate(prompt, {
      maxTokens: 150,
      temperature: 0.7,
    });

    return {
      remedy: result.text,
      percentage,
      phonemes: [phoneme1, phoneme2],
    };
  } catch (error) {
    console.error('Error getting remedy:', error);
    
    // Fallback remedy
    let remedy = '';
    if (percentage >= 80) {
      remedy = `Excellent work on ${phoneme1} and ${phoneme2}! You're doing great. Keep practicing daily for 5 minutes to maintain your skills.`;
    } else if (percentage >= 60) {
      remedy = `Good progress on ${phoneme1} and ${phoneme2}! Practice these sounds slowly, focusing on mouth positioning. Try 10 repetitions daily.`;
    } else {
      remedy = `Let's work on ${phoneme1} and ${phoneme2} together. Break the sounds into smaller parts. Watch your mouth in a mirror while practicing. Be patient with yourself!`;
    }

    return { remedy, percentage, phonemes: [phoneme1, phoneme2] };
  }
};
  

export default api;
