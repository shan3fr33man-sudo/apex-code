export interface ExecutionResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  runtimeMs: number;
  language: string;
  version: string;
}

const PISTON_URL = process.env.PISTON_API_URL || 'https://emkc.org/api/v2/piston';

export async function executeCode(
  language: string,
  code: string,
  stdin?: string
): Promise<ExecutionResult> {
  const response = await fetch(`${PISTON_URL}/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      language,
      version: '*',
      files: [{ name: 'main', content: code }],
      stdin: stdin ?? '',
      compile_timeout: 10000,
      run_timeout: 5000,
      run_memory_limit: 128,
    }),
  });

  if (!response.ok) {
    throw new Error(`Piston error: ${response.status}`);
  }

  const data = await response.json();
  return {
    stdout: data.run?.stdout || '',
    stderr: data.run?.stderr || data.compile?.stderr || '',
    exitCode: data.run?.code ?? 1,
    runtimeMs: data.run?.wall_time || 0,
    language: data.language || language,
    version: data.version || 'unknown',
  };
}