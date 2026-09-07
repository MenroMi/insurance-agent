import { spawn } from 'node:child_process';
import path from 'node:path';
import { describe, expect, it, onTestFinished } from 'vitest';

/*
 * `npm start` is a foreground server, so its only channel to the person who
 * ran it is what it prints. The first version printed nothing at all and was
 * reasonably mistaken for a hang: no address, no confirmation, no complaint
 * when there was nothing to serve.
 *
 * These tests run the real script as a real process, because what is being
 * checked IS the process behaviour: what it writes and how it exits.
 */

const script = path.resolve(import.meta.dirname, '../../scripts/serveStatic.mjs');

const run = (env: Record<string, string>) => {
  const child = spawn(process.execPath, [script], {
    env: { ...process.env, ...env },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  // A test that leaves a listener behind makes the NEXT run fail on
  // EADDRINUSE, which is how this suite first failed against itself.
  onTestFinished(() => child.kill('SIGKILL'));
  return child;
};

/*
 * Watching and killing are kept apart on purpose. The first version of this
 * helper killed the process as soon as its pattern matched, which quietly
 * freed the port the busy-port test below depends on: the test then timed out
 * blaming the script instead of itself. Cleanup belongs to onTestFinished.
 */
const watch = (child: ReturnType<typeof run>) => {
  const seen = { text: '' };
  const append = (chunk: Buffer) => {
    seen.text += chunk.toString();
  };
  child.stdout.on('data', append);
  child.stderr.on('data', append);
  return seen;
};

const printed = (child: ReturnType<typeof run>, pattern: RegExp) => {
  const seen = watch(child);
  return new Promise<string>((resolve, reject) => {
    const check = () => {
      if (pattern.test(seen.text)) resolve(seen.text);
    };
    child.stdout.on('data', check);
    child.stderr.on('data', check);
    child.on('exit', () =>
      pattern.test(seen.text)
        ? resolve(seen.text)
        : reject(new Error(`exited without matching ${pattern}:\n${seen.text}`))
    );
  });
};

const exited = (child: ReturnType<typeof run>) => {
  const seen = watch(child);
  return new Promise<{ output: string; code: number | null }>((resolve) => {
    child.on('exit', (code) => resolve({ output: seen.text, code }));
  });
};

describe('scripts/serveStatic.mjs', () => {
  it('announces the address it is serving on', async () => {
    const child = run({ PORT: '3987' });
    expect(await printed(child, /http:\/\//)).toContain('http://127.0.0.1:3987');
  });

  it('reports a busy port instead of dumping an unhandled error event', async () => {
    // Leaving a server running is the ordinary way to hit this, and Node's
    // default is a raw EADDRINUSE stack trace with no advice in it.
    const first = run({ PORT: '3988' });
    await printed(first, /http:\/\//);

    const { output, code } = await exited(run({ PORT: '3988' }));
    expect(code).toBe(1);
    expect(output).toContain('3988');
    expect(output).not.toContain('Unhandled');
  });

  it('refuses to start when the export is missing, and says what to run', async () => {
    const child = run({
      STATIC_ROOT: path.resolve(import.meta.dirname, 'no-such-export'),
    });
    const { output, code } = await exited(child);
    expect(code).toBe(1);
    expect(output).toContain('npm run build');
  });
});
