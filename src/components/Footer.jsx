import React from 'react';
import RippleLogo from './RippleLogo';

const Footer = () => {
  return (
    <footer className="card-dark border-t border-border mt-auto py-8 px-4">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          
          {/* Left: Logo + Name */}
          <div className="flex items-center gap-3">
            <RippleLogo size={32} />
            <span className="logo-text text-lg tracking-tight">Ripple Media</span>
          </div>

          {/* Center: Tagline */}
          <div className="text-muted-foreground font-medium italic">
            Connect · Share · Ripple
          </div>

          {/* Right: Author */}
          <div className="text-sm text-muted-foreground">
            Created by <span className="text-primary font-bold">Muhammad Ahmad</span>
          </div>
        </div>

        {/* Bottom Center */}
        <div className="mt-8 pt-6 border-t border-border/50 text-center space-y-3">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground font-medium">
              Built with by <span className="text-primary">Muhammad Ahmad</span> — 20-year-old Web Developer
            </p>
            <p className="text-xs text-muted-foreground/80">
              📞 +92 315 4603790
            </p>
          </div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60 pt-2">
            © 2026 Ripple Media. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
