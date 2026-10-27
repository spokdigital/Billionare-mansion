(function(){
  var chosen = [];
  var names = {};
  document.querySelectorAll('.chip').forEach(function(b){ names[b.dataset.svc] = b.dataset.name; });
  function sync(){
    document.querySelectorAll('.chip').forEach(function(b){ b.setAttribute('aria-pressed', chosen.indexOf(b.dataset.svc) > -1 ? 'true' : 'false'); });
    if (chosen.length) showErr('service', false);
  }
  function toggle(id){ var i = chosen.indexOf(id); if (i > -1) chosen.splice(i,1); else chosen.push(id); sync(); }
  function showErr(k, on){ var el = document.querySelector('[data-err="'+k+'"]'); if (el) el.hidden = !on; }
  document.querySelectorAll('.chip').forEach(function(b){ b.addEventListener('click', function(){ toggle(b.dataset.svc); }); });
  document.querySelectorAll('[data-pick]').forEach(function(a){ a.addEventListener('click', function(){ if (chosen.indexOf(a.dataset.pick) < 0) toggle(a.dataset.pick); }); });
  ['name','phone','email'].forEach(function(k){ var el = document.getElementById('f-'+k); el.addEventListener('input', function(){ showErr(k,false); }); });
  document.getElementById('leadForm').addEventListener('submit', function(e){
    e.preventDefault();
    var name = document.getElementById('f-name').value.trim();
    var phone = document.getElementById('f-phone').value.trim();
    var email = document.getElementById('f-email').value.trim();
    var errs = { service: chosen.length === 0, name: name.length < 2, phone: phone.replace(/[^0-9]/g,'').length < 7, email: !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) };
    var bad = false; Object.keys(errs).forEach(function(k){ showErr(k, errs[k]); if (errs[k]) bad = true; });
    if (bad) return;
    var lead = { services: chosen.map(function(id){ return names[id]; }), name: name, phone: phone, email: email,
      location: document.getElementById('f-city').value, budget: document.getElementById('f-budget').value, submittedAt: new Date().toISOString() };
    // TODO: send `lead` to your CRM / Google Sheet / webhook here, e.g.
    // fetch('https://YOUR-WEBHOOK-URL', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(lead) });
    document.getElementById('tFirst').textContent = name.split(' ')[0];
    document.getElementById('tList').textContent = lead.services.map(function(s){ return s.toLowerCase(); }).join(', ');
    document.getElementById('tPhone').textContent = phone;
    var budgetSel = document.getElementById('f-budget');
    var waText = [
      'Hi Billionaire Mansion, I\u2019d like a free design consultation.',
      '',
      '*Name:* ' + name,
      '*Phone:* ' + phone,
      '*Email:* ' + email,
      '*Services:* ' + lead.services.join(', '),
      '*Location:* ' + lead.location,
      '*Budget:* ' + budgetSel.options[budgetSel.selectedIndex].text
    ].join('\n');
    var waUrl = 'https://wa.me/971529127192?text=' + encodeURIComponent(waText);
    document.getElementById('waLead').href = waUrl;
    document.getElementById('formState').hidden = true;
    document.getElementById('thanksState').hidden = false;
    // Hand the full enquiry over to WhatsApp, ready to send
    window.open(waUrl, '_blank');
  });
  document.querySelectorAll('.faq-q').forEach(function(btn){
    btn.addEventListener('click', function(){
      var open = btn.getAttribute('aria-expanded') === 'true';
      document.querySelectorAll('.faq-q').forEach(function(o){
        o.setAttribute('aria-expanded','false'); o.lastElementChild.textContent = '+';
        o.parentNode.querySelector('.faq-a').hidden = true;
      });
      if (!open){ btn.setAttribute('aria-expanded','true'); btn.lastElementChild.textContent = '–'; btn.parentNode.querySelector('.faq-a').hidden = false; }
    });
  });
})();
