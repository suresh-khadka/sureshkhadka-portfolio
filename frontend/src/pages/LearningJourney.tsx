import React from 'react';

const milestones = [
  { year: '2022', title: 'The Beginning', description: 'Started exploring Python and the fundamentals of Data Science.' },
  { year: '2023', title: 'Deep Learning Dive', description: 'Mastered PyTorch and built several neural network architectures for computer vision.' },
  { year: '2024', title: 'Full Stack Transition', description: 'Learned React and Django to build end-to-end AI applications.' },
  { year: '2025', title: 'LLM Specialization', description: 'Focused on RAG, fine-tuning, and agentic workflows with Claude and GPT.' },
];

export default function LearningJourney() {
  return (
    <div className="page-container">
      <header className="text-center py-12">
        <h1 className="text-5xl font-bold text-white mb-4">Learning Journey</h1>
        <p className="text-text_muted max-w-2xl mx-auto">
          The path from a curious student to an AI/ML engineer. A timeline of milestones and breakthroughs.
        </p>
      </header>

      <div className="relative max-w-4xl mx-auto">
        {/* Vertical Line */}
        <div className="absolute left-4 md:left-1/2 transform -translate-x-1/2 h-full w-1 bg-slate-700"></div>

        <div className="space-y-12">
          {milestones.map((m, i) => (
            <div key={i} className={`relative flex items-center justify-between ${i % 2 === 0 ? 'flex-row-reverse' : ''}`}>
              <div className="hidden md:block w-5/12"></div>
              <div className="absolute left-4 md:left-1/2 transform -translate-x-1/2 w-4 h-4 bg-accent rounded-full border-4 border-primary shadow-lg"></div>
              <div className="w-full md:w-5/12 p-6 bg-secondary rounded-2xl border border-slate-700 shadow-lg">
                <span className="text-accent font-bold text-xl">{m.year}</span>
                <h3 className="text-white font-bold text-lg mb-2">{m.title}</h3>
                <p className="text-text_muted text-sm">{m.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
