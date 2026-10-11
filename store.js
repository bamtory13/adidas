(() => {
  const products = window.ADIDAS_CATALOG || [];
  const fmt = value => `${Number(value).toLocaleString('ko-KR')} 원`;
  const val = value => String(value || '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const getCart = () => { try { return JSON.parse(localStorage.getItem('adidasStoreCart') || '[]'); } catch { return []; } };
  const getOrders = () => { try { return JSON.parse(localStorage.getItem('adidasStoreOrders') || '[]'); } catch { return []; } };
  const getWish = () => { try { return JSON.parse(localStorage.getItem('adidasStoreWish') || '[]'); } catch { return []; } };
  let cart = getCart();
  let orders = getOrders();
  orders = orders.filter(order => !order.cancelledAt);
  try { localStorage.setItem('adidasStoreOrders', JSON.stringify(orders)); } catch {}
  let drawerMode = 'cart';
  let selectedSize = '';
  let checkoutInfo = {};
  let orderTimer;
  const toast = message => { const el=document.getElementById('storeToast'); if(!el)return; el.textContent=message; el.classList.add('show'); clearTimeout(el._timer); el._timer=setTimeout(()=>el.classList.remove('show'),2200); };
  const nav = `<div class="promo"><b>아디클럽 멤버 혜택</b>　멤버십에 가입하고 새로운 컬렉션을 만나보세요 <a href="account.html?tab=benefits">자세히 보기</a></div><div class="utility"><a href="https://www.adidas.co.kr/help/contact-us">도움말</a><a href="#orders" data-open-orders>주문 및 배송조회</a><a href="account.html">멤버 가입</a></div><nav class="store-nav"><a class="store-logo" href="index.html"><img src="adidas%20아디다스%20로고_01.png" alt="adidas"></a><div class="store-links"><a href="shop.html?group=outlet">OUTLET</a><a href="shop.html?group=shoes">SHOES</a><a href="shop.html?group=apparel">CLOTHING</a><a href="shop.html?group=men">MEN</a><a href="shop.html?group=women">WOMEN</a><a href="shop.html?group=kids">KIDS</a><a href="shop.html?group=running">SPORTS</a><a href="shop.html?group=originals">LIFESTYLE</a><a href="shop.html?group=accessories">ACCESSORIES</a></div><div class="store-tools"><label class="store-search"><svg viewBox="0 0 24 24"><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 5 5"/></svg><input id="storeSearch" placeholder="검색"></label><a class="store-icon" aria-label="마이페이지" href="account.html"><svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="3.3"/><path d="M5.5 20c.2-3.6 2.6-5.5 6.5-5.5s6.3 1.9 6.5 5.5"/></svg></a><a class="store-icon" aria-label="위시리스트" href="account.html?tab=wishlist"><svg viewBox="0 0 24 24"><path d="M20.8 8.7c0 4.5-8.8 10.3-8.8 10.3S3.2 13.2 3.2 8.7A4.2 4.2 0 0 1 12 6.2a4.2 4.2 0 0 1 8.8 2.5Z"/></svg></a><button class="store-icon" aria-label="주문 및 배송조회" data-open-orders><svg viewBox="0 0 24 24"><path d="M2 6h12v11H2zM14 10h4l4 4v3h-8z"/><circle cx="6" cy="19" r="1.7"/><circle cx="18" cy="19" r="1.7"/></svg></button><button class="store-icon" aria-label="장바구니" data-open-cart><svg viewBox="0 0 24 24"><path d="M4 8h16l-1.5 12h-13zM9 8a3 3 0 0 1 6 0"/></svg><span class="count" id="storeCartCount">0</span></button></div></nav>`;
  const footer = `<footer class="site-footer"><div class="footer-columns"><div><h3>PRODUCTS</h3><a href="shop.html?group=shoes">신발</a><a href="shop.html?group=men">남성</a><a href="shop.html?group=women">여성</a><a href="shop.html?group=kids">키즈</a><a href="account.html">마이페이지</a><a href="account.html?tab=wishlist">위시리스트</a></div><div><h3>SPORTS</h3><a href="shop.html?group=running">러닝</a><a href="https://www.adidas.co.kr/football">축구</a><a href="https://www.adidas.co.kr/training">트레이닝</a></div><div><h3>COLLECTIONS</h3><a href="shop.html?group=originals">오리지널스</a><a href="shop.html?group=originals">슈퍼스타</a><a href="shop.html?group=originals">삼바</a><a href="shop.html?group=originals">스페지알</a></div><div><h3>SUPPORT</h3><a href="https://www.adidas.co.kr/help/contact-us">고객센터</a><a href="https://www.adidas.co.kr/help?hcid=HCID_DELIVERY">배송</a><a href="https://www.adidas.co.kr/help?hcid=RETURNS_AND_REFUNDS">반품 및 환불</a><a href="#orders" data-open-orders>주문조회</a></div><div><h3>COMPANY</h3><a href="https://www.adidas-group.com/en/about/">회사 소개</a><a href="https://www.adidas.co.kr/adiclub">아디클럽</a></div></div><div class="footer-legal">© adidas Korea, LLC. All Rights Reserved.　<a href="https://www.adidas.co.kr/help/terms-and-conditions">이용약관</a>　<a href="https://www.adidas.co.kr/help/company-information/what-is-the-privacy-policy">개인정보 처리방침</a></div></footer>`;
  document.getElementById('siteHeader').innerHTML = nav;
  document.getElementById('siteFooter').innerHTML = footer;
  document.getElementById('cartRoot').innerHTML = `<div class="cart-shade" id="storeShade" aria-hidden="true"><section class="cart-panel" role="dialog" aria-modal="true" aria-labelledby="storePanelTitle"><header class="cart-panel-head"><h2 id="storePanelTitle">장바구니</h2><button class="cart-close" data-close-cart aria-label="닫기">×</button></header><div id="storePanelContent"></div></section></div>`;
  const shade = document.getElementById('storeShade');
  const panel = document.getElementById('storePanelContent');
  const productById = id => products.find(product => product.id === id) || products[0];
  function productCard(product) {
    const href = product.link || `product.html?id=${encodeURIComponent(product.id)}`;
    const heart = getWish().includes(product.id) ? '♥' : '♡';
    return `<article class="product-card"><a href="${href}"><div class="product-card-image"><img loading="lazy" src="${product.image}" alt="${product.name}"><span class="product-badge">${product.badge}</span><button class="product-wish" type="button" data-wish="${product.id}" aria-label="위시리스트에 추가">${heart}</button></div><div class="product-meta"><h3>${product.name}</h3><p>${product.color}</p><strong>${fmt(product.price)}${product.originalPrice?` <del>${fmt(product.originalPrice)}</del>`:''}</strong><span class="tag">${product.gender}</span></div></a></article>`;
  }
  function setCart(next) { cart=next; try{localStorage.setItem('adidasStoreCart',JSON.stringify(cart));}catch{} document.getElementById('storeCartCount').textContent=cart.reduce((n,item)=>n+item.qty,0); }
  function openDrawer(mode='cart') { drawerMode=mode; shade.classList.add('open');shade.setAttribute('aria-hidden','false'); if(mode==='orders')renderOrders();else renderCart(); }
  function closeDrawer() { shade.classList.remove('open');shade.setAttribute('aria-hidden','true');clearInterval(orderTimer); }
  function renderCart() {
    document.getElementById('storePanelTitle').textContent=`장바구니 (${cart.reduce((n,item)=>n+item.qty,0)})`;
    if(!cart.length){panel.innerHTML='<div class="cart-empty">장바구니가 비어 있습니다.</div>';return;}
    const total=cart.reduce((sum,item)=>sum+productById(item.id).price*item.qty,0);
    panel.innerHTML=cart.map((item,index)=>{const product=productById(item.id);return `<article class="cart-item-row"><img src="${product.image}" alt="${product.name}"><div class="cart-item-copy"><h3>${product.name}</h3><p>${product.color}</p><p>사이즈 ${item.size}</p><strong>${fmt(product.price)}</strong><div class="cart-quantity"><button data-cart-action="minus" data-index="${index}" aria-label="수량 줄이기">−</button><span>${item.qty}</span><button data-cart-action="plus" data-index="${index}" aria-label="수량 늘리기">+</button><button data-cart-action="remove" data-index="${index}">삭제</button></div></div></article>`}).join('')+`<div class="cart-total"><span>상품 합계</span><span>${fmt(total)}</span></div><button class="checkout-next" data-checkout>주문 정보 입력</button>`;
  }
  function checkoutStep(step) {
    document.getElementById('storePanelTitle').textContent=['','배송 정보','결제수단','주문 확인','주문 완료'][step]||'주문';
    const subtotal=cart.reduce((sum,item)=>sum+productById(item.id).price*item.qty,0);
    const shippingFee=checkoutInfo.shippingOption==='express'?5500:0;
    const total=subtotal+shippingFee;
    const items=cart.map(item=>`${productById(item.id).name} / ${item.size} / ${item.qty}개`).join('<br>');
    const member=(()=>{try{return JSON.parse(localStorage.getItem('adidasStoreMember')||'{}')}catch{return {}}})();
    const val=value=>String(value||'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
    if(step===1)panel.innerHTML=`<form class="checkout-form" id="storeShipping"><label>받는 분<input name="name" required autocomplete="name" value="${val(member.name)}"></label><label>휴대폰 번호<input name="phone" type="tel" required autocomplete="tel" value="${val(member.phone)}"></label><label>배송 주소<input name="address" required autocomplete="street-address" value="${val(member.address)}"></label><label>상세 주소<input name="detail" value="${val(member.detail)}" required></label><button>결제수단 선택</button></form>`;
    if(step===2)panel.innerHTML=`<div class="checkout-summary"><b>주문 상품</b><p>${items}</p><div>상품 합계 ${fmt(subtotal)}</div><div>배송비 ${shippingFee?fmt(shippingFee):'무료'}</div><strong>총 ${fmt(total)}</strong></div><form id="storePayment"><h3>배송 옵션</h3><label class="checkout-option"><input type="radio" name="shippingOption" value="standard" ${checkoutInfo.shippingOption!=='express'?'checked':''}> 일반 배송 · 무료</label><label class="checkout-option"><input type="radio" name="shippingOption" value="express" ${checkoutInfo.shippingOption==='express'?'checked':''}> 빠른 배송 · 5,500원 · 즉시 발송, 3~5시간 내 도착</label><h3>결제수단</h3><label class="checkout-option"><input type="radio" name="payment" value="card" ${checkoutInfo.payment!=='simple'?'checked':''}> 신용카드</label><label class="checkout-option"><input type="radio" name="payment" value="simple" ${checkoutInfo.payment==='simple'?'checked':''}> 간편결제</label><p class="checkout-note">결제 정보 입력 없이 주문 확인 화면으로 진행합니다. 실제 결제는 진행되지 않습니다.</p><button class="checkout-next">주문 확인</button></form>`;
    if(step===3)panel.innerHTML=`<h3>주문 내용을 확인해 주세요.</h3><div class="checkout-summary"><b>주문 상품</b><p>${items}</p><p>${val(checkoutInfo.name)} · ${val(checkoutInfo.phone)}<br>${val(checkoutInfo.address)} ${val(checkoutInfo.detail)}</p><p>배송 옵션: ${checkoutInfo.shippingOption==='express'?'빠른 배송':'일반 배송'} (${shippingFee?fmt(shippingFee):'무료'})</p><strong>결제수단: ${checkoutInfo.payment==='simple'?'간편결제':'신용카드'}</strong></div><div class="cart-total"><span>총 결제 금액</span><span>${fmt(total)}</span></div><p class="checkout-note">결제 완료를 누르면 이 브라우저에 주문 내역만 생성됩니다.</p><button class="checkout-next" data-place-order>결제 완료</button>`;
    if(step===4)panel.innerHTML=`<div class="cart-empty"><b>주문이 완료되었습니다.</b><p>주문번호 ${checkoutInfo.orderId}</p><button class="checkout-next" data-open-orders>주문 내역 확인</button></div>`;
  }
  function renderOrders() {
    document.getElementById('storePanelTitle').textContent='주문 및 배송조회';
    orders=getOrders();
    if(!orders.length){panel.innerHTML='<div class="cart-empty">조회할 주문 내역이 없습니다.</div>';return;}
    panel.innerHTML=orders.map(order=>{
      const created=order.createdAt||new Date(order.orderTime||Date.now()).getTime();
      const d=new Date(created), cutoff=new Date(d); cutoff.setHours(22,30,0,0);
      const dispatch=new Date(d); if(order.shippingOption==='express'){dispatch.setTime(created);}else{if(created>cutoff.getTime())dispatch.setDate(dispatch.getDate()+1); dispatch.setHours(23,0,0,0);}
    const arrival=order.shippingOption==='express'?new Date(order.deliveryEtaAt||created+4*60*60*1000):new Date(dispatch);if(order.shippingOption!=='express'){arrival.setDate(arrival.getDate()+1);arrival.setHours(9,0,0,0);}
      const now=Date.now(), prep=created+30*60*1000;
      const stage=order.cancelledAt?-1:now>=arrival.getTime()?3:now>=dispatch.getTime()?2:now>=prep?1:0;
      const names=['주문 접수','상품 준비 중','배송 중','배송 완료'];
      const percent=stage===3?100:stage===2?Math.min(99,Math.floor((now-dispatch.getTime())/(arrival.getTime()-dispatch.getTime())*100)):0;
      const clock=created?new Date(created).toLocaleTimeString('ko-KR',{hour:'2-digit',minute:'2-digit',hour12:false}):'';
      const arrivalText=arrival.toLocaleString('ko-KR',{year:'numeric',month:'long',day:'numeric',hour:'numeric',minute:'2-digit'});
      const dispatchText=order.shippingOption==='express'?'주문 즉시':dispatch.toLocaleString('ko-KR',{month:'long',day:'numeric',hour:'numeric',minute:'2-digit'});
      const orderItems=order.items||[];
      const lines=orderItems.map(item=>`${item.name||productById(item.id).name} · ${item.size} · ${item.qty}개`).join('<br>');
      const progress=stage>=2&&!order.cancelledAt?`<div class="tracking-meter"><span style="width:${percent}%"></span></div><b>배송 진행률 ${percent}%</b>`:'';
      const stageList=['주문 접수','상품 준비 중','배송 중','배송 완료'];
      const timeline=!order.cancelledAt?`<div class="tracking-timeline">${stageList.map((name,index)=>`<div class="tracking-step ${index<stage?'done':index===stage?'current':''}"><i></i><span>${name}</span></div>`).join('')}</div>`:'';
      const destination=[order.customer?.address,order.customer?.detail].filter(Boolean).join(' ');
      const mapLink=destination?`<a class="tracking-map-link" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destination)}" target="_blank" rel="noopener">배송지 지도 보기 ↗</a>`:'';
      const canCancel=!order.cancelledAt&&now-created<30*60*1000;
      const thumb=orderItems[0]?productById(orderItems[0].id).image:'';
      return `<article class="order-card"><header><div><b>${order.cancelledAt?'주문 취소':names[stage]}</b><small>주문번호 ${order.id}</small></div><small>${order.date||d.toLocaleDateString('ko-KR')} · ${clock}</small></header><div class="order-card-product">${thumb?`<img src="${thumb}" alt="">`:''}<p>${lines}</p></div><div class="order-card-total"><span>결제 금액</span><b>${fmt(order.total)}</b></div><section class="order-tracking"><b>${order.cancelledAt?'취소된 주문':`도착 ${stage===3?'완료':'예정'} · ${arrivalText}`}</b>${order.cancelledAt?'<p>주문이 취소되었습니다.</p>':`<p>${order.shippingOption==='express'?'빠른 배송 · 주문 즉시 배송 시작 · 3~5시간 내 도착 예정':`발송 예정 ${dispatchText}`}</p>${progress}${timeline}`}<div class="tracking-destination">${destination?`<span>배송지 ${val(destination)}</span>${mapLink}`:'배송 주소 정보가 없습니다.'}</div><small class="tracking-disclaimer">배송 단계와 도착 시간은 주문 시각 기준 예상 정보입니다.</small></section>${canCancel?`<button class="cancel-order-button" data-cancel="${order.id}">주문 취소</button>`:''}</article>`;
    }).join('');
    clearInterval(orderTimer);orderTimer=setInterval(()=>{if(shade.classList.contains('open')&&drawerMode==='orders')renderOrders()},30000);
  }
  function renderHome() {
    const featured=document.getElementById('featuredProducts'); if(featured)featured.innerHTML=products.slice(0,8).map(productCard).join('');
    const running=document.getElementById('runningProducts');if(running)running.innerHTML=products.filter(p=>p.category==='running').map(productCard).join('');
  }
  function renderCategory() {
    const params=new URLSearchParams(location.search),group=params.get('group')||'shoes';
    const titles={shoes:'신발',apparel:'의류',accessories:'액세서리',originals:'오리지널스',running:'러닝',training:'트레이닝',football:'축구',golf:'골프',sportswear:'스포츠웨어',men:'남성',women:'여성',kids:'키즈',outlet:'아울렛'};
    const title=titles[group]||'신발';document.getElementById('categoryTitle').textContent=title;document.getElementById('crumbGroup').textContent=title;document.title=`${title} | adidas`;
    document.getElementById('officialCategory').href=`https://www.adidas.co.kr/${({shoes:'shoes',apparel:'men-t_shirts',accessories:'accessories',originals:'originals',running:'running',training:'training',football:'football',golf:'golf',sportswear:'sportswear',men:'men',women:'women',kids:'kids-shoes',outlet:'outlet'})[group]||'shoes'}`;
    const filter=document.getElementById('categoryFilter');
    if(['originals','running','training','football','golf','sportswear','apparel','accessories'].includes(group)){filter.value=group;}
    const render=()=>{
      let list=products.filter(p=>group==='all'||(group==='shoes'&&p.type!=='apparel'&&p.type!=='accessory')||(group==='outlet'&&p.outlet===true)||p.category===group||(group==='running'&&p.type==='apparel'&&p.badge.includes('RUNNING'))||((group==='men'||group==='women')&&(p.gender===group||p.gender==='Unisex'))||(group==='kids'&&p.gender==='Kids'));
      if(filter.value!=='all')list=list.filter(p=>p.category===filter.value);
      const q=(params.get('q')||'').trim().toLocaleLowerCase('ko');if(q)list=list.filter(p=>[p.name,p.label,p.color,p.category,p.gender,p.badge,p.id].join(' ').toLocaleLowerCase('ko').includes(q));
      if(q){document.getElementById('categoryTitle').textContent=`“${params.get('q')}” 검색 결과`;document.getElementById('crumbGroup').textContent='검색';document.title=`${params.get('q')} 검색 결과 | adidas`;}
      const sort=document.getElementById('sortProducts').value;if(sort==='price-low')list.sort((a,b)=>a.price-b.price);if(sort==='price-high')list.sort((a,b)=>b.price-a.price);if(sort==='name')list.sort((a,b)=>a.name.localeCompare(b.name,'ko'));
      document.getElementById('resultCount').textContent=`${list.length}개 상품`;
      document.getElementById('catalogProducts').innerHTML=list.length?list.map(productCard).join(''):'<p>조건에 맞는 상품이 없습니다.</p>';
    };
    filter.addEventListener('change',render);document.getElementById('sortProducts').addEventListener('change',render);render();
  }
  function renderProduct() {
    const id=new URLSearchParams(location.search).get('id')||'superstar-ii-white';const product=productById(id);
    if(product.link){location.replace(product.link);return;}
    document.title=`${product.name} | adidas`;document.getElementById('productCrumb').textContent=product.name;
    const gallery=product.gallery||[product.image];
    const sizes=product.sizes||Array.from({length:17},(_,i)=>220+i*5);
    const sizeGuide=product.type==='apparel'?'https://www.adidas.co.kr/size-chart':product.type==='accessory'?'https://www.adidas.co.kr/accessories':'https://www.adidas.co.kr/size-chart/size-chart-size-shoes';
    document.getElementById('productDetail').innerHTML=`<section class="product-page"><div class="product-page-gallery">${gallery.map((src,i)=>`<img src="${src}" alt="${product.name} 상품 이미지 ${i+1}" ${i>1?'loading="lazy"':''}>`).join('')}</div><aside class="product-page-info"><span class="eyebrow">${product.gender.toUpperCase()} · ${product.badge}</span><div class="product-rating">★★★★★　(리뷰 보기)</div><h1>${product.name}</h1><p class="subtitle">${product.type==='apparel'?'adidas Originals Apparel':'adidas Performance & Originals'}</p><div class="product-price">${fmt(product.price)}</div><p class="product-color">컬러<br><strong>${product.color}</strong></p><div class="size-title"><strong>구입 가능한 사이즈</strong><a href="${sizeGuide}" target="_blank" rel="noopener">사이즈 가이드</a></div><div class="product-sizes">${sizes.map(size=>`<button type="button" data-size="${size}">${size}</button>`).join('')}</div><button class="detail-add" id="detailAdd"><span>장바구니 담기</span><span>→</span></button><div class="detail-desc">${product.description}<br><br>무료 배송 및 반품 안내는 <a href="https://www.adidas.co.kr/help?hcid=HCID_DELIVERY"><u>고객 서비스</u></a>에서 확인해 주세요.</div><div class="store-rating-line"><b>★★★★★</b>　고객 리뷰</div>${product.official?`<p><a href="${product.official}" target="_blank" rel="noopener"><u>아디다스 공식 상품 페이지 ↗</u></a></p>`:''}</aside></section><section class="home-section"><div class="section-heading"><h2>함께 보면 좋은 상품</h2><a href="shop.html?group=${product.category}">모두 보기 →</a></div><div class="product-grid">${products.filter(p=>p.id!==product.id).slice(0,4).map(productCard).join('')}</div></section>`;
    document.querySelectorAll('[data-size]').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('[data-size]').forEach(x=>x.classList.remove('selected'));button.classList.add('selected');selectedSize=button.dataset.size;}));
    document.getElementById('detailAdd').addEventListener('click',()=>{if(!selectedSize){toast('사이즈를 먼저 선택해 주세요.');return;}const found=cart.find(item=>item.id===product.id&&item.size===selectedSize);if(found)found.qty++;else cart.push({id:product.id,size:selectedSize,qty:1});setCart(cart);openDrawer('cart');});
  }
  document.addEventListener('click',event=>{
    const opener=event.target.closest('[data-open-cart]');if(opener){openDrawer('cart');return;}
    if(event.target.closest('[data-open-orders]')){event.preventDefault();openDrawer('orders');return;}
    if(event.target.closest('[data-close-cart]')){closeDrawer();return;}
    if(event.target===shade){closeDrawer();return;}
    const wish=event.target.closest('[data-wish]');if(wish){event.preventDefault();event.stopPropagation();let saved=[];try{saved=JSON.parse(localStorage.getItem('adidasStoreWish')||'[]')}catch{}const id=wish.dataset.wish;saved=saved.includes(id)?saved.filter(x=>x!==id):[...saved,id];try{localStorage.setItem('adidasStoreWish',JSON.stringify(saved))}catch{}wish.textContent=saved.includes(id)?'♥':'♡';toast(saved.includes(id)?'위시리스트에 저장했습니다.':'위시리스트에서 삭제했습니다.');return;}
    const action=event.target.closest('[data-cart-action]');if(action){const index=Number(action.dataset.index),kind=action.dataset.cartAction;if(kind==='plus')cart[index].qty++;if(kind==='minus')cart[index].qty--;if(kind==='remove'||cart[index].qty<=0)cart.splice(index,1);setCart(cart);renderCart();return;}
    if(event.target.closest('[data-checkout]')){checkoutInfo={};checkoutStep(1);return;}
    if(event.target.closest('[data-place-order]')){
      const id=`AD-${Date.now().toString().slice(-8)}`,subtotal=cart.reduce((sum,item)=>sum+productById(item.id).price*item.qty,0),shippingFee=checkoutInfo.shippingOption==='express'?5500:0,total=subtotal+shippingFee,orderTime=new Date().toISOString();
      const createdAt=new Date(orderTime).getTime(),deliveryEtaAt=checkoutInfo.shippingOption==='express'?createdAt+(3+Math.random()*2)*60*60*1000:null;
      orders=getOrders();orders.unshift({id,date:new Date().toLocaleDateString('ko-KR'),orderTime,createdAt,deliveryEtaAt,items:cart.map(item=>({...item,name:productById(item.id).name,price:productById(item.id).price})),subtotal,shippingOption:checkoutInfo.shippingOption||'standard',shippingFee,total,customer:checkoutInfo});
      try{localStorage.setItem('adidasStoreOrders',JSON.stringify(orders));}catch{}cart=[];setCart(cart);checkoutInfo.orderId=id;checkoutStep(4);return;
    }
    if(event.target.closest('[data-open-orders-confirm]')){openDrawer('orders');return;}
    const cancel=event.target.closest('[data-cancel]');if(cancel){orders=getOrders();const order=orders.find(x=>x.id===cancel.dataset.cancel);if(order&&Date.now()-order.createdAt<30*60*1000){order.cancelledAt=Date.now();try{localStorage.setItem('adidasStoreOrders',JSON.stringify(orders))}catch{}renderOrders();}return;}
  });
  document.addEventListener('submit',event=>{
    if(event.target.id==='storeShipping'){event.preventDefault();checkoutInfo=Object.fromEntries(new FormData(event.target).entries());checkoutStep(2);}
    if(event.target.id==='storePayment'){event.preventDefault();const data=new FormData(event.target);checkoutInfo.payment=data.get('payment');checkoutInfo.shippingOption=data.get('shippingOption');checkoutStep(3);}
  });
  document.addEventListener('change',event=>{if(event.target.name==='shippingOption'&&event.target.closest('#storePayment')){const form=event.target.form;checkoutInfo.shippingOption=event.target.value;checkoutInfo.payment=new FormData(form).get('payment');checkoutStep(2);}});
  const search=document.getElementById('storeSearch');if(search){const wrap=search.closest('.store-search');const results=document.createElement('div');results.className='search-results';results.setAttribute('role','listbox');wrap.after(results);const searchText=p=>[p.name,p.label,p.color,p.category,p.gender,p.badge,p.id].join(' ').toLocaleLowerCase('ko');const update=()=>{const q=search.value.trim().toLocaleLowerCase('ko');if(!q){results.classList.remove('open');results.innerHTML='';return;}const matches=products.filter(p=>searchText(p).includes(q)).slice(0,6);results.innerHTML=matches.length?matches.map(p=>`<a role="option" href="${p.link||`product.html?id=${encodeURIComponent(p.id)}`}" class="search-hit"><img src="${p.image}" alt=""><span><b>${p.name}</b><small>${p.color}</small></span><strong>${fmt(p.price)}</strong></a>`).join(''):`<p class="search-empty">일치하는 상품이 없습니다.</p>`;results.classList.add('open');};search.addEventListener('input',update);search.addEventListener('keydown',event=>{if(event.key==='Enter'&&search.value.trim()){event.preventDefault();location.href=`shop.html?group=all&q=${encodeURIComponent(search.value.trim())}`;}if(event.key==='Escape')results.classList.remove('open');});document.addEventListener('click',event=>{if(!wrap.contains(event.target))results.classList.remove('open');});}
  setCart(cart);
  const page=document.body.dataset.page;if(page==='home')renderHome();if(page==='category')renderCategory();if(page==='product')renderProduct();
})();


