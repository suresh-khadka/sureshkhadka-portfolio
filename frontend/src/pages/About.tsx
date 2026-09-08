import React from 'react';
import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div className="page-container">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div>
          <h1 className="text-5xl font-bold text-white mb-6">About Me</h1>
          <p className="text-lg text-text_muted mb-6">
            I am a passionate AI/ML Engineer and Full-stack Developer with a deep interest in 
            building systems that can learn, adapt, and solve complex real-world problems.
          </p>
          <p className="text-lg text-text_muted mb-8">
            Currently, I am focusing on the intersection of Large Language Models (LLMs) and 
            traditional software architecture, aiming to create tools that are not only 
            intelligent but also robust and scalable.
          </p>
          <div className="flex gap-4">
            <Link to="/learning" className="bg-accent text-primary px-6 py-3 rounded-lg font-bold hover:bg-sky-300 transition-colors">
              See My Journey
            </Link>
            <Link to="/contact" className="border-2 border-accent text-accent px-6 py-3 rounded-lg font-bold hover:bg-accent hover:text-primary transition-colors">
              Get in Touch
            </Link>
          </div>
        </div>

        <div className="relative">
          <img 
            src="https://via.placeholder.com/500x600" 
            alt="Suresh Khadka" 
            className="rounded-3xl shadow-2xl border-4 border-secondary"
          />
          <div className="absolute -bottom-6 -right-6 bg-accent text-primary p-6 rounded-2xl font-bold shadow-xl">
            AI/ML Enthusiast
          </div>
        </div>
      </div>
    </div>
  );
}
