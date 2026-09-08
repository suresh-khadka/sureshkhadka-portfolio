import React from 'react';

const milestones = [
  {
    year: '2024',
    title: 'The Beginning',
    description: 'Started my journey into programming and Computer Engineering, building a foundation in Python, programming fundamentals, and problem solving.'
  },
  {
    year: '2025',
    title: 'Machine Learning Journey',
    description: 'Moved deeper into Machine Learning and Data Science. Learned NumPy, Pandas, Matplotlib, Scikit-learn, data preprocessing, EDA, feature engineering, dimensionality reduction, and model evaluation. Built practical projects involving regression, classification, recommendation systems, and predictive modeling.'
  },
  {
    year: '2025',
    title: 'From Data to Intelligent Systems',
    description: 'Started working with larger datasets and more advanced ML techniques, including PCA, scaling, encoding, hyperparameter tuning, GridSearchCV, Optuna, XGBoost, and LightGBM. Built projects such as a House Price Prediction system and a Mobile Recommendation System, learning how to move from a trained model to a real application.'
  },
  {
    year: '2025–2026',
    title: 'Full-Stack Development',
    description: 'Expanded beyond ML into web development, learning HTML, CSS, JavaScript, jQuery, AJAX, Fetch API, React, Django, and databases. Started building complete applications where the frontend, backend, database, and ML models work together.'
  },
  {
    year: '2026',
    title: 'Deep Learning',
    description: 'Started my deeper exploration of Deep Learning and Neural Networks. Learning concepts such as ANNs, CNNs, forward propagation, backpropagation, activation functions, loss functions, optimization, and model training, while implementing the concepts through practical experiments.'
  },
  {
    year: '2026',
    title: 'AI Engineering',
    description: 'Currently combining everything I\'ve learned — Machine Learning, Deep Learning, Web Development, APIs, Databases, and AI systems — to build more complete and practical AI applications. My focus is shifting from simply training models to understanding how to design, deploy, and build useful AI-powered products.'
  },
  {
    year: 'Next',
    title: 'Building Real-World AI Systems',
    description: 'The goal is to continue toward AI Engineering, exploring LLMs, RAG, AI agents, multimodal AI, recommendation systems, and intelligent applications while documenting everything I learn through projects and technical blogs.'
  },
];

export default function LearningJourney() {
  return (
    <div className="page-container">
      <header className="text-center py-12">
        <h1 className="text-5xl font-bold text-text-main mb-4">Learning Journey</h1>
        <p className="text-text_muted max-w-2xl mx-auto">
          The path from a curious student to an AI/ML engineer. A timeline of milestones and breakthroughs.
        </p>
      </header>

      <div className="relative max-w-4xl mx-auto">
        {/* Vertical Line */}
        <div className="absolute left-4 md:left-1/2 transform -translate-x-1/2 h-full w-1 bg-slate-200"></div>

        <div className="space-y-12">
          {milestones.map((m, i) => (
            <div key={i} className={`relative flex items-center justify-between ${i % 2 === 0 ? 'flex-row-reverse' : ''}`}>
              <div className="hidden md:block w-5/12"></div>
              <div className="absolute left-4 md:left-1/2 transform -translate-x-1/2 w-4 h-4 bg-accent rounded-full border-4 border-primary shadow-lg"></div>
              <div className="w-full md:w-5/12 p-6 bg-secondary rounded-2xl border border-slate-200 shadow-lg">
                <span className="text-accent font-bold text-xl">{m.year}</span>
                <h3 className="text-text-main font-bold text-lg mb-2">{m.title}</h3>
                <p className="text-text_muted text-sm">{m.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
