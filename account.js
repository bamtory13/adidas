(() => {
  const app=document.getElementById('accountApp');
  const catalog=window.ADIDAS_CATALOG||[];
  const money=n=>`${Number(n||0).toLocaleString('ko-KR')} 원`;
  const esc=value=>String(value||'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key)||JSON.stringify(fallback))}catch{return fallback}};
  const write=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value))}catch{}};
  let member=read('adidasStoreMember',null);
  let tab=new URLSearchParams(location.search).get('tab')||'profile';
  const product=id=>catalog.find(item=>item.id===id);
  const statusOf=order=>{
    const created=order.createdAt||new Date(order.orderTime||Date.now()).getTime();
    const d=new Date(created),cutoff=new Date(d);cutoff.setHours(22,30,0,0);
    const dispatch=new Date(d);if(order.shippingOption==='express')dispatch.setTime(created);else{if(created>cutoff.getTime())dispatch.setDate(dispatch.getDate()+1);dispatch.setHours(23,0,0,0);}
    const arrival=order.shippingOption==='express'?new Date(order.deliveryEtaAt||created+4*60*60*1000):new Date(dispatch);if(order.shippingOption!=='express'){arrival.setDate(arrival.getDate()+1);arrival.setHours(9,0,0,0);}
    const now=Date.now(),stage=order.cancelledAt?-1:now>=arrival.getTime()?3:now>=dispatch.getTime()?2:now>=created+1800000?1:0;
    const names=['주문 접수','상품 준비 중','배송 중','배송 완료'];
    const percent=stage===3?100:stage===2?Math.min(99,Math.floor((now-dispatch.getTime())/(arrival.getTime()-dispatch.getTime())*100)):0;
    return {created,dispatch,arrival,stage,label:order.cancelledAt?'주문 취소':names[stage],percent};
  };
  function render(){
    member=read('adidasStoreMember',null);
    const orders=read('adidasStoreOrders',[]).filter(x=>!x.cancelledAt);
    const wish=read('adidasStoreWish',[]);
    if(!member&&tab!=='orders'){app.innerHTML=`<section class="account-signin"><h2>아디클럽에 오신 것을 환영합니다.</h2><p>이 브라우저에서 회원 정보와 쇼핑 내역을 확인할 수 있습니다.</p><form id="memberSignIn"><input name="name" placeholder="이름" autocomplete="name" required><input name="email" type="email" placeholder="이메일 주소" autocomplete="email" required><button class="account-button">계속하기</button></form><p class="account-note">회원 데이터는 이 브라우저에 저장됩니다. 아디다스 계정과 연결되거나 서버로 전송되지 않습니다.</p></section>`;return;}
    const active=(name)=>tab===name?'active':'';
    const nav=member?`<aside class="account-tabs"><button class="${active('profile')}" data-tab="profile">프로필</button><button class="${active('orders')}" data-tab="orders">주문 및 배송</button><button class="${active('wishlist')}" data-tab="wishlist">위시리스트 (${wish.length})</button><button class="${active('benefits')}" data-tab="benefits">아디클럽</button></aside>`:`<aside class="account-tabs"><button class="active" data-tab="orders">주문 및 배송</button><a class="account-button secondary" href="account.html">회원 정보 입력</a></aside>`;
    let content='';
    if(tab==='profile'){
      const earned=orders.reduce((sum,o)=>sum+Math.floor((o.total||0)*.01),0);
      content=`<section class="account-section"><h2>내 프로필</h2><div class="account-cards"><div class="account-stat"><span>가입 이메일</span><strong style="font-size:13px">${esc(member.email)}</strong></div><div class="account-stat"><span>주문 횟수</span><strong>${orders.length}</strong></div><div class="account-stat"><span>예상 포인트</span><strong>${earned.toLocaleString('ko-KR')} P</strong></div></div><form class="account-form" id="profileForm"><label>이름<input name="name" value="${esc(member.name)}" required></label><label>이메일<input name="email" type="email" value="${esc(member.email)}" required></label><label>휴대폰 번호<input name="phone" value="${esc(member.phone)}" placeholder="010-0000-0000"></label><label>기본 배송 주소<input name="address" value="${esc(member.address)}" placeholder="주소"></label><label class="wide">상세 주소<input name="detail" value="${esc(member.detail)}" placeholder="상세 주소"></label><div class="account-actions wide"><button class="account-button">정보 저장</button><button class="account-button secondary" type="button" data-logout>로그아웃</button></div></form><p class="account-note">포인트 표시는 주문 금액을 기준으로 계산한 브라우저 내 참고용 금액입니다.</p></section>`;
    } else if(tab==='orders'){
      const html=orders.map(order=>{const state=statusOf(order),items=(order.items||[]).map(item=>`${item.name||product(item.id)?.name||'상품'} · ${item.size} · ${item.qty}개`).join('<br>'),canCancel=Date.now()-state.created<30*60*1000,destination=[order.customer?.address,order.customer?.detail].filter(Boolean).join(' '),map=destination?`<br><a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destination)}" target="_blank" rel="noopener">배송지 지도 보기 ↗</a>`:'';return `<article class="account-order"><div class="account-order-head"><h3>${esc(order.id)}</h3><span>${order.date||new Date(state.created).toLocaleDateString('ko-KR')} · ${new Date(state.created).toLocaleTimeString('ko-KR',{hour:'2-digit',minute:'2-digit',hour12:false})}</span></div><p>${items}<br>${order.shippingOption==='express'?'빠른 배송비 5,500원 포함<br>':''}결제 금액 ${money(order.total)}</p><div class="account-order-status"><b>${state.label}</b><br>${order.shippingOption==='express'?'배송 시작 주문 즉시 · 3~5시간 내 도착 예정':`발송 예정 ${state.dispatch.toLocaleString('ko-KR',{month:'long',day:'numeric',hour:'numeric',minute:'2-digit'})}`}<br>도착 예정 ${state.arrival.toLocaleString('ko-KR',{year:'numeric',month:'long',day:'numeric',hour:'numeric',minute:'2-digit'})}${state.stage>=2?`<br>배송 진행률 ${state.percent}%`:''}${map}</div>${canCancel?`<button class="account-button secondary" data-cancel-account-order="${esc(order.id)}">주문 취소</button>`:''}</article>`}).join('');
      content=`<section class="account-section"><h2>주문 및 배송</h2>${!member?'<p class="account-note">이 브라우저에 저장된 주문 내역입니다.</p>':''}${html?`<div class="account-orders">${html}</div>`:`<div class="account-empty">이 브라우저에서 조회할 주문 내역이 없습니다.<br><br><a href="shop.html?group=shoes">상품 둘러보기 →</a></div>`}</section>`;
    } else if(tab==='wishlist'){
      const items=wish.map(id=>product(id)).filter(Boolean);
      content=`<section class="account-section"><h2>위시리스트</h2>${items.length?`<div class="account-wishlist">${items.map(item=>{const href=item.link||`product.html?id=${encodeURIComponent(item.id)}`;return `<article class="wish-item"><a href="${href}"><img src="${item.image}" alt="${item.name}"><h3>${item.name}</h3><p>${money(item.price)}</p></a><button type="button" data-remove-wish="${item.id}" aria-label="위시리스트에서 삭제">×</button></article>`}).join('')}</div>`:`<div class="account-empty">저장한 상품이 없습니다.<br><br><a href="shop.html?group=shoes">신상품 둘러보기 →</a></div>`}</section>`;
    } else {
      const earned=orders.reduce((sum,o)=>sum+Math.floor((o.total||0)*.01),0);
      content=`<section class="account-section"><h2>아디클럽</h2><div class="account-benefits"><h3>${esc(member.name)}님, 아디클럽과 함께하세요.</h3><p>회원 혜택과 주문 현황을 이 페이지에서 확인할 수 있습니다. 구매 내역에 따라 계산된 참고 포인트는 <b>${earned.toLocaleString('ko-KR')} P</b>입니다.</p></div><div class="account-cards" style="margin-top:14px"><div class="account-stat"><span>주문</span><strong>${orders.length}</strong></div><div class="account-stat"><span>위시리스트</span><strong>${wish.length}</strong></div><div class="account-stat"><span>배송 조회</span><strong><button class="account-button secondary" data-tab="orders">확인하기</button></strong></div></div></section>`;
    }
    app.innerHTML=`<div class="account-layout">${nav}<div>${content}</div></div>`;
  }
  app.addEventListener('click',event=>{
    const tabButton=event.target.closest('[data-tab]');if(tabButton){tab=tabButton.dataset.tab;history.replaceState(null,'',`?tab=${tab}`);render();return;}
    const remove=event.target.closest('[data-remove-wish]');if(remove){write('adidasStoreWish',read('adidasStoreWish',[]).filter(id=>id!==remove.dataset.removeWish));render();return;}
    const cancel=event.target.closest('[data-cancel-account-order]');if(cancel){const orders=read('adidasStoreOrders',[]),order=orders.find(item=>item.id===cancel.dataset.cancelAccountOrder);if(order&&Date.now()-(order.createdAt||Date.now())<30*60*1000){order.cancelledAt=Date.now();write('adidasStoreOrders',orders);render();}return;}
    if(event.target.closest('[data-logout]')){localStorage.removeItem('adidasStoreMember');member=null;render();}
  });
  app.addEventListener('submit',event=>{
    if(event.target.id==='memberSignIn'){event.preventDefault();const data=Object.fromEntries(new FormData(event.target).entries());member={...data};write('adidasStoreMember',member);render();}
    if(event.target.id==='profileForm'){event.preventDefault();member={...member,...Object.fromEntries(new FormData(event.target).entries())};write('adidasStoreMember',member);render();}
  });
  render();
  setInterval(()=>{if(tab==='orders')render();},30000);
})();
