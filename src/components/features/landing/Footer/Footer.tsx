import AnimatedSection from "@/components/common/AnimatedSection/AnimatedSection";
import styles from "./Footer.module.css";
import AnimatedElement from "@/components/common/AnimatedElement/AnimatedElement";

const Footer = () => {
  return (
    <AnimatedSection className={styles.footer} animation="up">
      <div className="container">
        <AnimatedElement animation="fade" delay={0.2}>
          <div className={styles.footerContent}>
            <div className={styles.footerColumn}>
              <div className={styles.footerLogo}>Teacherly</div>
              <p className={styles.footerAbout}>
                Empowering educators with AI-powered tools to create engaging, personalized learning experiences for students around the world.
              </p>
              <div className={styles.socialLinks}>
                <a href="#" className={styles.socialIcon}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                  </svg>
                </a>
                <a href="#" className={styles.socialIcon}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
                  </svg>
                </a>
                <a href="#" className={styles.socialIcon}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </a>
                <a href="#" className={styles.socialIcon}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                    <rect x="2" y="9" width="4" height="12"></rect>
                    <circle cx="4" cy="4" r="2"></circle>
                  </svg>
                </a>
              </div>
            </div>

            <div className={styles.footerColumn}>
              <h4>Company</h4>
              <div className={styles.footerLinks}>
                <a href="#" className={styles.footerLink}>About Us</a>
                <a href="#" className={styles.footerLink}>Our Team</a>
                <a href="#" className={styles.footerLink}>Careers</a>
                <a href="#" className={styles.footerLink}>Press</a>
                <a href="#" className={styles.footerLink}>Contact</a>
              </div>
            </div>

            <div className={styles.footerColumn}>
              <h4>Resources</h4>
              <div className={styles.footerLinks}>
                <a href="#" className={styles.footerLink}>Blog</a>
                <a href="#" className={styles.footerLink}>Documentation</a>
                <a href="#" className={styles.footerLink}>Help Center</a>
                <a href="#" className={styles.footerLink}>Community</a>
                <a href="#" className={styles.footerLink}>Webinars</a>
              </div>
            </div>

            <div className={styles.footerColumn}>
              <h4>Legal</h4>
              <div className={styles.footerLinks}>
                <a href="#" className={styles.footerLink}>Terms of Service</a>
                <a href="#" className={styles.footerLink}>Privacy Policy</a>
                <a href="#" className={styles.footerLink}>Cookie Policy</a>
                <a href="#" className={styles.footerLink}>GDPR</a>
                <a href="#" className={styles.footerLink}>Accessibility</a>
              </div>
            </div>
          </div>

          <div className={styles.footerBottom}>
            <div className={styles.footerCopyright}>
              © {new Date().getFullYear()} Teacherly. All rights reserved.
            </div>
            <div className={styles.footerBottomLinks}>
              <a href="#" className={styles.footerBottomLink}>Sitemap</a>
              <a href="#" className={styles.footerBottomLink}>Cookies</a>
              <a href="#" className={styles.footerBottomLink}>Security</a>
            </div>
          </div>
        </AnimatedElement>
      </div>
    </AnimatedSection>
  );
};

export default Footer;