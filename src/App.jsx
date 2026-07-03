import { useState, useEffect } from 'react'
import { Mic, MicOff, Star, Volume2, CheckCircle, XCircle, Lightbulb } from 'lucide-react'
import './App.css'

function App() {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [stars, setStars] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [suggestion, setSuggestion] = useState('')

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in your browser. Please use Chrome or Edge.')
    }
  }, [])

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) return

    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onstart = () => {
      setIsListening(true)
      setTranscript('')
      setFeedback(null)
      setSuggestion('')
    }

    recognition.onresult = (event) => {
      let finalTranscript = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript
        }
      }
      if (finalTranscript) {
        setTranscript(finalTranscript)
        analyzeSpeech(finalTranscript)
      }
    }

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error)
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.start()
  }

  const stopListening = () => {
    setIsListening(false)
  }

  const analyzeSpeech = async (text) => {
    setIsProcessing(true)
    
    // Simulate AI analysis (in production, this would call an AI API)
    setTimeout(() => {
      const analysis = performGrammarCheck(text)
      setFeedback(analysis)
      
      if (analysis.isGood) {
        const newStars = stars + analysis.starsEarned
        setStars(newStars)
      }
      
      if (analysis.suggestion) {
        setSuggestion(analysis.suggestion)
      }
      
      setIsProcessing(false)
    }, 1000)
  }

  const performGrammarCheck = (text) => {
    const lowerText = text.toLowerCase().trim()
    
    // Simple grammar rules for demonstration
    const commonErrors = [
      { pattern: /\bi\b/g, correction: 'I', message: 'Always capitalize "I" when referring to yourself' },
      { pattern: /\bdon't\b/g, correction: "don't", message: 'Good contraction usage!' },
      { pattern: /\bdoesnt\b/g, correction: "doesn't", message: 'Missing apostrophe: use "doesn\'t"' },
      { pattern: /\bcant\b/g, correction: "can't", message: 'Missing apostrophe: use "can\'t"' },
      { pattern: /\bwont\b/g, correction: "won't", message: 'Missing apostrophe: use "won\'t"' },
      { pattern: /\bim\b/g, correction: "I'm", message: 'Should be "I\'m" with capital I' },
      { pattern: /\bme go\b/g, correction: 'let me go', message: 'Missing "let" before "me go"' },
      { pattern: /\bhe go\b/g, correction: 'he goes', message: 'Use "goes" for third person singular' },
      { pattern: /\bshe go\b/g, correction: 'she goes', message: 'Use "goes" for third person singular' },
    ]

    let corrections = []
    let isGood = true
    let starsEarned = 0

    commonErrors.forEach(error => {
      if (error.pattern.test(lowerText)) {
        corrections.push(error.message)
        isGood = false
      }
    })

    // Check for sentence structure
    if (!text.endsWith('.') && !text.endsWith('?') && !text.endsWith('!')) {
      corrections.push('Sentences should end with punctuation (. ? !)')
      isGood = false
    }

    if (text.split(' ').length < 3) {
      corrections.push('Try to make longer sentences for better practice')
      isGood = false
    }

    // Calculate stars based on performance
    if (isGood) {
      starsEarned = 3
    } else if (corrections.length <= 1) {
      starsEarned = 2
    } else if (corrections.length <= 2) {
      starsEarned = 1
    }

    // Generate suggestions for improvement
    let suggestionText = ''
    if (!isGood) {
      const suggestions = [
        `Try saying: "${text.replace(/\.$/, '')}." (add period)`,
        'Try using more descriptive words',
        'Practice using complete sentences',
        'Try adding more details to your sentence'
      ]
      suggestionText = suggestions[Math.floor(Math.random() * suggestions.length)]
    }

    return {
      isGood,
      corrections,
      starsEarned,
      suggestion: suggestionText,
      pronunciation: calculatePronunciationScore(text)
    }
  }

  const calculatePronunciationScore = (text) => {
    // Simulated pronunciation score (in production, use actual speech analysis)
    const wordCount = text.split(' ').length
    const baseScore = Math.min(95, 70 + (wordCount * 2))
    return Math.floor(baseScore + Math.random() * 10)
  }

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.8
      utterance.pitch = 1.1
      window.speechSynthesis.speak(utterance)
    }
  }

  return (
    <div className="app-container">
      <div className="header">
        <h1>🎤 AI English Speaking Tutor</h1>
        <div className="stars-display">
          <Star className="star-icon" fill={stars > 0 ? '#f59e0b' : 'none'} />
          <Star className="star-icon" fill={stars > 1 ? '#f59e0b' : 'none'} />
          <Star className="star-icon" fill={stars > 2 ? '#f59e0b' : 'none'} />
          <Star className="star-icon" fill={stars > 3 ? '#f59e0b' : 'none'} />
          <Star className="star-icon" fill={stars > 4 ? '#f59e0b' : 'none'} />
          <span className="stars-count">{stars} Stars</span>
        </div>
      </div>

      <div className="main-content">
        <div className="microphone-section">
          <button
            className={`mic-button ${isListening ? 'listening' : ''}`}
            onClick={isListening ? stopListening : startListening}
            disabled={isProcessing}
          >
            {isListening ? <Mic className="mic-icon animate-pulse" /> : <Mic className="mic-icon" />}
            {isListening ? 'Listening...' : 'Tap to Speak'}
          </button>
          
          {isProcessing && (
            <div className="processing-indicator">
              <div className="spinner"></div>
              <span>Analyzing your speech...</span>
            </div>
          )}
        </div>

        {transcript && (
          <div className="transcript-section">
            <div className="transcript-header">
              <h3>You said:</h3>
              <button 
                className="speak-button"
                onClick={() => speakText(transcript)}
                title="Hear pronunciation"
              >
                <Volume2 size={20} />
              </button>
            </div>
            <p className="transcript-text">{transcript}</p>
          </div>
        )}

        {feedback && (
          <div className="feedback-section">
            <div className="pronunciation-score">
              <h3>Pronunciation Score:</h3>
              <div className="score-bar">
                <div 
                  className="score-fill" 
                  style={{ width: `${feedback.pronunciation}%` }}
                ></div>
              </div>
              <span className="score-text">{feedback.pronunciation}%</span>
            </div>

            {feedback.isGood ? (
              <div className="success-message">
                <CheckCircle className="success-icon" />
                <p>Excellent job! Your grammar is perfect! ⭐⭐⭐</p>
              </div>
            ) : (
              <div className="corrections-list">
                <h4>Grammar Tips:</h4>
                {feedback.corrections.map((correction, index) => (
                  <div key={index} className="correction-item">
                    <XCircle className="error-icon" />
                    <span>{correction}</span>
                  </div>
                ))}
              </div>
            )}

            {suggestion && (
              <div className="suggestion-box">
                <Lightbulb className="suggestion-icon" />
                <p><strong>Better way to say it:</strong> {suggestion}</p>
              </div>
            )}

            <div className="stars-earned">
              {feedback.starsEarned > 0 && (
                <p className="stars-message">
                  🌟 You earned {feedback.starsEarned} star{feedback.starsEarned > 1 ? 's' : ''}!
                </p>
              )}
            </div>
          </div>
        )}

        <div className="tips-section">
          <h3>Tips for Better Speaking:</h3>
          <ul>
            <li>Speak clearly and at a moderate pace</li>
            <li>Use complete sentences with proper punctuation</li>
            <li>Practice new words and phrases daily</li>
            <li>Don't be afraid to make mistakes - they help you learn!</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default App
