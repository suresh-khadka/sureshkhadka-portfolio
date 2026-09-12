import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Linkedin, Instagram, Mail, Maximize2, X } from 'lucide-react';
import { FaGithub, FaTwitter } from 'react-icons/fa';
import apiClient from '../api/client';
import { Button } from '../components/Button';

interface Project {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail_url: string;
  stack: string[];
}

interface Skill {
  id: string;
  name: string;
  category_name: string;
  proficiency_level: string;
  icon_url: string;
  proficiency: number;
}

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  cover_image_url: string;
  published_at: string;
  tags: { id: string; name: string; slug: string }[];
}

interface HeroProps {
  name: string;
  role: string;
  photoUrl: string;
  socialLinks: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    instagram?: string;
    email?: string;
  };
}

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

const Hero = ({ name, role, photoUrl, socialLinks }: HeroProps) => {

  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  };

  const socialIcons = [
    { icon: FaGithub, link: socialLinks.github },
    { icon: Linkedin, link: socialLinks.linkedin },
    { icon: FaTwitter, link: socialLinks.twitter },
    { icon: Instagram, link: socialLinks.instagram },
    { icon: Mail, link: socialLinks.email },
  ].filter(item => item.link);

  return (
    <section id="hero" className="relative w-full min-h-screen overflow-hidden bg-primary">


      {/* Photo layer - full background on desktop, hidden on mobile */}
      <img
        src={photoUrl}
        alt={name}
        // className="hidden md:block absolute inset-0 w-full h-full object-cover object-right"
        // className="hidden md:block absolute inset-0 w-full h-full object-contain object-right"
        className="absolute inset-0 w-full h-full object-cover object-center md:left-1/2 md:w-1/2 md:object-[35%_center]"
        style={{ willChange: 'transform' }}
      />


      <div className="relative z-10 flex flex-col md:block min-h-screen">
        {/* Text panel */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10 w-full md:w-[58%] md:min-h-screen bg-primary flex flex-col justify-center px-8 md:px-16 lg:px-24 py-20 md:[clip-path:polygon(0_0,100%_0,78%_100%,0_100%)]"
        >
          <motion.span variants={itemVariants} className="text-gray-500 font-medium text-lg mb-2">
            Hi, I am
          </motion.span>

          <motion.h1
            variants={itemVariants}
            className="text-5xl md:text-6xl font-bold text-gray-900 mb-4"
          >
            {name}
          </motion.h1>

          <motion.p variants={itemVariants} className="text-gray-500 font-medium tracking-wide text-xl mb-8">
            {role}
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-wrap gap-4">
            {socialIcons.map(({ icon: Icon, link }, i) => (
              <a
                key={i}
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gray-800 text-white flex items-center justify-center transition-all duration-300 hover:scale-110 hover:bg-black"
              >
                <Icon size={18} />
              </a>
            ))}
          </motion.div>
        </motion.div>

        {/* Photo - mobile only, stacked below text */}
        <div className="md:hidden relative w-full h-80 bg-primary">
          <img src={photoUrl} alt={name} className="w-full h-full object-cover object-center" />
        </div>
      </div>

      <button
        onClick={() => setIsLightboxOpen(true)}
        className="absolute bottom-6 right-6 z-20 p-3 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/40 transition-colors"
        aria-label="Expand image"
      >
        <Maximize2 size={24} />
      </button>

      {/* Lightbox */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setIsLightboxOpen(false)}
          >
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              aria-label="Close lightbox"
            >
              <X size={32} />
            </button>
            <motion.img
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              src={photoUrl}
              alt={name}
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

const SectionWrapper = ({ id, children, title, subtitle }: { id: string, children: React.ReactNode, title?: string, subtitle?: string }) => {
  return (
    <section
      id={id}
      className="min-h-screen w-full flex flex-col justify-center py-20 px-6 md:px-12 lg:px-24"
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-6xl mx-auto w-full"
      >
        {title && (
          <header className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-bold text-text-main mb-4">{title}</h2>
            {subtitle && <p className="text-text_muted max-w-2xl mx-auto text-lg">{subtitle}</p>}
          </header>
        )}
        {children}
      </motion.div>
    </section>
  );
};

const SkillCard = ({ skill }: { skill: Skill }) => {
  return (
    <motion.div
      className="relative group w-24 h-24 md:w-28 md:h-28 mx-auto cursor-pointer"
      whileHover="hover"
      initial="initial"
    >
      <div className="absolute inset-0 rounded-full bg-primary border-2 border-slate-200 group-hover:border-accent transition-colors duration-300 shadow-sm group-hover:shadow-md" />
      <div className="absolute inset-0 flex items-center justify-center p-2">
        <motion.div
          variants={{
            initial: { opacity: 1, scale: 1, rotate: 0 },
            hover: { opacity: 0, scale: 0.5, rotate: -90 }
          }}
          transition={{ duration: 0.3 }}
          className="flex items-center justify-center w-full h-full"
        >
          <img
            src={skill.icon_url || 'https://placehold.co/64'}
            alt={skill.name}
            className="w-10 h-10 md:w-12 md:h-12 object-contain"
          />
        </motion.div>
        <motion.div
          variants={{
            initial: { opacity: 0, scale: 0.5, rotate: 90 },
            hover: { opacity: 1, scale: 1, rotate: 0 }
          }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 flex flex-col items-center justify-center text-center"
        >
          <span className="text-lg md:text-xl font-bold text-accent">{skill.proficiency}%</span>
        </motion.div>
      </div>
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-max text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <span className="text-xs font-bold text-text-main whitespace-nowrap">{skill.name}</span>
      </div>
    </motion.div>
  );
};

const CategoryCard = ({ category, skills }: { category: string, skills: Skill[] }) => (
  <div className="bg-secondary p-8 rounded-3xl border border-slate-200 shadow-lg">
    <h3 className="text-2xl font-bold text-text-main mb-6 text-center border-b border-slate-200 pb-4">{category}</h3>
    <div className="flex flex-wrap justify-center gap-8 md:gap-12">
      {skills.filter(s => s.category_name === category).map(skill => (
        <SkillCard key={skill.id} skill={skill} />
      ))}
    </div>
  </div>
);


export default function HomePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [contactStatus, setContactStatus] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsRes, skillsRes, blogsRes] = await Promise.all([
          apiClient.get('/projects/'),
          apiClient.get('/skills/'),
          apiClient.get('/blogs/'),
        ]);
        setProjects(projectsRes.data);
        setSkills(skillsRes.data);
        setBlogs(blogsRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactStatus('sending');
    setTimeout(() => setContactStatus('success'), 1500);
  };

  const skillCategories = Array.from(new Set(skills.map(s => s.category_name)));

  return (
    <div className="">
      <Hero
        name="Suresh Khadka"
        role="Aspiring AI,  ML & Data Science Engineer"
        photoUrl="/hero.jpeg"
        socialLinks={{
          github: "https://github.com/suresh-khadka",
          linkedin: "www.linkedin.com/in/suresh-khadka-85307731b",
          twitter: "https://twitter.com",
          instagram: "https://www.instagram.com/iam_sureshkhadka/?hl=en",
          email: "mailto:khadkasuresh647@gmail.com"
        }}
      />

      <SectionWrapper id="about" title="About Me">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <p className="text-lg text-text_muted leading-relaxed">
              I’m Suresh Khadka, a Computer Engineering student passionate about AI, Machine Learning, and Data Science. I enjoy turning what I learn into practical projects and exploring how intelligent systems can solve real-world problems.
            </p>
            <p className="text-lg text-text_muted leading-relaxed">
              My journey has taken me from Python and data analysis into machine learning, deep learning, and full-stack AI applications. I’m a strong believer in learning by building, experimenting, and sharing, which is why I document my learning and projects through this portfolio.
            </p>
            <p className="text-lg text-text_muted leading-relaxed">
              Currently, I’m focused on growing as an AI/ML and Data Science Engineer and building meaningful projects along the way.
            </p>
            <div className="flex gap-4">
              <Link to="/learning" className="bg-accent text-white px-6 py-3 rounded-lg font-bold hover:bg-sky-600 transition-colors">
                See My Journey
              </Link>
              <Button variant="outline" onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}>
                Contact Me
              </Button>
            </div>
          </div>
          <div className="relative">
            <img
              src="/profile_01.png"
              alt="Suresh Khadka"
              className="rounded-3xl shadow-2xl border-4 border-secondary w-full object-cover"
            />
            <div className="absolute -bottom-6 -right-6 bg-accent text-white p-6 rounded-2xl font-bold shadow-xl">
              AI/ML Enthusiast
            </div>
          </div>
        </div>
      </SectionWrapper>

      <SectionWrapper id="skills" title="Technical Skills" subtitle="My toolbelt for building intelligent applications.">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-pulse">
            {[1, 2].map(i => <div key={i} className="bg-secondary h-64 rounded-3xl"></div>)}
          </div>
        ) : (
          <div className="columns-1 md:columns-2 gap-12">
            {skillCategories.map(category => (
              <div key={category} className="break-inside-avoid mb-12">
                <CategoryCard category={category} skills={skills} />
              </div>
            ))}
          </div>
        )}
      </SectionWrapper>

      <SectionWrapper id="learning" title="Learning Journey" subtitle="The path from a curious student to an AI/ML engineer.">
        <div className="relative max-w-4xl mx-auto">
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
      </SectionWrapper>

      <SectionWrapper id="projects" title="Featured Work" subtitle="A selection of my most impactful AI/ML projects">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-pulse">
            {[1, 2, 3].map(i => <div key={i} className="bg-secondary h-80 rounded-2xl"></div>)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {projects.slice(0, 6).map(project => (
              <div key={project.id} className="group bg-secondary rounded-2xl overflow-hidden border border-slate-200 hover:border-accent transition-all duration-300 shadow-lg">
                <div className="h-48 overflow-hidden">
                  <img
                    src={project.thumbnail_url || 'https://placehold.co/400x200'}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-text-main mb-2">{project.title}</h3>
                  <p className="text-text_muted text-sm mb-4 line-clamp-2">{project.description}</p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {project.stack.map(tech => (
                      <span key={tech} className="text-xs bg-white px-2 py-1 rounded-md text-accent border border-accent/20 shadow-sm">
                        {tech}
                      </span>
                    ))}
                  </div>
                  <Link
                    to={`/projects/${project.slug}`}
                    className="text-text-main font-semibold flex items-center gap-2 group-hover:text-accent transition-colors"
                  >
                    View Details <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionWrapper>

      <SectionWrapper id="blogs" title="Recent Blogs" subtitle="Sharing my thoughts on Machine Learning, AI architecture, and software engineering.">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-pulse">
            {[1, 2].map(i => <div key={i} className="bg-secondary h-64 rounded-3xl"></div>)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {blogs.slice(0, 6).map(blog => (
              <div key={blog.id} className="group bg-secondary rounded-2xl overflow-hidden border border-slate-200 hover:border-accent transition-all duration-300 shadow-lg">
                <div className="h-48 overflow-hidden">
                  <img
                    src={blog.cover_image_url || 'https://placehold.co/400x200'}
                    alt={blog.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <div className="flex gap-2 mb-3">
                    {blog.tags.map(tag => (
                      <span key={tag.id} className="text-xs text-accent">#{tag.name}</span>
                    ))}
                  </div>
                  <h3 className="text-xl font-bold text-text-main mb-2 group-hover:text-accent transition-colors">{blog.title}</h3>
                  <p className="text-text_muted text-sm mb-6 line-clamp-2">
                    {blog.content ? blog.content.substring(0, 150) : 'No content available'}...
                  </p>
                  <Link
                    to={`/blogs/${blog.slug}`}
                    className="text-text-main font-semibold flex items-center gap-2 hover:text-accent transition-colors"
                  >
                    Read Article <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="text-center mt-12">
          <Link to="/blogs" className="bg-accent text-white px-8 py-3 rounded-lg font-bold hover:bg-sky-600 transition-colors">
            View All Blogs
          </Link>
        </div>
      </SectionWrapper>

      <SectionWrapper id="contact" title="Get in Touch" subtitle="Have a project in mind or just want to say hi?">
        <div className="max-w-xl mx-auto bg-secondary p-8 rounded-3xl border border-slate-200 shadow-2xl">
          <form onSubmit={handleContactSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-text_muted mb-2">Name</label>
                <input
                  type="text"
                  required
                  className="w-full bg-primary border border-slate-200 rounded-lg px-4 py-3 text-text-main focus:outline-none focus:border-accent transition-colors"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text_muted mb-2">Email</label>
                <input
                  type="email"
                  required
                  className="w-full bg-primary border border-slate-200 rounded-lg px-4 py-3 text-text-main focus:outline-none focus:border-accent transition-colors"
                  placeholder="john@example.com"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-text_muted mb-2">Message</label>
              <textarea
                rows={5}
                required
                className="w-full bg-primary border border-slate-200 rounded-lg px-4 py-3 text-text-main focus:outline-none focus:border-accent transition-colors"
                placeholder="Tell me about your project..."
              ></textarea>
            </div>
            <button
              type="submit"
              disabled={contactStatus === 'sending'}
              className="w-full bg-accent text-white font-bold py-4 rounded-lg hover:bg-sky-600 transition-colors disabled:opacity-50"
            >
              {contactStatus === 'sending' ? 'Sending...' : 'Send Message'}
            </button>
            {contactStatus === 'success' && (
              <p className="text-center text-green-600 font-medium mt-4">Message sent successfully!</p>
            )}
          </form>
        </div>
      </SectionWrapper>
    </div>
  );
}