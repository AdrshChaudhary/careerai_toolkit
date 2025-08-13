import Link from 'next/link';
import { Linkedin, Github, Instagram, Twitter as XIcon, PenSquare, Globe } from 'lucide-react';

const socialLinks = [
    { name: 'LinkedIn', href: 'https://www.linkedin.com/in/aadarshchaudhary/', icon: Linkedin },
    { name: 'Instagram', href: 'https://www.instagram.com/aadar.ssshhh/', icon: Instagram },
    { name: 'Twitter', href: 'https://x.com/ImAadrsh', icon: XIcon },
    { name: 'GitHub', href: 'https://github.com/AdrshChaudhary', icon: Github },
    { name: 'Medium', href: 'https://medium.com/@im.aadrsh', icon: PenSquare },
    { name: 'Portfolio', href: 'https://aadrsh.netlify.app/', icon: Globe },
]

export function Footer() {
    return (
        <footer className="py-6 md:px-8 md:py-4">
            <div className="container flex flex-col items-center justify-center gap-4">
                <p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
                    Made by Aadarsh Chaudhary
                </p>
                <div className="flex items-center gap-4">
                    {socialLinks.map((link) => (
                    <Link key={link.name} href={link.href} target="_blank" rel="noopener noreferrer" className="text-muted-foreground transition-colors hover:text-primary">
                        <link.icon className="h-5 w-5" />
                        <span className="sr-only">{link.name}</span>
                    </Link>
                    ))}
                </div>
            </div>
      </footer>
    )
}
