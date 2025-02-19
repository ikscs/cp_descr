//https://www.geeksforgeeks.org/how-to-create-sticky-footer-in-reactjs/
// import { useState, } from 'react';

interface FooterlProps {
     text: string;
	 backgroundColor: string;
}
const Footer = ({text,backgroundColor}: FooterlProps) => (
	<footer 
		style={{backgroundColor: backgroundColor}} 
		className="footer"
	>
		<p>{text}</p>
	</footer>
);

export default Footer;
