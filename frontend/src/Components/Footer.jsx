const Footer = () => {
    const currentYear = new Date().getFullYear();

    const quickAccess = [
        { label: 'Features', href: '/features' },
        { label: 'Pricing', href: '/pricing' },
        { label: 'Articles', href: '/articles' },
        { label: 'About', href: '/about' },
        { label: 'Contact Us', href: '/contact' }
    ];

    const externalLinks = [
        { label: 'Privacy Policy', href: '/privacy' },
        { label: 'Terms of Service', href: '/terms' },
        { label: 'Cookie Policy', href: '/cookies' },
        { label: 'Security', href: '/security' }
    ];

    

    return (
        <footer className="bg-gray-200 dark:bg-gray-800">
            <div className="container px-4 mx-auto">
                <div className="pt-24 pb-11 mx-auto max-w-4xl lg:items-start lg:justify-start md:items-start md:justify-start flex items-center justify-center flex-col">
                    <a
                        className="block md:mx-auto mb-5 max-w-max text-center"
                        href="#"
                    >
                        <div className="font-spacegroteskbold lg:text-5xl md:text-4xl text-3xl text-left dark:text-white">
                            NeuroAi
                        </div>
                    </a>
                    <div className="flex flex-wrap text-center justify-center w-full">
                        <div className="w-full md:w-auto p-3 md:px-6">
                            <a
                                className="inline-block text-lg text-gray-500 hover:text-gray-600 dark:text-gray-300 dark:hover:text-white font-spacegroteskmedium"
                                href="/terms"
                            >
                                Terms
                            </a>
                        </div>
                        <div className="w-full md:w-auto p-3 md:px-6">
                            <a
                                className="inline-block text-lg text-gray-500 hover:text-gray-600 dark:text-gray-300 dark:hover:text-white font-spacegroteskmedium"
                                href="/privacy"
                            >
                                Privacy
                            </a>
                        </div>
                        <div className="w-full md:w-auto p-3 md:px-6">
                            <a
                                className="inline-block text-lg text-gray-500 hover:text-gray-600 dark:text-gray-300 dark:hover:text-white font-spacegroteskmedium"
                                href=""
                            >
                                Contact Us
                            </a>
                        </div>
                        <div className="w-full md:w-auto p-3 md:px-6">
                            <a
                                className="inline-block text-lg text-gray-500 hover:text-gray-600 dark:text-gray-300 dark:hover:text-white font-spacegroteskmedium"
                                href="/careers"
                            >
                                Careers
                            </a>
                        </div>
                        <div className="w-full md:w-auto p-3 md:px-6">
                            <a
                                className="inline-block text-lg text-gray-500 hover:text-gray-600 dark:text-gray-300 dark:hover:text-white font-spacegroteskmedium"
                                href="/pricing"
                            >
                                Pricing
                            </a>
                        </div>
                        <p className="text-gray-300 leading-relaxed">
                            Helping every child find their voice through safe, intelligent speech learning. A secure, accessible digital platform empowering children with AI-driven speech therapy while maintaining the highest standards of security and privacy.
                        </p>
                    </div>

                    {/* Quick Access */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4 text-white">Quick Access</h3>
                        <ul className="space-y-3">
                            {quickAccess.map((link) => (
                                <li key={link.label}>
                                    <a href={link.href} className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center group">
                                        <svg className="h-3 w-3 mr-2 opacity-50 group-hover:opacity-100 transition-opacity" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                        </svg>
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* External Links */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4 text-white">Resources</h3>
                        <ul className="space-y-3">
                            {externalLinks.map((link) => (
                                <li key={link.label}>
                                    <a href={link.href} className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center group">
                                        <svg className="h-3 w-3 mr-2 opacity-50 group-hover:opacity-100 transition-opacity" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                        </svg>
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
            <div className="border-b border-gray-100 dark:border-gray-700" />
            <div className="container px-4 mx-auto">
                <p className="py-10 md:pb-20 text-md text-gray-400 dark:text-gray-500 font-spacegroteskmedium text-center">
                    Copyright NeuroAi 2025
                </p>
            </div>
        </footer>
    );
};

export default Footer;