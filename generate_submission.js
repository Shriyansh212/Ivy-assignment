const fs = require('fs');
const path = require('path');

const answers = JSON.parse(fs.readFileSync(path.join(__dirname, 'answers.json'), 'utf8'));
const findings = JSON.parse(fs.readFileSync(path.join(__dirname, 'findings.json'), 'utf8'));

const submission = {
  "api_key": process.env.IVY_API_KEY || "IVY26-436663951613",
  "candidate": {
    "name": "Shriyansh Gupta",
    "email": "shriyansh.20214042@mnnit.ac.in",
    "repo_url": "https://github.com/shriyanshgupta/ivy-homes-assessment",
    "demo_url": "https://ivy-homes-assessment.vercel.app"
  },
  "answers": answers,
  "findings": findings
};

fs.writeFileSync(path.join(__dirname, 'submission.json'), JSON.stringify(submission, null, 2));
console.log('Successfully generated submission.json at root directory!');
