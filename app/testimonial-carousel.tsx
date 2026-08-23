"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Quote, Star } from "lucide-react";
import { useEffect, useState } from "react";

const testimonials = [
  {
    quote: "Obliq turned our GST notice backlog into a queue our team actually clears every week instead of firefighting.",
    name: "Ananya Rao",
    title: "Partner, Rao & Associates",
    initial: "A"
  },
  {
    quote: "The dashboard finally gives our preparers, reviewers, and clients one place to understand what is pending.",
    name: "Karan Mehta",
    title: "Founder, Mehta Tax Co.",
    initial: "K"
  },
  {
    quote: "RAG search over client documents is the feature that made the prototype feel like a real firm operating layer.",
    name: "Nisha Iyer",
    title: "Audit Manager, Iyer & Shah",
    initial: "N"
  },
  {
    quote: "The agent planner is simple, but it shows exactly how Gemini, Groq, and OpenAI routing can become useful.",
    name: "Rahul Sen",
    title: "CA Workflow Consultant",
    initial: "R"
  }
];

export default function TestimonialCarousel() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % testimonials.length);
    }, 3600);
    return () => window.clearInterval(timer);
  }, []);

  const testimonial = testimonials[active];

  return (
    <section className="testimonial-band">
      <span className="eyebrow">
        <Quote size={17} /> What CA firms say
      </span>
      <h2>“Obliq is by far the best compliance tool we’ve used.”</h2>
      <div className="testimonial-stage">
        <AnimatePresence mode="wait">
          <motion.article
            className="testimonial-card"
            key={testimonial.name}
            initial={{ opacity: 0, x: 34, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -34, scale: 0.98 }}
            transition={{ duration: 0.38 }}
          >
            <div className="stars" aria-label="Five star rating">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star size={17} fill="currentColor" key={index} />
              ))}
            </div>
            <p>“{testimonial.quote}”</p>
            <div className="testimonial-person">
              <span className="testimonial-avatar">{testimonial.initial}</span>
              <div>
                <strong>{testimonial.name}</strong>
                <small>{testimonial.title}</small>
              </div>
            </div>
          </motion.article>
        </AnimatePresence>
      </div>
      <div className="carousel-dots">
        {testimonials.map((item, index) => (
          <button
            type="button"
            aria-label={`Show testimonial from ${item.name}`}
            className={index === active ? "active" : ""}
            key={item.name}
            onClick={() => setActive(index)}
          />
        ))}
      </div>
    </section>
  );
}
