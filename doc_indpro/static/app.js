async function uploadPdf() {
  const fileInput = document.getElementById('pdfFile');
  const out = document.getElementById('uploadOut');
  const apiKey = document.getElementById('apiKey').value.trim();
  if (!fileInput.files.length) { out.textContent = 'Choose a PDF first.'; return; }
  const fd = new FormData();
  fd.append('file', fileInput.files[0]); // single file
  const headers = {};
  if (apiKey) headers['X-API-Key'] = apiKey;
  out.textContent = 'Uploading...';
  try {
    const res = await fetch('/upload', { method: 'POST', body: fd, headers });
    const data = await res.json();
    out.textContent = JSON.stringify(data, null, 2);
  } catch (e) {
    out.textContent = 'Upload failed: ' + e;
  }
}

async function searchQuery() {
  const q = document.getElementById('query').value.trim();
  const k = parseInt(document.getElementById('topk').value, 10);
  const thr = parseFloat(document.getElementById('threshold').value);
  const apiKey = document.getElementById('apiKey').value.trim();
  const headers = { 'Content-Type': 'application/json' };
  if (apiKey) headers['X-API-Key'] = apiKey;

  const ans = document.getElementById('answer');
  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = '';
  ans.textContent = 'Searching...';

  try {
    const res = await fetch('/search', {
      method: 'POST',
      headers,
      body: JSON.stringify({ query: q, top_k: k, score_threshold: thr })
    });
    const data = await res.json();
    ans.textContent = data.answer || '(No synthesized answer; showing top chunks)';

    (data.results || []).forEach(r => {
      const div = document.createElement('div');
      div.className = 'result';
      const meta = document.createElement('div');
      meta.className = 'meta';
      meta.textContent = `${r.metadata.filename} #${r.metadata.chunk_id} • offset ${r.metadata.offset} • score `;
      const score = document.createElement('span');
      score.className = 'score';
      score.textContent = r.score.toFixed(3);
      meta.appendChild(score);
      const text = document.createElement('pre');
      text.textContent = r.text;
      div.appendChild(meta);
      div.appendChild(text);
      resultsDiv.appendChild(div);
    });
  } catch (e) {
    ans.textContent = 'Search failed: ' + e;
  }
}

window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('uploadBtn').addEventListener('click', uploadPdf);
  document.getElementById('searchBtn').addEventListener('click', searchQuery);
});
