import Image from "next/image";
import AnimatedElement from "@/components/common/AnimatedElement/AnimatedElement";
import AnimatedSection from "@/components/common/AnimatedSection/AnimatedSection";
import styles from "./TestimonialsSection.module.css";

const TestimonialsSection = () => {
  const testimonials = [
    {
      id: 1,
      name: "Dr. Sarah Tamiru",
      role: "Mathematics Teacher",
      school: "Addis Ababa International School",
      image: "/sarah-tamiru.png",
      rating: 5,
      testimonial: "Teacherly AI has revolutionized my grading process. What used to take me 3 hours of grading now takes just 30 minutes. The AI grading accuracy is incredible - I've found it to be 97% accurate with complex math problems. My students love getting instant feedback too!",
      highlight: "Reduced grading time by 85%",
      features: ["AI Grading", "Instant Feedback", "Math Problem Recognition"]
    },
    {
      id: 2,
      name: "Milki Johannes",
      role: "English Literature Teacher",
      school: "Ethiopian International Academy",
      image: "/milki-johannes.png",
      rating: 5,
      testimonial: "The essay grading feature is simply outstanding. It provides detailed feedback on grammar, structure, and content quality. My students' writing has improved significantly since I started using the AI-powered feedback system. The content generation hub helps me create diverse assignments effortlessly.",
      highlight: "Improved student writing by 40%",
      features: ["Essay Analysis", "Content Generation", "Detailed Feedback"]
    },
    {
      id: 3,
      name: "Abebech Dinku",
      role: "Science Department Head",
      school: "Bole International School",
      image: "/abebech-dinku.png",
      rating: 5,
      testimonial: "Managing grades for 200+ students across multiple science subjects was overwhelming. Teacherly AI's analytics and reporting features give me insights I never had before. I can identify struggling students early and provide targeted support. The attendance tracking with intervention alerts is a game-changer.",
      highlight: "Early intervention increased pass rates by 25%",
      features: ["Analytics Dashboard", "Attendance Tracking", "Intervention Alerts"]
    }
  ];

  const metrics = [
    {
      value: "4.9/5",
      label: "Average Rating",
      description: "Based on 2,500+ reviews"
    },
    {
      value: "98%",
      label: "Teacher Satisfaction",
      description: "Would recommend to colleagues"
    },
    {
      value: "18 hrs",
      label: "Time Saved",
      description: "Average weekly time reduction"
    },
    {
      value: "45%",
      label: "Improved Outcomes",
      description: "Average student performance increase"
    }
  ];

  const institutions = [
    "Addis Ababa University",
    "Ethiopian International Academy", 
    "Bole International School",
    "Unity University",
    "Admas University",
    "St. Mary's University"
  ];

  return (
    <AnimatedSection className={styles.testimonialsSection} animation="fade">
      <div className="container">
        <AnimatedElement animation="up" delay={0.2}>
          <div className={styles.sectionHeader}>
            <div className={styles.badge}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
              Testimonials
            </div>
            <h2 className={styles.sectionTitle}>
              Loved by Teachers
              <span className={styles.gradientText}> Worldwide</span>
            </h2>
            <p className={styles.sectionDescription}>
              See how educators are transforming their teaching experience with Teacherly AI
            </p>
          </div>
        </AnimatedElement>

        <div className={styles.testimonialsGrid}>
          {testimonials.map((testimonial, index) => (
            <AnimatedElement 
              key={testimonial.id} 
              animation={index % 2 === 0 ? "left" : "right"} 
              delay={0.4 + (index * 0.2)}
            >
              <div className={styles.testimonialCard}>
                <div className={styles.testimonialHeader}>
                  <div className={styles.authorInfo}>
                    <div className={styles.authorImage}>
                      <Image
                        src={testimonial.image}
                        alt={testimonial.name}
                        width={80}
                        height={80}
                        className={styles.avatarImage}
                      />
                      <div className={styles.verifiedBadge}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 6L9 17l-5-5"/>
                        </svg>
                      </div>
                    </div>
                    <div className={styles.authorDetails}>
                      <h4 className={styles.authorName}>{testimonial.name}</h4>
                      <p className={styles.authorRole}>{testimonial.role}</p>
                      <p className={styles.authorSchool}>{testimonial.school}</p>
                      <div className={styles.rating}>
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                          </svg>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className={styles.highlightMetric}>
                    <span className={styles.metricValue}>{testimonial.highlight}</span>
                  </div>
                </div>

                <blockquote className={styles.testimonialContent}>
                  &ldquo;{testimonial.testimonial}&rdquo;
                </blockquote>

                <div className={styles.testimonialFeatures}>
                  {testimonial.features.map((feature, featureIndex) => (
                    <span key={featureIndex} className={styles.featureTag}>
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            </AnimatedElement>
          ))}
        </div>

        <AnimatedElement animation="scale" delay={0.8}>
          <div className={styles.metricsContainer}>
            <div className={styles.metricsGrid}>
              {metrics.map((metric, index) => (
                <div key={index} className={styles.metricItem}>
                  <div className={styles.metricValue}>{metric.value}</div>
                  <div className={styles.metricLabel}>{metric.label}</div>
                  <div className={styles.metricDescription}>{metric.description}</div>
                </div>
              ))}
            </div>
          </div>
        </AnimatedElement>

        <AnimatedElement animation="up" delay={1.0}>
          <div className={styles.institutionsSection}>
            <h3 className={styles.institutionsTitle}>Trusted by Leading Educational Institutions</h3>
            <div className={styles.institutionsList}>
              {institutions.map((institution, index) => (
                <div key={index} className={styles.institutionItem}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 21l18-6V9L3 3v7l13 1L3 14v7z"/>
                  </svg>
                  {institution}
                </div>
              ))}
            </div>
          </div>
        </AnimatedElement>

        <AnimatedElement animation="fade" delay={1.2}>
          <div className={styles.socialProof}>
            <div className={styles.socialProofContent}>
              <div className={styles.socialProofIcon}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <div className={styles.socialProofText}>
                <h4>Join 10,000+ Educators</h4>
                <p>Be part of a growing community of teachers transforming education with AI</p>
              </div>
              <div className={styles.socialProofActions}>
                <button className={styles.joinCommunityBtn}>
                  Join Community
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                    <polyline points="12 5 19 12 12 19"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </AnimatedElement>
      </div>
    </AnimatedSection>
  );
};

export default TestimonialsSection;