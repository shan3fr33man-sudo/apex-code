import { Button } from '@/components/ui/button';
import { Plus, FolderOpen, BarChart3 } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Welcome to APEX-CODE</h1>
        <p className="text-gray-400">
          Your AI-powered coding platform. Start a conversation or create a project to begin.
        </p>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* New Chat Card */}
        <Link href="/chat">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-blue-600 transition-colors cursor-pointer h-full">
            <div className="flex items-center justify-between mb-4">
              <Plus className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">New Chat</h3>
            <p className="text-gray-400 text-sm">
              Start a conversation with an AI assistant to help with your coding tasks.
            </p>
          </div>
        </Link>

        {/* Browse Projects Card */}
        <Link href="/projects">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-blue-600 transition-colors cursor-pointer h-full">
            <div className="flex items-center justify-between mb-4">
              <FolderOpen className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Browse Projects</h3>
            <p className="text-gray-400 text-sm">
              Organize and manage your coding projects in one place.
            </p>
          </div>
        </Link>

        {/* View Usage Card */}
        <Link href="/settings/usage">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-blue-600 transition-colors cursor-pointer h-full">
            <div className="flex items-center justify-between mb-4">
              <BarChart3 className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">View Usage</h3>
            <p className="text-gray-400 text-sm">
              Check your token usage and plan details.
            </p>
          </div>
        </Link>
      </div>

      {/* Getting Started Section */}
      <div className="mt-12 bg-gray-900 border border-gray-800 rounded-lg p-8">
        <h2 className="text-xl font-semibold text-white mb-4">Getting Started</h2>
        <ul className="space-y-3 text-gray-400">
          <li className="flex gap-3">
            <span className="text-blue-600 font-semibold flex-shrink-0">1.</span>
            <span>Start a new chat to begin your first conversation</span>
          </li>
          <li className="flex gap-3">
            <span className="text-blue-600 font-semibold flex-shrink-0">2.</span>
            <span>Create projects to organize your coding work</span>
          </li>
          <li className="flex gap-3">
            <span className="text-blue-600 font-semibold flex-shrink-0">3.</span>
            <span>Monitor your token usage in the settings</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
