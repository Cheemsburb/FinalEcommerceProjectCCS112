import React from 'react';
import style from './styles/Footer.module.css';
import { Link } from 'react-router-dom'; // 1. Import Link

// Imported Social Media Icons
import fb from "../assets/designs/footer/fb.png";
import ig from "../assets/designs/footer/ig.png";
import github from "../assets/designs/footer/github.png";
import twitter from "../assets/designs/footer/twitter.png";

// Imported Payment Icons
import visa from "../assets/designs/footer/visa.png";
import mastercard from "../assets/designs/footer/mastercard.png";
import paypal from "../assets/designs/footer/paypal.png";
import apple from "../assets/designs/footer/applepay.png";
import gpay from "../assets/designs/footer/gpay.png";

// Define the data structure for the navigation columns
const NAV_LINKS = [
    {
        title: "LINK",
        links: ["Home", "Categories", "Brands"]
    },
    {
        title: "ACCOUNT",
        links: ["Profile", "Cart", "Checkout"]
    },
    {
        title: "HELP",
        links: ["Delivery Details", "Terms & Conditions", "Privacy Policy"]
    }
];

// 2. Create a mapping for link text to route paths
const routeMap = {
    "Home": "/",
    "Categories": "/products",
    "Brands": "/products",
    "Profile": "/profile", // Assuming you have a /profile route
    "Cart": "/cart",
    "Checkout": "/cart" // Checkout is part of the cart page
    // Add other internal links if needed
};

function Footer() {
    const socialIcons = [
        { icon: fb, alt: "Facebook", link: "https://www.facebook.com/" },
        { icon: twitter, alt: "Twitter", link: "https://www.x.com" },
        { icon: ig, alt: "Instagram", link: "https://www.instagram.com" },
        { icon: github, alt: "GitHub", link: "https://www.github.com" },
    ];

    const paymentIcons = [
        { icon: visa, alt: "Visa" },
        { icon: mastercard, alt: "Mastercard" },
        { icon: paypal, alt: "PayPal" },
        { icon: apple, alt: "Apple Pay" },
        { icon: gpay, alt: "Google Pay" },
    ];

    return (
        <footer className={style.footer}>
            <div className={style.contentWrapper}>
                {/* Top Section */}
                <div className={style.footerGrid}>
                    {/* Column 1: About */}
                    <div className={style.aboutSection}>
                        <h2 className={style.logoText}>WTCH</h2>
                        <p className={style.tagline}>
                            We have an array of watch that suits your style and which you're proud to wear.
                        </p>
                        <div className={style.socialIcons}>
                            {socialIcons.map((item) => (
                                <a key={item.alt} href={item.link} target="_blank" rel="noopener noreferrer" className={style.socialLink}>
                                    <img src={item.icon} alt={item.alt} className={style.socialIcon} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Columns 2, 3, 4: Navigation Links */}
                    {NAV_LINKS.map((section) => (
                        <div key={section.title} className={style.linkSection}>
                            <h3 className={style.linkTitle}>{section.title}</h3>
                            <ul className={style.linkList}>
                                {section.links.map((linkText) => {
                                    // 3. Check if the link is in our routeMap
                                    const path = routeMap[linkText];
                                    return (
                                        <li key={linkText} className={style.linkItem}>
                                            {path ? (
                                                // If it's an internal route, use Link
                                                <Link to={path} className={style.link}>
                                                    {linkText}
                                                </Link>
                                            ) : (
                                                // Otherwise, use a standard <a> tag (for Help links)
                                                <a href={`#${linkText.toLowerCase().replace(/\s&?/g, '-')}`} className={style.link}>
                                                    {linkText}
                                                </a>
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom Section */}
                <div className={style.bottomBar}>
                    <p className={style.copyright}>wtch.co © 2025-2026, All Rights Reserved</p>
                    <div className={style.paymentIcons}>
                        {paymentIcons.map((item) => (
                            <img
                                key={item.alt}
                                src={item.icon}
                                alt={item.alt}
                                className={style.paymentIcon}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;