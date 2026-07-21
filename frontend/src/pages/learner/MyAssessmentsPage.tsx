import { useState } from 'react';
import { motion } from 'framer-motion';
import { ClipboardCheck, Clock, Target, Play, CheckCircle, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { assessmentService } from '@/services/assessmentService';
import toast from 'react-hot-toast';

// Mock questions for assessment taking
const mockQuestions = [
  {
    id: 1,
    question: 'What is the primary purpose of a firewall in network security?',
    options: [
      'To speed up internet connection',
      'To monitor and filter incoming and outgoing network traffic',
      'To store backup files',
      'To encrypt all data on the network',
    ],
    correct: 1,
  },
  {
    id: 2,
    question: 'Which of the following is a best practice for password security?',
    options: [
      'Using the same password for all accounts',
      'Writing passwords on sticky notes',
      'Using a combination of letters, numbers, and special characters',
      'Sharing passwords with colleagues for convenience',
    ],
    correct: 2,
  },
  {
    id: 3,
    question: 'What does VPN stand for?',
    options: [
      'Virtual Private Network',
      'Very Protected Node',
      'Verified Public Network',
      'Visual Processing Node',
    ],
    correct: 0,
  },
  {
    id: 4,
    question: 'Which type of attack involves flooding a server with traffic to make it unavailable?',
    options: [
      'Phishing',
      'Man-in-the-middle',
      'Denial of Service (DoS)',
      'SQL Injection',
    ],
    correct: 2,
  },
  {
    id: 5,
    question: 'What is the role of an Intrusion Detection System (IDS)?',
    options: [
      'To block all incoming traffic',
      'To detect and alert on suspicious activity',
      'To encrypt network communications',
      'To backup system files',
    ],
    correct: 1,
  },
];

type AssessmentState = 'list' | 'instructions' | 'taking' | 'results';

export function MyAssessmentsPage() {
  const assessments = assessmentService.getAll();
  const [state, setState] = useState<AssessmentState>('list');
  const [selectedAssessment, setSelectedAssessment] = useState<typeof assessments[0] | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [timeLeft] = useState('24:30');

  const handleStartAssessment = (assessment: typeof assessments[0]) => {
    setSelectedAssessment(assessment);
    setState('instructions');
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
  };

  const handleBeginTest = () => {
    setState('taking');
    toast.success('Assessment started! Good luck.');
  };

  const handleAnswer = (questionIdx: number, optionIdx: number) => {
    setAnswers({ ...answers, [questionIdx]: optionIdx });
  };

  const handleSubmit = () => {
    const correctCount = mockQuestions.filter((q, i) => answers[i] === q.correct).length;
    const score = Math.round((correctCount / mockQuestions.length) * 100);
    setShowResults(true);
    setState('results');
    if (score >= (selectedAssessment?.passingScore || 70)) {
      toast.success(`Passed! Score: ${score}%`);
    } else {
      toast.error(`Score: ${score}%. Required: ${selectedAssessment?.passingScore}%`);
    }
  };

  const handleBackToList = () => {
    setState('list');
    setSelectedAssessment(null);
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
  };

  const score = showResults
    ? Math.round((mockQuestions.filter((q, i) => answers[i] === q.correct).length / mockQuestions.length) * 100)
    : 0;

  // Instructions Screen
  if (state === 'instructions' && selectedAssessment) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto space-y-6">
        <button onClick={handleBackToList} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-4 h-4" /> Back to Assessments
        </button>

        <Card>
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 bg-navy-800/5 rounded-full flex items-center justify-center mx-auto">
              <ClipboardCheck className="w-8 h-8 text-navy-800" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">{selectedAssessment.title}</h2>
            <p className="text-sm text-gray-500">{selectedAssessment.courseName}</p>

            <div className="grid grid-cols-3 gap-4 py-4 border-y border-gray-100 max-w-md mx-auto">
              <div className="text-center">
                <p className="text-2xl font-bold text-navy-800">{selectedAssessment.questions}</p>
                <p className="text-xs text-gray-500">Questions</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-navy-800">{selectedAssessment.duration}</p>
                <p className="text-xs text-gray-500">Minutes</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-navy-800">{selectedAssessment.passingScore}%</p>
                <p className="text-xs text-gray-500">Pass Score</p>
              </div>
            </div>

            <div className="text-left bg-gray-50 rounded-lg p-4 space-y-2 max-w-md mx-auto">
              <p className="text-sm font-medium text-gray-900">Instructions:</p>
              <ul className="text-sm text-gray-600 space-y-1.5">
                <li>• Read each question carefully before answering</li>
                <li>• You have {selectedAssessment.duration} minutes to complete</li>
                <li>• You need {selectedAssessment.passingScore}% to pass</li>
                <li>• Maximum attempts allowed: {selectedAssessment.attempts}</li>
                <li>• You can navigate between questions</li>
                <li>• Click "Submit" when you're done</li>
              </ul>
            </div>

            <Button variant="gold" size="lg" onClick={handleBeginTest} className="mt-4">
              <Play className="w-4 h-4 mr-2" /> Begin Assessment
            </Button>
          </div>
        </Card>
      </motion.div>
    );
  }

  // Assessment Taking Screen
  if (state === 'taking' && selectedAssessment) {
    const question = mockQuestions[currentQuestion];
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">{selectedAssessment.title}</h2>
              <p className="text-xs text-gray-500">Question {currentQuestion + 1} of {mockQuestions.length}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-sm text-orange-600 font-medium">
                <Clock className="w-4 h-4" /> {timeLeft}
              </div>
              <Badge variant="gold">
                {Object.keys(answers).length}/{mockQuestions.length} answered
              </Badge>
            </div>
          </div>
          <ProgressBar value={((currentQuestion + 1) / mockQuestions.length) * 100} size="sm" color="gold" className="mt-3" />
        </div>

        {/* Question */}
        <Card>
          <div className="space-y-6">
            <div>
              <span className="text-xs font-medium text-gold-500 uppercase tracking-wider">Question {currentQuestion + 1}</span>
              <h3 className="text-lg font-medium text-gray-900 mt-1">{question.question}</h3>
            </div>

            <div className="space-y-3">
              {question.options.map((option, idx) => (
                <label
                  key={idx}
                  className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all ${
                    answers[currentQuestion] === idx
                      ? 'border-navy-800 bg-navy-800/5 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${currentQuestion}`}
                    checked={answers[currentQuestion] === idx}
                    onChange={() => handleAnswer(currentQuestion, idx)}
                    className="accent-navy-800 w-4 h-4"
                  />
                  <span className="text-sm text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
            disabled={currentQuestion === 0}
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Previous
          </Button>

          {/* Question dots */}
          <div className="flex items-center gap-1.5">
            {mockQuestions.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentQuestion(idx)}
                className={`w-3 h-3 rounded-full transition-all ${
                  idx === currentQuestion
                    ? 'bg-navy-800 scale-125'
                    : answers[idx] !== undefined
                    ? 'bg-gold-500'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          {currentQuestion < mockQuestions.length - 1 ? (
            <Button
              variant="primary"
              onClick={() => setCurrentQuestion(currentQuestion + 1)}
            >
              Next <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button
              variant="gold"
              onClick={handleSubmit}
              disabled={Object.keys(answers).length < mockQuestions.length}
            >
              Submit Assessment
            </Button>
          )}
        </div>
      </motion.div>
    );
  }

  // Results Screen
  if (state === 'results' && selectedAssessment) {
    const passed = score >= selectedAssessment.passingScore;
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto space-y-6">
        <Card>
          <div className="text-center py-8 space-y-4">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto ${passed ? 'bg-green-100' : 'bg-red-100'}`}>
              {passed ? (
                <CheckCircle className="w-10 h-10 text-green-600" />
              ) : (
                <AlertCircle className="w-10 h-10 text-red-600" />
              )}
            </div>

            <h2 className="text-2xl font-bold text-gray-900">
              {passed ? 'Congratulations! 🎉' : 'Not Quite There'}
            </h2>
            <p className="text-gray-500">
              {passed
                ? 'You have successfully passed this assessment.'
                : `You need ${selectedAssessment.passingScore}% to pass. Try again!`}
            </p>

            <div className="grid grid-cols-3 gap-4 py-6 border-y border-gray-100 max-w-md mx-auto">
              <div className="text-center">
                <p className={`text-3xl font-bold ${passed ? 'text-green-600' : 'text-red-600'}`}>{score}%</p>
                <p className="text-xs text-gray-500">Your Score</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-navy-800">{selectedAssessment.passingScore}%</p>
                <p className="text-xs text-gray-500">Pass Score</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-navy-800">
                  {mockQuestions.filter((q, i) => answers[i] === q.correct).length}/{mockQuestions.length}
                </p>
                <p className="text-xs text-gray-500">Correct</p>
              </div>
            </div>

            {/* Review answers */}
            <div className="text-left space-y-3 max-w-md mx-auto">
              {mockQuestions.map((q, i) => (
                <div key={i} className={`p-3 rounded-lg border ${answers[i] === q.correct ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                  <p className="text-sm font-medium text-gray-900">Q{i + 1}. {q.question}</p>
                  <p className="text-xs mt-1">
                    Your answer: <span className="font-medium">{q.options[answers[i]] || 'Not answered'}</span>
                    {answers[i] !== q.correct && (
                      <span className="text-green-600 ml-2">Correct: {q.options[q.correct]}</span>
                    )}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center gap-3 pt-4">
              <Button variant="outline" onClick={handleBackToList}>Back to Assessments</Button>
              {!passed && (
                <Button variant="gold" onClick={() => { setState('instructions'); setAnswers({}); setCurrentQuestion(0); setShowResults(false); }}>
                  Retry Assessment
                </Button>
              )}
            </div>
          </div>
        </Card>
      </motion.div>
    );
  }

  // Default: Assessment List
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Assessments</h1>
        <p className="text-sm text-gray-500 mt-1">Quizzes, exams, and assignments</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {assessments.filter(a => a.status === 'published').map((assessment) => (
          <Card key={assessment.id} hover>
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 bg-navy-800/5 rounded-lg">
                <ClipboardCheck className="w-5 h-5 text-navy-800" />
              </div>
              <Badge variant="gold">{assessment.type}</Badge>
            </div>
            <h3 className="font-medium text-gray-900 mb-1">{assessment.title}</h3>
            <p className="text-sm text-gray-500 mb-3">{assessment.courseName}</p>
            <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
              <span className="flex items-center gap-1"><ClipboardCheck className="w-3.5 h-3.5" /> {assessment.questions} questions</span>
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {assessment.duration} min</span>
              <span className="flex items-center gap-1"><Target className="w-3.5 h-3.5" /> Pass: {assessment.passingScore}%</span>
            </div>
            <Button
              variant="primary"
              size="sm"
              className="w-full"
              onClick={() => handleStartAssessment(assessment)}
            >
              <Play className="w-4 h-4 mr-1" /> Start Assessment
            </Button>
          </Card>
        ))}
      </div>
    </motion.div>
  );
}
