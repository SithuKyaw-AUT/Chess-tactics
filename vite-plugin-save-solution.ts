/**
 * Dev-server plugin: lets the app write solutions permanently into the JSON files.
 *
 * POST /api/save-solution  { puzzleId, moves, hints?, explanation? }
 *
 *  - Puzzles that come from a workbook JSON (Endgames, Step 5, ...) get their
 *    `solution_san` written into that same file.
 *  - Built-in Step 4 puzzles (p3_d1, ...) have no JSON of their own, so they go
 *    into Step4_Solutions.json.
 *
 * Only works while `npm run dev` is running (a static/PWA build has no server).
 */
import fs from 'node:fs';
import path from 'node:path';
import type { Plugin } from 'vite';
import { getSeriesInfo } from './src/utils/seriesInfo';

const WORKBOOK_FILES = [
  'step3extra_1_18.json',
  'Step1Workbook.json',
  'Step_5_Workbook.json',
  'Endgames.json',
  'Opening_for_Black.json'
];
const STEP4_FILE = 'Step4_Solutions.json';

const writeJson = (file: string, data: unknown) => {
  // Write to a temp file first so a crash can never leave a half-written JSON file.
  const tmp = `${file}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf-8');
  fs.renameSync(tmp, file);
};

export function saveSolutionPlugin(): Plugin {
  const root = process.cwd();

  return {
    name: 'save-solution-to-json',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/api/save-solution', (req, res) => {
        const reply = (status: number, body: object) => {
          res.statusCode = status;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(body));
        };
        if (req.method !== 'POST') return reply(405, { ok: false, error: 'POST only' });

        let raw = '';
        req.on('data', (chunk) => (raw += chunk));
        req.on('end', () => {
          try {
            const { puzzleId, moves, hints, explanation } = JSON.parse(raw);
            if (
              typeof puzzleId !== 'string' ||
              !/^[A-Za-z0-9_]+$/.test(puzzleId) ||
              !Array.isArray(moves) ||
              moves.length === 0 ||
              !moves.every((m: unknown) => typeof m === 'string')
            ) {
              return reply(400, { ok: false, error: 'Invalid payload' });
            }

            // 1) Workbook JSON puzzle?
            for (const name of WORKBOOK_FILES) {
              const file = path.join(root, name);
              if (!fs.existsSync(file)) continue;
              const data = JSON.parse(fs.readFileSync(file, 'utf-8'));
              const { stepSlug } = getSeriesInfo(String(data.series));
              const match = /^(.*)_d(\d+)$/.exec(puzzleId);
              if (!match || match[1] !== stepSlug) continue;
              const diagram = data.diagrams.find(
                (d: { diagram_number: number }) => d.diagram_number === Number(match[2])
              );
              if (!diagram) continue;

              diagram.solution_san = moves;
              if (!diagram.hint && Array.isArray(hints) && hints[0]) diagram.hint = hints[0];
              if (!diagram.explanation && explanation) diagram.explanation = explanation;
              writeJson(file, data);
              return reply(200, { ok: true, file: name });
            }

            // 2) Built-in Step 4 puzzle -> Step4_Solutions.json
            const file = path.join(root, STEP4_FILE);
            const data = fs.existsSync(file)
              ? JSON.parse(fs.readFileSync(file, 'utf-8'))
              : { solutions: {} };
            data.solutions = data.solutions || {};
            data.solutions[puzzleId] = {
              puzzleId,
              moves,
              hints: Array.isArray(hints) ? hints : [],
              explanation: typeof explanation === 'string' ? explanation : '',
              updatedAt: new Date().toISOString(),
              verified: false
            };
            writeJson(file, data);
            return reply(200, { ok: true, file: STEP4_FILE });
          } catch (e) {
            return reply(500, { ok: false, error: (e as Error).message });
          }
        });
      });
    }
  };
}
