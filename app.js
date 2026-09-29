/* AI作业批阅-管PC-20260923 复刻基线交互 */
(function () {
  'use strict';

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  /* ---------- 通用开关 ---------- */
  $$('.switch').forEach(function (sw) {
    sw.addEventListener('click', function () {
      sw.classList.toggle('on');
      sw.setAttribute('aria-checked', sw.classList.contains('on') ? 'true' : 'false');
      var targetId = sw.getAttribute('data-enable-target');
      if (targetId) {
        var input = document.getElementById(targetId);
        if (input) input.disabled = !sw.classList.contains('on');
      }
    });
  });

  /* ---------- 重新提交次数 ---------- */
  var retrySwitch = $('#publishRuleSwitch');
  var retryInput = $('#resubmitInput');
  var retryError = $('#resubmitError');
  function validateRetry(showError) {
    var message = '';
    if (!retryInput.disabled) {
      if (!retryInput.value.trim()) message = '请输入限制次数';
      else if (!/^[1-9][0-9]?$/.test(retryInput.value.trim())) message = '请输入1–99的整数';
    }
    retrySwitch.dataset.enabled = String(!retryInput.disabled && !message);
    retrySwitch.dataset.state = retryInput.disabled ? 'off' : (message ? 'pending' : 'enabled');
    retryInput.setCustomValidity(message);
    retryInput.setAttribute('aria-invalid', showError && message ? 'true' : 'false');
    retryError.textContent = showError ? message : '';
    retryError.classList.toggle('hidden', !showError || !message);
    return !message;
  }
  function syncRetry() {
    retryInput.required = !retryInput.disabled;
    retryInput.setAttribute('aria-required', String(retryInput.required));
    validateRetry(false);
  }
  retrySwitch.addEventListener('click', function () {
    syncRetry();
    if (!retryInput.disabled) retryInput.focus();
  });
  retrySwitch.addEventListener('keydown', function (event) {
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      retrySwitch.click();
    }
  });
  retryInput.addEventListener('input', function () { validateRetry(true); });
  retryInput.addEventListener('blur', function () { validateRetry(true); });
  $$('.form-actions .primary').forEach(function (button) {
    button.addEventListener('click', function (event) {
      if (!validateRetry(true)) {
        event.preventDefault();
        event.stopImmediatePropagation();
        retryInput.focus();
      }
    });
  });
  syncRetry();

  /* ---------- 审批设置开关：状态一 / 状态二 ---------- */
  var approvalSwitch = $('#approvalSwitch');
  var approvalExtras = $('#approvalExtras');
  if (approvalSwitch && approvalExtras) {
    approvalSwitch.addEventListener('click', function () {
      approvalExtras.classList.toggle('hidden', !approvalSwitch.classList.contains('on'));
    });
  }

  /* ---------- 作业名称字数 ---------- */
  var nameInput = $('#taskNameInput');
  var nameCount = $('#nameCount');
  if (nameInput && nameCount) {
    var syncName = function () { nameCount.textContent = nameInput.value.length; };
    nameInput.addEventListener('input', syncName);
    syncName();
  }

  /* ---------- 提交内容类型全选 ---------- */
  var checkAll = $('#checkAll');
  var typeChecks = $$('#contentTypeChecks input[type="checkbox"]');
  if (checkAll && typeChecks.length) {
    checkAll.addEventListener('change', function () {
      typeChecks.forEach(function (cb) { cb.checked = checkAll.checked; });
    });
    typeChecks.forEach(function (cb) {
      cb.addEventListener('change', function () {
        checkAll.checked = typeChecks.every(function (c) { return c.checked; });
      });
    });
  }

  /* ---------- 作业类型卡片选中态 ---------- */
  $$('input[name="taskType"]').forEach(function (radio) {
    radio.addEventListener('change', function () {
      $$('.type-card').forEach(function (card) { card.classList.remove('selected'); });
      var card = radio.closest('.type-card');
      if (card) card.classList.add('selected');
    });
  });

  /* ---------- 选中态文案（评分方式 / 审批模式） ---------- */
  $$('.radio-stack').forEach(function (stack) {
    $$('.radio-line', stack).forEach(function (line) {
      var radio = $('input[type="radio"]', line);
      if (!radio) return;
      var sync = function () {
        line.classList.toggle('selected-text', radio.checked);
      };
      radio.addEventListener('change', function () {
        $$('.radio-line', stack).forEach(function (l) { l.classList.remove('selected-text'); });
        sync();
      });
      sync();
    });
  });

  /* ---------- 打开 / 关闭配置审批人 ---------- */
  var openBtn = $('#openApproverBtn');
  var overlay = $('#approverOverlay');
  var closeBtn = $('#closeApproverBtn');
  if (openBtn && overlay) {
    openBtn.addEventListener('click', function () {
      overlay.classList.remove('hidden');
      overlay.scrollTop = 0;
    });
  }
  if (closeBtn && overlay) {
    closeBtn.addEventListener('click', function () {
      overlay.classList.add('hidden');
    });
  }

  /* ---------- AI智能审批：展开 AI批阅规则 ---------- */
  var aiRadio = $('#aiApproverRadio');
  var aiRules = $('#aiRules');
  if (aiRadio && aiRules) {
    $$('input[name="approverType"]').forEach(function (radio) {
      radio.addEventListener('change', function () {
        aiRules.classList.toggle('hidden', !aiRadio.checked);
      });
    });
  }

  /* ---------- 批阅人设定字数与重置 ---------- */
  var personaInput = $('#personaInput');
  var personaCount = $('#personaCount');
  var resetLink = $('#resetPersonaLink');
  var personaDefault = personaInput ? personaInput.value : '';
  var syncPersona = function () {
    if (personaCount && personaInput) personaCount.textContent = personaInput.value.length;
  };
  if (personaInput) {
    personaInput.addEventListener('input', syncPersona);
    syncPersona();
  }
  if (resetLink) {
    resetLink.addEventListener('click', function () {
      personaInput.value = personaDefault;
      syncPersona();
    });
  }

  /* ---------- 链接占位（不做臆断跳转） ---------- */
  $$('a.link[href="javascript:;"]').forEach(function (a) {
    a.addEventListener('click', function (e) { e.preventDefault(); });
  });
})();

/* 多主题配置：本页状态与文件选择，不上传文件 */
(function () {
  'use strict';
  var sw = document.getElementById('multiTopicSwitch');
  var list = document.getElementById('topicList');
  var add = document.getElementById('addTopicBtn');
  var status = document.getElementById('topicSaveMessage');
  var sequence = 0;
  var toastTimer;
  var toast = document.createElement('div'); toast.className='feedback-toast hidden'; toast.setAttribute('role','status'); toast.setAttribute('aria-live','polite'); document.body.append(toast);
  function notify(message){clearTimeout(toastTimer);toast.textContent=message;toast.classList.remove('hidden');toastTimer=setTimeout(function(){toast.classList.add('hidden');},3600);}

  function clearStatus() { status.classList.add('hidden'); }
  function filePicker(host) {
    var input = document.createElement('input'); input.type = 'file'; input.multiple = false; input.hidden = true;
    var wrap = document.createElement('div'); wrap.className = 'reference-upload';
    var button = document.createElement('button'); button.type = 'button'; button.className = 'btn reference-trigger';
    button.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M6 17a5 5 0 0 1-1-9.8A7 7 0 0 1 18.5 8a4.5 4.5 0 0 1 .5 9M12 20V10m-4 4 4-4 4 4" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>上传文件';
    button.setAttribute('aria-expanded', 'false'); button.setAttribute('aria-haspopup', 'true');
    var menu = document.createElement('div'); menu.className = 'reference-menu'; menu.hidden = true;
    var local = document.createElement('button'); local.type = 'button'; local.textContent = '从本地上传';
    var cloud = document.createElement('button'); cloud.type = 'button'; cloud.textContent = '从时光云选择';
    menu.append(local, cloud); wrap.append(button, menu);
    var files = document.createElement('div'); files.className = 'reference-files'; var chosen = [];
    function opened(value) { menu.hidden = !value; wrap.classList.toggle('is-open', value); button.setAttribute('aria-expanded', String(value)); }
    wrap.addEventListener('mouseenter', function () { opened(true); });
    wrap.addEventListener('mouseleave', function () { if (!wrap.contains(document.activeElement)) opened(false); });
    button.addEventListener('focus', function () { opened(true); });
    button.onclick = function () { opened(true); };
    wrap.addEventListener('focusout', function (e) { if (!wrap.contains(e.relatedTarget)) opened(false); });
    wrap.addEventListener('keydown', function (e) { if (e.key === 'Escape') { button.focus(); opened(false); } if (e.key === 'ArrowDown' && e.target === button) { e.preventDefault(); opened(true); local.focus(); } });
    function render() {
      files.replaceChildren(); chosen.forEach(function (file, i) {
        var row = document.createElement('div'); row.className = 'topic-file selected-reference';
        var attachment = document.createElement('div'); attachment.className = 'reference-attachment';
        attachment.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M8 13l7-7a3 3 0 0 1 4 4L9 20a5 5 0 0 1-7-7L13 2m-8 13 9-9" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';
        var name = document.createElement('span'); name.textContent = file.name; name.title = file.name;
        var done = document.createElement('span'); done.className = 'reference-selected-mark'; done.setAttribute('role', 'img'); done.setAttribute('aria-label', '已选择'); done.title = '已选择'; done.innerHTML = '<svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true"><circle cx="10" cy="10" r="9" fill="#52C41A"/><path d="M5.5 10l3 3 6-6" fill="none" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
        var remove = document.createElement('button'); remove.type = 'button'; remove.className = 'topic-link'; remove.textContent = '移除'; remove.setAttribute('aria-label', '移除资料：' + file.name);
        remove.onclick = function () { if (host.dataset.hasPoints === 'true' && !window.confirm('移除资料将清空对应的考核要点，是否继续？')) return; chosen.splice(i, 1); render(); clearStatus(); };
        attachment.append(name, done); row.append(attachment, remove); files.append(row);
      }); host.dataset.fileCount = String(chosen.length); host.dataset.fileName = chosen[0] ? chosen[0].name : ''; host.dispatchEvent(new Event('referencechange')); wrap.hidden = chosen.length > 0;
    }
    function appendFiles(items) {
      if (items.length) chosen = [items[0]];
      render(); clearStatus(); var card = host.closest('.topic-card'); if (card) validateCard(card, false);
    }
    local.onclick = function () { opened(false); input.click(); };
    input.onchange = function () { appendFiles(Array.from(input.files)); input.value = ''; };
    cloud.onclick = function () {
      opened(false);
      var dialog = document.createElement('dialog'); dialog.className = 'cloud-dialog';
      dialog.innerHTML = '<form method="dialog"><header><h3>从时光云选择</h3><button class="topic-link" value="cancel" aria-label="关闭">关闭</button></header><div class="cloud-content"><div class="hint-line">以下为演示资料，尚未连接真实时光云。</div><label class="cloud-search">搜索资料<input class="input" placeholder="输入资料名称" type="search"></label><div class="cloud-list"></div></div><footer><span class="cloud-count"></span><button class="btn" value="cancel">取消</button><button class="btn primary cloud-confirm" type="button">确定</button></footer></form>';
      var samples = ['小学语文阅读精准学参考话术.docx','数学错题精讲参考话术.pdf','英语口语训练参考话术.docx','学习机功能介绍.pdf'].map(function (name, i) { return {name:name, cloudId:'demo-cloud-' + i}; });
      var selected = new Set(chosen.filter(function (c) { return c.cloudId; }).map(function (c) { return c.cloudId; }));
      var search = dialog.querySelector('input'); var results = dialog.querySelector('.cloud-list');
      function showResults() {
        results.replaceChildren();
        samples.filter(function (f) { return f.name.includes(search.value.trim()); }).forEach(function (f) {
          var label = document.createElement('label'); label.className = 'cloud-item';
          var check = document.createElement('input'); check.type = 'radio'; check.name = 'cloud-reference'; check.checked = selected.has(f.cloudId);
          check.onchange = function () { selected.clear(); if (check.checked) selected.add(f.cloudId); count(); };
          var name = document.createElement('span'); name.textContent = f.name; label.append(check,name); results.append(label);
        });
        if (!results.children.length) results.textContent = '暂无匹配资料'; count();
      }
      function count() { dialog.querySelector('.cloud-count').textContent = '已选择 ' + selected.size + '/1 项'; dialog.querySelector('.cloud-confirm').disabled = !selected.size; }
      search.oninput = showResults;
      dialog.querySelector('.cloud-confirm').onclick = function () { chosen = chosen.filter(function (c) { return !c.cloudId || selected.has(c.cloudId); }); appendFiles(samples.filter(function (f) { return selected.has(f.cloudId); })); dialog.close(); };
      dialog.addEventListener('close', function () { dialog.remove(); if (!wrap.hidden) button.focus(); else files.querySelector('button').focus(); opened(false); });
      document.body.append(dialog); showResults(); dialog.showModal(); search.focus();
    };
    host.referenceState = {get:function(){return chosen.slice();},set:function(items){chosen=items.slice(0,1);render();}};
    host.append(wrap,input,files); render(); return button;
  }

  /* 共用评分维度编辑及考核要点交互 */
  function dimensions() {
    return Array.from(document.querySelectorAll('.dim-table tbody tr[data-dimension]')).map(function (r) { return r.dataset.dimension; }).filter(Boolean);
  }
  var dimensionBody = document.querySelector('.dim-table tbody');
  document.querySelector('.dim-actions .primary').onclick = function () {
    if (dimensionBody.querySelector('.empty-cell')) dimensionBody.replaceChildren();
    var row = document.createElement('tr'); row.dataset.dimension = ''; row.dataset.dimensionId = 'dim-' + (++sequence);
    row.innerHTML = '<td><input class="input dimension-name" aria-label="评分维度" placeholder="请输入评分维度" required></td><td><input class="input dimension-description" aria-label="维度说明" placeholder="请输入维度说明" required></td><td><div class="dimension-weight-wrap"><input class="input dimension-weight" aria-label="权重百分比" type="number" min="1" max="100" placeholder="权重" required><span>%</span></div></td><td><button type="button" class="topic-link">删除</button></td>';
    row.addEventListener('input', function (event) {
      var input = row.querySelector('.dimension-name'); var name = input.value.trim();
      var duplicate = Array.from(dimensionBody.children).some(function(other){return other !== row && name && other.dataset.dimension === name;});
      input.setCustomValidity(!name ? '请输入评分维度' : duplicate ? '评分维度名称不可重复' : '');
      input.setAttribute('aria-invalid', String(!name || duplicate));
      row.dataset.dimension = name; if (!event.target.classList.contains('dimension-weight')) document.dispatchEvent(new Event('gradingchange'));
    });
    row.querySelector('button').onclick = function () {
      if (!window.confirm('删除此评分维度将同步移除各主题对应的考核要点，是否继续？')) return;
      row.remove(); document.dispatchEvent(new Event('gradingchange'));
      if (!dimensionBody.children.length) dimensionBody.innerHTML = '<tr><td colspan="4" class="empty-cell">暂无数据</td></tr>';
    };
    dimensionBody.append(row); document.dispatchEvent(new Event('gradingchange')); row.querySelector('input').focus();
  };
  function setupPoints(reference, card, container) {
    var panel = document.createElement('section'); panel.className = 'assessment-points';
    panel.innerHTML = '<div class="points-header"><strong>考核要点</strong></div><div class="hint-line">解析参考资料后，结合上方评分维度生成考核要点；生成结果可点击修改。</div><div class="points-table-wrap"><table class="points-table"><colgroup><col style="width:25%"><col><col style="width:144px"></colgroup><thead><tr><th>评分维度</th><th>考核要点</th><th>操作</th></tr></thead><tbody></tbody></table></div><div class="points-actions"><button type="button" class="btn primary generate-points">根据资料生成</button></div>';
    container.append(panel);
    var tbody=panel.querySelector('tbody'), generate=panel.querySelector('.generate-points');
    var entries=new Map(), revision=0, busy=false, parsed=false;
    function dims(){return Array.from(dimensionBody.querySelectorAll('tr[data-dimension-id]')).map(function(r){return {id:r.dataset.dimensionId,name:r.dataset.dimension,description:r.querySelector('.dimension-description').value};});}
    function label(entry){entry.view.textContent=entry.text || '请输入考核要点或点击右侧AI生成'; entry.badge.textContent=entry.status; entry.action.textContent='AI生成';}
    function mainLabel(){panel.classList.toggle('hidden', !Number(reference.dataset.fileCount)); panel.querySelector('.points-table-wrap').classList.toggle('hidden', !parsed); reference.dataset.hasPoints=String(parsed); generate.textContent=parsed?'重新生成':'解析资料并生成考核要点';}
    function sync(){
      revision++;var current=dims(), keep=new Set(current.map(function(d){return d.id;}));
      entries.forEach(function(e,id){if(!keep.has(id)){e.row.remove();entries.delete(id);}});
      var empty=tbody.querySelector('.points-empty');if(empty)empty.remove();
      current.forEach(function(d){
        var e=entries.get(d.id);
        if(!e){
          e={text:'',status:'待补充',signature:'',dim:d};
          e.row=document.createElement('tr');var title=document.createElement('td'),content=document.createElement('td'),ops=document.createElement('td');
          e.title=document.createElement('span');e.badge=document.createElement('div');e.badge.className='point-status';title.append(e.title,e.badge);
          e.area=document.createElement('textarea');e.area.className='input';e.area.placeholder='选填，输入本维度下的主题考核要点';
          e.area.classList.add('hidden');
          e.view=document.createElement('button');e.view.type='button';e.view.className='point-read';
          var edit=document.createElement('button');edit.type='button';edit.className='topic-link';edit.textContent='编辑';
          var saveEdit=document.createElement('button');saveEdit.type='button';saveEdit.className='topic-link hidden';saveEdit.textContent='保存';
          var cancelEdit=document.createElement('button');cancelEdit.type='button';cancelEdit.className='topic-link hidden';cancelEdit.textContent='取消';
          function editing(value){e.editing=value;e.area.classList.toggle('hidden',!value);e.view.classList.toggle('hidden',value);edit.classList.toggle('hidden',value);saveEdit.classList.toggle('hidden',!value);cancelEdit.classList.toggle('hidden',!value);e.action.classList.toggle('hidden',value);}
          e.view.onclick=edit.onclick=function(){e.area.value=e.text;editing(true);e.area.focus();};
          saveEdit.onclick=function(){e.text=e.area.value.trim();e.status=e.text?'已采用':'沿用通用规则';editing(false);label(e);mainLabel();clearStatus();notify('考核要点已保存');};
          cancelEdit.onclick=function(){e.area.value=e.text;editing(false);};
          e.finishEdit=function(){editing(false);};
          e.action=document.createElement('button');e.action.type='button';e.action.className='topic-link';e.action.onclick=function(){run([e]);};
          content.append(e.view,e.area);ops.append(edit,e.action,saveEdit,cancelEdit);e.row.append(title,content,ops);entries.set(d.id,e);
        }
        var signature=d.name+'|'+d.description;if(e.signature && e.signature!==signature && e.text.trim())e.status='待检查';
        e.signature=signature;e.dim=d;e.title.textContent=d.name||'未命名维度';e.title.title=d.name;e.area.setAttribute('aria-label',(d.name||'未命名维度')+'考核要点');label(e);tbody.append(e.row);
      });
      if(!current.length)tbody.innerHTML='<tr class="points-empty"><td colspan="3">暂无评分维度，请先创建维度</td></tr>';
      mainLabel();if(busy)lock(true);
    }
    function changed(){revision++;entries.forEach(function(e){if(e.text.trim()){e.status='待更新';label(e);}});mainLabel();}
    function lock(value){panel.querySelectorAll('button,textarea').forEach(function(el){el.disabled=value;});}
    async function run(target){
      if(busy)return;var current=dims();
      if(!current.length || !current.some(function(d){return d.name.trim();})){notify('请先创建维度');return;}
      if(!Number(reference.dataset.fileCount)){notify('请先上传资料');return;}
      if(current.some(function(d){return !d.name.trim();})){notify('请先补全评分维度名称');return;}
      if(new Set(current.map(function(d){return d.name.trim();})).size!==current.length){notify('评分维度名称不可重复，请先修改');return;}
      var selected=target || Array.from(entries.values());
      if(!target && parsed){
        if(!window.confirm('请确认是否根据当前评分维度重新生成考核要点。重新生成将替换当前资料下全部已有考核要点。'))return;
      } else if(target && target.some(function(e){return e.text.trim();})){
        if(!window.confirm('AI生成将替换该维度已有的考核要点，是否继续？'))return;
      }
      busy=true;lock(true);var captured=revision;notify('正在生成考核要点（交互演示）…');
      try{
        await new Promise(function(resolve){setTimeout(resolve,500);});
        if(captured!==revision){notify('生成依据已变化，原有内容已保留，请重新生成。');return;}
        selected.forEach(function(e){e.text='【示例草稿】请结合当前主题参考资料，补充'+e.dim.name+'需要检查的具体内容。';e.area.value=e.text;e.finishEdit();e.status='已采用（示例）';label(e);});
        parsed=true;
        notify('考核要点已生成（示例演示，未解析真实资料）');clearStatus();
      }catch(error){notify('生成失败，已有内容已保留，请重试或手动填写。');}
      finally{busy=false;lock(false);mainLabel();}
    }
    generate.onclick=function(){run();};
    reference.addEventListener('referencechange',function(){revision++;parsed=false;entries.clear();tbody.replaceChildren();sync();});
    document.getElementById('taskNameInput').addEventListener('input',changed);
    document.querySelector('.editor-area').addEventListener('input',changed);
    document.addEventListener('gradingchange',sync);
    if(card)card.querySelector('.topic-name').addEventListener('input',changed);
    reference.pointsState={
      blocked:function(){return busy?'正在生成，请稍后切换':Array.from(entries.values()).some(function(e){return e.editing;})?'请先保存或取消考核要点编辑':'';},
      get:function(){return {parsed:parsed,items:Array.from(entries.entries()).map(function(pair){return {id:pair[0],text:pair[1].text,status:pair[1].status};})};},
      set:function(snapshot){revision++;sync();parsed=snapshot.parsed;snapshot.items.forEach(function(item){var e=entries.get(item.id);if(e){e.text=item.text;e.area.value=item.text;e.status=item.status;e.finishEdit();label(e);}});mainLabel();}
    };
    sync();
  }
  function syncCount() {
    var cards = Array.from(list.children);
    cards.forEach(function (card, i) {
      card.querySelector('.topic-title').textContent = card.querySelector('.topic-name').value.trim() || '主题' + (i + 1);
      card.querySelector('.topic-delete').disabled = cards.length <= 2;
    });
    add.disabled = cards.length >= 5;
    document.getElementById('topicCount').textContent = '已添加 ' + cards.length + '/5 个主题';
  }
  function validateCard(card, show) {
    var name = card.querySelector('.topic-name');
    var value = name.value.trim();
    var upload = card.querySelector('.topic-materials');
    var duplicate = value && Array.from(list.children).some(function (c) { return c !== card && c.querySelector('.topic-name').value.trim() === value; });
    var message = !value ? '请输入主题名称' : duplicate ? '主题名称重复，请修改' : '';
    card.querySelector('.topic-error').textContent = show ? message : '';
    name.setAttribute('aria-invalid', String(!!(show && (!value || duplicate))));
    if (show && message) {
      card.querySelector('.topic-body').classList.remove('hidden');
      card.querySelector('.topic-collapse').textContent = '收起';
      card.querySelector('.topic-collapse').setAttribute('aria-expanded', 'true');
    }
    return message ? (!value || duplicate ? name : upload.querySelector('button')) : null;
  }
  function createTopic() {
    var id = ++sequence;
    var card = document.createElement('section'); card.className = 'topic-card';
    card.innerHTML = '<div class="topic-head"><span class="topic-title"></span><button type="button" class="topic-link topic-collapse" aria-expanded="true">收起</button><button type="button" class="topic-link topic-delete">删除</button></div><div class="topic-body"><label class="topic-field topic-inline"><span>主题名称： <span style="color:#FF4D4F">*</span></span><input class="input topic-name" placeholder="例如：小学语文阅读精准学" required></label><label class="topic-field topic-inline"><span>识别关键词：</span><input class="input topic-keywords" placeholder="选填，多个关键词用逗号分隔"></label><div class="topic-field topic-reference-field"><span>参考资料</span><div class="topic-materials"></div><div class="hint-line topic-reference-hint">建议为每个主题上传对应的参考资料，有助于提升 AI 批阅的准确性。</div></div><div class="topic-error" role="alert"></div></div>';
    var body = card.querySelector('.topic-body'); body.id = 'topic-body-' + id;
    var collapse = card.querySelector('.topic-collapse'); collapse.setAttribute('aria-controls', body.id);
    collapse.onclick = function () { var closed = body.classList.toggle('hidden'); collapse.textContent = closed ? '展开' : '收起'; collapse.setAttribute('aria-expanded', String(!closed)); };
    card.querySelector('.topic-delete').onclick = function () {
      if (list.children.length <= 2) return;
      var hasContent = card.querySelector('.topic-name').value.trim() || card.querySelector('.topic-keywords').value.trim() || Number(card.querySelector('.topic-materials').dataset.fileCount);
      if (hasContent && !window.confirm('删除该主题及其参考资料配置？')) return;
      card.remove(); syncCount(); clearStatus(); add.focus();
    };
    card.addEventListener('input', function () { syncCount(); validateCard(card, false); clearStatus(); });
    filePicker(card.querySelector('.topic-materials'));
    setupPoints(card.querySelector('.topic-materials'), card, body);
    list.append(card); syncCount(); return card;
  }
  var previousMode=false;
  function syncMode() {
    var on=sw.classList.contains('on');
    if(on!==previousMode && singleHost){
      var source=previousMode && list.firstElementChild ? list.firstElementChild.querySelector('.topic-materials') : singleHost;
      var blocked=source.pointsState.blocked();
      if(blocked){sw.classList.toggle('on',previousMode);sw.setAttribute('aria-checked',String(previousMode));notify(blocked);return;}
      if(on && !list.children.length){createTopic();createTopic();}
      var destination=on?list.firstElementChild.querySelector('.topic-materials'):singleHost;
      var files=source.referenceState.get(), points=source.pointsState.get();
      destination.referenceState.set(files);destination.pointsState.set(points);
      if(files.length)notify(on?'已将参考资料和考核要点带入第一个主题':'已沿用第一个主题的参考资料和考核要点');
    }
    previousMode=on;
    document.getElementById('topicSettings').classList.toggle('hidden', !on);
    document.getElementById('singleReferenceRow').classList.toggle('hidden', on);
    document.getElementById('sharedScoreHint').classList.toggle('hidden', on === false);
    clearStatus();
  }
  sw.addEventListener('click', syncMode);
  add.onclick = function () { if (list.children.length < 5) createTopic().querySelector('input').focus(); clearStatus(); };
  var single = document.querySelector('#singleReferenceRow .form-control');
  single.querySelector('.upload-btn').remove();
  var singleHost = document.createElement('div'); single.prepend(singleHost); filePicker(singleHost); setupPoints(singleHost, null, single);
  var save = document.querySelector('.node-footer .primary');
  save.addEventListener('click', function (event) {
    if (!document.getElementById('aiApproverRadio').checked) return;
    var invalidRule = Array.from(dimensionBody.querySelectorAll('input')).find(function(input){return !input.checkValidity();});
    if (invalidRule) { event.preventDefault(); invalidRule.reportValidity(); return; }
    var first = null;
    if (sw.classList.contains('on')) Array.from(list.children).forEach(function (card) { var invalid = validateCard(card, true); if (!first && invalid) first = invalid; });
    if (first) { event.preventDefault(); clearStatus(); notify('请填写不重复的主题名称'); first.focus(); first.scrollIntoView({block:'center'}); return; }
    notify('配置已保留在当前页面；文件未上传，刷新后需重新选择。');
  });
  syncMode();
})();
