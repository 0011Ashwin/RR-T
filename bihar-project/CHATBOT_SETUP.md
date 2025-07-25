# Luma AI Chatbot Setup

## Overview
Luma is an AI-powered study companion that helps students with:
- Academic performance analysis
- Personalized study recommendations
- Assignment and exam management
- Time management strategies
- Goal setting and progress tracking

## Features
- 🤖 **AI-Powered**: Uses Google's Gemini API for intelligent responses
- 🎯 **Personalized**: Tailored advice based on student data (GPA, attendance, subjects)
- 💬 **Interactive**: Real-time chat interface with suggestions
- 📱 **Responsive**: Floating action button with popup interface
- 🧠 **Smart Fallback**: Works even without API key using built-in intelligence

## Setup Instructions

### 1. Get Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy the API key

### 2. Configure Environment Variable
You can set the API key in one of these ways:

#### Option A: Using DevServerControl (Recommended)
Use the DevServerControl tool to set the environment variable:
```
GEMINI_API_KEY=your-actual-api-key-here
```

#### Option B: Create .env file
Create a `.env` file in the project root:
```bash
GEMINI_API_KEY=your-actual-api-key-here
```

### 3. Restart Dev Server
After setting the API key, restart the development server for changes to take effect.

## Usage

### For Students
1. **Access**: Look for the purple chat button in the bottom-right corner
2. **Click**: Opens the Luma chat interface
3. **Chat**: Ask questions about your academic performance, study tips, etc.
4. **Suggestions**: Click on suggested questions for quick interactions

### Example Questions
- "How is my academic performance?"
- "Give me study recommendations"
- "What should I focus on this week?"
- "Help me prepare for exams"
- "How can I improve my attendance?"

## Integration Details

### Component Location
- **Component**: `client/components/LumaChatbot.tsx`
- **API Endpoint**: `server/routes/chat.ts`
- **Integration**: Added to `EnhancedStudentDashboard.tsx`

### Data Used
The chatbot receives the following student data:
- Name and basic profile info
- Current GPA and academic standing
- Attendance percentage
- Class rank and total students
- Subject-wise progress and grades
- Assignment completion status
- Upcoming events and deadlines

### Fallback System
If no Gemini API key is provided, the chatbot uses a built-in intelligent response system that still provides helpful, personalized advice based on student data.

## Customization

### Personality
You can modify Luma's personality by editing the prompt in `server/routes/chat.ts`:
```typescript
const prompt = `You are Luma, an AI study companion for students...`
```

### Styling
The chatbot UI can be customized in `client/components/LumaChatbot.tsx`:
- Colors, gradients, and themes
- Chat bubble styles
- Animation effects
- Button positioning

### Response Logic
Enhance the fallback responses in the `generateSmartResponse` function for more intelligent responses without API dependency.

## Security Notes
- Never commit API keys to version control
- Use environment variables for sensitive data
- The API key is only used server-side
- Student data is processed securely and not stored

## Troubleshooting

### Common Issues
1. **Chatbot not responding**: Check if API key is set correctly
2. **Fallback responses only**: Verify Gemini API key and network connection
3. **UI not appearing**: Ensure component is imported and integrated properly

### Debug Mode
Check browser console and server logs for detailed error messages.

## Future Enhancements
- Voice interaction capabilities
- Study schedule generation
- Progress tracking and analytics
- Integration with calendar systems
- Multi-language support
- Offline mode improvements
