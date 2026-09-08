import React, { useState } from 'react';

export default function Contact() {
  const [status, setStatus] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    // Simulation of form submission
    setTimeout(() => {
      setStatus('success');
    }, 1500);
  };

  return (
    <div className="page-container">
      <header className="text-center py-12">
        <h1 className="text-5xl font-bold text-white mb-4">Get in Touch</h1>
        <p className="text-text_muted max-w-2xl mx-auto">
          Have a project in mind or just want to say hi? I am always open to discussing AI/ML and software engineering.
        </p>
      </header>

      <div className="max-w-xl mx-auto bg-secondary p-8 rounded-3xl border border-slate-700 shadow-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-text_muted mb-2">Name</label>
              <input 
                type="text" 
                required 
                className="w-full bg-primary border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent transition-colors" 
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text_muted mb-2">Email</label>
              <input 
                type="email" 
                required 
                className="w-full bg-primary border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent transition-colors" 
                placeholder="john@example.com"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text_muted mb-2">Message</label>
            <textarea 
              rows={5} 
              required 
              className="w-full bg-primary border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent transition-colors" 
              placeholder="Tell me about your project..."
            ></textarea>
          </div>
          <button 
            type="submit" 
            disabled={status === 'sending'}
            className="w-full bg-accent text-primary font-bold py-4 rounded-lg hover:bg-sky-300 transition-colors disabled:opacity-50"
          >
            {status === 'sending' ? 'Sending...' : 'Send Message'}
          </button>
          {status === 'success' && (
            <p className="text-center text-green-400 font-medium mt-4">Message sent successfully!</p>
          )}
        </form>
      </div>
    </div>
  );
}
