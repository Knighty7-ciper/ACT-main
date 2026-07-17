import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, GraduationCap, Video, FileText, ArrowRight, CheckCircle } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const LearnPage = () => {
  const courses = [
    { title: 'Introduction to Cryptocurrency', level: 'Beginner', duration: '30 min', lessons: 5 },
    { title: 'Understanding Pesa-Afrik', level: 'Beginner', duration: '45 min', lessons: 8 },
    { title: 'Wallet Security Basics', level: 'Intermediate', duration: '60 min', lessons: 10 },
    { title: 'DeFi Fundamentals', level: 'Intermediate', duration: '90 min', lessons: 12 },
  ];

  const topics = [
    'What is cryptocurrency?',
    'How does Pesa-Afrik work?',
    'Setting up your wallet',
    'Security best practices',
    'Sending & receiving PESA',
    'Staking and earning rewards',
    'Understanding DeFi',
    'African financial sovereignty'
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/" className="inline-flex items-center gap-2 text-blue-200 hover:text-white mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            Learn with <span className="text-blue-400">Pesa-Afrik</span>
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mb-8">
            Master cryptocurrency and financial freedom with our comprehensive educational resources.
          </p>
          <Link to="/register" className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors inline-flex items-center gap-2">
            Start Learning Free
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-8">Popular Courses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {courses.map((course) => (
              <div key={course.title} className="bg-slate-50 rounded-xl p-6 border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">{course.level}</span>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{course.title}</h3>
                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <span className="flex items-center gap-1"><Video className="w-4 h-4" /> {course.duration}</span>
                  <span className="flex items-center gap-1"><FileText className="w-4 h-4" /> {course.lessons} lessons</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-8 text-center">What You'll Learn</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {topics.map((topic) => (
              <div key={topic} className="flex items-center gap-3 bg-white rounded-lg p-4 border border-slate-200">
                <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <span className="text-slate-700">{topic}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LearnPage;
