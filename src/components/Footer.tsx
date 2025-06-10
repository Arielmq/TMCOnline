
import React from 'react';
import '../styles/footer.css';
import MessageIcon from '@mui/icons-material/Message';
import XIcon from '@mui/icons-material/X';
import TelegramIcon from '@mui/icons-material/Telegram';
const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__logo">
          <img src="https://res.cloudinary.com/dd6eoxgul/image/upload/v1748027634/removed-removebg-preview_iosrkj.png" alt="Hashira AI Logo" className="footer__logo-img" />
        </div>
        
        <div className="footer__navigation">
          <div className="footer__column footer__column--social">
            <h3 className="footer__heading">Social</h3>
            <ul className="footer__list footer__list--social">
              <li>
                <a href="https://x.com/tmc__watch" target="_blank" rel="noopener noreferrer" className="footer__link footer__link--social" aria-label="X (formerly Twitter)">
                  <XIcon className="footer__social-icon" />
                </a>
              </li>
           
               <li>
                <a href="https://t.me/HashiraAI" target="_blank" rel="noopener noreferrer" className="footer__link footer__link--social" aria-label="Telegram">
                 <TelegramIcon className="footer__social-icon" />
                </a>
              </li>

                 <li>
                <a href="#contact"  className="footer__link footer__link--social" aria-label="Telegram">
                 <MessageIcon className="footer__social-icon" />
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="footer__copyright">
          <p>&copy; {new Date().getFullYear()} Hashira AI Token. All rights reserved.</p>
          <p>Hashira AI is the token connecting real mining to Web3.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
