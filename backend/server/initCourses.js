// Simple script to initialize courses
import fetch from 'node-fetch';

async function initializeCourses() {
  try {
    console.log('Initializing courses...');
    const response = await fetch('http://localhost:5000/api/courses/initialize');
    
    if (!response.ok) {
      const text = await response.text();
      console.error('Error response:', text);
      throw new Error(`HTTP ${response.status}: ${text}`);
    }
    
    const data = await response.json();
    console.log('Success!');
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

initializeCourses();
