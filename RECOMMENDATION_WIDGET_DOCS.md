# RecommendationWidget Component

## Overview
The `RecommendationWidget` is a React component that displays AI-powered project recommendations, including prioritized next tasks and project delay warnings. It fetches data from the `/api/projects/:projectId/recommendations` endpoint and presents it in an intuitive, user-friendly interface.

## Features

### 1. **Next Suggested Tasks** 📋
- Displays an ordered list of prioritized tasks
- Shows priority levels with color-coded chips (CRITICAL, HIGH, MEDIUM, LOW)
- Includes task details: title, description, status, deadline, assignee
- Displays reasons for task prioritization
- Shows deadline proximity with human-readable format

### 2. **Project Delay Warning** ⚠️
- Clear Material-UI Alert component for delay warnings
- Color-coded alerts based on risk level (HIGH = red, MEDIUM = yellow, LOW = green)
- Lists specific risk factors identified by AI
- Provides actionable recommendations
- Shows success message when project is on track

### 3. **Quick Insights** 💡
- Completion percentage
- Team velocity (tasks/day)
- Number of urgent tasks
- Estimated days to complete

## Installation

The component is already created at:
```
client/src/components/RecommendationWidget.js
```

No additional dependencies needed - uses existing Material-UI components.

## Usage

### Basic Usage
```jsx
import RecommendationWidget from './components/RecommendationWidget';

function MyDashboard() {
  const projectId = '690c085b7b553f23520556c4';
  
  return (
    <RecommendationWidget projectId={projectId} />
  );
}
```

### With Custom Limit
```jsx
<RecommendationWidget 
  projectId={selectedProject._id} 
  limit={10} 
/>
```

### Integration Example (Mentor Dashboard)
```jsx
import React, { useState } from 'react';
import { Box, Grid } from '@mui/material';
import RecommendationWidget from '../components/RecommendationWidget';

function MentorDashboard() {
  const [selectedProject, setSelectedProject] = useState(null);
  
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={8}>
        {/* Other dashboard content */}
      </Grid>
      <Grid item xs={12} md={4}>
        {selectedProject && (
          <RecommendationWidget 
            projectId={selectedProject._id} 
            limit={5} 
          />
        )}
      </Grid>
    </Grid>
  );
}
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `projectId` | String | Yes | - | MongoDB ObjectId of the project |
| `limit` | Number | No | 5 | Maximum number of suggested tasks to display |

## Component States

### Loading State
Displays a circular progress indicator with loading message.

### Error State
Shows an error alert if the API request fails.

### Success State
Displays the full widget with:
- Project delay warning alert (if applicable)
- Next suggested tasks list
- Quick insights chips

## Visual Design

### Priority Levels
- **CRITICAL**: Red chip with error icon (overdue or due within 24 hours)
- **HIGH**: Orange chip with warning icon (due within 3 days)
- **MEDIUM**: Blue chip with priority icon (due within 7 days)
- **LOW**: Green chip with checkmark icon (no immediate deadline)

### Alert Severity Mapping
- **HIGH Risk**: Red error alert
- **MEDIUM Risk**: Yellow warning alert
- **LOW Risk**: Blue info alert
- **No Risk**: Green success alert

### Task Display
Each task card shows:
1. **Priority number** (1, 2, 3...) in a circular badge
2. **Task title** with priority and status chips
3. **Description** (if available)
4. **Deadline** with proximity indicator
5. **Assignee** or "Unassigned" warning
6. **Reasons for prioritization** as small chips

## API Integration

The component expects the following response structure from the API:

```json
{
  "message": "Project recommendations generated successfully",
  "projectId": "690c085b7b553f23520556c4",
  "projectName": "Test Project",
  "nextSuggestedTasks": [
    {
      "id": "task123",
      "title": "Task Title",
      "description": "Task description",
      "status": "In Progress",
      "deadline": "2025-11-09T02:31:26.000Z",
      "assignedTo": {
        "id": "user123",
        "username": "john",
        "email": "john@example.com"
      },
      "priorityLevel": "CRITICAL",
      "reasons": ["Due within 3 days", "Already in progress"]
    }
  ],
  "projectDelayWarning": {
    "isDelayed": true,
    "riskLevel": "MEDIUM",
    "message": "⚠️ Project is at MEDIUM risk of delays...",
    "riskFactors": ["2 tasks are unassigned"],
    "recommendations": ["Assign unassigned tasks"]
  },
  "insights": {
    "urgentTasksCount": 1,
    "teamVelocity": 1,
    "completionPercentage": 33,
    "estimatedDaysToComplete": 2
  }
}
```

## Testing

### Demo Page
A demo page is available for testing the component:

**URL:** `http://localhost:3000/demo/recommendations`

The demo page includes:
- Project ID input field
- Task limit configuration
- Live widget preview
- Integration guide

### Manual Testing
1. Start the server: `cd server && node server.js`
2. Start the client: `cd client && npm start`
3. Navigate to: `http://localhost:3000/demo/recommendations`
4. Use test project ID: `690c085b7b553f23520556c4`
5. Verify all features are working correctly

### Test Cases

#### 1. Project with Delays
- **Expected:** Red/yellow alert showing delay warning
- **Expected:** Risk factors listed
- **Expected:** Recommendations provided

#### 2. Project On Track
- **Expected:** Green success alert
- **Expected:** "Project is on track" message

#### 3. Tasks with Different Priorities
- **Expected:** Tasks ordered by priority score
- **Expected:** Color-coded priority chips
- **Expected:** Appropriate icons for each priority level

#### 4. Unassigned Tasks
- **Expected:** Warning indicator next to unassigned tasks
- **Expected:** "Unassigned" appears in reasons

#### 5. Overdue Tasks
- **Expected:** "Overdue by X days" message
- **Expected:** CRITICAL priority level
- **Expected:** Red color coding

## Customization

### Changing Colors
Modify the `getPriorityColor` function:
```javascript
const getPriorityColor = (priorityLevel) => {
  switch (priorityLevel) {
    case 'CRITICAL':
      return 'error'; // Change to your preferred color
    // ...
  }
};
```

### Changing Icons
Modify the `getPriorityIcon` function:
```javascript
import { Star as StarIcon } from '@mui/icons-material';

const getPriorityIcon = (priorityLevel) => {
  switch (priorityLevel) {
    case 'CRITICAL':
      return <StarIcon fontSize="small" />;
    // ...
  }
};
```

### Custom Date Formatting
Modify the `formatDeadline` function to change how deadlines are displayed.

## Accessibility

- Uses semantic HTML elements
- Proper ARIA labels on interactive elements
- Color is not the only indicator (icons + text)
- Keyboard navigation supported through Material-UI components
- Screen reader friendly alert messages

## Performance

- Efficient re-rendering with React hooks
- API calls only when projectId or limit changes
- Memoization opportunities for large task lists
- Lazy loading support for large datasets

## Error Handling

The component handles:
- Network errors
- Invalid project IDs
- Missing authentication tokens
- Empty task lists
- Missing data fields

## Browser Compatibility

Compatible with all modern browsers:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Mobile Responsiveness

- Responsive layout using Material-UI Grid
- Stack direction changes on small screens
- Touch-friendly chip components
- Optimized spacing for mobile devices

## Future Enhancements

Potential improvements:
1. **Real-time Updates** - WebSocket integration for live updates
2. **Task Actions** - Quick assign/complete buttons on tasks
3. **Export Feature** - Download recommendations as PDF
4. **Filtering** - Filter tasks by priority or status
5. **Sorting** - Custom sort options
6. **Animations** - Smooth transitions for better UX
7. **Notifications** - Browser notifications for critical tasks

## Troubleshooting

### Widget Not Loading
- Check if server is running on port 5000
- Verify JWT token in localStorage
- Check browser console for errors
- Verify project ID is correct

### No Tasks Displayed
- Verify project has uncompleted tasks
- Check API response in Network tab
- Ensure user has access to the project

### Delay Warning Not Showing
- Project may be on track (this is good!)
- Check if project has deadlines set
- Verify AI analysis is running correctly

## License

Part of the Mini Project - Project Management System

---

**Created:** November 7, 2025  
**Author:** GitHub Copilot  
**Version:** 1.0.0  
**Status:** ✅ Production Ready
