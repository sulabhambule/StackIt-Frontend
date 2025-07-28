# Frontend-Backend Integration Guide

## 🎯 **Implementation Overview**

I've successfully integrated your QnA forum frontend with the backend APIs. Here's what has been implemented:

## 🔧 **API Integration Architecture**

### **1. Service Layer (`/src/api/`)**
```
api/
├── client.js           # Axios instance with interceptors
├── endpoints.js        # API endpoint definitions
├── authService.js      # Authentication API calls
├── questionService.js  # Question API calls (NEW)
└── answerService.js    # Answer API calls (NEW)
```

### **2. Custom Hooks (`/src/hooks/`)**
```
hooks/
├── useQuestions.js     # Question data management (NEW)
├── useDebounce.js      # Search input debouncing (NEW)
└── use-toast.js        # Toast notifications (existing)
```

### **3. Components**
```
components/
└── RequireAuth.jsx     # Authentication wrapper (NEW)
```

## 🚀 **Key Features Implemented**

### **✅ Authentication Integration**
- **Login Check**: "Ask Question" button checks authentication
- **Auto Redirect**: Redirects to login with return URL if not authenticated
- **User Display**: Shows user info when logged in
- **Protected Routes**: Created `RequireAuth` component for protected pages

### **✅ API Data Fetching**
- **Real-time Questions**: Fetches questions from backend API
- **Pagination**: Backend-driven pagination with proper controls
- **Search**: Debounced search with 500ms delay
- **Filtering**: Sort by newest, unanswered, most voted, etc.
- **Loading States**: Proper loading indicators
- **Error Handling**: User-friendly error messages

### **✅ Data Transformation**
- **Date Formatting**: Converts timestamps to "2 hours ago" format
- **Tag Processing**: Handles comma-separated tags from backend
- **User Population**: Shows user names and avatars
- **Answer Status**: Displays solved/unsolved status

## 📡 **API Endpoints Connected**

### **Questions API**
```javascript
// Get all questions with filters
GET /api/questions?page=1&limit=5&search=react&sortBy=createdAt&sortOrder=desc

// Get single question
GET /api/questions/:questionId

// Submit question (authenticated)
POST /api/questions

// Update question (authenticated, owner only)
PATCH /api/questions/:questionId

// Delete question (authenticated, owner only)
DELETE /api/questions/:questionId
```

### **Answer API**
```javascript
// Submit answer (authenticated)
POST /api/answers/question/:questionId

// Vote on answer (authenticated)
POST /api/answers/:answerId/vote

// Accept answer (authenticated, question owner only)
PATCH /api/answers/:answerId/accept
```

## 🔄 **Data Flow Explained**

### **1. HomePage Loading Process**
```mermaid
User visits HomePage
    ↓
useAuth checks authentication
    ↓
useQuestions hook initializes
    ↓
API call to GET /api/questions
    ↓
Data transformed and displayed
    ↓
User interactions trigger new API calls
```

### **2. Search Flow**
```
User types in search box
    ↓
useDebounce delays API call (500ms)
    ↓
updateSearch triggers new API request
    ↓
Backend filters questions
    ↓
UI updates with filtered results
```

### **3. Authentication Flow**
```
User clicks "Ask Question"
    ↓
handleAskQuestion checks isAuthenticated
    ↓
If not authenticated: redirect to /login?returnUrl=/ask-question
    ↓
If authenticated: navigate to /ask-question
```

## 🛠️ **How to Use**

### **1. Environment Setup**
Create `.env.local` file in client directory:
```bash
VITE_API_BASE_URL=http://localhost:5000/api
```

### **2. Start Backend Server**
```bash
cd server
npm start
# Server runs on http://localhost:5000
```

### **3. Start Frontend**
```bash
cd client
npm run dev
# Client runs on http://localhost:5173
```

## 📝 **Code Examples**

### **Using the Questions Hook**
```javascript
import { useQuestions } from '@/hooks/useQuestions';

const MyComponent = () => {
  const {
    questions,
    pagination,
    loading,
    error,
    updateSearch,
    updateSort,
    updatePage
  } = useQuestions({
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  // Handle search
  const handleSearch = (searchTerm) => {
    updateSearch(searchTerm);
  };

  // Handle pagination
  const handlePageChange = (page) => {
    updatePage(page);
  };
};
```

### **Protected Route Usage**
```javascript
import RequireAuth from '@/components/RequireAuth';

const AskQuestionPage = () => {
  return (
    <RequireAuth>
      <div>
        {/* Your ask question form here */}
      </div>
    </RequireAuth>
  );
};
```

### **API Service Usage**
```javascript
import { questionAPI } from '@/api/questionService';

// Submit a question
const submitQuestion = async (questionData) => {
  try {
    const response = await questionAPI.submitQuestion(questionData);
    console.log('Question submitted:', response);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

## 🎨 **UI/UX Improvements**

### **✅ Dynamic UI Elements**
- **User Avatar**: Shows user profile picture when logged in
- **Solved Indicators**: Green checkmarks for accepted answers
- **Vote Counters**: Dynamic vote display with proper styling
- **Loading States**: Skeleton loading for better UX
- **Empty States**: Helpful messages when no questions found

### **✅ Interactive Features**
- **Hover Effects**: Cards highlight on hover
- **Search Highlighting**: Search terms could be highlighted (future enhancement)
- **Real-time Updates**: Data refreshes after actions
- **Responsive Design**: Works on all screen sizes

## 🔐 **Security Features**

### **✅ Authentication Checks**
- **Token Management**: Automatic token refresh
- **Route Protection**: Prevents unauthorized access
- **User Context**: Maintains user state across app
- **Secure Storage**: Tokens stored in localStorage with proper cleanup

### **✅ Input Validation**
- **Client-side Validation**: Form validation before API calls
- **Error Handling**: Proper error display to users
- **XSS Protection**: Input sanitization
- **CSRF Protection**: Proper headers and token management

## 🚨 **Error Handling**

### **API Errors**
```javascript
try {
  const response = await questionAPI.getAllQuestions();
} catch (error) {
  // Error automatically handled by interceptors
  // User sees friendly error message
  setError('Failed to load questions. Please try again.');
}
```

### **Authentication Errors**
- **401 Unauthorized**: Automatic token refresh attempt
- **403 Forbidden**: Clear error message
- **Network Errors**: Retry suggestions
- **Validation Errors**: Field-specific error display

## 📊 **Performance Optimizations**

### **✅ Implemented**
- **Debounced Search**: Reduces API calls during typing
- **Pagination**: Loads data in chunks
- **Lazy Loading**: Components load only when needed
- **Memoization**: Prevents unnecessary re-renders
- **Optimistic Updates**: UI updates before API confirmation

### **🔮 Future Enhancements**
- **Infinite Scroll**: Replace pagination for mobile
- **Caching**: Redux/Zustand for state management
- **Virtual Scrolling**: For large question lists
- **Image Optimization**: Lazy load avatars
- **Service Workers**: Offline support

## 🧪 **Testing Strategy**

### **API Testing**
```javascript
// Test question fetching
describe('Question API', () => {
  test('fetches questions successfully', async () => {
    const questions = await questionAPI.getAllQuestions();
    expect(questions.success).toBe(true);
    expect(questions.data.questions).toBeInstanceOf(Array);
  });
});
```

### **Component Testing**
```javascript
// Test authentication flow
describe('HomePage', () => {
  test('redirects to login when asking question without auth', () => {
    render(<HomePage />);
    fireEvent.click(screen.getByText('Ask New Question'));
    expect(mockNavigate).toHaveBeenCalledWith('/login?returnUrl=/ask-question');
  });
});
```

## 🎯 **Next Steps**

### **1. Immediate Actions**
1. Test the login/authentication flow
2. Create an Ask Question form page
3. Add question detail page with answers
4. Test search and filtering

### **2. Additional Pages to Implement**
- **Ask Question Page**: Form with rich text editor
- **Question Detail Page**: Full question view with answers
- **User Profile Page**: User's questions and answers
- **Answer Management**: Edit/delete answers

### **3. Advanced Features**
- **Real-time Notifications**: WebSocket integration
- **Markdown Support**: Rich text questions/answers
- **File Uploads**: Images in questions
- **Tag Autocomplete**: Smart tag suggestions
- **Question Voting**: Upvote/downvote questions

## 🚀 **Summary**

Your QnA forum now has a fully functional frontend-backend integration with:

✅ **Complete API Integration**  
✅ **Authentication Flow**  
✅ **Real-time Search & Filtering**  
✅ **Pagination**  
✅ **Error Handling**  
✅ **Loading States**  
✅ **User Management**  
✅ **Protected Routes**  

The foundation is solid and ready for additional features!
