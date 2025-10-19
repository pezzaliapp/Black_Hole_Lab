/* app.js — Black Hole Lab WebGL (PWA) — v1.2.1 (overlay Info)
   Autore: pezzaliAPP (prototipo) */
(() => {
  const G = 6.67430e-11, C = 299792458, MSUN = 1.98847e30;
  const canvas = document.getElementById('gl');
  const massEl = document.getElementById('mass'), massVal = document.getElementById('massVal');
  const qualityEl = document.getElementById('quality'), qualityVal = document.getElementById('qualityVal');
  const exposureEl = document.getElementById('exposure'), exposureVal = document.getElementById('exposureVal');
  const diskEl = document.getElementById('disk'); const resetCamBtn = document.getElementById('resetCam');
  const rsText = document.getElementById('rsText'); const fpsText = document.getElementById('fps'); const installBtn = document.getElementById('install');
  const infoBtn = document.getElementById('infoBtn'); const infoClose = document.getElementById('infoClose'); const infoOv = document.getElementById('infoOverlay');
  function openInfo(){ infoOv.classList.add('show'); infoOv.setAttribute('aria-hidden','false'); }
  function closeInfo(){ infoOv.classList.remove('show'); infoOv.setAttribute('aria-hidden','true'); }
  infoBtn.addEventListener('click', openInfo);
  if(infoClose) infoClose.addEventListener('click', closeInfo);
  window.addEventListener('keydown', (e)=>{ if(e.key==='Escape') closeInfo(); });
  if(infoOv) infoOv.addEventListener('click', (e)=>{ if(e.target===infoOv) closeInfo(); });

  const gl = canvas.getContext('webgl', { antialias:false, alpha:false, preserveDrawingBuffer:false });
  if(!gl){ alert('WebGL non disponibile'); return; }

  const vert = 'attribute vec2 aPos;void main(){gl_Position=vec4(aPos,0.0,1.0);}';
  const frag = `precision highp float;uniform vec2 uRes;uniform float uTime,uMassKg,uExposure,uScalePx;uniform vec3 uCam;uniform int uShowDisk;
  float hash(vec2 p){return fract(sin(dot(p,vec2(41.3,289.1)))*43758.5453123);}float noise(vec2 p){vec2 i=floor(p),f=fract(p);
  float a=hash(i),b=hash(i+vec2(1.,0.)),c=hash(i+vec2(0.,1.)),d=hash(i+vec2(1.,1.));vec2 u=f*f*(3.-2.*f);return mix(a,b,u.x)+(c-a)*u.y*(1.-u.x)+(d-b)*u.x*u.y;}
  vec3 stars(vec3 dir){float u=atan(dir.z,dir.x)/6.2831853+.5;float v=asin(clamp(dir.y,-1.,1.))/3.1415926+.5;vec2 uv=vec2(u,v)*200.;
  float n=noise(uv);float s=smoothstep(.995,1.,n);float tw=.5+.5*sin(uTime*2.+n*20.);vec3 col=vec3(.60,.72,1.)*s*tw;float band=pow(abs(dir.y),.8);
  col+=vec3(.03,.04,.06)*(1.-band);return col;}mat3 rotYX(float yaw,float pitch){float cy=cos(yaw),sy=sin(yaw);float cp=cos(pitch),sp=sin(pitch);
  mat3 RY=mat3(cy,0.,-sy,0.,1.,0.,sy,0.,cy);mat3 RX=mat3(1.,0.,0.,0.,cp,sp,0.,-sp,cp);return RX*RY;}
  void main(){vec2 frag=gl_FragCoord.xy/uScalePx;vec2 R=uRes/uScalePx;vec2 uv=(frag-.5*R)/R.y;float yaw=uCam.x,pitch=uCam.y,zoom=uCam.z;
  mat3 Rcam=rotYX(yaw,pitch);vec3 ro=vec3(0.,0.,zoom);vec3 rd=normalize(Rcam*normalize(vec3(uv.x,uv.y,-1.2)));vec3 oc=-ro;float proj=dot(oc,rd);
  vec3 closest=oc-proj*rd;float b=length(closest)+1e-6;float UNIT=1.0e7;float b_m=b*UNIT;float Rs=2.*6.67430e-11*uMassKg/(299792458.*299792458.);
  float alpha=clamp(2.*Rs/max(b_m,1.),0.,1.2);float falloff=1./(1.+pow(b*2.,2.));alpha*=falloff;vec3 n=normalize(closest);
  vec3 bent=normalize(mix(rd,normalize(rd*cos(alpha)-n*sin(alpha)),1.));vec3 col=stars(bent);if(uShowDisk==1){float t=-(ro.y)/(bent.y+1e-6);
  if(t>0.){vec3 hit=ro+bent*t;float r=length(hit.xz);float Rs_scene=Rs/UNIT;if(r>Rs_scene*1.05){float rings=.5+.5*sin(log(r+1.)*20.);
  float fall=smoothstep(4.*Rs_scene,1.2*Rs_scene,r);float side=clamp(dot(normalize(hit.xz),vec2(1.,0.)),-1.,1.);float beaming=.65+.35*side;
  vec3 disk=mix(vec3(.8,.35,.08),vec3(1.,.8,.35),rings);disk*=beaming*fall;col=mix(col,disk,.85);}else{col*=.2;}}}
  float rp=length(uv);float halo=smoothstep(.45,0.,rp);col+=vec3(.02,.03,.05)*halo;col=1.-exp(-col*uExposure);col=pow(col,vec3(1./2.2));
  gl_FragColor=vec4(col,1.);} `;

  function shader(type,src){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);
    if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){console.error(gl.getShaderInfoLog(s));throw new Error('Shader compile error');}return s;}
  function program(vs,fs){const p=gl.createProgram();gl.attachShader(p,shader(gl.VERTEX_SHADER,vs));gl.attachShader(p,shader(gl.FRAGMENT_SHADER,fs));gl.linkProgram(p);
    if(!gl.getProgramParameter(p,gl.LINK_STATUS)){console.error(gl.getProgramInfoLog(p));throw new Error('Program link error');}return p;}
  const prog=program(vert,frag);gl.useProgram(prog);
  const quad=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,quad);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
  const aPos=gl.getAttribLocation(prog,'aPos');gl.enableVertexAttribArray(aPos);gl.vertexAttribPointer(aPos,2,gl.FLOAT,false,0,0);
  const uRes=gl.getUniformLocation(prog,'uRes'),uTime=gl.getUniformLocation(prog,'uTime'),uMassKg=gl.getUniformLocation(prog,'uMassKg');
  const uExposure=gl.getUniformLocation(prog,'uExposure'),uScalePx=gl.getUniformLocation(prog,'uScalePx'),uCam=gl.getUniformLocation(prog,'uCam');
  const uShowDisk=gl.getUniformLocation(prog,'uShowDisk');

  let DPR=Math.max(1,Math.min(2,window.devicePixelRatio||1));
  let massSolar=+massEl.value, exposure=+exposureEl.value, scalePx=1.0/+qualityEl.value, showDisk=diskEl.checked?1:0;
  let cam={yaw:0.0,pitch:0.0,zoom:3.2}; const defaults={yaw:0,pitch:0,zoom:3.2};

  function resize(){const r=canvas.getBoundingClientRect();canvas.width=Math.max(2,Math.floor(r.width*DPR));canvas.height=Math.max(2,Math.floor(r.height*DPR));gl.viewport(0,0,canvas.width,canvas.height);}
  const ro=new ResizeObserver(resize); ro.observe(canvas);

  function updateUI(){massVal.textContent=massSolar;qualityVal.textContent=(+qualityEl.value).toFixed(2)+'x';exposureVal.textContent=exposure.toFixed(2);
    const Mkg=massSolar*MSUN;const Rs=2*G*Mkg/(C*C);rsText.textContent=(Rs>1e6)?(Rs/1000).toFixed(1)+' km':Rs.toFixed(2)+' m';}
  updateUI();

  massEl.addEventListener('input',e=>{massSolar=+e.target.value;updateUI();});
  qualityEl.addEventListener('input',e=>{scalePx=1.0/+e.target.value;resize();updateUI();});
  exposureEl.addEventListener('input',e=>{exposure=+e.target.value;updateUI();});
  diskEl.addEventListener('change',e=>{showDisk=e.target.checked?1:0;});
  resetCamBtn.addEventListener('click',()=>{cam={...defaults};updateUI();});

  let dragging=false,lastX=0,lastY=0;
  canvas.addEventListener('mousedown',e=>{dragging=true;lastX=e.clientX;lastY=e.clientY;});
  window.addEventListener('mouseup',()=>dragging=false);
  window.addEventListener('mousemove',e=>{if(!dragging)return;const dx=(e.clientX-lastX),dy=(e.clientY-lastY);lastX=e.clientX;lastY=e.clientY;cam.yaw+=dx*0.005;cam.pitch=Math.max(-1.2,Math.min(1.2,cam.pitch+dy*0.005));});
  let lastDist=null;
  canvas.addEventListener('touchstart',e=>{if(e.touches.length===1){dragging=true;lastX=e.touches[0].clientX;lastY=e.touches[0].clientY;lastDist=null;}
    if(e.touches.length===2){lastDist=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);}}, {passive:true});
  canvas.addEventListener('touchmove',e=>{if(e.touches.length===1&&dragging){const t=e.touches[0];const dx=t.clientX-lastX,dy=t.clientY-lastY;lastX=t.clientX;lastY=t.clientY;cam.yaw+=dx*0.005;cam.pitch=Math.max(-1.2,Math.min(1.2,cam.pitch+dy*0.005));}
    if(e.touches.length===2&&lastDist!==null){const d=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);const dd=d-lastDist;lastDist=d;cam.zoom=Math.max(1.2,Math.min(8.0,cam.zoom-dd*0.01));}}, {passive:true});
  window.addEventListener('wheel',e=>{cam.zoom=Math.max(1.2,Math.min(8.0,cam.zoom+(e.deltaY>0?0.1:-0.1)));},{passive:true});

  let frames=0,lastFps=performance.now();function tickFps(){frames++;const now=performance.now();if(now-lastFps>500){fpsText.textContent=String(Math.round(frames*2));frames=0;lastFps=now;}}

  function render(t){gl.useProgram(prog);gl.uniform2f(uRes,canvas.width,canvas.height);gl.uniform1f(uTime,t*0.001);gl.uniform1f(uMassKg,massSolar*MSUN);
    gl.uniform1f(uExposure,exposure);gl.uniform1f(uScalePx,(1.0/scalePx));gl.uniform3f(uCam,cam.yaw,cam.pitch,cam.zoom);gl.uniform1i(uShowDisk,showDisk);
    gl.drawArrays(gl.TRIANGLES,0,3);tickFps();requestAnimationFrame(render);}

  if('serviceWorker' in navigator){navigator.serviceWorker.register('sw.js').catch(()=>{});}

  let deferredPrompt=null;window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;installBtn.hidden=false;});
  installBtn.addEventListener('click',async()=>{if(!deferredPrompt)return;deferredPrompt.prompt();await deferredPrompt.userChoice;installBtn.hidden=true;deferredPrompt=null;});

  function fitCanvas(){const r=canvas.getBoundingClientRect();canvas.width=Math.max(2,Math.floor(r.width*DPR));canvas.height=Math.max(2,Math.floor(r.height*DPR));gl.viewport(0,0,canvas.width,canvas.height);}
  const rsObs=new ResizeObserver(fitCanvas);rsObs.observe(canvas);fitCanvas();requestAnimationFrame(render);
})();