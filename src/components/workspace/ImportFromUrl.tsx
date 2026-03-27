'use client';

import { useState, useCallback } from 'react';
import { Globe, GitBranch, Loader2, CheckCircle, AlertCircle, X } from 'lucide-react';

interface ImportFromUrlProps {
  projectId: string;
  onImportComplete?: (files: Array<{ path: string; size: number }>) => void;
}

{Ft rest of file truncated}