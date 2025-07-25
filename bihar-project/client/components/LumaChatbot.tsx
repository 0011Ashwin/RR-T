import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  MessageSquare,
  Send,
  X,
  Bot,
  User,
  Sparkles,
  BookOpen,
  TrendingUp,
  Calendar,
  Target,
  Lightbulb,
  AlertCircle,
  CheckCircle,
  Clock,
  Star,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

interface StudentData {
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
}

interface LumaChatbotProps {
  studentData: StudentData;
}

const LumaChatbot: React.FC<LumaChatbotProps> = ({ studentData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Initialize with welcome message
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        type: 'bot',
        content: `Hi ${studentData.name}! 👋 I'm Luma, your AI study companion. I can help you with academic performance insights, study recommendations, and answer questions about your progress. What would you like to know?`,
        timestamp: new Date(),
        suggestions: [
          'How is my academic performance?',
          'Give me study recommendations',
          'What should I focus on this week?',
          'Show my attendance analysis',
        ],
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, studentData.name, messages.length]);

  const generateBotResponse = async (userMessage: string): Promise<Message> => {
    // Simulate API call to Gemini
    setIsLoading(true);
    
    try {
      // Here you would integrate with Gemini API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          studentData: studentData,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return {
          id: Date.now().toString(),
          type: 'bot',
          content: data.message,
          timestamp: new Date(),
          suggestions: data.suggestions,
        };
      }
    } catch (error) {
      console.error('Error calling chat API:', error);
    }

    // Fallback responses for demo purposes
    const botResponse = generateFallbackResponse(userMessage, studentData);
    
    return {
      id: Date.now().toString(),
      type: 'bot',
      content: botResponse.content,
      timestamp: new Date(),
      suggestions: botResponse.suggestions,
    };
  };

  const generateFallbackResponse = (userMessage: string, data: StudentData) => {
    const message = userMessage.toLowerCase();
    
    if (message.includes('performance') || message.includes('academic')) {
      return {
        content: `📊 **Academic Performance Analysis:**

Your current GPA is **${data.gpa}** which is excellent! You're ranked **${data.rank}** out of **${data.totalStudents}** students.

**Subject Performance:**
${data.subjects.map(subject => 
  `• **${subject.name}**: ${subject.grade} (${subject.progress}% complete)`
).join('\n')}

**Key Insights:**
• Your attendance of ${data.attendance}% is above the required threshold
• You have ${data.subjects.reduce((total, subject) => total + (subject.assignments.total - subject.assignments.completed), 0)} pending assignments
• Keep up the excellent work! 🌟`,
        suggestions: [
          'How can I improve my weakest subject?',
          'Study schedule suggestions',
          'Upcoming deadlines',
        ],
      };
    }
    
    if (message.includes('study') || message.includes('recommend')) {
      const weakestSubject = data.subjects.reduce((prev, current) => 
        prev.progress < current.progress ? prev : current
      );
      
      return {
        content: `📚 **Personalized Study Recommendations:**

Based on your performance, here's what I recommend:

**Priority Focus Area:**
• **${weakestSubject.name}** needs attention (${weakestSubject.progress}% complete)
• Consider dedicating 2-3 extra hours this week

**Study Strategy:**
• Use active recall techniques for better retention
• Create summary notes for each subject
• Join study groups for collaborative learning
• Practice past papers regularly

**Time Management:**
• Study during your peak focus hours
• Take 10-minute breaks every 45 minutes
• Use the Pomodoro technique for better focus`,
        suggestions: [
          'Create a study schedule',
          'Find study partners',
          'Assignment deadlines',
        ],
      };
    }
    
    if (message.includes('attendance')) {
      return {
        content: `📅 **Attendance Analysis:**

Your current attendance is **${data.attendance}%** - Great job! 🎉

**Insights:**
• You're well above the minimum 75% requirement
• Consistent attendance correlates with better grades
• Your attendance streak shows good discipline

**Tips to maintain:**
• Set daily reminders for classes
• Plan ahead for any planned absences
• Communicate with instructors if you must miss class`,
        suggestions: [
          'Attendance improvement tips',
          'Class schedule optimization',
          'Make-up session availability',
        ],
      };
    }
    
    if (message.includes('week') || message.includes('focus')) {
      const upcomingHighPriority = data.upcomingEvents.filter(event => event.priority === 'high');
      
      return {
        content: `🎯 **This Week's Focus Areas:**

**Immediate Priorities:**
${upcomingHighPriority.length > 0 ? 
  upcomingHighPriority.map(event => 
    `• **${event.title}** - ${new Date(event.date).toLocaleDateString()}`
  ).join('\n') : 
  '• Continue regular study routine\n• Complete pending assignments'
}

**Study Goals:**
• Complete all pending assignments
• Review weak topics in ${data.subjects.find(s => s.progress < 80)?.name || 'core subjects'}
• Prepare for upcoming assessments

**Wellness Reminders:**
• Maintain proper sleep schedule
• Take regular breaks
• Stay hydrated and eat well`,
        suggestions: [
          'Assignment prioritization',
          'Exam preparation tips',
          'Study group formation',
        ],
      };
    }
    
    // Default response
    return {
      content: `I'm here to help with your academic journey! I can assist you with:

🎓 **Academic Performance** - Analysis and insights
📚 **Study Recommendations** - Personalized learning strategies  
📊 **Progress Tracking** - Monitor your improvement
⏰ **Time Management** - Optimize your schedule
🎯 **Goal Setting** - Achieve your academic targets

What specific area would you like to explore?`,
      suggestions: [
        'Analyze my performance',
        'Study schedule help',
        'Exam preparation tips',
        'Assignment management',
      ],
    };
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const botResponse = await generateBotResponse(inputMessage.trim());
      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      console.error('Error generating response:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          size="lg"
          className={cn(
            "rounded-full w-14 h-14 shadow-lg transition-all duration-300 hover:scale-110",
            "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700",
            isOpen && "rotate-180"
          )}
        >
          {isOpen ? (
            <X className="h-6 w-6 text-white" />
          ) : (
            <div className="relative">
              <MessageSquare className="h-6 w-6 text-white" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
            </div>
          )}
        </Button>
      </div>

      {/* Chat Interface */}
      {isOpen && (
        <Card className="fixed bottom-24 right-6 w-96 h-[600px] z-40 shadow-2xl border-0 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Bot className="h-6 w-6" />
                  <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-yellow-300" />
                </div>
                <div>
                  <span className="font-bold">Luma</span>
                  <div className="text-xs text-purple-100">AI Study Companion</div>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-400 rounded-full" />
                <span className="text-xs">Online</span>
              </div>
            </CardTitle>
          </CardHeader>

          <CardContent className="p-0 h-full flex flex-col">
            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className="space-y-2">
                    <div
                      className={cn(
                        "flex",
                        message.type === 'user' ? 'justify-end' : 'justify-start'
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[80%] rounded-lg p-3 text-sm",
                          message.type === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        )}
                      >
                        <div className="flex items-start space-x-2">
                          {message.type === 'bot' && (
                            <Bot className="h-4 w-4 mt-0.5 flex-shrink-0 text-purple-600" />
                          )}
                          {message.type === 'user' && (
                            <User className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          )}
                          <div className="flex-1">
                            <div className="whitespace-pre-wrap">
                              {message.content}
                            </div>
                            <div
                              className={cn(
                                "text-xs mt-1 opacity-70",
                                message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                              )}
                            >
                              {message.timestamp.toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Suggestions */}
                    {message.suggestions && (
                      <div className="flex flex-wrap gap-2 ml-6">
                        {message.suggestions.map((suggestion, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="cursor-pointer hover:bg-purple-50 hover:border-purple-300 transition-colors text-xs"
                            onClick={() => handleSuggestionClick(suggestion)}
                          >
                            {suggestion}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-lg p-3 max-w-[80%]">
                      <div className="flex items-center space-x-2">
                        <Bot className="h-4 w-4 text-purple-600" />
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75" />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <Separator />

            {/* Input Area */}
            <div className="p-4">
              <div className="flex space-x-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask Luma anything about your studies..."
                  className="flex-1"
                  disabled={isLoading}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default LumaChatbot;
