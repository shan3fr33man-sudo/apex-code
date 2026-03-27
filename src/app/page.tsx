import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Zap,
  Code2,
  Cpu,
  AlertCircle,
  Users,
  Brain,
  Check,
  X,
} from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-gray-950/80 backdrop-blur-md border-b border-gray-900 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
            APEX-CODE
          </div>
          <div className="flex gap-4">
            <Button variant="ghost" asChild>
              <a href="#features">Features</a>
            </Button>
            <Button variant="ghost" asChild>
              <a href="#pricing">Pricing</a>
            </Button>
            <Button asChild>
              <a href="/signup">Get Started</a>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-6xl md:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 bg-clip-text text-transparent">
              APEX-CODE
            </span>
          </h1>
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-300 mb-6">
            The AI Coding Platform That Out-Thinks the Competition
          </h2>
          <p className="text-lg text-gray-400 mb-8 leading-relaxed max-w-2xl mx-auto">
            Powered by Kimi K2.5 — 76.8% on SWE-Bench. Full Monaco editor, 40+ language execution, and team collaboration. Everything ChatGPT and Gemini should have been.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button size="lg" asChild>
              <a href="/signup">Get Started Free</a>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="#demo">View Demo</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-gray-900/30">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">
            Powerful Features Built for Developers
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <Card className="bg-gray-900 border-gray-800 hover:border-purple-500/50 transition-all">
              <div className="p-6">
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Brain className="text-purple-500" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Kimi K2.5 Engine</h3>
                <p className="text-gray-400">
                  76.8% SWE-Bench score. Thinking mode for complex architecture, instant mode for fast code generation.
                </p>
              </div>
            </Card>

            {/* Feature 2 */}
            <Card className="bg-gray-900 border-gray-800 hover:border-blue-500/50 transition-all">
              <div className="p-6">
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Code2 className="text-blue-500" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Monaco Code Editor</h3>
                <p className="text-gray-400">
                  Full VS Code engine in your browser. Syntax highlighting, IntelliSense, and AI completions.
                </p>
              </div>
            </Card>

            {/* Feature 3 */}
            <Card className="bg-gray-900 border-gray-800 hover:border-cyan-500/50 transition-all">
              <div className="p-6">
                <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Cpu className="text-cyan-500" />
                </div>
                <h3 className="text-xl font-semibold mb-3">40+ Languages</h3>
                <p className="text-gray-400">
                  Execute Python, JavaScript, TypeScript, Go, Rust, Java, C++, and 30+ more languages instantly.
                </p>
              </div>
            </Card>

            {/* Feature 4 */}
            <Card className="bg-gray-900 border-gray-800 hover:border-orange-500/50 transition-all">
              <div className="p-6">
                <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mb-4">
                  <AlertCircle className="text-orange-500" />
                </div>
                <h3 className="text-xl font-semibold mb-3">AI Auto-Fix</h3>
                <p className="text-gray-400">
                  Code fails? AI automatically diagnoses and fixes errors with up to 3 retry attempts.
                </p>
              </div>
            </Card>

            {/* Feature 5 */}
            <Card className="bg-gray-900 border-gray-800 hover:border-green-500/50 transition-all">
              <div className="p-6">
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Users className="text-green-500" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Team Collaboration</h3>
                <p className="text-gray-400">
                  Real-time multi-user workspaces, shared conversations, and project management.
                </p>
              </div>
            </Card>

            {/* Feature 6 */}
            <Card className="bg-gray-900 border-gray-800 hover:border-pink-500/50 transition-all">
              <div className="p-6">
                <div className="w-12 h-12 bg-pink-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="text-pink-500" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Thinking Mode</h3>
                <p className="text-gray-400">
                  Watch the AI reason step-by-step through complex problems. Full reasoning traces visible.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">
            How We Compare
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="px-6 py-4 font-semibold text-gray-300">Feature</th>
                  <th className="px-6 py-4 font-semibold text-purple-400">APEX-CODE</th>
                  <th className="px-6 py-4 font-semibold text-gray-400">ChatGPT</th>
                  <th className="px-6 py-4 font-semibold text-gray-400">Gemini</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-900 hover:bg-gray-900/50">
                  <td className="px-6 py-4 font-medium">Code Model</td>
                  <td className="px-6 py-4">Kimi K2.5 (76.8% SWE)</td>
                  <td className="px-6 py-4 text-gray-400">GPT-4o</td>
                  <td className="px-6 py-4 text-gray-400">Gemini 2.0</td>
                </tr>
                <tr className="border-b border-gray-900 hover:bg-gray-900/50">
                  <td className="px-6 py-4 font-medium">Monaco Editor</td>
                  <td className="px-6 py-4 flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-500" />
                  </td>
                  <td className="px-6 py-4 flex items-center gap-2">
                    <X className="w-5 h-5 text-gray-500" />
                  </td>
                  <td className="px-6 py-4 flex items-center gap-2">
                    <X className="w-5 h-5 text-gray-500" />
                  </td>
                </tr>
                <tr className="border-b border-gray-900 hover:bg-gray-900/50">
                  <td className="px-6 py-4 font-medium">Code Execution</td>
                  <td className="px-6 py-4">40+ languages</td>
                  <td className="px-6 py-4 text-gray-400">Basic</td>
                  <td className="px-6 py-4 text-gray-400">Basic</td>
                </tr>
                <tr className="border-b border-gray-900 hover:bg-gray-900/50">
                  <td className="px-6 py-4 font-medium">Auto-Fix Errors</td>
                  <td className="px-6 py-4 flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-500" />
                  </td>
                  <td className="px-6 py-4 flex items-center gap-2">
                    <X className="w-5 h-5 text-gray-500" />
                  </td>
                  <td className="px-6 py-4 flex items-center gap-2">
                    <X className="w-5 h-5 text-gray-500" />
                  </td>
                </tr>
                <tr className="border-b border-gray-900 hover:bg-gray-900/50">
                  <td className="px-6 py-4 font-medium">Team Collaboration</td>
                  <td className="px-6 py-4 flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-500" />
                  </td>
                  <td className="px-6 py-4 flex items-center gap-2">
                    <X className="w-5 h-5 text-gray-500" />
                  </td>
                  <td className="px-6 py-4 flex items-center gap-2">
                    <X className="w-5 h-5 text-gray-500" />
                  </td>
                </tr>
                <tr className="border-b border-gray-900 hover:bg-gray-900/50">
                  <td className="px-6 py-4 font-medium">Reasoning Visible</td>
                  <td className="px-6 py-4">Full traces</td>
                  <td className="px-6 py-4 text-gray-400">Partial</td>
                  <td className="px-6 py-4 text-gray-400">Partial</td>
                </tr>
                <tr className="hover:bg-gray-900/50">
                  <td className="px-6 py-4 font-medium">Price</td>
                  <td className="px-6 py-4">$20/mo</td>
                  <td className="px-6 py-4 text-gray-400">$20/mo</td>
                  <td className="px-6 py-4 text-gray-400">$20/mo</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-6 bg-gray-900/30">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">
            Simple, Transparent Pricing
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Free Plan */}
            <Card className="bg-gray-900 border-gray-800">
              <div className="p-8">
                <h3 className="text-2xl font-semibold mb-2">Free</h3>
                <div className="text-4xl font-bold mb-6">
                  $0<span className="text-lg text-gray-400">/mo</span>
                </div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="text-gray-300">100K tokens</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="text-gray-300">Instant mode</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="text-gray-300">1 user</span>
                  </li>
                </ul>
                <Button variant="outline" className="w-full" asChild>
                  <a href="/signup">Get Started</a>
                </Button>
              </div>
            </Card>

            {/* Pro Plan */}
            <Card className="bg-gradient-to-b from-purple-500/10 to-blue-500/10 border-purple-500/50 relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </span>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-semibold mb-2">Pro</h3>
                <div className="text-4xl font-bold mb-6">
                  $20<span className="text-lg text-gray-400">/mo</span>
                </div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="text-gray-300">2M tokens</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="text-gray-300">All modes</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="text-gray-300">All features</span>
                  </li>
                </ul>
                <Button className="w-full" asChild>
                  <a href="/signup">Get Started</a>
                </Button>
              </div>
            </Card>

            {/* Team Plan */}
            <Card className="bg-gray-900 border-gray-800">
              <div className="p-8">
                <h3 className="text-2xl font-semibold mb-2">Team</h3>
                <div className="text-4xl font-bold mb-6">
                  $50<span className="text-lg text-gray-400">/seat/mo</span>
                </div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="text-gray-300">10M tokens</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="text-gray-300">Collaboration</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="text-gray-300">Priority support</span>
                  </li>
                </ul>
                <Button variant="outline" className="w-full" asChild>
                  <a href="/signup">Get Started</a>
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-900 py-12 px-6 bg-gray-950">
        <div className="max-w-7xl mx-auto text-center text-gray-500">
          <p>Built with Kimi K2.5 + Next.js + Supabase</p>
          <p className="text-sm mt-2">© 2026 APEX-CODE. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
