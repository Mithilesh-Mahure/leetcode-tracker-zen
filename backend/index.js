import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from backend!' });
});

// In-memory problems store
let problems = [];

// Get all problems
app.get('/api/problems', (req, res) => {
  res.json(problems);
});

// Add a new problem
app.post('/api/problems', (req, res) => {
  const problem = { ...req.body, id: Date.now().toString() };
  problems.push(problem);
  res.status(201).json(problem);
});

// Update a problem
app.put('/api/problems/:id', (req, res) => {
  const { id } = req.params;
  const idx = problems.findIndex(p => p.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  problems[idx] = { ...problems[idx], ...req.body };
  res.json(problems[idx]);
});

// Delete a problem
app.delete('/api/problems/:id', (req, res) => {
  const { id } = req.params;
  const idx = problems.findIndex(p => p.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  problems.splice(idx, 1);
  res.status(204).end();
});

// Add a solution to a problem
app.post('/api/problems/:id/solutions', (req, res) => {
  const { id } = req.params;
  const problem = problems.find(p => p.id === id);
  if (!problem) return res.status(404).json({ error: 'Problem not found' });

  const solution = { ...req.body, id: Date.now().toString(), createdAt: new Date() };
  if (!problem.solutions) problem.solutions = [];
  problem.solutions.push(solution);
  problem.solved = true;
  problem.attempts = (problem.attempts || 0) + 1;
  problem.lastSolvedAt = new Date();

  res.status(201).json(solution);
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
}); 