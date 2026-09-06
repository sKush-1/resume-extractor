import Link from 'next/link';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-muted border-t border-border">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                BP
              </div>
              <span className="font-semibold text-foreground">BulkParser.com</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Parse resumes with AI-powered intelligence.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold text-foreground mb-4 text-sm">Product</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/#features" className="text-muted-foreground hover:text-foreground transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/#pricing" className="text-muted-foreground hover:text-foreground transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                  About
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-foreground mb-4 text-sm">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                  Terms
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between">
          <p className="text-sm text-muted-foreground">
            © {currentYear} BulkParser.com. All rights reserved.
          </p>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <Link
              href="https://www.reddit.com/r/bulkparser"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Follow on Reddit"
            >
              <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor">
                <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.057 1.597.05.203.075.414.075.63 0 2.361-2.733 4.282-5.94 4.282-3.207 0-5.941-1.921-5.941-4.282 0-.216.025-.427.076-.63a1.76 1.76 0 0 1-1.058-1.597c0-.968.786-1.754 1.754-1.754.478 0 .9.182 1.208.491 1.194-.856 2.85-1.419 4.674-1.488l.82-3.818c.03-.13.117-.243.243-.243zm-6.6 7.135c-.907 0-1.642.735-1.642 1.641 0 .907.735 1.642 1.642 1.642.907 0 1.642-.735 1.642-1.642 0-.906-.735-1.641-1.642-1.641zm6.6 0c-.906 0-1.641.735-1.641 1.641 0 .907.735 1.642 1.641 1.642s1.642-.735 1.642-1.642c0-.906-.736-1.641-1.642-1.641zm-3.39 2.546c-.452 0-.818.109-1.127.327-.145.105-.23.23-.284.34a.17.17 0 0 0 .041.17c.041.041.096.064.155.064.037 0 .073-.01.104-.027.037-.018.127-.064.284-.136.257-.105.514-.241.827-.241.314 0 .57.136.827.241.157.072.247.118.284.136a.17.17 0 0 0 .104.027c.059 0 .114-.023.155-.064.041-.041.055-.09.041-.17-.054-.11-.139-.235-.284-.34-.309-.218-.675-.327-1.127-.327z" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
