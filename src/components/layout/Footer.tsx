import React from "react";
import Link from "next/link";
import { Sparkles, Heart, ExternalLink } from "lucide-react";
import { GithubIcon, TwitterIcon, LinkedinIcon } from "@/components/brand/SocialIcons";

export function Footer() {
  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand info */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-pink-500 flex items-center justify-center text-white">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <span className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                TEXTRA
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Enterprise Natural Language Processing suite driven by Stanford CoreNLP neural pipelines and modern interactive linguistics visualization.
            </p>
            <div className="flex items-center gap-3 pt-1 text-zinc-400">
              <a href="https://github.com/stanfordnlp/CoreNLP" target="_blank" rel="noreferrer" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
                <GithubIcon className="w-4 h-4" />
              </a>
              <a href="https://twitter.com/stanfordnlp" target="_blank" rel="noreferrer" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
                <TwitterIcon className="w-4 h-4" />
              </a>
              <a href="https://www.linkedin.com" target="_blank" rel="noreferrer" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
                <LinkedinIcon className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Core Studio */}
          <div className="space-y-3">
            <h4 className="font-semibold text-zinc-900 dark:text-zinc-200">Core Studio</h4>
            <ul className="space-y-2">
              <li><Link href="/studio" className="hover:text-indigo-500 transition-colors">Studio Workspace</Link></li>
              <li><Link href="/studio" className="hover:text-indigo-500 transition-colors">Dependency Arc Visualizer</Link></li>
              <li><Link href="/studio" className="hover:text-indigo-500 transition-colors">Constituency Parse Tree</Link></li>
              <li><Link href="/studio" className="hover:text-indigo-500 transition-colors">Coreference Resolution</Link></li>
              <li><Link href="/studio" className="hover:text-indigo-500 transition-colors">Open IE Relations</Link></li>
            </ul>
          </div>

          {/* Platform */}
          <div className="space-y-3">
            <h4 className="font-semibold text-zinc-900 dark:text-zinc-200">Platform</h4>
            <ul className="space-y-2">
              <li><Link href="/dashboard" className="hover:text-indigo-500 transition-colors">Activity Dashboard</Link></li>
              <li><Link href="/profile" className="hover:text-indigo-500 transition-colors">User Profile</Link></li>
              <li><Link href="/auth/login" className="hover:text-indigo-500 transition-colors">Social Sign-In</Link></li>
              <li><Link href="/auth/signup" className="hover:text-indigo-500 transition-colors">Email OTP Verification</Link></li>
              <li><a href="http://localhost:9000" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-indigo-500 transition-colors">CoreNLP Server <ExternalLink className="w-3 h-3" /></a></li>
            </ul>
          </div>

          {/* Infrastructure */}
          <div className="space-y-3">
            <h4 className="font-semibold text-zinc-900 dark:text-zinc-200">Engine & Email</h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Email verification powered by <strong className="text-zinc-700 dark:text-zinc-300">Nodemailer</strong> & <strong className="text-zinc-700 dark:text-zinc-300">Brevo</strong>. Linguistic engine powered by <strong className="text-zinc-700 dark:text-zinc-300">Stanford CoreNLP 4.6.0</strong>.
            </p>
            <div className="p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 text-[11px] text-zinc-500">
              <span className="w-2 h-2 rounded-full inline-block bg-emerald-500 mr-1.5" />
              SMTP Relay: Brevo Ready
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-zinc-100 dark:border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-zinc-500">
          <div>
            &copy; 2026 Textra NLP Studio. Built with Stanford CoreNLP, Next.js & Brevo.
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:underline">Privacy</Link>
            <Link href="/" className="hover:underline">Terms</Link>
            <Link href="/" className="hover:underline">Security</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
