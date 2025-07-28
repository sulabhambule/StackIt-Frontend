import apiClient from './client';

class ChatbotService {
  constructor() {
    this.isConnected = false;
    this.chatHistory = [];
  }

  async connect() {
    try {
      // Simulate connection establishment
      await new Promise(resolve => setTimeout(resolve, 1000));
      this.isConnected = true;
      return true;
    } catch (error) {
      console.error('Chatbot connection failed:', error);
      this.isConnected = false;
      throw error;
    }
  }

  disconnect() {
    this.isConnected = false;
  }

  async sendMessage(message) {
    if (!this.isConnected) {
      throw new Error('Chatbot not connected');
    }

    try {
      // For now, we'll simulate different responses based on message content
      // In a real implementation, this would call your AI/chatbot API
      const response = await this.generateResponse(message);
      
      // Store in history
      this.chatHistory.push({
        userMessage: message,
        botResponse: response,
        timestamp: new Date().toISOString()
      });

      return response;
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  }

  async generateResponse(message) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const lowerMessage = message.toLowerCase();

    // Guest user responses (for landing page)
    if (lowerMessage.includes('features') || lowerMessage.includes('offer')) {
      return {
        message: "BusinessFlow offers comprehensive business management tools including:",
        metadata: {
          type: 'list',
          items: [
            'Real-time sales analytics and reporting',
            'Customer relationship management (CRM)',
            'Team performance tracking',
            'Automated scheduling and calendar integration',
            'Business intelligence dashboards',
            'Secure data management and backup'
          ],
          confidence: 0.95
        }
      };
    }

    if (lowerMessage.includes('pricing') || lowerMessage.includes('cost') || lowerMessage.includes('plan')) {
      return {
        message: "Our pricing plans are designed to scale with your business:",
        metadata: {
          type: 'card',
          title: 'Pricing Plans',
          description: 'Choose the plan that fits your needs',
          actions: [
            { label: 'View All Plans', action: 'pricing_details' },
            { label: 'Start Free Trial', action: 'free_trial' }
          ],
          confidence: 0.93
        }
      };
    }

    if (lowerMessage.includes('get started') || lowerMessage.includes('sign up') || lowerMessage.includes('register')) {
      return {
        message: "Getting started with BusinessFlow is easy! Here's how:",
        metadata: {
          type: 'list',
          items: [
            '1. Click the Sign Up button to create your account',
            '2. Choose your pricing plan (free trial available)',
            '3. Set up your business profile and preferences',
            '4. Import your existing data or start fresh',
            '5. Invite your team members to collaborate'
          ],
          confidence: 0.97
        }
      };
    }

    if (lowerMessage.includes('support') || lowerMessage.includes('contact') || lowerMessage.includes('help')) {
      return {
        message: "I'm here to help! You can also reach our support team:",
        metadata: {
          type: 'card',
          title: 'Contact Support',
          description: 'Get help from our expert team',
          actions: [
            { label: 'Email Support', action: 'email_support' },
            { label: 'Live Chat', action: 'live_chat' },
            { label: 'Help Center', action: 'help_center' }
          ],
          confidence: 0.96
        }
      };
    }

    // Authenticated user responses (for dashboard)
    if (lowerMessage.includes('sales') || lowerMessage.includes('revenue')) {
      return {
        message: "Here's your sales overview: Revenue is up 15% this month compared to last month. Top performing products include our Business Pro plan and Analytics Suite.",
        metadata: {
          type: 'card',
          title: 'Sales Performance',
          description: 'Monthly revenue increased by 15%',
          actions: [
            { label: 'View Details', action: 'sales_details' },
            { label: 'Export Report', action: 'export_sales' }
          ],
          confidence: 0.92
        }
      };
    }

    if (lowerMessage.includes('customer') || lowerMessage.includes('analytics')) {
      return {
        message: "Your customer analytics show positive trends:",
        metadata: {
          type: 'list',
          items: [
            'Customer satisfaction: 94% (up 3%)',
            'New customer acquisition: 127 this month',
            'Customer retention rate: 89%',
            'Average customer lifetime value: $2,340'
          ],
          confidence: 0.88
        }
      };
    }

    if (lowerMessage.includes('team') || lowerMessage.includes('performance')) {
      return {
        message: "Your team is performing excellently! Here are the key metrics: Average productivity score is 87%, team collaboration rating is 92%, and project completion rate is 94%. The sales team exceeded targets by 12% this quarter.",
        metadata: {
          confidence: 0.85
        }
      };
    }

    if (lowerMessage.includes('meeting') || lowerMessage.includes('schedule')) {
      return {
        message: "I can help you schedule a meeting! What type of meeting would you like to set up?",
        metadata: {
          type: 'card',
          title: 'Schedule Meeting',
          description: 'Set up a new meeting with your team',
          actions: [
            { label: 'Team Meeting', action: 'schedule_team' },
            { label: 'Client Call', action: 'schedule_client' },
            { label: 'One-on-One', action: 'schedule_1on1' }
          ],
          confidence: 0.90
        }
      };
    }

    if (lowerMessage.includes('settings') || lowerMessage.includes('configuration')) {
      return {
        message: "I can guide you through the system settings. What would you like to configure?",
        metadata: {
          type: 'list',
          items: [
            'User permissions and roles',
            'Notification preferences',
            'Data export settings',
            'Integration configurations',
            'Security settings'
          ],
          confidence: 0.87
        }
      };
    }

    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return {
        message: "Hello! I'm your BusinessFlow assistant. I can help you learn about our features, pricing, getting started, or provide support. What would you like to know?",
        metadata: {
          confidence: 0.98
        }
      };
    }

    // Default response for unrecognized queries
    return {
      message: "I understand you're asking about: \"" + message + "\". I can help you with information about our features, pricing plans, getting started, or connecting you with support. What specific area interests you most?",
      metadata: {
        confidence: 0.60
      }
    };
  }

  async getChatHistory() {
    // Return stored chat history
    const messages = [];
    
    this.chatHistory.forEach(entry => {
      messages.push({
        id: `user_${entry.timestamp}`,
        content: entry.userMessage,
        type: 'user',
        timestamp: entry.timestamp,
        isRead: true
      });
      
      messages.push({
        id: `bot_${entry.timestamp}`,
        content: entry.botResponse.message,
        type: 'bot',
        timestamp: entry.timestamp,
        isRead: true,
        metadata: entry.botResponse.metadata
      });
    });

    return messages;
  }

  clearHistory() {
    this.chatHistory = [];
  }

  // Future method for real API integration
  async sendToAPI(message) {
    try {
      const response = await apiClient.post('/chatbot/message', {
        message,
        timestamp: new Date().toISOString()
      });
      
      return response.data;
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  }
}

export const chatbotService = new ChatbotService();
