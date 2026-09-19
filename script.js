const form=document.getElementById('consultForm');
const result=document.getElementById('result');
form?.addEventListener('submit',e=>{
  e.preventDefault();
  const g=document.getElementById('graves').value;
  const t=document.getElementById('terrain').value;
  const p=document.getElementById('plan').value;
  const c=document.getElementById('contact').value.trim()||'연락처 미입력';
  const msg=`다함장묘 상담 요청\n묘지 기수: ${g}\n현장 지형: ${t}\n희망 진행: ${p}\n연락처: ${c}`;
  result.hidden=false;
  result.innerHTML=`<b>상담내용이 만들어졌습니다.</b><br>${msg.replaceAll('\n','<br>')}<br><br><a href="sms:01051985900?body=${encodeURIComponent(msg)}">이 내용으로 문자 보내기 →</a>`;
});
