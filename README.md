# Mom, I'm Bored!

A beautiful web application that provides personalized advice to parents on keeping their kids occupied without screens. This app serves as a wrapper for ChatGPT, offering a user-friendly interface for getting activity suggestions tailored to your kid's age and situation.

## Features

- **Age-Specific Recommendations**: Choose from different age ranges (toddlers to teens)
- **Personalized Advice**: Describe your specific situation and get tailored suggestions
- **Quick Activity Ideas**: Browse pre-curated screen-free activities
- **Beautiful UI**: Modern, responsive design with smooth animations
- **Mobile-Friendly**: Works perfectly on all devices

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd parent-activity-advisor
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp env.example .env
```

4. Configure your environment variables in the `.env` file:
   - Add your OpenAI API key (if using ChatGPT integration)
   - Add your Google Analytics tracking ID (optional, for analytics)

5. Start the development server:
```bash
npm start
```

6. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Usage

1. **Select Age Range**: Choose your kid's age group from the available options
2. **Describe Situation**: Tell us about your specific circumstances (e.g., "rainy day", "need quiet activities", etc.)
3. **Get Advice**: Click "Get Activity Advice" to receive personalized suggestions
4. **Browse Quick Ideas**: Explore the pre-curated activity suggestions for instant inspiration

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: CSS3 with modern design patterns
- **Icons**: Lucide React
- **Build Tool**: Create React App
- **Analytics**: Google Analytics 4 (react-ga4)

## Project Structure

```
src/
├── App.tsx              # Main application component
├── App.css              # Component-specific styles
├── index.tsx            # Application entry point
├── index.css            # Global styles
├── react-app-env.d.ts   # TypeScript declarations
└── services/
    ├── chatgptService.ts # ChatGPT API integration
    └── analytics.ts      # Google Analytics configuration
```

## Configuration

### Google Analytics Setup

This app includes Google Analytics 4 integration to track user interactions and app usage. To set up analytics:

1. **Create a Google Analytics Account**:
   - Go to [Google Analytics](https://analytics.google.com/)
   - Create a new account and property
   - Set up a web data stream for your domain

2. **Get Your Tracking ID**:
   - In Google Analytics, go to Admin > Data Streams
   - Select your web stream
   - Copy the Measurement ID (starts with "G-")

3. **Add to Environment Variables**:
   - Add your tracking ID to the `.env` file:
   ```
   REACT_APP_GA_TRACKING_ID=G-XXXXXXXXXX
   ```

4. **Tracked Events**:
   The app automatically tracks:
   - Page views
   - Form submissions
   - Age range selections
   - Place type selections
   - Copy to clipboard actions
   - Activity interactions

### Adding New Activities

To add new quick activity suggestions, modify the `quickSuggestions` array in `src/App.tsx`:

```typescript
const quickSuggestions: ActivitySuggestion[] = [
  {
    title: "Your Activity Title",
    description: "Description of the activity",
    ageRange: "4-8",
    duration: "30-45 min",
    category: "Creative"
  },
  // ... more activities
];
```

### Styling

The app uses a modern design system with:
- Gradient backgrounds
- Card-based layout
- Smooth hover animations
- Responsive design
- Custom color palette

## Future Enhancements

- [ ] Integration with actual ChatGPT API
- [ ] Activity difficulty ratings
- [ ] Save favorite activities
- [ ] Share activities with other parents
- [ ] Activity categories and filtering
- [ ] Seasonal activity suggestions

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue in the GitHub repository or contact the development team.

---

**Note**: This app currently uses mock data for demonstration purposes. To integrate with ChatGPT, you'll need to add your OpenAI API key and implement the actual API calls. 