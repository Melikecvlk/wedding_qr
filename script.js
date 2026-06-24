const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycby3HG_ty68R0c6KsXpifQVd3cOxxLuOnu3Og74_TavBYWM8IzoYdYGgEcu2vEOG_QjN/exec";
const zone = document.getElementById('drop-zone');

zone.addEventListener('dragover', e => {
  e.preventDefault();
  zone.classList.add('drag-over');
});

zone.addEventListener('dragleave', () => {
  zone.classList.remove('drag-over');
});

zone.addEventListener('drop', e => {
  e.preventDefault();
  zone.classList.remove('drag-over');
  document.getElementById('file').files = e.dataTransfer.files;
  updatePreviews(e.dataTransfer.files);
});

document.getElementById('file').addEventListener('change', function () {
  updatePreviews(this.files);
});

function updatePreviews(files) {
  const strip = document.getElementById('preview-strip');
  strip.innerHTML = '';
  Array.from(files).forEach(f => {
    if (f.type.startsWith('image/')) {
      const img = document.createElement('img');
      img.className = 'preview-thumb';
      img.src = URL.createObjectURL(f);
      strip.appendChild(img);
    } else {
      const div = document.createElement('div');
      div.className = 'preview-file';
      div.textContent = f.type.startsWith('video/') ? '🎬' : '📄';
      strip.appendChild(div);
    }
  });
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function uploadFile() {
  const fileInput = document.getElementById('file');
  const files     = fileInput.files;

  if (!files || files.length === 0) {
    showResult('Lütfen önce bir dosya seçin 🌿', 'error');
    return;
  }

  const btn          = document.getElementById('btn-upload');
  const progressWrap = document.getElementById('progress-wrap');
  const progressBar  = document.getElementById('progress-bar');
  const note         = document.getElementById('note').value.trim();
  const name         = document.getElementById('name').value.trim();

  btn.disabled = true;
  btn.classList.add('loading');
  btn.textContent = 'Yükleniyor…';
  progressWrap.classList.add('visible');
  document.getElementById('result').innerHTML = '';

  let uploaded = 0;
  const total  = files.length;

  for (const file of files) {
    try {
      const base64 = await fileToBase64(file);

      const payload = {
        fileName: file.name,
        mimeType: file.type,
        file:     base64,
        name:     name,
        note:     note
      };

      const response = await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        body:   JSON.stringify(payload)
      });

      const result = await response.json();
      if (!result.success) throw new Error(result.error || 'Upload failed');

      uploaded++;
      progressBar.style.width = Math.round((uploaded / total) * 100) + '%';

    } catch (err) {
      showResult('Bir şeyler ters gitti, tekrar deneyin 🌿', 'error');
      resetBtn(btn, progressWrap);
      return;
    }
  }

  showResult('Teşekkürler, anılarınız için 🌸');
  resetBtn(btn, progressWrap);
  fileInput.value = '';
  document.getElementById('preview-strip').innerHTML = '';
  document.getElementById('name').value = '';
  document.getElementById('note').value = '';
}

function showResult(msg, type) {
  const el = document.getElementById('result');
  el.className = type === 'error' ? 'error' : '';
  el.textContent = msg;
}

function resetBtn(btn, progressWrap) {
  btn.disabled = false;
  btn.classList.remove('loading');
  btn.textContent = 'Albüme Ekle';
  setTimeout(() => {
    progressWrap.classList.remove('visible');
    document.getElementById('progress-bar').style.width = '0%';
  }, 800);
}
