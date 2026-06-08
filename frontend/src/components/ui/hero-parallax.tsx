import React from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  MotionValue,
} from "framer-motion";
import { Link } from "react-router-dom";

export const HeroParallax = ({
  features,
}: {
  features: {
    title: string;
    description: string;
    color: string;
    icon: string;
  }[];
}) => {
  const firstRow = features.slice(0, 5);
  const secondRow = features.slice(5, 10);
  const ref = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const springConfig = { stiffness: 300, damping: 30, bounce: 100 };

  const translateX = useSpring(
    useTransform(scrollYProgress, [0, 1], [0, 1000]),
    springConfig
  );
  const translateXReverse = useSpring(
    useTransform(scrollYProgress, [0, 1], [0, -1000]),
    springConfig
  );
  const rotateX = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [15, 0]),
    springConfig
  );
  const opacity = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [0.2, 1]),
    springConfig
  );
  const rotateZ = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [20, 0]),
    springConfig
  );
  const translateY = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [-700, 500]),
    springConfig
  );
  
  return (
    <div
      ref={ref}
      className="h-[220vh] py-40 overflow-hidden antialiased relative flex flex-col self-auto [perspective:1000px] [transform-style:preserve-3d] bg-slate-50"
    >
      <Header />
      <motion.div
        style={{
          rotateX,
          rotateZ,
          translateY,
          opacity,
        }}
        className=""
      >
        <motion.div className="flex flex-row-reverse space-x-reverse space-x-12 mb-12">
          {firstRow.map((feature) => (
            <FeatureCard
              feature={feature}
              translate={translateX}
              key={feature.title}
            />
          ))}
        </motion.div>
        <motion.div className="flex flex-row mb-12 space-x-12 ">
          {secondRow.map((feature) => (
            <FeatureCard
              feature={feature}
              translate={translateXReverse}
              key={feature.title}
            />
          ))}
        </motion.div>
      </motion.div>
      
      {/* Fade out to white to blend with the rest of the page */}
      <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-white to-transparent z-10 pointer-events-none"></div>
    </div>
  );
};

export const Header = () => {
  return (
    <div className="max-w-7xl relative mx-auto py-20 md:py-40 px-4 md:px-16 w-full left-0 top-0 mt-10 z-20 pointer-events-none">
      <div className="absolute inset-0 bg-white/60 blur-3xl rounded-full scale-150 -z-10"></div>
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-sm font-bold tracking-wide uppercase mb-6">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
        Your code. Visualized.
      </div>
      <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
        Understand Code. <br/> Don't <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">Memorize</span> It.
      </h1>
      <p className="max-w-2xl text-lg md:text-xl mt-8 text-slate-500 leading-relaxed font-medium">
        DryRun helps you truly understand how code works by visualizing each step of execution with beautiful animations and AI explanations. 
      </p>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-8 pointer-events-auto">
        <Link 
          to="/workspace"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-xl font-semibold transition-all shadow-[0_8px_20px_-6px_rgba(79,70,229,0.5)] flex items-center gap-2"
        >
          Start Visualizing - It's Free <span className="text-xl leading-none">→</span>
        </Link>
      </div>
    </div>
  );
};

export const FeatureCard = ({
  feature,
  translate,
}: {
  feature: {
    title: string;
    description: string;
    color: string;
    icon: string;
  };
  translate: MotionValue<number>;
}) => {
  return (
    <motion.div
      style={{
        x: translate,
      }}
      whileHover={{
        y: -10,
        scale: 1.02
      }}
      key={feature.title}
      className={`group/feature h-72 w-[24rem] relative flex-shrink-0 rounded-2xl overflow-hidden border border-slate-200 shadow-lg bg-white p-8 flex flex-col justify-between hover:shadow-xl transition-all duration-300`}
    >
      <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl shadow-sm ${feature.color}`}>
         {/* using the passed string as a fallback or a simple div */}
         <div className="font-mono font-bold">{feature.icon}</div>
      </div>
      
      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-3 group-hover/feature:text-indigo-600 transition-colors">
          {feature.title}
        </h2>
        <p className="text-slate-500 font-medium leading-relaxed">
          {feature.description}
        </p>
      </div>
      
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white to-slate-100 rounded-bl-full -z-10 opacity-50 group-hover/feature:scale-110 transition-transform"></div>
    </motion.div>
  );
};
