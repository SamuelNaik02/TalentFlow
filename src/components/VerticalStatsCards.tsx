import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import CountUp from './CountUp';
import './VerticalStatsCards.css';

gsap.registerPlugin(ScrollTrigger);

const VerticalStatsCards = () => {
  const containerRef = useRef(null);
  const cardsRef = useRef([]);

  useEffect(() => {
    const cards = cardsRef.current;
    if (!cards.length) return;

    // Stagger animation for cards
    gsap.fromTo(cards, 
      { 
        x: -30, 
        opacity: 0
      },
      {
        x: 0,
        opacity: 1,
        duration: 0.6,
        stagger: 0.15,
        ease: "power2.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse"
        }
      }
    );

    // Hover animations
    cards.forEach((card, index) => {
      if (!card) return;

      const handleMouseEnter = () => {
        gsap.to(card, {
          x: 8,
          duration: 0.2,
          ease: "power2.out"
        });
      };

      const handleMouseLeave = () => {
        gsap.to(card, {
          x: 0,
          duration: 0.2,
          ease: "power2.out"
        });
      };

      card.addEventListener('mouseenter', handleMouseEnter);
      card.addEventListener('mouseleave', handleMouseLeave);

      return () => {
        card.removeEventListener('mouseenter', handleMouseEnter);
        card.removeEventListener('mouseleave', handleMouseLeave);
      };
    });
  }, []);

  const stats = [
    {
      icon: "📊",
      value: "25",
      numericValue: 25,
      label: "Active Jobs",
      color: "#1A3C34",
      bgColor: "#CADED9",
      badge: "LIVE"
    },
    {
      icon: "👥",
      value: "1,247",
      numericValue: 1247,
      label: "Total Candidates",
      color: "#1A3C34",
      bgColor: "#B0C4CD",
      badge: "ACTIVE"
    },
    {
      icon: "✅",
      value: "89",
      numericValue: 89,
      label: "Hired This Month",
      color: "#1A3C34",
      bgColor: "#DDE4E0",
      badge: "NEW"
    },
    {
      icon: "📈",
      value: "94%",
      numericValue: 94,
      label: "Success Rate",
      color: "#1A3C34",
      bgColor: "#C8D9D5",
      badge: "HIGH"
    }
  ];

  return (
    <div ref={containerRef} className="vertical-stats-container">
      {stats.map((stat, index) => (
        <div
          key={index}
          ref={el => cardsRef.current[index] = el}
          className="vertical-stat-card"
          style={{ '--card-color': stat.color, '--card-bg': stat.bgColor }}
        >
          <div className="vertical-stat-icon-container">
            <div className="vertical-stat-icon">
              {stat.icon}
            </div>
          </div>
          <div className="vertical-stat-content">
            <div className="vertical-stat-badge">{stat.badge}</div>
            <div className="vertical-stats-number">
              <CountUp 
                to={stat.numericValue} 
                duration={2.5} 
                delay={index * 0.2}
                separator={stat.numericValue > 100 ? "," : ""}
              />
              {stat.label === "Success Rate" && "%"}
            </div>
            <div className="vertical-stats-label">{stat.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default VerticalStatsCards;
