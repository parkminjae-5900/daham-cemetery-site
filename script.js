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

const contractLocations=[
  {status:'contract',name:'인제군 기린면',detail:'계약중 · 4기',lat:37.955,lng:128.318},
  {status:'contract',name:'보령시 남포면 양기리',detail:'계약중 · 2기',lat:36.266,lng:126.607},
  {status:'contract',name:'속초시 노학동',detail:'계약중 · 1기',lat:38.191,lng:128.535},
  {status:'contract',name:'양평군 무궁화공원',detail:'계약중 · 1기',lat:37.491,lng:127.487},
  {status:'visit',name:'논산시',detail:'답사예약',lat:36.187,lng:127.098},
  {status:'visit',name:'제천시',detail:'답사예약',lat:37.132,lng:128.191},
  {status:'consult',name:'고흥군',detail:'사전상담',lat:34.611,lng:127.285},
  {status:'consult',name:'화성시',detail:'사전상담',lat:37.199,lng:126.831}
];
const statusNames={contract:'계약중',visit:'답사예약',consult:'사전상담'};
const mapPanel=document.querySelector('.contract-map-panel');
const hero=document.querySelector('.hero');
const mapTitle=document.getElementById('map-status-title');
let contractMap;
let contractMarkers=[];

function renderContractMap(status='all'){
  mapPanel.classList.add('is-visible');
  hero.classList.add('map-open');
  const markerLayer=document.getElementById('map-markers');
  const placeCard=document.getElementById('map-place-card');
  markerLayer.innerHTML='';
  placeCard.hidden=true;
  const selected=status==='all'?contractLocations:contractLocations.filter(x=>x.status===status);
  selected.forEach(x=>{
    const marker=document.createElement('button');
    marker.type='button';
    marker.className=`map-marker ${x.status}`;
    marker.style.left=`${12+((x.lng-126)/(129-126))*76}%`;
    marker.style.top=`${8+((38.7-x.lat)/(38.7-34))*82}%`;
    marker.setAttribute('aria-label',`${x.name} ${x.detail}`);
    marker.addEventListener('click',()=>{
      placeCard.innerHTML=`<b>${x.name}</b>${x.detail}`;
      placeCard.hidden=false;
    });
    markerLayer.appendChild(marker);
  });
  mapTitle.textContent=status==='all'?`전체 현황 ${selected.length}곳`:`${statusNames[status]} 지역 ${selected.length}곳`;
}

document.querySelectorAll('.status-card').forEach(card=>card.addEventListener('click',()=>{
  document.querySelectorAll('.status-card').forEach(x=>{x.classList.remove('is-active');x.setAttribute('aria-pressed','false')});
  card.classList.add('is-active');
  card.setAttribute('aria-pressed','true');
  renderContractMap(card.dataset.status);
}));
document.getElementById('show-all-status')?.addEventListener('click',()=>{
  document.querySelectorAll('.status-card').forEach(x=>{x.classList.remove('is-active');x.setAttribute('aria-pressed','false')});
  renderContractMap('all');
});

function animateStatusCounts(){
  document.querySelectorAll('.count-number').forEach((el,index)=>{
    const target=Number(el.dataset.count||0);
    const duration=2400+index*450;
    const start=performance.now();
    const tick=now=>{
      const progress=Math.min((now-start)/duration,1);
      const eased=1-Math.pow(1-progress,3);
      el.textContent=String(Math.floor(target*eased));
      if(progress<1)requestAnimationFrame(tick);
      else el.textContent=String(target);
    };
    requestAnimationFrame(tick);
  });
}
animateStatusCounts();
