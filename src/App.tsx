import * as React from 'react';
import { useState, useEffect } from 'react';
import { Send, Users, Clock, Heart, MapPin, Copy, ChevronDown, ChevronUp } from 'lucide-react';
import './App.css';
import { initGA, trackPageView, trackFormSubmission, trackCopyToClipboard } from './services/analytics';
import FloatingAppreciationButton from './FloatingAppreciationButton';

interface ChatGPTActivity {
  title: string;
  description: string;
  instructions: string;
  tips: string;
  ageRange: string;
  duration: string;
  category: string;
  thingsToAvoid: string;
}

const AboutModal: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  if (!open) return null;
  return (
    <div className="about-modal-overlay">
      <div className="about-modal-content">
        <button onClick={onClose} aria-label="Close">×</button>
        <h2>About Mom, I'm Bored!</h2>
        <p><strong>Purpose:</strong> Mom, I'm Bored! is designed to help parents and caregivers quickly find creative, screen-free activities for kids in any situation. Our audience is parents, guardians, and anyone seeking wholesome, practical ways to keep children engaged without digital devices. We focus on safe, age-appropriate, and easy-to-implement ideas for a variety of everyday scenarios.</p>
        <h3>Meta Description</h3>
        <p>Discover screen-free activities for kids, tailored for parents and caregivers. Find creative, safe, and practical ideas to keep children entertained in any situation. Perfect for families seeking wholesome, device-free fun.</p>
        <h3>Privacy Policy</h3>
        <p>Your privacy is important to us. We do not collect any personally identifiable information from users. Third-party vendors, including Google, use cookies to serve ads based on your prior visits to this website or other websites. Google's use of advertising cookies enables it and its partners to serve ads to you based on your visit to this site and/or other sites on the Internet. You may opt out of personalized advertising by visiting <a href="https://www.aboutads.info/choices" target="_blank" rel="noopener noreferrer">Ad Settings</a>. For more information, see <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer">Google's Privacy Policy</a>. We do not knowingly collect information from children under 13. If you have questions about our privacy practices, please contact us.</p>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [selectedAge, setSelectedAge] = useState<string>('');
  const [selectedPlace, setSelectedPlace] = useState<string>('');
  const [situation, setSituation] = useState<string>('');
  const [response, setResponse] = useState<string>('');
  const [activities, setActivities] = useState<ChatGPTActivity[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [expandedActivities, setExpandedActivities] = useState<Set<number>>(new Set());
  const [copiedActivities, setCopiedActivities] = useState<Set<number>>(new Set());
  const [aboutOpen, setAboutOpen] = useState(false);

  // Initialize Google Analytics on component mount
  useEffect(() => {
    initGA();
    trackPageView(window.location.pathname);
    // Scroll to top on initial mount
    window.scrollTo(0, 0);
  }, []);

  const ageRanges = [
    { value: '1-3', label: 'Toddler (1-3)' },
    { value: '4-6', label: 'Preschooler (4-6)' },
    { value: '7-9', label: 'Early Elementary (7-9)' },
    { value: '10-12', label: 'Pre-teen (10-12)' },
    { value: '13+', label: 'Teen (13+)' }
  ];

  const places = [
    { value: 'restaurant', label: 'Restaurant' },
    { value: 'car-ride', label: 'Car Ride' },
    { value: 'grocery-store', label: 'Shopping' },
    { value: 'waiting-room', label: 'Waiting Room' },
    { value: 'adult-gathering', label: 'Adult Gathering' }
  ];

  const handleSubmit = async () => {
    // All fields are now optional - no validation needed
    setIsLoading(true);
    setResponse('');
    setActivities([]);
    setIsError(false);

    // Track form submission
    trackFormSubmission(selectedAge, selectedPlace, !!situation);

    try {
      // Import the service dynamically to avoid build issues
      const { getActivityAdvice } = await import('./services/chatgptService');
      const result = await getActivityAdvice({
        ageRange: selectedAge,
        placeType: selectedPlace,
        situation: situation
      });
      
      setResponse(result.advice);
      setActivities(result.activities);
    } catch (error) {
      setResponse('Bummer dude! Our surfer has wiped out. We\'re looking into it, so please try again later.');
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const clearResponse = () => {
    if (response || activities.length > 0) {
      setResponse('');
      setActivities([]);
      setIsError(false);
    }
  };

  const handleAgeChange = (age: string) => {
    const newAge = selectedAge === age ? '' : age;
    setSelectedAge(newAge);
    clearResponse();
  };

  const handlePlaceChange = (place: string) => {
    const newPlace = selectedPlace === place ? '' : place;
    setSelectedPlace(newPlace);
    clearResponse();
  };

  const handleSituationChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSituation(e.target.value);
    clearResponse();
  };

  const copyActivityToClipboard = async (activity: ChatGPTActivity, index: number) => {
    try {
      const letter = String.fromCharCode(65 + index); // A, B, C, D, E
      const activityText = `${letter}. ${activity.title}
Description: ${activity.description}
Instructions: ${activity.instructions}
Tips: ${activity.tips}
Age Range: ${activity.ageRange}
Duration: ${activity.duration}
Category: ${activity.category}
Things to Avoid: ${activity.thingsToAvoid}`;
      
      await navigator.clipboard.writeText(activityText);
      
      // Mark this activity as copied
      setCopiedActivities(prev => new Set(Array.from(prev).concat(index)));
      
      // Reset the copied state after 3 seconds
      setTimeout(() => {
        setCopiedActivities(prev => {
          const newSet = new Set(prev);
          newSet.delete(index);
          return newSet;
        });
      }, 3000);
      
      // Track copy to clipboard event
      trackCopyToClipboard();
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      // setCopyFeedback('Failed to copy'); // Removed unused variable
      setTimeout(() => {
        // setCopyFeedback(''); // Removed unused variable
      }, 2000);
    }
  };

  const toggleActivityExpansion = (index: number) => {
    const newExpanded = new Set(expandedActivities);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedActivities(newExpanded);
  };

  //console.log('🎨 Current activities state:', activities);

  return (
    <div className="App">
      <div className="container">
        <header className="header">
          <div className="header-content">
            <img src="/surfing.png" alt="Surfing" className="logo-image" />
            <div className="logo">
              <h1>Mom, I'm Bored!</h1>
            </div>
            <p className="subtitle">Keep your kids entertained without a screen.</p>
          </div>
        </header>

        <div className="main-content">
          <div className="card">
            <p className="card-description">
              Tell me about your kid and what the situation is, and I'll provide activities that keep your kids entertained without screens.
            </p>

            <div className="form-section">
              <label className="form-label">
                <Users className="label-icon" />
                Kid's Age Range
              </label>
              <div className="age-buttons">
                {ageRanges.map((age) => (
                  <button
                    key={age.value}
                    className={`age-btn ${selectedAge === age.value ? 'active' : ''}`}
                    onClick={() => handleAgeChange(age.value)}
                  >
                    {age.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-section">
              <label className="form-label">
                <MapPin className="label-icon" />
                Place
              </label>
              <div className="age-buttons">
                {places.map((place) => (
                  <button
                    key={place.value}
                    className={`age-btn ${selectedPlace === place.value ? 'active' : ''}`}
                    onClick={() => handlePlaceChange(place.value)}
                  >
                    {place.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-section">
              <label className="form-label">
                <Heart className="label-icon" />
                Describe Your Situation
              </label>
              <textarea
                className="input textarea"
                placeholder="Try: 'My 5-year-old is bored at a restaurant and keeps asking for the tablet. He is fascinated by dinosaurs.' OR 'I need activities for my 8-year-old at the grocery store. She wants to be a musician when she grows up.'"
                value={situation}
                onChange={handleSituationChange}
                rows={6}
              />
            </div>

            <button
              className="btn submit-btn"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="spinner"></div>
                  Getting Advice...
                </>
              ) : (
                <>
                  <Send />
                  Get Activity Advice
                </>
              )}
            </button>
          </div>

          {(response || activities.length > 0) && (
            <div className="card">
              <div className="response-header">
                <h2>{isError ? 'Oops!' : 'Activities to Consider'}</h2>
              </div>
              {isError && (
                <div className="error-image">
                  <img src="/wipeout.png" alt="Surfer wiping out" style={{ width: '150px', height: '150px', margin: '0 auto 20px', display: 'block' }} />
                </div>
              )}
              {isError ? (
                <div className="response">{response}</div>
              ) : (
                <div className="chatgpt-activities">
                  {activities.map((activity, index) => (
                    <div key={index} className="activity-card">
                      <h3>{activity.title}</h3>
                      <p className="activity-description">{activity.description}</p>
                      
                      <button
                        className="btn try-it-btn"
                        onClick={() => toggleActivityExpansion(index)}
                      >
                        {expandedActivities.has(index) ? (
                          <>
                            <ChevronUp className="chevron-icon" />
                            Hide Details
                          </>
                        ) : (
                          <>
                            <ChevronDown className="chevron-icon" />
                            Try it out!
                          </>
                        )}
                      </button>

                      {expandedActivities.has(index) && (
                        <div className="activity-details expanded">
                          <div className="detail-section">
                            <strong>Instructions:</strong>
                            <p className="detail-text">{activity.instructions}</p>
                          </div>
                          <div className="detail-section">
                            <strong>Tips:</strong>
                            <p className="detail-text">{activity.tips}</p>
                          </div>
                          <div className="detail-section">
                            <strong>Things to Avoid:</strong>
                            <p className="detail-text">{activity.thingsToAvoid}</p>
                          </div>
                          <div className="activity-copy-section">
                            <button
                              className={`btn copy-activity-btn ${copiedActivities.has(index) ? 'copied' : ''}`}
                              onClick={() => copyActivityToClipboard(activity, index)}
                              title="Copy this activity to clipboard"
                            >
                              <Copy className="copy-icon" />
                              {copiedActivities.has(index) ? 'copied!' : 'copy to clipboard'}
                            </button>
                          </div>
                        </div>
                      )}
                      
                      <div className="activity-meta">
                        <span className="meta-item">
                          <Clock className="meta-icon" />
                          {activity.duration}
                        </span>
                        <span className="meta-item">
                          <Users className="meta-icon" />
                          {activity.ageRange}
                        </span>
                        <span className="meta-item category">
                          {activity.category}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <footer className="footer">
          <p>Made with ❤️ for parents everywhere</p>
          <p className="footer-note">
            This app provides general advice. Always supervise kids and ensure activities are safe for their age and abilities.
          </p>
          <button style={{ background: 'none', border: 'none', color: '#fff', opacity: 0.7, fontSize: 14, cursor: 'pointer', textDecoration: 'underline', marginTop: 8 }} onClick={() => setAboutOpen(true)} aria-label="About this site">About</button>
        </footer>
        <AboutModal open={aboutOpen} onClose={() => setAboutOpen(false)} />
        <FloatingAppreciationButton />
      </div>
    </div>
  );
};

export default App; 