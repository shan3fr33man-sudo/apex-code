import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function ProjectsPage() {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Your Projects</h1>
          <p className="text-gray-400 mt-1">Manage and organize your coding projects</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
          <Plus className="w-4 h-4" />
          Create Project
        </Button>
      </div>

      {/* Empty State */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-12 text-center">
        <div className="mb-4">
          <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-gray-600" />
          </div>
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">No projects yet</h2>
        <p className="text-gray-400 mb-6">
          Create your first project to organize your code and collaborate with others.
        </p>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
          <Plus className="w-4 h-4" />
          Create Your First Project
        </Button>
      </div>
    </div>
  );
}
