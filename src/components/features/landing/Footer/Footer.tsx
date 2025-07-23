import Image from "next/image";
import Link from "next/link";
import AnimatedSection from "@/components/common/AnimatedSection/AnimatedSection";
import AnimatedElement from "@/components/common/AnimatedElement/AnimatedElement";
import styles from "./Footer.module.css";

const Footer = () => {
  const footerLinks = {
    product: [
      { name: "AI Grading", href: "/features/grading" },
      { name: "Content Generation", href: "/features/generation" },
      { name: "Grade Management", href: "/features/grades" },
      { name: "Attendance Tracking", href: "/features/attendance" },
      { name: "Analytics & Reports", href: "/features/analytics" },
      { name: "Student Management", href: "/features/students" }
    ],
    solutions: [
      { name: "K-12 Schools", href: "/solutions/k12" },
      { name: "Higher Education", href: "/solutions/higher-ed" },
      { name: "International Schools", href: "/solutions/international" },
      { name: "Private Tutoring", href: "/solutions/tutoring" },
      { name: "Online Learning", href: "/solutions/online" },
      { name: "Enterprise", href: "/solutions/enterprise" }
    ],
    resources: [
      { name: "Documentation", href: "/docs" },
      { name: "User Guides", href: "/help/guides" },
      { name: "API Reference", href: "/api-docs" },
      { name: "Video Tutorials", href: "/tutorials" },
      { name: "Webinars", href: "/webinars" },
      { name: "Best Practices", href: "/best-practices" }
    ],
    support: [
      { name: "Help Center", href: "/help" },
      { name: "Contact Support", href: "/support" },
      { name: "Community Forum", href: "/community" },
      { name: "Feature Requests", href: "/feedback" },
      { name: "System Status", href: "/status" },
      { name: "Training Services", href: "/training" }
    ],
    company: [
      { name: "About Us", href: "/about" },
      { name: "Careers", href: "/careers" },
      { name: "Press & Media", href: "/press" },
      { name: "Partners", href: "/partners" },
      { name: "Investors", href: "/investors" },
      { name: "Blog", href: "/blog" }
    ],
    legal: [
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
      { name: "Cookie Policy", href: "/cookies" },
      { name: "GDPR Compliance", href: "/gdpr" },
      { name: "FERPA Compliance", href: "/ferpa" },
      { name: "Security", href: "/security" }
    ]
  };

  const socialLinks = [
    {
      name: "LinkedIn",
      href: "#",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
          <rect x="2" y="9" width="4" height="12"/>
          <circle cx="4" cy="4" r="2"/>
        </svg>
      )
    },
    {
      name: "Twitter",
      href: "#",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/>
        </svg>
      )
    },
    {
      name: "YouTube",
      href: "#",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/>
          <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/>
        </svg>
      )
    },
    {
      name: "GitHub",
      href: "#",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
        </svg>
      )
    }
  ];

  const certifications = [
    {
      name: "SOC 2 Type II",
      description: "Security & Compliance"
    },
    {
      name: "FERPA Certified",
      description: "Education Privacy"
    },
    {
      name: "GDPR Compliant",
      description: "Data Protection"
    },
    {
      name: "ISO 27001",
      description: "Information Security"
    }
  ];

  return (
    <AnimatedSection className={styles.footer} animation="up">
      <div className="container">
        <div className={styles.footerContent}>
          <AnimatedElement animation="fade" delay={0.2}>
            <div className={styles.footerBrand}>
              <Link href="/" className={styles.brandLink}>
                <Image
                  src="/logo.png"
                  alt="Teacherly AI"
                  width={48}
                  height={48}
                  className={styles.brandLogo}
                />
                <span className={styles.brandName}>Teacherly AI</span>
              </Link>
              
              <p className={styles.brandDescription}>
                Empowering educators worldwide with intelligent AI technology for automated grading, 
                content generation, and comprehensive analytics. Transform your teaching experience today.
              </p>
              
              <div className={styles.socialLinks}>
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    className={styles.socialLink}
                    aria-label={social.name}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {social.icon}
                  </a>
                ))}
              </div>

              <div className={styles.certifications}>
                <h4 className={styles.certificationsTitle}>Security & Compliance</h4>
                <div className={styles.certificationsList}>
                  {certifications.map((cert) => (
                    <div key={cert.name} className={styles.certificationItem}>
                      <span className={styles.certName}>{cert.name}</span>
                      <span className={styles.certDescription}>{cert.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </AnimatedElement>

          <div className={styles.footerLinks}>
            <AnimatedElement animation="up" delay={0.3}>
              <div className={styles.linkColumn}>
                <h4 className={styles.linkTitle}>Product</h4>
                <ul className={styles.linkList}>
                  {footerLinks.product.map((link) => (
                    <li key={link.name}>
                      <Link href={link.href} className={styles.footerLink}>
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </AnimatedElement>

            <AnimatedElement animation="up" delay={0.4}>
              <div className={styles.linkColumn}>
                <h4 className={styles.linkTitle}>Solutions</h4>
                <ul className={styles.linkList}>
                  {footerLinks.solutions.map((link) => (
                    <li key={link.name}>
                      <Link href={link.href} className={styles.footerLink}>
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </AnimatedElement>

            <AnimatedElement animation="up" delay={0.5}>
              <div className={styles.linkColumn}>
                <h4 className={styles.linkTitle}>Resources</h4>
                <ul className={styles.linkList}>
                  {footerLinks.resources.map((link) => (
                    <li key={link.name}>
                      <Link href={link.href} className={styles.footerLink}>
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </AnimatedElement>

            <AnimatedElement animation="up" delay={0.6}>
              <div className={styles.linkColumn}>
                <h4 className={styles.linkTitle}>Support</h4>
                <ul className={styles.linkList}>
                  {footerLinks.support.map((link) => (
                    <li key={link.name}>
                      <Link href={link.href} className={styles.footerLink}>
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </AnimatedElement>

            <AnimatedElement animation="up" delay={0.7}>
              <div className={styles.linkColumn}>
                <h4 className={styles.linkTitle}>Company</h4>
                <ul className={styles.linkList}>
                  {footerLinks.company.map((link) => (
                    <li key={link.name}>
                      <Link href={link.href} className={styles.footerLink}>
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </AnimatedElement>

            <AnimatedElement animation="up" delay={0.8}>
              <div className={styles.linkColumn}>
                <h4 className={styles.linkTitle}>Legal</h4>
                <ul className={styles.linkList}>
                  {footerLinks.legal.map((link) => (
                    <li key={link.name}>
                      <Link href={link.href} className={styles.footerLink}>
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </AnimatedElement>
          </div>
        </div>

        <AnimatedElement animation="fade" delay={0.9}>
          <div className={styles.footerBottom}>
            <div className={styles.footerCopyright}>
              <p>&copy; {new Date().getFullYear()} Teacherly AI. All rights reserved.</p>
              <p className={styles.locationInfo}>
                Made with ❤️ for educators worldwide | Headquartered in Addis Ababa, Ethiopia
              </p>
            </div>
            
            <div className={styles.footerBottomLinks}>
              <Link href="/sitemap" className={styles.footerBottomLink}>
                Sitemap
              </Link>
              <Link href="/accessibility" className={styles.footerBottomLink}>
                Accessibility
              </Link>
              <Link href="/security" className={styles.footerBottomLink}>
                Security
              </Link>
              <Link href="/status" className={styles.footerBottomLink}>
                Status
              </Link>
            </div>
          </div>
        </AnimatedElement>
      </div>
    </AnimatedSection>
  );
};

export default Footer;