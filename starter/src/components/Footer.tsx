//https://www.geeksforgeeks.org/how-to-create-sticky-footer-in-reactjs/
// import { useState, } from 'react';

interface FooterlProps {
     text: string;
}
const Footer = ({text}: FooterlProps) => (
	<footer className="footer">
		<p>{text}</p>
	</footer>
);

export default Footer;
