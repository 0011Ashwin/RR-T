import { RequestHandler } from "express";

interface ChatRequest {
  message: string;
  studentData: {
    name: string;
    gpa: number;
    attendance: number;
    rank: number;
    totalStudents: number;
    subjects: Array<{
      name: string;
      grade: string;
      progress: number;
      assignments: { completed: number; total: number };
    }>;
    upcomingEvents: Array<{
      title: string;
      date: string;
      type: string;
      priority: string;
    }>;
  };
}

interface ChatResponse {
  message: string;
  suggestions?: string[];
}

import { GoogleGenerativeAI } from "@google/generative-ai";

export const handleChat: RequestHandler = async (req, res) => {
  try {
    const { message, studentData }: ChatRequest = req.body;

    // Check if Gemini API key is available
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        // Use Gemini API for intelligent responses
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const prompt = `You are Luma, an AI study companion for students.
You help students with academic performance analysis, study recommendations, and educational guidance.
Always be encouraging, supportive, and personalized in your responses.

Student Profile:
- Name: ${studentData.name}
- GPA: ${studentData.gpa}/10
- Attendance: ${studentData.attendance}%
- Class Rank: ${studentData.rank} out of ${studentData.totalStudents} students

Current Subjects:
${studentData.subjects.map(s => `- ${s.name}: Grade ${s.grade}, ${s.progress}% complete, ${s.assignments.completed}/${s.assignments.total} assignments done`).join('\n')}

Upcoming Events:
${studentData.upcomingEvents.map(e => `- ${e.title} on ${e.date} (${e.type}, ${e.priority} priority)`).join('\n')}

Student Question: "${message}"

Please provide a helpful, encouraging, and personalized response focused on academic success.
Use emojis appropriately and format with markdown for better readability.
Keep responses concise but informative (max 300 words).
End with 2-3 relevant follow-up suggestions.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const botMessage = response.text();

        // Extract suggestions from the response or provide default ones
        const suggestions = extractSuggestions(botMessage, message) || generateDefaultSuggestions(message);

        res.json({
          message: botMessage,
          suggestions: suggestions,
        });
        return;
      } catch (geminiError) {
        console.error("Gemini API error:", geminiError);
        // Fall through to use fallback system
      }
    }

    // Fallback response system when Gemini API is not available
    const botResponse = generateSmartResponse(message, studentData);

    const response: ChatResponse = {
      message: botResponse.content,
      suggestions: botResponse.suggestions,
    };

    res.json(response);
  } catch (error) {
    console.error("Chat API error:", error);
    res.status(500).json({
      message: "I'm having trouble connecting right now. Please try again in a moment! 🤖",
      suggestions: ["Try asking again", "Check your connection"],
    });
  }
};

function generateSmartResponse(message: string, studentData: any) {
  const msg = message.toLowerCase();
  
  if (msg.includes('performance') || msg.includes('academic') || msg.includes('how am i')) {
    const averageProgress = studentData.subjects.reduce((sum: number, subject: any) => sum + subject.progress, 0) / studentData.subjects.length;
    const completedAssignments = studentData.subjects.reduce((sum: number, subject: any) => sum + subject.assignments.completed, 0);
    const totalAssignments = studentData.subjects.reduce((sum: number, subject: any) => sum + subject.assignments.total, 0);
    
    return {
      content: `📊 **Academic Performance Analysis for ${studentData.name}:**

**Overall Standing:**
• GPA: **${studentData.gpa}** - Excellent performance! 🌟
• Class Rank: **${studentData.rank}** out of **${studentData.totalStudents}** students
• Attendance: **${studentData.attendance}%** - Well above minimum requirement ✅

**Subject Performance:**
${studentData.subjects.map((subject: any) => 
  `• **${subject.name}**: Grade ${subject.grade} (${subject.progress}% complete)`
).join('\n')}

**Assignment Status:**
• Completed: **${completedAssignments}/${totalAssignments}** assignments
• Overall Progress: **${Math.round(averageProgress)}%**

**Key Insights:**
${studentData.gpa >= 8.5 ? '• You\'re in the top tier - keep up the excellent work!' : '• Focus on consistent study habits to improve further'}
${studentData.attendance >= 85 ? '• Great attendance record - this correlates with your good grades' : '• Consider improving attendance for better outcomes'}
• Your rank shows strong academic standing in your class`,
      suggestions: [
        'How can I improve my weakest subject?',
        'Study tips for upcoming exams',
        'Time management strategies',
        'Assignment prioritization help',
      ],
    };
  }
  
  if (msg.includes('study') || msg.includes('recommend') || msg.includes('help me study')) {
    const weakestSubject = studentData.subjects.reduce((prev: any, current: any) => 
      prev.progress < current.progress ? prev : current
    );
    const strongestSubject = studentData.subjects.reduce((prev: any, current: any) => 
      prev.progress > current.progress ? prev : current
    );
    
    return {
      content: `📚 **Personalized Study Recommendations for ${studentData.name}:**

**Priority Focus Area:**
• **${weakestSubject.name}** needs attention (${weakestSubject.progress}% complete)
• Current grade: ${weakestSubject.grade} - You can improve this! 💪

**Study Strategy Based on Your Performance:**

**For ${weakestSubject.name} (Priority):**
• Dedicate 3-4 study sessions this week
• Review fundamentals and practice problems
• Seek help from instructors during office hours
• Form study groups with classmates

**Leverage Your Strengths:**
• You're excelling in **${strongestSubject.name}** (${strongestSubject.grade})
• Use concepts from strong subjects to understand weaker ones
• Teach others - it reinforces your own learning

**Proven Study Techniques:**
1. **Active Recall**: Quiz yourself without looking at notes
2. **Spaced Repetition**: Review material at increasing intervals  
3. **Pomodoro Technique**: 25-min focused sessions with 5-min breaks
4. **Interleaving**: Mix different subjects in study sessions

**Weekly Schedule Suggestion:**
• Morning: High-energy subjects (${weakestSubject.name})
• Afternoon: Review and practice problems
• Evening: Light reading and concept review`,
      suggestions: [
        'Create a detailed study schedule',
        'Find study group partners',
        'Exam preparation strategies',
        'Assignment deadline management',
      ],
    };
  }
  
  if (msg.includes('attendance') || msg.includes('classes')) {
    return {
      content: `📅 **Attendance Analysis:**

**Current Status:**
• Your attendance: **${studentData.attendance}%** 📈
• Required minimum: **75%**
• Status: ${studentData.attendance >= 85 ? '**Excellent!** 🎉' : studentData.attendance >= 75 ? '**Good** ✅' : '**Needs Improvement** ⚠️'}

**Impact on Performance:**
• Students with 85%+ attendance typically score 15-20% higher
• Your consistent attendance contributes to your good GPA of ${studentData.gpa}
• Class participation opportunities increase with regular attendance

**Tips to Maintain/Improve:**
• Set daily reminders 15 minutes before class
• Plan transportation in advance
• Keep a backup plan for unexpected issues
• Communicate with professors if you must miss class

**Attendance Benefits You're Gaining:**
✅ Better understanding through live discussions
✅ Direct access to instructor clarifications  
✅ Networking with classmates
✅ Real-time feedback on your progress`,
      suggestions: [
        'Class schedule optimization',
        'Make-up session availability',
        'Study group coordination',
        'Professor office hours',
      ],
    };
  }
  
  if (msg.includes('week') || msg.includes('focus') || msg.includes('priority')) {
    const highPriorityEvents = studentData.upcomingEvents.filter((event: any) => event.priority === 'high');
    const pendingAssignments = studentData.subjects.reduce((total: number, subject: any) => 
      total + (subject.assignments.total - subject.assignments.completed), 0);
    
    return {
      content: `🎯 **This Week's Strategic Focus for ${studentData.name}:**

**🚨 Immediate Priorities:**
${highPriorityEvents.length > 0 ? 
  highPriorityEvents.map((event: any) => 
    `• **${event.title}** - ${new Date(event.date).toLocaleDateString()} (${event.type})`
  ).join('\n') : 
  '• Continue regular study routine\n• Focus on pending assignments'
}

**📝 Academic Tasks:**
• **${pendingAssignments}** assignments pending completion
• Review weak areas in ${studentData.subjects.filter((s: any) => s.progress < 80).map((s: any) => s.name).join(', ') || 'all subjects'}
• Prepare for upcoming assessments

**📊 Performance Goals:**
• Maintain your current rank of ${studentData.rank}/${studentData.totalStudents}
• Aim to complete 100% of this week's assignments
• Increase weak subject progress by 10%

**⚡ Daily Action Plan:**
• **Monday-Wednesday**: Focus on high-priority subjects
• **Thursday-Friday**: Assignment completion and review
• **Weekend**: Comprehensive review and next week preparation

**🧘 Wellness Reminders:**
• Maintain 7-8 hours of sleep
• Take 10-minute breaks every hour of study
• Stay hydrated and eat brain-healthy foods
• Exercise for 30 minutes daily to boost focus`,
      suggestions: [
        'Detailed daily schedule',
        'Assignment deadline tracker',
        'Study group coordination',
        'Stress management tips',
      ],
    };
  }
  
  if (msg.includes('exam') || msg.includes('test') || msg.includes('prepare')) {
    const upcomingExams = studentData.upcomingEvents.filter((event: any) => 
      event.type === 'exam' || event.title.toLowerCase().includes('exam') || event.title.toLowerCase().includes('test')
    );
    
    return {
      content: `📋 **Exam Preparation Strategy:**

**Upcoming Exams:**
${upcomingExams.length > 0 ? 
  upcomingExams.map((exam: any) => 
    `• **${exam.title}** - ${new Date(exam.date).toLocaleDateString()}`
  ).join('\n') : 
  '• No exams currently scheduled - perfect time to stay ahead!'
}

**Preparation Timeline (Proven Strategy):**

**2 Weeks Before:**
• Create comprehensive study notes
• Identify weak topics and focus areas
• Gather past papers and reference materials

**1 Week Before:**
• Daily practice sessions (2-3 hours)
• Active recall and self-testing
• Join study groups for discussion

**3 Days Before:**
• Final revision of key concepts
• Solve practice papers under timed conditions
• Light review, avoid cramming new material

**Day Before:**
• Light revision only
• Organize exam materials
• Get good sleep (8+ hours)

**Based on Your Performance:**
• Your GPA of ${studentData.gpa} shows you have strong exam skills
• Leverage your strength in ${studentData.subjects.reduce((prev: any, current: any) => 
    prev.progress > current.progress ? prev : current
  ).name}
• Give extra attention to ${studentData.subjects.reduce((prev: any, current: any) => 
    prev.progress < current.progress ? prev : current
  ).name} for balanced performance`,
      suggestions: [
        'Create exam schedule',
        'Practice paper resources',
        'Group study coordination',
        'Stress management techniques',
      ],
    };
  }
  
  if (msg.includes('improve') || msg.includes('better') || msg.includes('tips')) {
    return {
      content: `🚀 **Improvement Strategies Tailored for You:**

**Academic Enhancement:**
• **Target GPA**: Aim for ${Math.min(studentData.gpa + 0.5, 10.0)} next semester
• **Rank Goal**: Move up by 2-3 positions through consistent effort
• **Focus Subject**: Prioritize ${studentData.subjects.reduce((prev: any, current: any) => 
    prev.progress < current.progress ? prev : current
  ).name} for maximum impact

**Proven Improvement Methods:**

**1. The 1% Better Rule:**
• Improve by just 1% daily in each subject
• Small consistent gains lead to significant results
• Track daily progress to stay motivated

**2. Strategic Study Blocks:**
• 🌅 Morning (8-10 AM): Most challenging subjects
• 🌞 Afternoon (2-4 PM): Practice and problem-solving  
• 🌙 Evening (6-8 PM): Review and consolidation

**3. Active Learning Techniques:**
• Explain concepts to others (teaching method)
• Create mind maps and visual summaries
• Use real-world applications for abstract concepts
• Regular self-assessment and testing

**4. Leverage Your Strengths:**
• You excel at maintaining good attendance (${studentData.attendance}%)
• Your current rank (${studentData.rank}/${studentData.totalStudents}) shows strong foundation
• Build on these existing strengths

**Weekly Challenge:**
Pick ONE improvement area this week and track daily progress!`,
      suggestions: [
        'Set specific improvement goals',
        'Create accountability system',
        'Find a study mentor',
        'Track progress metrics',
      ],
    };
  }
  
  // Default helpful response
  return {
    content: `Hi ${studentData.name}! 👋 I'm Luma, your AI study companion. 

I can help you with:

🎓 **Academic Performance** - Detailed analysis of your grades and progress
📚 **Study Strategies** - Personalized learning recommendations
📊 **Progress Tracking** - Monitor improvement over time  
⏰ **Time Management** - Optimize your study schedule
🎯 **Goal Setting** - Achieve your academic targets
📅 **Exam Preparation** - Strategic preparation plans
✅ **Assignment Help** - Prioritization and deadline management

**Quick Insights for You:**
• Current GPA: **${studentData.gpa}** - ${studentData.gpa >= 8.5 ? 'Excellent!' : studentData.gpa >= 7.5 ? 'Very Good!' : 'Good foundation to build on!'}
• Class Rank: **${studentData.rank}/${studentData.totalStudents}**
• Attendance: **${studentData.attendance}%** - ${studentData.attendance >= 85 ? 'Outstanding!' : 'Good!'}

What would you like to focus on today? 🤔`,
    suggestions: [
      'Analyze my academic performance',
      'Give me study recommendations',
      'Help me prepare for exams',
      'Show my improvement areas',
      'Create a study schedule',
      'Assignment deadline help',
    ],
  };
}
